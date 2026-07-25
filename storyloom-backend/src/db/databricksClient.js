import { DBSQLClient } from '@databricks/sql';
import { config } from '../config/index.js';

let clientPromise = null;

/**
 * Lazily creates and caches a single Databricks SQL connection.
 * @databricks/sql opens a session over Thrift/HTTP against a SQL Warehouse.
 */
async function getConnection() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const client = new DBSQLClient();
      await client.connect({
        host: config.databricks.serverHostname,
        path: config.databricks.httpPath,
        token: config.databricks.token,
      });
      const session = await client.openSession();
      return { client, session };
    })();
  }
  return clientPromise;
}

/**
 * Run a parameterized-ish SQL statement. @databricks/sql doesn't support
 * bind params on all versions, so we build safely-escaped SQL here via
 * the `sql` tag helper below rather than string concatenation in callers.
 */
export async function query(sqlText) {
  const { session } = await getConnection();
  const operation = await session.executeStatement(sqlText, {
    runAsync: true,
    maxRows: 10000,
  });
  try {
    const rows = await operation.fetchAll();
    return rows;
  } finally {
    await operation.close();
  }
}

export async function execute(sqlText) {
  return query(sqlText);
}

export function qualifiedTable(name) {
  return `${config.databricks.catalog}.${config.databricks.schema}.${name}`;
}

/** Escapes a single SQL string literal value. Use for every interpolated value. */
export function esc(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

/** Renders a JS array of strings as a Databricks SQL ARRAY<STRING> literal. */
export function escArray(arr) {
  if (!arr || arr.length === 0) return 'array()';
  return `array(${arr.map(esc).join(', ')})`;
}

export async function closeConnection() {
  if (!clientPromise) return;
  const { client, session } = await clientPromise;
  await session.close();
  await client.close();
  clientPromise = null;
}
