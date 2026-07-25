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
