import { v4 as uuid } from 'uuid';
import { query, qualifiedTable, esc, escArray } from '../databricksClient.js';

const PROJECT_T = () => qualifiedTable('projects');
const CHAR_T = () => qualifiedTable('characters');
const CONFLICT_T = () => qualifiedTable('conflicts');
const SCENE_T = () => qualifiedTable('scenes');
const PLOT_T = () => qualifiedTable('plot_generations');

export async function createProject(input) {
  const id = uuid();
  await query(`
    INSERT INTO ${PROJECT_T()}
      (id, title, genres, themes, background, core_story, timeline, resolution, status, created_at, updated_at)
    VALUES (
      ${esc(id)}, ${esc(input.title)}, ${escArray(input.genres)}, ${escArray(input.themes)},
      ${esc(input.background)}, ${esc(input.coreStory)}, ${esc(input.timeline)}, ${esc(input.resolution)},
      'draft', current_timestamp(), current_timestamp()
    )
  `);

  for (const c of input.characters || []) {
    await query(`
      INSERT INTO ${CHAR_T()} (id, project_id, name, role, bio, relationships, created_at)
      VALUES (${esc(uuid())}, ${esc(id)}, ${esc(c.name)}, ${esc(c.role)}, ${esc(c.bio)}, ${escArray(c.relationships)}, current_timestamp())
    `);
  }
  for (const c of input.conflicts || []) {
    await query(`
      INSERT INTO ${CONFLICT_T()} (id, project_id, conflict, hook, created_at)
      VALUES (${esc(uuid())}, ${esc(id)}, ${esc(c.conflict)}, ${esc(c.hook)}, current_timestamp())
    `);
  }

  return getProject(id);
}

/**
 * Upserts the project's top-level fields and fully replaces its
 * characters/conflicts lists (simplest correct semantics for a wizard-style
 * "edit and regenerate" flow — avoids diffing stale ids from the client).
 */
export async function updateProject(id, input) {
  const existing = await query(`SELECT id FROM ${PROJECT_T()} WHERE id = ${esc(id)}`);
  if (!existing.length) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }

  const sets = [];
  if (input.title !== undefined) sets.push(`title = ${esc(input.title)}`);
  if (input.genres !== undefined) sets.push(`genres = ${escArray(input.genres)}`);
  if (input.themes !== undefined) sets.push(`themes = ${escArray(input.themes)}`);
  if (input.background !== undefined) sets.push(`background = ${esc(input.background)}`);
  if (input.coreStory !== undefined) sets.push(`core_story = ${esc(input.coreStory)}`);
  if (input.timeline !== undefined) sets.push(`timeline = ${esc(input.timeline)}`);
  if (input.resolution !== undefined) sets.push(`resolution = ${esc(input.resolution)}`);
  sets.push(`updated_at = current_timestamp()`);

  if (sets.length) {
    await query(`UPDATE ${PROJECT_T()} SET ${sets.join(', ')} WHERE id = ${esc(id)}`);
  }

  if (input.characters !== undefined) {
    await query(`DELETE FROM ${CHAR_T()} WHERE project_id = ${esc(id)}`);
    for (const c of input.characters) {
      await query(`
        INSERT INTO ${CHAR_T()} (id, project_id, name, role, bio, relationships, created_at)
        VALUES (${esc(uuid())}, ${esc(id)}, ${esc(c.name)}, ${esc(c.role)}, ${esc(c.bio)}, ${escArray(c.relationships)}, current_timestamp())
      `);
    }
  }
  if (input.conflicts !== undefined) {
    await query(`DELETE FROM ${CONFLICT_T()} WHERE project_id = ${esc(id)}`);
    for (const c of input.conflicts) {
      await query(`
        INSERT INTO ${CONFLICT_T()} (id, project_id, conflict, hook, created_at)
        VALUES (${esc(uuid())}, ${esc(id)}, ${esc(c.conflict)}, ${esc(c.hook)}, current_timestamp())
      `);
    }
  }

  return getProject(id);
}

export async function getProject(id) {
  const [project] = await query(`SELECT * FROM ${PROJECT_T()} WHERE id = ${esc(id)}`);
  if (!project) return null;
  const characters = await query(`SELECT * FROM ${CHAR_T()} WHERE project_id = ${esc(id)}`);
  const conflicts = await query(`SELECT * FROM ${CONFLICT_T()} WHERE project_id = ${esc(id)}`);
  const scenes = await query(`SELECT * FROM ${SCENE_T()} WHERE project_id = ${esc(id)} ORDER BY idx ASC`);
  return { ...project, characters, conflicts, scenes };
}

export async function listProjects() {
  return query(`SELECT id, title, genres, status, created_at FROM ${PROJECT_T()} ORDER BY created_at DESC`);
}

/** Returns the currently-selected opening plot text for a project, or null. */
export async function getSelectedPlotText(projectId) {
  const [row] = await query(`
    SELECT text FROM ${PLOT_T()} WHERE project_id = ${esc(projectId)} AND is_selected = TRUE
    ORDER BY created_at DESC LIMIT 1
  `);
  return row?.text || null;
}

/** Builds the storyContext shape the AI agents/prompts expect. */
export async function buildStoryContext(projectId) {
  const project = await getProject(projectId);
  if (!project) return null;
  const openingPlot = await getSelectedPlotText(projectId);
  return {
    genres: project.genres || [],
    themes: project.themes || [],
    coreStory: project.core_story,
    background: project.background,
    timeline: project.timeline,
    resolution: project.resolution,
    openingPlot,
    // ids are preserved so downstream consumers (e.g. the knowledge graph) can
    // stitch generated data back to the character rows they came from.
    characters: project.characters.map((c) => ({
      id: c.id, name: c.name, role: c.role, bio: c.bio, relationships: c.relationships || [],
    })),
    conflicts: project.conflicts.map((c) => ({ conflict: c.conflict, hook: c.hook })),
    priorScenes: project.scenes.map((s) => ({ title: s.title, tone: s.tone, text: s.text })),
    scenes: project.scenes.map((s) => ({ title: s.title, tone: s.tone, text: s.text })),
  };
}
