export const GENRES = ['Horror', 'Romance', 'Thriller', 'Comedy', 'Sci-Fi', 'Drama', 'Action', 'Mystery'];

export const DEFAULT_SELECTED_GENRES = ['Romance'];

export const DEFAULT_THEMES = ['Rivalry', 'Found family', 'Pride vs vulnerability'];

export const INITIAL_CHARACTERS = [
  {
    id: 'meera',
    name: 'Meera Rajan',
    role: 'Protagonist',
    bio: 'Runs "Coastal Curry" — sharp-tongued, guarded since her family restaurant failed.',
    relationships: ['Rival to Arjun', 'Mentee of Aunty Leela'],
  },
  {
    id: 'arjun',
    name: 'Arjun Nathan',
    role: 'Love interest',
    bio: 'Runs "Fusion Wheels" — charming, hides financial pressure from his crew.',
    relationships: ['Rival to Meera', 'Protective of sister Divya'],
  },
];

export const INITIAL_CONFLICTS = [
  { conflict: 'Slow-burn rivalry could feel repetitive', hook: 'Comedic food-festival sabotage subplot' },
  { conflict: 'Low external stakes for a full arc', hook: 'City permit deadline creates ticking clock' },
];

export const DEFAULT_RESOLUTION =
  "Meera and Arjun team up to fix Arjun's sabotaged truck before the festival judging, exposing the real saboteur (a corporate chain trying to buy out both spots) and winning the shared permit together.";

export const DEFAULT_TIMELINE = 'Present day, over one monsoon season in Chennai';

export const DEFAULT_CORE_STORY =
  'Two rival food-truck owners are forced to share a single parking spot after a city zoning change — and slowly fall for each other while competing for the same customers.';

export const DEFAULT_BACKGROUND =
  'Set in a mid-size coastal city where a new street-food festival is about to decide which truck gets a permanent city contract.';

export const COPILOT_SUGGESTIONS = [
  { label: 'Genre check', text: 'Romance + Comedy pairs well — audiences rate hook-driven romances 22% higher on completion.' },
  { label: 'Cast', text: 'Consider adding a third-party antagonist beyond the rivalry itself — you\'ve done this with the "corporate chain" resolution, nice catch.' },
  { label: 'Pacing', text: 'Two conflict/hook pairs is healthy for a short-form arc. A third can dilute focus.' },
  { label: 'Timeline', text: '"One monsoon season" gives a natural three-act rhythm — building, storm, clearing.' },
];

export const OPENING_PLOT_TEXT =
  "Under Chennai's first monsoon storm of the season, food-truck rivals Meera and Arjun are pushed into an uneasy alliance when the city announces only one of them will win the festival's permanent spot. What begins as petty sabotage and border disputes over a shared parking lot slowly turns into something neither expected — until a corporate buyout offer threatens to take the choice away from both of them entirely.";

export const MINI_CAST = [
  { initials: 'MR', name: 'Meera Rajan', tag: 'Protagonist' },
  { initials: 'AN', name: 'Arjun Nathan', tag: 'Love int.' },
  { initials: 'LA', name: 'Aunty Leela', tag: 'Mentor' },
  { initials: 'DN', name: 'Divya Nathan', tag: 'Supporting' },
];

export const INITIAL_SCENES = [
  {
    title: '1. Parking Lot Standoff',
    tone: 'Tension rising',
    text: "Meera arrives to find Arjun's truck parked in her usual spot. Sharp words, a crowd forms, both refuse to move.",
  },
  {
    title: '2. The City Notice',
    tone: 'Ticking clock',
    text: "A zoning officer posts a notice: only one truck gets the permanent festival spot. Both owners realize they're now direct rivals for survival.",
  },
  {
    title: '3. Reluctant Truce',
    tone: 'Comedic beat',
    text: "A burst water pipe floods both trucks' storage. Forced to share Meera's tiny kitchen overnight, the banter turns almost friendly.",
  },
];

