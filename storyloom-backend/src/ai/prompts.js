// Central prompt registry. Bump the *_VERSION string whenever wording changes
// meaningfully — it's stored alongside every generation row for auditability
// and lets you A/B compare prompt versions in Databricks later.

export const PLOT_PROMPT_VERSION = 'plot-v1';
export function plotSystemPrompt() {
  return [
    'You are Storyloom\'s Plot Agent, a writers-room copilot for short-form serialized fiction.',
    'You write a single tight opening-plot paragraph (120-180 words) that hooks a reader in the',
    'first two sentences, introduces the central tension, and ends on a forward-pulling question',
    'or threat. Match the tone implied by the genres/themes. Do not use headings or bullet points.',
    'Output plain prose only — no preamble like "Here is your plot".',
  ].join(' ');
}
export function plotUserPrompt(storyContext) {
  const { genres = [], themes = [], coreStory, background, timeline, characters = [], conflicts = [] } = storyContext;
  return [
    `Genres: ${genres.join(', ') || 'unspecified'}`,
    `Themes: ${themes.join(', ') || 'unspecified'}`,
    `Core story: ${coreStory || 'unspecified'}`,
    `Setting/background: ${background || 'unspecified'}`,
    `Timeline: ${timeline || 'unspecified'}`,
    characters.length ? `Characters: ${characters.map((c) => `${c.name} (${c.role}) — ${c.bio}`).join(' | ')}` : null,
    conflicts.length ? `Known conflicts/hooks: ${conflicts.map((c) => `${c.conflict} -> ${c.hook}`).join(' | ')}` : null,
    'Write the opening plot paragraph now.',
  ].filter(Boolean).join('\n');
}

export const SCENE_PROMPT_VERSION = 'scene-v1';
export function sceneSystemPrompt() {
  return [
    'You are Storyloom\'s Next Scene Agent. Given prior scenes and a chosen story direction (a "hook"),',
    'you write the next scene: 60-110 words of vivid, active prose, third person, present tense.',
    'Preserve established character voices and continuity. End on a beat that sets up the following scene',
    '— do not resolve the episode. Output plain prose only.',
  ].join(' ');
}
export function sceneUserPrompt(option, storyContext) {
  const { priorScenes = [], characters = [] } = storyContext || {};
  return [
    characters.length ? `Cast: ${characters.map((c) => `${c.name} (${c.role})`).join(', ')}` : null,
    priorScenes.length
      ? `Prior scenes:\n${priorScenes.map((s, i) => `${i + 1}. ${s.title}: ${s.text}`).join('\n')}`
      : 'This is the first scene of the episode.',
    `Chosen direction (hook): ${option.hook || option.tone}`,
    `Direction summary: ${option.desc || option.title}`,
    `Seed beat to expand into a full scene: ${option.text}`,
    'Write the next scene now.',
  ].filter(Boolean).join('\n');
}

export const REVIEW_PROMPT_VERSION = 'review-v1';
export function reviewSystemPrompt() {
  return [
    'You are Storyloom\'s Review Agent, a story editor that checks a script draft for pacing,',
    'character-consistency, and unresolved-conflict issues. Return a JSON object shaped exactly as',
    '{ "feedback": [ { "severity": "info"|"warn"|"crit", "category": string,',
    '"text": string, "jump": string|null } ] }. "jump" is a short CTA like "Jump to Scene 2 →" or null.',
    'Return 3-6 items in "feedback", ordered by severity (crit first). Be specific — reference scene numbers/titles.',
  ].join(' ');
}
export function reviewUserPrompt(storyContext) {
  const { scenes = [], characters = [], conflicts = [], resolution } = storyContext;
  return [
    `Characters: ${characters.map((c) => `${c.name} (${c.role}) — ${c.bio}`).join(' | ')}`,
    `Planned resolution: ${resolution || 'unspecified'}`,
    conflicts.length ? `Setup conflicts/hooks: ${conflicts.map((c) => `${c.conflict} -> ${c.hook}`).join(' | ')}` : null,
    `Scenes so far:\n${scenes.map((s, i) => `${i + 1}. ${s.title} (${s.tone}): ${s.text}`).join('\n')}`,
    'Analyze and return the JSON feedback array now.',
  ].filter(Boolean).join('\n');
}

export const IMPACT_PROMPT_VERSION = 'impact-v1';
export function impactSystemPrompt() {
  return [
    'You are Storyloom\'s Review Agent performing a "remove this entity" impact check.',
    'Given a character/element name and the current story, assess what breaks if it is removed.',
    'Return JSON exactly shaped as: { "risk": "safe"|"review"|"high", "summary": string,',
    '"scenes": [{ "label": string, "status": "mentioned"|"featured" }] }.',
  ].join(' ');
}
export function impactUserPrompt(entityName, storyContext) {
  const { scenes = [], characters = [] } = storyContext;
  return [
    `Entity to check: ${entityName}`,
    `Characters: ${characters.map((c) => `${c.name} (${c.role}) — relationships: ${(c.relationships || []).join('; ')}`).join(' | ')}`,
    `Scenes:\n${scenes.map((s, i) => `${i + 1}. ${s.title}: ${s.text}`).join('\n')}`,
    'Return the JSON impact assessment now.',
  ].join('\n');
}

export const RANKING_PROMPT_VERSION = 'ranking-v1';
export function rankingSystemPrompt() {
  return [
    'You are Storyloom\'s greenlight Ranking Agent. Given a project brief, estimate a "score"',
    'and "fit" out of 100, plus a 7-point "spark" trend array (0-100) representing projected',
    'audience engagement over the episode arc. Return JSON exactly: { "score": int, "fit": int,',
    '"spark": [int x7] }. Be a discerning but fair critic — most projects should land 55-90.',
  ].join(' ');
}
export function rankingUserPrompt(project) {
  return [
    `Title: ${project.title}`,
    `Genres: ${(project.genres || []).join(', ')}`,
    `Logline/core story: ${project.coreStory || project.logline || 'unspecified'}`,
    'Return the JSON score now.',
  ].join('\n');
}

export const AUDIENCE_PROMPT_VERSION = 'audience-v1';
export function audienceSystemPrompt() {
  return [
    'You are Storyloom\'s audience-simulation agent, modeling how a viewer panel would respond to a',
    'script. Return JSON exactly: { "demographics": [{"label": string, "value": int0-100}] (6 items:',
    'Age fit, Genre affinity, Patience match, Listening speed, Language reach, Country spread),',
    '"heroScore": int0-100, "whyText": string (2-3 sentences explaining the score, mention the weakest',
    'demographic by name) }.',
  ].join(' ');
}
export function audienceUserPrompt(project) {
  return [
    `Title: ${project.title}`,
    `Genres: ${(project.genres || []).join(', ')}`,
    `Logline: ${project.logline || project.coreStory || 'unspecified'}`,
    `Scene count: ${(project.sceneThumbs || project.scenes || []).length || 'unknown'}`,
    'Return the JSON simulation now.',
  ].join('\n');
}
