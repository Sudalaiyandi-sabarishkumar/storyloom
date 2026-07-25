import { v4 as uuid } from 'uuid';
import { generateText, generateJSON } from '../ai/index.js';
import {
  sceneSystemPrompt, sceneUserPrompt, SCENE_PROMPT_VERSION,
  sceneOptionsSystemPrompt, sceneOptionsUserPrompt,
} from '../ai/prompts.js';
import { query, qualifiedTable, esc } from '../db/databricksClient.js';
import { config } from '../config/index.js';

const GEN_T = () => qualifiedTable('scene_generations');
const SCENE_T = () => qualifiedTable('scenes');

const FALLBACK_HOOKS = ['Comedic hook', 'Emotional stakes', 'Action / tension hook'];

/**
 * Asks the Next Scene Agent for 3 fresh next-scene directions, grounded in
 * the project's generated opening plot + cast + conflicts + scenes so far.
 * Called by the Story Editor's "Next Scene Agent" panel every time the
 * storyboard changes, so suggestions always reflect the latest story state.
 */
export async function generateSceneOptions(projectId, storyContext) {
  const result = await generateJSON({
    system: sceneOptionsSystemPrompt(),
    prompt: sceneOptionsUserPrompt(storyContext),
    temperature: 0.8,
  });

  const raw = Array.isArray(result) ? result : result?.options;
  const options = (Array.isArray(raw) ? raw : [])
    .filter((o) => o && o.title && (o.text || o.desc))
    .slice(0, 3)
    .map((o, i) => ({
      id: o.id || `${projectId}-opt-${i}`,
      title: o.title,
      hook: o.hook || o.tone || FALLBACK_HOOKS[i] || 'Next beat',
      tone: o.tone || o.hook || FALLBACK_HOOKS[i] || 'Next beat',
      desc: o.desc || o.text,
      text: o.text || o.desc,
    }));

  if (!options.length) {
    throw Object.assign(new Error('Scene agent returned no usable options'), { status: 502 });
  }
  return options;
}

/**
 * Generates (or regenerates) the next scene for a chosen direction.
 * Does NOT commit it as an accepted scene — call acceptScene() once the
 * writer picks a generated version, mirroring the UI's "pick" flow.
 */
export async function generateNextScene(projectId, option, storyContext, opts = {}) {
  const text = await generateText({
    system: sceneSystemPrompt(),
    prompt: sceneUserPrompt(option, storyContext),
    temperature: opts.regenerate ? Math.min(1, config.ai.temperature + 0.1) : config.ai.temperature,
  });

  const id = uuid();
  await query(`
    INSERT INTO ${GEN_T()} (id, project_id, option_id, title, tone, text, model, is_selected, created_at)
    VALUES (${esc(id)}, ${esc(projectId)}, ${esc(option.id)}, ${esc(option.title)}, ${esc(option.tone)}, ${esc(text)}, ${esc(config.ai.model)}, FALSE, current_timestamp())
  `);

  return { id, title: option.title, tone: option.tone, text };
}

export async function getSceneGenerationHistory(projectId, optionId) {
  return query(`
    SELECT id, option_id, title, tone, text, is_selected, created_at
    FROM ${GEN_T()}
    WHERE project_id = ${esc(projectId)} ${optionId ? `AND option_id = ${esc(optionId)}` : ''}
    ORDER BY created_at DESC
  `);
}

/** Commits a generated scene as an accepted scene in the story's timeline. */
export async function acceptScene(projectId, generationId) {
  const [gen] = await query(`
    SELECT * FROM ${GEN_T()} WHERE id = ${esc(generationId)} AND project_id = ${esc(projectId)}
  `);
  if (!gen) throw Object.assign(new Error('Generation not found'), { status: 404 });

  const [{ maxIdx } = { maxIdx: 0 }] = await query(`
    SELECT COALESCE(MAX(idx), 0) as maxIdx FROM ${SCENE_T()} WHERE project_id = ${esc(projectId)}
  `);
  const nextIdx = Number(maxIdx) + 1;
  const id = uuid();

  await query(`
    INSERT INTO ${SCENE_T()} (id, project_id, idx, title, tone, text, status, created_at, updated_at)
    VALUES (${esc(id)}, ${esc(projectId)}, ${nextIdx}, ${esc(gen.title)}, ${esc(gen.tone)}, ${esc(gen.text)}, 'accepted', current_timestamp(), current_timestamp())
  `);
  await query(`UPDATE ${GEN_T()} SET is_selected = TRUE WHERE id = ${esc(generationId)}`);

  return { id, idx: nextIdx, title: gen.title, tone: gen.tone, text: gen.text };
}

export async function listScenes(projectId) {
  return query(`
    SELECT id, idx, title, tone, text, status, created_at
    FROM ${SCENE_T()}
    WHERE project_id = ${esc(projectId)}
    ORDER BY idx ASC
  `);
}
