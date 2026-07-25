import { GENRES } from '../../../data/mockData.js';

export default function GenreSection({ selectedGenres, onToggle }) {
  return (
    <div className="card section-card">
      <div className="section-label">Genre</div>
      <div className="section-hint">Pick your primary genre. Select more than one to blend tones.</div>
      <div className="chip-row">
        {GENRES.map((genre) => (
          <button
            key={genre}
            className={`chip ${selectedGenres.includes(genre) ? 'selected' : ''}`}
            onClick={() => onToggle(genre)}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
}
