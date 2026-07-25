// Formats a full project (as returned by GET /projects/:id) into a plain-text
// document and triggers a browser download. Used by the story card's
// "Download" action in both Creator Studio and Director's Room.
function formatStoryDocument(project) {
  const title = project.title || 'Untitled project';
  const lines = [title, '='.repeat(title.length), ''];

  if (project.genres?.length) lines.push(`Genres: ${project.genres.join(', ')}`);
  if (project.themes?.length) lines.push(`Themes: ${project.themes.join(', ')}`);
  lines.push('');

  if (project.openingPlot) {
    lines.push('OPENING PLOT', '------------', project.openingPlot, '');
  }

  if (project.characters?.length) {
    lines.push('CHARACTERS', '----------');
    for (const c of project.characters) {
      lines.push(`${c.name}${c.role ? ` (${c.role})` : ''}${c.bio ? ` — ${c.bio}` : ''}`);
      if (c.relationships?.length) lines.push(`  Relationships: ${c.relationships.join(', ')}`);
    }
    lines.push('');
  }

  if (project.conflicts?.length) {
    lines.push('CONFLICTS', '---------');
    for (const c of project.conflicts) lines.push(`- ${c.conflict} (hook: ${c.hook})`);
    lines.push('');
  }

  if (project.scenes?.length) {
    lines.push('SCENES', '------');
    project.scenes.forEach((s, i) => {
      lines.push(`${i + 1}. ${s.title}${s.tone ? ` [${s.tone}]` : ''}`, s.text, '');
    });
  }

  return lines.join('\n');
}

export function downloadStoryDocument(project) {
  const text = formatStoryDocument(project);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const safeTitle = (project.title || 'story').trim().replace(/[^\w\-]+/g, '_') || 'story';

  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeTitle}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
