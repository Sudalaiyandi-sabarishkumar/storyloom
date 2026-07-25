import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v4 as uuid } from 'uuid';
import { closeConnection } from './databricksClient.js';
import { countListeners, deleteAllListeners, insertListenerBatch } from './repositories/listenerRepo.js';
import { generateEmbeddings } from '../ai/embeddings.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, '..', 'dataset', 'story_listener.csv');

const EMBED_BATCH_SIZE = 100;
const INSERT_BATCH_SIZE = 12;

async function main() {
  const force = process.argv.includes('--force');

  const existing = await countListeners();
  if (existing > 0 && !force) {
    console.log(`listener_profiles already has ${existing} rows — skipping. Pass --force to reseed.`);
    await closeConnection();
    return;
  }
  if (existing > 0 && force) {
    console.log(`Deleting ${existing} existing listener_profiles rows (--force)...`);
    await deleteAllListeners();
  }

  const listeners = parseCsv(fs.readFileSync(CSV_PATH, 'utf8'));
  console.log(`Parsed ${listeners.length} listener rows from ${CSV_PATH}`);

  let embedded = 0;
  for (let i = 0; i < listeners.length; i += EMBED_BATCH_SIZE) {
    const chunk = listeners.slice(i, i + EMBED_BATCH_SIZE);
    const embeddings = await generateEmbeddings(chunk.map((l) => l.personaText));
    const rows = chunk.map((l, idx) => ({ ...l, id: uuid(), embedding: embeddings[idx] }));

    for (let j = 0; j < rows.length; j += INSERT_BATCH_SIZE) {
      await insertListenerBatch(rows.slice(j, j + INSERT_BATCH_SIZE));
    }

    embedded += chunk.length;
    console.log(`Embedded + inserted ${embedded}/${listeners.length}`);
  }

  console.log('Listener seed complete.');
  await closeConnection();
}

function parseCsv(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const [, ...dataLines] = lines; // drop header
  return dataLines.map((line) => {
    const [sourceId, age, country, language, personality, readingHabits, favouriteGenres, patience] = line.split(',');
    const personaText = [
      `A ${age}-year-old ${personality.toLowerCase()} listener from ${country}`,
      `who reads ${language} content ${readingHabits.toLowerCase()}`,
      `and favors ${favouriteGenres}, with ${patience.toLowerCase()} patience.`,
    ].join(' ');

    return {
      sourceId,
      age: Number(age),
      country,
      language,
      personality,
      readingHabits,
      favouriteGenres,
      patience,
      personaText,
    };
  });
}

main().catch((err) => {
  console.error('Listener seed failed:', err);
  process.exit(1);
});
