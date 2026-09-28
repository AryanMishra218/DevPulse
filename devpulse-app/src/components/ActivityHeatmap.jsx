import { useMemo } from "react";

// Turns any string into a stable number. We use this to fake
// "how many tasks were completed on this day" from just the
// date string — so the heatmap looks the same every time you
// load the page, instead of randomly changing (which would
// look buggy). A real version reads this from actual task
// completion timestamps in the database (Task 3).
function pseudoRandomFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 5; // returns 0-4 (activity level)
}

const WEEKS = 12;
const DAY_LABELS = ["Mon", "Wed", "Fri"];

export default function ActivityHeatmap() {
  // useMemo: this calculation only needs to run ONCE, since
  // it doesn't depend on anything that changes. Without
  // useMemo it would silently recompute on every re-render.
  const weeks = useMemo(() => {
    const today = new Date();
    const days = [];
    for (let i = WEEKS * 7 - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      days.push({ date: iso, level: pseudoRandomFromString(iso) });
    }
    // group into columns of 7 (one column = one week)
    const cols = [];
    for (let i = 0; i < days.length; i += 7) {
      cols.push(days.slice(i, i + 7));
    }
    return cols;
  }, []);

  return (
    <div className="heatmap">
      <div className="heatmap__grid">
        {weeks.map((week, wi) => (
          <div className="heatmap__col" key={wi}>
            {week.map((day) => (
              <div
                key={day.date}
                className={`heatmap__cell heatmap__cell--l${day.level}`}
                title={`${day.date}: ${day.level} task${day.level === 1 ? "" : "s"} completed`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="heatmap__legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <div key={l} className={`heatmap__cell heatmap__cell--l${l}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
