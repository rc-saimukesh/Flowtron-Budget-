interface Props {
  value: number; // amount spent
  max: number;   // budget
  color?: "accent" | "danger" | "success";
}

export default function ProgressBar({ value, max, color = "accent" }: Props) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const isOver = max > 0 && value > max;

  const trackColor = "bg-surface-mid";
  const fillColor = isOver
    ? "bg-danger"
    : color === "success"
    ? "bg-success"
    : "bg-accent";

  return (
    <div className={`w-full h-1.5 rounded-full ${trackColor} overflow-hidden`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${fillColor}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}