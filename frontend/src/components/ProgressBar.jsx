export default function ProgressBar({ percent = 0 }) {
  const safePercent = Math.min(100, Math.max(0, Math.round(percent)));
  const color =
    safePercent === 100 ? 'var(--success)' :
    safePercent >= 50  ? 'var(--accent)'  :
    '#2d6a8a';

  return (
    <div className="progress-bar-wrap" role="progressbar" aria-valuenow={safePercent} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{
            width: `${safePercent}%`,
            background: `linear-gradient(90deg, ${color}, ${color}cc)`,
          }}
        />
      </div>
      <span className="progress-label" style={{ color }}>{safePercent}%</span>
    </div>
  );
}
