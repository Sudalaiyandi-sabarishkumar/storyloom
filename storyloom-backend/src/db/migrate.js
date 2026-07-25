import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';
import { execute, closeConnection, qualifiedTable } from './databricksClient.js';
import * as userRepo from './repositories/userRepo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const catalog = config.databricks.catalog;
  const schema = config.databricks.schema;

  console.log(`Ensuring catalog: ${catalog}`);
  try {
    await execute(`CREATE CATALOG IF NOT EXISTS ${catalog}`);
  } catch (err) {
    console.error([
      '',
      `Could not create catalog "${catalog}".`,
      'This usually means your Databricks account doesn\'t have CREATE CATALOG',
      'privilege (only metastore admins / account admins have it by default).',
      '',
      'Two ways to fix this:',
      '  1) Ask a workspace/metastore admin to run: CREATE CATALOG storyloom;',
      '     or to grant you the privilege: GRANT CREATE CATALOG ON METASTORE TO `you@example.com`;',
      `  2) Simpler: point DATABRICKS_CATALOG in .env at a catalog you already`,
      '     have access to (often "main" or "hive_metastore" in dev workspaces),',
      '     then rerun `npm run db:migrate`.',
      '',
      `Original error: ${err.message}`,
    ].join('\n'));
    throw err;
  }

  console.log(`Ensuring schema: ${catalog}.${schema}`);
  await execute(`CREATE SCHEMA IF NOT EXISTS ${catalog}.${schema}`);
  await execute(`USE CATALOG ${catalog}`);
  await execute(`USE SCHEMA ${schema}`);

  const ddl = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const ddlWithoutCommentLines = ddl
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');
  const statements = ddlWithoutCommentLines
    .split(/;\s*(?:\n|$)/)
    .map((s) => s.trim())
    .filter((s) => s.length);

  for (const stmt of statements) {
    const label = stmt.slice(0, 60).replace(/\s+/g, ' ');
    process.stdout.write(`Applying: ${label}... `);
    await execute(stmt);
    console.log('done');
  }

  // schema.sql's `CREATE TABLE IF NOT EXISTS projects` no-ops on a database
  // that already has a projects table from before role-based access existed
  // — retrofit the new column explicitly so existing deployments pick it up.
  process.stdout.write('Ensuring projects.created_by column exists... ');
  try {
    await execute(`ALTER TABLE ${qualifiedTable('projects')} ADD COLUMNS (created_by STRING)`);
    console.log('added');
  } catch (err) {
    if (/already exists/i.test(err.message)) {
      console.log('already present');
    } else {
      throw err;
    }
  }

  await seedDirector();

  console.log('Migration complete.');
  await closeConnection();
}

/**
 * Upserts the single Director account from DIRECTOR_* env vars. This is the
 * only way a director user ever gets created — public signup always creates
 * role: 'creator'.
 */
async function seedDirector() {
  if (!config.director.password) {
    console.log('Skipping director seed — DIRECTOR_PASSWORD not set.');
    return;
  }
  const existing = await userRepo.findByUsername(config.director.username);
  if (existing) {
    console.log(`Director account "${config.director.username}" already exists — skipping.`);
    return;
  }
  const passwordHash = await bcrypt.hash(config.director.password, 10);
  await userRepo.createUser({
    username: config.director.username,
    passwordHash,
    role: 'director',
    displayName: config.director.displayName,
  });
  console.log(`Seeded director account "${config.director.username}".`);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});