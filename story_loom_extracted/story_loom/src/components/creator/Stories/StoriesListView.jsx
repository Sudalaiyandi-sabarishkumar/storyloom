import { useEffect, useState } from 'react';
import { listProjects, getProjectDetail } from '../../../services/projectsService.js';
import { downloadStoryDocument } from '../../../utils/exportStory.js';

const STATUS_LABEL = {
  draft: 'Draft',
  in_review: 'Submitted',
  ranked: 'Ranked',
  greenlit: 'Greenlit',
};

export default function StoriesListView({ active, onOpenStory, onNewProject, openingStoryId, openError }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState('');

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

  async function handleDownload(e, story) {
    e.stopPropagation();
    setDownloadingId(story.id);
    setDownloadError('');
    try {
      const detail = await getProjectDetail(story.id);
      downloadStoryDocument(detail);
    } catch (err) {
      setDownloadError(err.message || 'Could not download that story — try again.');
    } finally {
      setDownloadingId(null);
    }
  }

  const busy = Boolean(openingStoryId);

  return (
    <div id="c-stories" className={`view ${active ? 'active' : ''}`}>
      <div className="page-head">
        <div className="eyebrow">Creator studio</div>
        <div className="page-title">My stories</div>
        <div className="page-sub">Pick up where you left off, or start something new.</div>
      </div>

      {error && <div className="section-hint" style={{ color: 'var(--c-danger, #D9534F)' }}>{error}</div>}
      {openError && <div className="section-hint" style={{ color: 'var(--c-danger, #D9534F)' }}>{openError}</div>}
      {downloadError && <div className="section-hint" style={{ color: 'var(--c-danger, #D9534F)' }}>{downloadError}</div>}

      {loading ? (
        <div className="card drawer-empty">Loading your stories…</div>
      ) : (
        <div className="story-grid">
          <button type="button" className="card story-card new-story-card" onClick={onNewProject} disabled={busy}>
            <div className="story-card-plus">+</div>
            <div className="story-card-title">New project</div>
          </button>

          {stories.map((story) => {
            const isOpening = openingStoryId === story.id;
            const isDownloading = downloadingId === story.id;
            return (
              <div
                role="button"
                tabIndex={0}
                className={`card story-card ${busy ? 'story-card-disabled' : ''}`}
                key={story.id}
                onClick={() => !busy && onOpenStory(story)}
                onKeyDown={(e) => { if (!busy && (e.key === 'Enter' || e.key === ' ')) onOpenStory(story); }}
              >
                {isOpening && (
                  <div className="story-card-loading">
                    <span className="spinner"></span> Opening…
                  </div>
                )}
                <div className={`impact-badge status-badge status-${story.status}`}>
                  {STATUS_LABEL[story.status] || story.status}
                </div>
                <div className="story-card-title">{story.title || 'Untitled project'}</div>
                {Array.isArray(story.genres) && story.genres.length > 0 && (
                  <div className="story-card-genres">{story.genres.join(' · ')}</div>
                )}
                <button
                  type="button"
                  className="ghost-btn story-download-btn"
                  onClick={(e) => handleDownload(e, story)}
                  disabled={isDownloading}
                >
                  {isDownloading ? 'Downloading…' : '⬇ Download'}
                </button>
              </div>
            );
          })}

          {stories.length === 0 && (
            <div className="card drawer-empty story-empty">No stories yet — start your first one.</div>
          )}
        </div>
      )}
    </div>
  );
}
