import { query, qualifiedTable, esc } from '../databricksClient.js';

const LISTENER_T = () => qualifiedTable('listener_profiles');

export async function countListeners() {
  const [row] = await query(`SELECT count(*) AS n FROM ${LISTENER_T()}`);
  return Number(row?.n || 0);
}

export async function deleteAllListeners() {
  await query(`DELETE FROM ${LISTENER_T()}`);
}

/**
 * Bulk-inserts listener rows. Callers should chunk to a modest batch size —
 * embedding_json is ~20-30KB of escaped text per row (1536 floats), so this
 * is much heavier per-row than the small JSON blobs elsewhere in this schema.
 */
export async function insertListenerBatch(rows) {
  if (!rows.length) return;
  const values = rows.map((r) => `(
    ${esc(r.id)}, ${esc(r.sourceId)}, ${r.age}, ${esc(r.country)}, ${esc(r.language)},
    ${esc(r.personality)}, ${esc(r.readingHabits)}, ${esc(r.favouriteGenres)}, ${esc(r.patience)},
    ${esc(r.personaText)}, ${esc(JSON.stringify(r.embedding))}, current_timestamp()
  )`).join(',\n');

  await query(`
    INSERT INTO ${LISTENER_T()}
      (id, source_id, age, country, language, personality, reading_habits, favourite_genres, patience, persona_text, embedding_json, created_at)
    VALUES ${values}
  `);
}

/** Full read for the in-memory retrieval index — embedding parsed back to a plain array. */
export async function getAllListeners() {
  const rows = await query(`
    SELECT source_id, age, country, language, personality, reading_habits, favourite_genres, patience, persona_text, embedding_json
    FROM ${LISTENER_T()}
  `);
  return rows.map((r) => ({
    sourceId: r.source_id,
    age: r.age,
    country: r.country,
    language: r.language,
    personality: r.personality,
    readingHabits: r.reading_habits,
    favouriteGenres: r.favourite_genres,
    patience: r.patience,
    personaText: r.persona_text,
    embedding: JSON.parse(r.embedding_json),
  }));
}
