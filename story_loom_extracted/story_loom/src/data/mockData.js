export const GENRES = ['Horror', 'Romance', 'Thriller', 'Comedy', 'Sci-Fi', 'Drama', 'Action', 'Mystery'];

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
