import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../config/index.js';
import { execute, closeConnection } from './databricksClient.js';

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

  console.log('Migration complete.');
  await closeConnection();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});