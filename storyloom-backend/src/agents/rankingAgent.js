import { v4 as uuid } from 'uuid';
import { generateJSON } from '../ai/index.js';
import {
  rankingSystemPrompt, rankingUserPrompt, RANKING_PROMPT_VERSION,
  audienceSystemPrompt, audienceUserPrompt, AUDIENCE_PROMPT_VERSION,
} from '../ai/prompts.js';
import { query, qualifiedTable, esc, escArray } from '../db/databricksClient.js';
import { config } from '../config/index.js';

const RANK_T = () => qualifiedTable('rankings');
const AUD_T = () => qualifiedTable('audience_simulations');
const PROJECT_T = () => qualifiedTable('projects');

/**
 * Returns the Director Room rankings list. Recomputes any project whose
 * score is missing/stale; otherwise serves the last computed Databricks row.
 * Swap the scoring call for a Databricks Model Serving endpoint (see
 * scoreWithModelServing below) once you have a trained ranking model.
 */
export async function getRankings({ forceRecompute = false } = {}) {
  const projects = await query(`SELECT id, title, genres, core_story FROM ${PROJECT_T()}`);

  const results = [];
  for (const p of projects) {
    let row = forceRecompute ? null : (await query(`
      SELECT title, genres, score, fit, spark_json FROM ${RANK_T()}
      WHERE project_id = ${esc(p.id)} ORDER BY computed_at DESC LIMIT 1
    `))[0];

    if (!row) {
      const scored = await scoreProject(p);
      await persistRanking(p, scored);
      row = { title: p.title, genres: p.genres, score: scored.score, fit: scored.fit, spark_json: JSON.stringify(scored.spark) };
    }

    results.push({
      title: row.title,
      genres: row.genres,
      score: row.score,
      fit: row.fit,
      spark: JSON.parse(row.spark_json),
    });
  }
  return results.sort((a, b) => b.score - a.score);
}

export async function recomputeRanking(projectId) {
  const [p] = await query(`SELECT id, title, genres, core_story FROM ${PROJECT_T()} WHERE id = ${esc(projectId)}`);
  if (!p) throw Object.assign(new Error('Project not found'), { status: 404 });
  const scored = await scoreProject(p);
  await persistRanking(p, scored);
  return { title: p.title, genres: p.genres, ...scored };
}

async function scoreProject(project) {
  if (config.databricks.servingEndpointUrl) {
    return scoreWithModelServing(project);
  }
  const result = await generateJSON({
    system: rankingSystemPrompt(),
    prompt: rankingUserPrompt({ title: project.title, genres: project.genres, coreStory: project.core_story }),
    temperature: 0.5,
  });
  return {
    score: clampInt(result.score, 0, 100, 60),
    fit: clampInt(result.fit, 0, 100, 60),
    spark: normalizeSpark(result.spark),
  };
}

/**
 * Example adapter for a real Databricks-hosted ranking model (e.g. a
 * gradient-boosted model logged with MLflow and served via Model Serving).
 * Point DATABRICKS_SERVING_ENDPOINT_URL at .../serving-endpoints/<name>/invocations
 */
async function scoreWithModelServing(project) {
  const resp = await fetch(config.databricks.servingEndpointUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.databricks.servingToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dataframe_records: [
        { title: project.title, genres: (project.genres || []).join('|'), core_story: project.core_story },
      ],
    }),
  });
  if (!resp.ok) throw new Error(`Model serving call failed: ${resp.status} ${await resp.text()}`);
  const data = await resp.json();
  const pred = data.predictions?.[0] || {};
  return {
    score: clampInt(pred.score, 0, 100, 60),
    fit: clampInt(pred.fit, 0, 100, 60),
    spark: normalizeSpark(pred.spark),
  };
}

async function persistRanking(project, scored) {
  await query(`
    INSERT INTO ${RANK_T()} (id, project_id, title, genres, score, fit, spark_json, computed_at)
    VALUES (${esc(uuid())}, ${esc(project.id)}, ${esc(project.title)}, ${escArray(project.genres)}, ${scored.score}, ${scored.fit}, ${esc(JSON.stringify(scored.spark))}, current_timestamp())
  `);
}

/** Audience-simulation panel for a single project's Script Detail view. */
export async function getAudienceSimulation(projectTitle, { forceRecompute = false } = {}) {
  const [p] = await query(`
    SELECT id, title, genres, core_story FROM ${PROJECT_T()} WHERE title = ${esc(projectTitle)}
  `);
  if (!p) throw Object.assign(new Error('Project not found'), { status: 404 });

  const sceneThumbs = (await query(`
    SELECT title FROM ${qualifiedTable('scenes')} WHERE project_id = ${esc(p.id)} ORDER BY idx ASC
  `)).map((s) => s.title);

  if (!forceRecompute) {
    const [cached] = await query(`
      SELECT logline, tags, demographics_json, hero_score, why_text
      FROM ${AUD_T()} WHERE project_id = ${esc(p.id)} ORDER BY computed_at DESC LIMIT 1
    `);
    if (cached) return formatAudience(cached, sceneThumbs);
  }

  const result = await generateJSON({
    system: audienceSystemPrompt(),
    prompt: audienceUserPrompt({ title: p.title, genres: p.genres, logline: p.core_story }),
    temperature: 0.5,
  });

  const demographics = (Array.isArray(result.demographics) ? result.demographics : [])
    .map((d) => ({ label: d.label, value: clampInt(d.value, 0, 100, 50) }));
  const heroScore = clampInt(result.heroScore, 0, 100, 60);
  const whyText = result.whyText || '';
  const tags = [...(p.genres || [])];

  await query(`
    INSERT INTO ${AUD_T()} (id, project_id, logline, tags, demographics_json, hero_score, why_text, computed_at)
    VALUES (${esc(uuid())}, ${esc(p.id)}, ${esc(p.core_story || '')}, ${escArray(tags)}, ${esc(JSON.stringify(demographics))}, ${heroScore}, ${esc(whyText)}, current_timestamp())
  `);

  return { logline: p.core_story || '', tags, sceneThumbs, demographics, heroScore, whyText };
}

function formatAudience(row, sceneThumbs) {
  return {
    logline: row.logline,
    tags: row.tags,
    sceneThumbs,
    demographics: JSON.parse(row.demographics_json),
    heroScore: row.hero_score,
    whyText: row.why_text,
  };
}

function clampInt(v, min, max, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function normalizeSpark(spark) {
  if (!Array.isArray(spark) || spark.length === 0) return [40, 45, 50, 55, 60, 62, 65];
  const seven = spark.slice(0, 7);
  while (seven.length < 7) seven.push(seven[seven.length - 1] ?? 50);
  return seven.map((n) => Math.max(0, Math.min(100, Math.round(Number(n) || 50))));
}
