// Knowledge Graph agent — unlike the plot/scene/review agents this doesn't
// call the LLM. The graph is derived deterministically from the project's
// own characters + relationships + scenes, so it's cheap to recompute on
// every request and always exactly matches what's in the story right now.

const PALETTE = [
  { fill: '#D98C3D', labelColor: '#1B1611' },
  { fill: '#E8B073', labelColor: '#1B1611' },
  { fill: '#4C6B8A', labelColor: '#fff' },
  { fill: '#8a5c56', labelColor: '#fff' },
  { fill: '#6b8a5c', labelColor: '#fff' },
  { fill: '#8a7a5c', labelColor: '#fff' },
];

const EDGE_KEYWORDS = [
  { test: /rival|romanc|falling|love|crush/i, stroke: '#D98C3D', label: 'romantic / rivalry', dashed: false },
  { test: /mentor|mentee|guardian|teach/i, stroke: '#7A93B0', label: 'mentorship', dashed: true },
  { test: /protect|conflict|antagon|threat|enem/i, stroke: '#D9534F', label: 'protective / conflict', dashed: false },
];

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function classifyRelationship(text) {
  const match = EDGE_KEYWORDS.find((k) => k.test.test(text));
  return match || { stroke: '#7A93B0', label: 'connected', dashed: true };
}

/**
 * Builds { nodes, edges, edgeLabels, profiles } from the project's
 * characters + free-text relationships + accepted scenes.
 * `storyContext.characters` items look like { id, name, role, bio, relationships }
 * where relationships are free-text strings like "Rival to Arjun".
 * `storyContext.scenes` items look like { title, tone, text }.
 */
export function getKnowledgeGraph(storyContext) {
  const characters = storyContext?.characters || [];
  const scenes = storyContext?.scenes || [];

  if (!characters.length) {
    return { nodes: [], edges: [], edgeLabels: [], profiles: {} };
  }

  const byName = new Map(characters.map((c) => [c.name.toLowerCase(), c]));
  const ids = characters.map((c) => c.id || slugify(c.name));

  // Simple circular layout so the graph always renders sensibly regardless
  // of cast size, instead of hand-placed coordinates for a fixed cast.
  const cx = 300, cy = 250, radius = characters.length > 1 ? 160 : 0;
  const nodePositions = characters.map((c, i) => {
    const angle = (2 * Math.PI * i) / characters.length - Math.PI / 2;
    return {
      x: Math.round(cx + radius * Math.cos(angle)),
      y: Math.round(cy + radius * Math.sin(angle)),
    };
  });

  const mentionCounts = characters.map((c) =>
    scenes.filter((s) => `${s.title} ${s.text}`.toLowerCase().includes(c.name.toLowerCase().split(' ')[0])).length
  );
  const maxMentions = Math.max(1, ...mentionCounts);

  const nodes = characters.map((c, i) => {
    const id = ids[i];
    const palette = PALETTE[i % PALETTE.length];
    const prominence = mentionCounts[i] / maxMentions; // 0..1, drives node size
    return {
      id,
      cx: nodePositions[i].x,
      cy: nodePositions[i].y,
      r: Math.round(20 + prominence * 16),
      fill: palette.fill,
      labelColor: palette.labelColor,
      labelDy: 4,
      labelSize: i === 0 ? undefined : 10,
      label: c.name.split(' ')[0],
    };
  });

  const edges = [];
  const edgeLabels = [];
  const seenPairs = new Set();

  characters.forEach((c, i) => {
    for (const rel of c.relationships || []) {
      // Free-text relationship strings look like "Rival to Arjun" or
      // "Mentee of Aunty Leela" — find which other cast member they name.
      const target = characters.find((other, j) => j !== i && rel.toLowerCase().includes(other.name.toLowerCase().split(' ')[0].toLowerCase()));
      if (!target) continue;
      const j = characters.indexOf(target);
      const pairKey = [ids[i], ids[j]].sort().join('::');
      if (seenPairs.has(pairKey)) continue;
      seenPairs.add(pairKey);

      const { stroke, label, dashed } = classifyRelationship(rel);
      edges.push({
        x1: nodePositions[i].x, y1: nodePositions[i].y,
        x2: nodePositions[j].x, y2: nodePositions[j].y,
        stroke, dashed,
      });
      edgeLabels.push({
        x: Math.round((nodePositions[i].x + nodePositions[j].x) / 2),
        y: Math.round((nodePositions[i].y + nodePositions[j].y) / 2),
        text: rel.length > 22 ? label : rel.toLowerCase(),
        color: stroke,
      });
    }
  });

  const profiles = {};
  characters.forEach((c, i) => {
    const firstName = c.name.split(' ')[0].toLowerCase();
    const appearances = scenes
      .map((s, idx) => ({ s, idx }))
      .filter(({ s }) => `${s.title} ${s.text}`.toLowerCase().includes(firstName))
      .map(({ s, idx }) => `${idx + 1}. ${s.title}`);

    profiles[ids[i]] = {
      name: c.name,
      role: c.role,
      bio: c.bio || '',
      rels: (c.relationships || []).map((rel) => {
        const target = characters.find((other) => other !== c && rel.toLowerCase().includes(other.name.split(' ')[0].toLowerCase()));
        return [target ? target.name.split(' ')[0] : rel.split(' ').slice(-1)[0], rel];
      }),
      scenes: appearances.length ? appearances : ['Not yet appeared in a written scene'],
    };
  });

  return { nodes, edges, edgeLabels, profiles };
}
