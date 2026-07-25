// TODO(backend): replace with a real call to your next-scene agent,
// e.g. POST /api/projects/:id/scenes with { option, storyContext }.
export async function generateNextScene(option, storyContext) {
  await new Promise((resolve) => setTimeout(resolve, 1300));
  return { title: option.title, tone: option.tone, text: option.text };
}
