// A reusable progress bar. We pass in "done" and "total"
// as props (inputs), and this component calculates the
// percentage itself — the parent doesn't need to know how.
export default function ProgressBar({ done, total }) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="progress-bar">
      <div className="progress-bar__track">
        <div
          className="progress-bar__fill"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="progress-bar__label">
        {done}/{total} tasks · {percent}%
      </span>
    </div>
  );
}
