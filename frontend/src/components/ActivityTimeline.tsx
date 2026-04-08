import { useActivityLog } from "../hooks/activityLog";

const labels: Record<string, string> = {
  deposit: "Deposit",
  borrow: "Borrow",
  repay: "Repay",
};

export function ActivityTimeline() {
  const { activities } = useActivityLog();

  if (activities.length === 0) {
    return (
      <div className="card timelineCard">
        <h2 style={{ margin: 0 }}>Activity</h2>
        <p className="hint" style={{ marginBottom: 0 }}>
          No actions yet. Deposit or borrow to see history.
        </p>
      </div>
    );
  }

  return (
    <div className="card timelineCard">
      <h2 style={{ margin: 0 }}>Activity</h2>
      <ul className="timeline">
        {activities.map((a) => (
          <li key={a.id} className="timelineItem">
            <div className="timelineDot" />
            <div className="timelineBody">
              <div className="timelineTitle">{labels[a.kind] ?? a.kind}</div>
              <div className="timelineMeta">
                {new Date(a.at).toLocaleString()}
                {a.detail ? ` · ${a.detail}` : ""}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
