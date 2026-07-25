import { v4 as uuid } from 'uuid';
import { generateJSON } from '../ai/index.js';
import {
  reviewSystemPrompt, reviewUserPrompt, REVIEW_PROMPT_VERSION,
  impactSystemPrompt, impactUserPrompt, IMPACT_PROMPT_VERSION,
} from '../ai/prompts.js';
import { query, qualifiedTable, esc } from '../db/databricksClient.js';

const FEEDBACK_T = () => qualifiedTable('feedback_items');
const IMPACT_T = () => qualifiedTable('impact_checks');

const VALID_SEVERITY = new Set(['info', 'warn', 'crit']);

/**
 * Runs (or re-runs) the review agent over the current story context and
 * persists a fresh feedback set, replacing the prior one.
 */
export async function getFeedback(projectId, storyContext, opts = {}) {
  // storyContext undefined => caller just wants the last computed feedback (cheap path).
  if (!storyContext || opts.useCache) {
    const cached = await query(`
      SELECT severity, category, text, jump_target as jump
      FROM ${FEEDBACK_T()} WHERE project_id = ${esc(projectId)}
      ORDER BY created_at DESC
    `);
    if (cached.length) return cached;
  }
  if (!storyContext) return [];

  const result = await generateJSON({
    system: reviewSystemPrompt(),
    prompt: reviewUserPrompt(storyContext),
  });
  const items = Array.isArray(result) ? result : result?.feedback;

  const clean = (Array.isArray(items) ? items : []).filter(
    (i) => i && VALID_SEVERITY.has(i.severity) && i.category && i.text
  );

  await query(`DELETE FROM ${FEEDBACK_T()} WHERE project_id = ${esc(projectId)}`);
  for (const item of clean) {
    await query(`
      INSERT INTO ${FEEDBACK_T()} (id, project_id, severity, category, text, jump_target, created_at)
      VALUES (${esc(uuid())}, ${esc(projectId)}, ${esc(item.severity)}, ${esc(item.category)}, ${esc(item.text)}, ${esc(item.jump ?? null)}, current_timestamp())
    `);
  }
  return clean;
}

/**
 * "What breaks if I remove this?" — always regenerates fresh (there's no
 * meaningful cached version per arbitrary entityName), and logs every check.
 */
export async function checkImpact(entityName, projectId, storyContext) {
  const result = await generateJSON({
    system: impactSystemPrompt(),
    prompt: impactUserPrompt(entityName, storyContext),
  });

  const risk = ['safe', 'review', 'high'].includes(result.risk) ? result.risk : 'review';
  const scenes = Array.isArray(result.scenes) ? result.scenes : [];

  await query(`
    INSERT INTO ${IMPACT_T()} (id, project_id, entity_name, risk, summary, scenes_json, created_at)
    VALUES (${esc(uuid())}, ${esc(projectId)}, ${esc(entityName)}, ${esc(risk)}, ${esc(result.summary || '')}, ${esc(JSON.stringify(scenes))}, current_timestamp())
  `);

  return { risk, summary: result.summary || '', scenes };
}
