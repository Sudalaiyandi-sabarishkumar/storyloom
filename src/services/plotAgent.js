import { OPENING_PLOT_TEXT } from '../data/mockData.js';

// TODO(backend): replace with a real call to your plot-generation agent/API,
// e.g. POST /api/projects/:id/opening-plot with the story context below.
export async function generateOpeningPlot(storyContext) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return OPENING_PLOT_TEXT;
}
