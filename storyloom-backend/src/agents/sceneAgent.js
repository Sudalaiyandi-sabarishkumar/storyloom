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

async function getScene(projectId, sceneId) {
  const [scene] = await query(`
    SELECT * FROM ${SCENE_T()} WHERE id = ${esc(sceneId)} AND project_id = ${esc(projectId)}
  `);
  return scene || null;
}

/** Direct in-place edit of an accepted scene — not versioned, like the plot's updatePlotText. */
export async function updateScene(projectId, sceneId, { title, tone, text }) {
  const existing = await getScene(projectId, sceneId);
  if (!existing) throw Object.assign(new Error('Scene not found'), { status: 404 });

  const sets = [];
  if (title !== undefined) sets.push(`title = ${esc(title)}`);
  if (tone !== undefined) sets.push(`tone = ${esc(tone)}`);
  if (text !== undefined) sets.push(`text = ${esc(text)}`);
  sets.push(`updated_at = current_timestamp()`);

  await query(`UPDATE ${SCENE_T()} SET ${sets.join(', ')} WHERE id = ${esc(sceneId)} AND project_id = ${esc(projectId)}`);
  return getScene(projectId, sceneId);
}

export async function deleteScene(projectId, sceneId) {
  const existing = await getScene(projectId, sceneId);
  if (!existing) throw Object.assign(new Error('Scene not found'), { status: 404 });
  await query(`DELETE FROM ${SCENE_T()} WHERE id = ${esc(sceneId)} AND project_id = ${esc(projectId)}`);
}

/** Case/whitespace-insensitive delete used by the Review Agent's "Remove anyway" flow. */
export async function deleteSceneByTitle(projectId, title) {
  const matches = await query(`
    SELECT id FROM ${SCENE_T()}
    WHERE project_id = ${esc(projectId)} AND LOWER(TRIM(title)) = LOWER(TRIM(${esc(title)}))
  `);
  if (!matches.length) return false;
  await query(`
    DELETE FROM ${SCENE_T()}
    WHERE project_id = ${esc(projectId)} AND LOWER(TRIM(title)) = LOWER(TRIM(${esc(title)}))
  `);
  return true;
}

/**
 * Regenerates an already-accepted scene in place: keeps its title/tone/idx
 * (so its position in the timeline is stable) but rewrites its text, grounded
 * in the same prior-scenes context as generateNextScene minus itself.
 */
export async function regenerateSceneInPlace(projectId, sceneId, storyContext) {
  const scene = await getScene(projectId, sceneId);
  if (!scene) throw Object.assign(new Error('Scene not found'), { status: 404 });

  const priorScenes = (storyContext.priorScenes || []).filter((s) => s.title !== scene.title);
  const option = { title: scene.title, tone: scene.tone, hook: scene.tone, desc: scene.title, text: scene.text };

  const text = await generateText({
    system: sceneSystemPrompt(),
    prompt: sceneUserPrompt(option, { ...storyContext, priorScenes }),
    temperature: Math.min(1, config.ai.temperature + 0.1),
  });

  await query(`UPDATE ${SCENE_T()} SET text = ${esc(text)}, updated_at = current_timestamp() WHERE id = ${esc(sceneId)} AND project_id = ${esc(projectId)}`);
  return getScene(projectId, sceneId);
}