export const NEXT_SCENE_OPTIONS = [
  {
    id: 'sabotage',
    hook: 'Comedic hook',
    title: 'Sabotage at the Stalls',
    desc: 'Spice-label chaos forces an instinctive team-up in front of the judges.',
    tone: 'Comedic hook',
    text: 'Someone swaps the spice labels in both trucks minutes before the festival judges arrive — chaos ensues, and Meera and Arjun instinctively cover for each other without thinking.',
  },
  {
    id: 'divya-warning',
    hook: 'Emotional stakes',
    title: "Divya's Warning",
    desc: 'A private confrontation reveals how much Arjun has risked on this.',
    tone: 'Emotional stakes',
    text: "Arjun's sister Divya confronts Meera privately, revealing Arjun secretly remortgaged his home for the truck — raising the stakes of what losing the permit really means.",
  },
  {
    id: 'corporate-offer',
    hook: 'Action / tension hook',
    title: 'The Corporate Offer',
    desc: 'A buyout offer plants the real antagonist and a shared decision.',
    tone: 'Action / tension hook',
    text: 'A rep from a food-truck chain quietly offers to buy out whichever of them loses the permit — planting the seed of the real antagonist and forcing a decision neither wants to make alone.',
  },
];

export const CHARACTER_PROFILES = {
  meera: {
    name: 'Meera Rajan',
    role: 'Protagonist',
    bio: 'Runs "Coastal Curry." Sharp-tongued and guarded since her family restaurant failed years ago. Slowly learns to let people in.',
    scenes: ['1. Parking Lot Standoff', '2. The City Notice', '3. Reluctant Truce'],
    rels: [['Arjun', 'Rivalry → romance'], ['Aunty Leela', 'Mentee']],
  },
  arjun: {
    name: 'Arjun Nathan',
    role: 'Love interest',
    bio: 'Runs "Fusion Wheels." Charming on the surface, hiding real financial pressure from his crew and his sister.',
    scenes: ['1. Parking Lot Standoff', '2. The City Notice', '3. Reluctant Truce'],
    rels: [['Meera', 'Rivalry → romance'], ['Divya', 'Protective older brother']],
  },
  leela: {
    name: 'Aunty Leela',
    role: 'Mentor',
    bio: "Retired restaurateur who took Meera in after her family's place closed. Wise, blunt, deeply loyal.",
    scenes: ['1. Parking Lot Standoff (mentioned)'],
    rels: [['Meera', 'Mentor']],
  },
  divya: {
    name: 'Divya Nathan',
    role: 'Supporting',
    bio: "Arjun's younger sister and part of his crew. Sees through his bravado faster than anyone.",
    scenes: ['Planned: Scene 4'],
    rels: [['Arjun', 'Sibling']],
  },
};

export const GRAPH_NODES = [
  { id: 'meera', cx: 300, cy: 230, r: 34, fill: '#D98C3D', labelDx: 0, labelDy: 4, labelColor: '#1B1611', labelSize: undefined, label: 'Meera' },
  { id: 'arjun', cx: 420, cy: 120, r: 30, fill: '#E8B073', labelDx: 0, labelDy: 4, labelColor: '#1B1611', labelSize: undefined, label: 'Arjun' },
  { id: 'leela', cx: 150, cy: 330, r: 24, fill: '#4C6B8A', labelDx: 0, labelDy: 4, labelColor: '#fff', labelSize: 10, label: 'Leela' },
  { id: 'divya', cx: 450, cy: 330, r: 22, fill: '#8a5c56', labelDx: 0, labelDy: 4, labelColor: '#fff', labelSize: 10, label: 'Divya' },
];

export const GRAPH_EDGES = [
  { x1: 300, y1: 230, x2: 180, y2: 120, stroke: '#D98C3D', dashed: false },
  { x1: 300, y1: 230, x2: 420, y2: 120, stroke: '#D98C3D', dashed: false },
  { x1: 300, y1: 230, x2: 150, y2: 330, stroke: '#7A93B0', dashed: true },
  { x1: 420, y1: 120, x2: 450, y2: 330, stroke: '#D9534F', dashed: false },
  { x1: 420, y1: 120, x2: 300, y2: 230, stroke: '#D98C3D', dashed: false },
  { x1: 450, y1: 330, x2: 300, y2: 230, stroke: '#7A93B0', dashed: true },
];

