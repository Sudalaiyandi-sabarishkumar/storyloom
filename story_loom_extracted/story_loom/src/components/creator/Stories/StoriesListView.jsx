import { useEffect, useState } from 'react';
import { listProjects } from '../../../services/projectsService.js';

const STATUS_LABEL = {
  draft: 'Draft',
  in_review: 'Submitted',
  ranked: 'Ranked',
  greenlit: 'Greenlit',
};

export default function StoriesListView({ active, onOpenStory, onNewProject }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const items = await listProjects();
        if (!cancelled) setStories(items);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load your stories.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [active]);

  return (
    <div id="c-stories" className={`view ${active ? 'active' : ''}`}>
      <div className="page-head">
        <div className="eyebrow">Creator studio</div>
        <div className="page-title">My stories</div>
        <div className="page-sub">Pick up where you left off, or start something new.</div>
      </div>

      {error && <div className="section-hint" style={{ color: 'var(--c-danger, #D9534F)' }}>{error}</div>}

      {loading ? (
        <div className="card drawer-empty">Loading your stories…</div>
      ) : (
        <div className="story-grid">
          <button type="button" className="card story-card new-story-card" onClick={onNewProject}>
            <div className="story-card-plus">+</div>
            <div className="story-card-title">New project</div>
          </button>

          {stories.map((story) => (
            <button
              type="button"
              className="card story-card"
              key={story.id}
              onClick={() => onOpenStory(story)}
            >
              <div className={`impact-badge status-badge status-${story.status}`}>
                {STATUS_LABEL[story.status] || story.status}
              </div>
              <div className="story-card-title">{story.title || 'Untitled project'}</div>
              {Array.isArray(story.genres) && story.genres.length > 0 && (
                <div className="story-card-genres">{story.genres.join(' · ')}</div>
              )}
            </button>
          ))}

          {stories.length === 0 && (
            <div className="card drawer-empty story-empty">No stories yet — start your first one.</div>
          )}
        </div>
      )}
    </div>
  );
}
