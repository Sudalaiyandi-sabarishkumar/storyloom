import { v4 as uuid } from 'uuid';
import { query, qualifiedTable, esc } from '../databricksClient.js';

const USER_T = () => qualifiedTable('users');

export async function createUser({ username, passwordHash, role, displayName }) {
  const id = uuid();
  await query(`
    INSERT INTO ${USER_T()} (id, username, password_hash, role, display_name, created_at)
    VALUES (${esc(id)}, ${esc(username)}, ${esc(passwordHash)}, ${esc(role)}, ${esc(displayName)}, current_timestamp())
  `);
  return { id, username, role, displayName };
}

export async function findByUsername(username) {
  const [row] = await query(`
    SELECT * FROM ${USER_T()} WHERE LOWER(TRIM(username)) = LOWER(TRIM(${esc(username)}))
  `);
  return row || null;
}

export async function findById(id) {
  const [row] = await query(`SELECT * FROM ${USER_T()} WHERE id = ${esc(id)}`);
  return row || null;
}
