type Props = {
  health01: number; // 0..1
};

function healthColor(health01: number) {
  if (health01 >= 0.66) return "good";
  if (health01 >= 0.33) return "warn";
  return "bad";
}

export function HealthOrb({ health01 }: Props) {
  const level = healthColor(health01);
  return (
    <div className={`healthOrb ${level}`} style={{ ["--health" as never]: health01 }}>
      <div className="orbGlow" />
      <div className="orbCore" />
      <div className="orbRing" />
      <div className="orbText">
        <div className="orbTitle">Health</div>
        <div className="orbValue">{Math.round(health01 * 100)}%</div>
      </div>
    </div>
  );
}