export const GRAPH_EDGE_LABELS = [
  { x: 240, y: 172, text: 'rivals', color: '#D98C3D' },
  { x: 370, y: 172, text: 'falling for', color: '#D98C3D' },
  { x: 190, y: 278, text: 'mentee', color: '#7A93B0' },
  { x: 450, y: 220, text: 'protective', color: '#D9534F' },
];

export const FEEDBACK_ITEMS = [
  {
    severity: 'info',
    category: 'Pacing',
    text: 'Scenes 1–2 both open with confrontation. Consider a quieter beat before scene 3 to vary rhythm.',
    jump: 'Jump to Scene 2 →',
  },
  {
    severity: 'warn',
    category: 'Character consistency',
    text: 'Arjun is described as "hiding financial pressure" in the template, but scene 3 doesn\'t reflect any guardedness yet.',
    jump: 'Jump to Scene 3 →',
  },
  {
    severity: 'crit',
    category: 'Unresolved conflict',
    text: 'The "corporate chain buyout" resolution hasn\'t been set up anywhere yet — introduce it before the climax to avoid a plot hole.',
    jump: 'Add setup scene →',
  },
  {
    severity: 'info',
    category: 'Tone',
    text: "Scene 3's comedic beat lands well against the ticking-clock tension from scene 2 — good contrast, keep this rhythm going.",
    jump: null,
  },
];

export const IMPACT_RESULT = {
  risk: 'review',
  summary: 'Aunty Leela appears in 3 scenes across 1 episode and is referenced in Meera\'s mentorship arc.',
  scenes: [
    { label: 'Scene 1 — Parking Lot Standoff', status: 'mentioned' },
    { label: 'Scene 5 — Kitchen Wisdom (planned)', status: 'featured' },
    { label: 'Resolution — final festival scene', status: 'featured' },
  ],
};

export const PROJECTS = [
  { title: 'Coastal Curry & Fusion Wheels', genres: ['Romance', 'Comedy'], score: 87, fit: 91, spark: [30, 45, 38, 60, 72, 68, 80] },
  { title: 'The Last Signal', genres: ['Sci-Fi', 'Thriller'], score: 79, fit: 83, spark: [50, 40, 55, 48, 62, 58, 70] },
  { title: 'Nightshade Manor', genres: ['Horror'], score: 74, fit: 76, spark: [20, 35, 42, 30, 55, 60, 64] },
  { title: 'Second Innings', genres: ['Drama'], score: 68, fit: 70, spark: [40, 38, 45, 42, 50, 48, 55] },
  { title: 'Punchline City', genres: ['Comedy', 'Action'], score: 63, fit: 65, spark: [25, 30, 28, 40, 38, 45, 50] },
  { title: 'Whistleblower', genres: ['Mystery', 'Drama'], score: 58, fit: 60, spark: [35, 30, 32, 28, 34, 30, 38] },
];

export const SCRIPT_DETAIL = {
  logline: 'Two rival food-truck owners are forced to share one parking spot — and fall for each other while competing for the same city permit.',
  tags: ['Romance', 'Comedy', '6 episodes'],
  sceneThumbs: [
    '1. Parking Lot Standoff',
    '2. The City Notice',
    '3. Reluctant Truce',
    '4. Sabotage at Stalls',
    '5. Kitchen Wisdom',
    '6. Festival Judging',
  ],
  demographics: [
    { label: 'Age fit', value: 81 },
    { label: 'Genre affinity', value: 91 },
    { label: 'Patience match', value: 64 },
    { label: 'Listening speed', value: 77 },
    { label: 'Language reach', value: 88 },
    { label: 'Country spread', value: 69 },
  ],
  heroScore: 87,
  whyText:
    'High patience-score audiences respond well to this pacing, and genre affinity for Romance+Comedy blends is currently trending 14% above baseline across the 500-viewer panel. Country spread is the main drag — reach skews heavily toward South Asian audiences.',
};
