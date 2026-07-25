import { getAllListeners } from '../db/repositories/listenerRepo.js';
import { generateEmbedding } from '../ai/embeddings.js';

// Flat additive nudge for an exact favourite_genres match against the
// project's genres — pure cosine similarity over near-identical templated
// persona sentences mostly just rediscovers genre-keyword overlap anyway,
// so make that signal explicit instead of leaving it implicit/noisy.
const GENRE_MATCH_BOOST = 0.15;

// Static reference data seeded once via `npm run db:seed-listeners` — cached
// for the process lifetime (same singleton-promise shape as databricksClient's
// getConnection(), to avoid duplicate concurrent loads on first request).
let indexPromise = null;
function loadListenerIndex() {
  if (!indexPromise) indexPromise = getAllListeners();
  return indexPromise;
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

/**
 * Retrieves the listener profiles most relevant to a project, ranked by
 * semantic similarity (embedding cosine) with an exact-genre-match boost.
 * project: { title, genres, coreStory | logline }
 */
export async function retrieveRelevantListeners(project, topK = 40) {
  const genres = project.genres || [];
  const queryText = [
    project.title,
    genres.length ? `Genres: ${genres.join(', ')}` : null,
    project.coreStory || project.logline,
  ].filter(Boolean).join('. ');

  const [index, queryEmbedding] = await Promise.all([
    loadListenerIndex(),
    generateEmbedding(queryText),
  ]);

  const genresLower = new Set(genres.map((g) => g.toLowerCase()));

  const scored = index.map((listener) => {
    const similarity = cosineSimilarity(queryEmbedding, listener.embedding);
    const genreMatch = genresLower.has((listener.favouriteGenres || '').toLowerCase());
    return {
      ...listener,
      similarity,
      genreMatch,
      combinedScore: similarity + (genreMatch ? GENRE_MATCH_BOOST : 0),
    };
  });

  scored.sort((a, b) => b.combinedScore - a.combinedScore);
  return scored.slice(0, topK).map(({ embedding, ...rest }) => rest);
}

function pct(count, total) {
  return total ? Math.round((count / total) * 100) : 0;
}

function topBreakdown(listeners, key, n = 3) {
  const counts = {};
  for (const l of listeners) counts[l[key]] = (counts[l[key]] || 0) + 1;
  return Object.entries(counts)
    .map(([label, count]) => ({ label, pct: pct(count, listeners.length) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, n);
}

/**
 * Computes real aggregate stats from a retrieved listener set, plus a
 * ready-to-embed prompt block — this computed data (not LLM-invented) is
 * what grounds the ranking/audience-simulation prompts.
 */
export function summarizeListeners(listeners) {
  const total = listeners.length || 1;
  const patienceBreakdown = topBreakdown(listeners, 'patience', 3);
  const topCountries = topBreakdown(listeners, 'country', 3);
  const topLanguages = topBreakdown(listeners, 'language', 3);
  const genreMatchPct = pct(listeners.filter((l) => l.genreMatch).length, total);
  const avgAge = Math.round(listeners.reduce((sum, l) => sum + (l.age || 0), 0) / total);
  const samplePersonas = listeners.slice(0, 4).map((l) => l.personaText);

  const promptBlock = [
    `Retrieved listener panel (N=${listeners.length} real listeners most relevant to this story):`,
    `- Patience: ${patienceBreakdown.map((p) => `${p.pct}% ${p.label}`).join(', ')}`,
    `- Top countries: ${topCountries.map((c) => `${c.label} (${c.pct}%)`).join(', ')}`,
    `- Top languages: ${topLanguages.map((c) => `${c.label} (${c.pct}%)`).join(', ')}`,
    `- Genre match: ${genreMatchPct}% list a favourite genre matching this story's genres`,
    `- Average age: ${avgAge}`,
    samplePersonas.length ? `- Example listeners: ${samplePersonas.join(' | ')}` : null,
    'Ground your score/fit/demographics in this real panel data, not just the logline.',
  ].filter(Boolean).join('\n');

  return { patienceBreakdown, topCountries, topLanguages, genreMatchPct, avgAge, sampleCount: listeners.length, promptBlock };
}
