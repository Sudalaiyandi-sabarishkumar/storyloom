import { v4 as uuid } from 'uuid';
import { generateText } from '../ai/index.js';
import { plotSystemPrompt, plotUserPrompt, PLOT_PROMPT_VERSION } from '../ai/prompts.js';
import { query, qualifiedTable, esc } from '../db/databricksClient.js';
import { config } from '../config/index.js';

const T = () => qualifiedTable('plot_generations');

/**
 * Generates a new opening plot for a project.
 * @param {string} projectId
 * @param {object} storyContext - { genres, themes, coreStory, background, timeline, characters, conflicts }
 * @param {{regenerate?: boolean}} opts
 */
export async function generateOpeningPlot(projectId, storyContext, opts = {}) {
  const text = await generateText({
    system: plotSystemPrompt(),
    prompt: plotUserPrompt(storyContext),
    // Regeneration should feel different each time — nudge temperature up slightly.
    temperature: opts.regenerate ? Math.min(1, config.ai.temperature + 0.1) : config.ai.temperature,
  });

  const id = uuid();
  await query(`
    UPDATE ${T()} SET is_selected = FALSE WHERE project_id = ${esc(projectId)}
  `);
  await query(`
    INSERT INTO ${T()} (id, project_id, text, prompt_version, model, is_selected, created_at)
    VALUES (${esc(id)}, ${esc(projectId)}, ${esc(text)}, ${esc(PLOT_PROMPT_VERSION)}, ${esc(config.ai.model)}, TRUE, current_timestamp())
  `);

  await pruneHistory(projectId);
  return { id, text };
}

export async function getPlotHistory(projectId) {
  return query(`
    SELECT id, text, prompt_version, model, is_selected, created_at
    FROM ${T()}
    WHERE project_id = ${esc(projectId)}
    ORDER BY created_at DESC
  `);
}

export async function selectPlotVersion(projectId, generationId) {
  await query(`UPDATE ${T()} SET is_selected = FALSE WHERE project_id = ${esc(projectId)}`);
  await query(`UPDATE ${T()} SET is_selected = TRUE WHERE id = ${esc(generationId)} AND project_id = ${esc(projectId)}`);
}

async function pruneHistory(projectId) {
  const rows = await query(`
    SELECT id FROM ${T()} WHERE project_id = ${esc(projectId)} ORDER BY created_at DESC
  `);
  const stale = rows.slice(config.generation.maxHistory);
  for (const row of stale) {
    await query(`DELETE FROM ${T()} WHERE id = ${esc(row.id)}`);
  }
}
