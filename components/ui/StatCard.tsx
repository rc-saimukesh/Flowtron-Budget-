import { ReactNode } from "react";

interface Props {
  label: string;
  value: string;
  sub?: string;
  subColor?: "danger" | "success" | "muted";
  highlight?: boolean; // warm peach highlight like "Remaining Amount"
  children?: ReactNode;
}

export default function StatCard({
  label,
  value,
  sub,
  subColor = "muted",
  highlight = false,
  children,
}: Props) {
  const subColors = {
    danger: "text-danger",
    success: "text-success",
    muted: "text-on-surface-muted",
  };

  return (
    <div
      className={`rounded-xl p-6 flex flex-col gap-2 shadow-warm-sm
        ${highlight ? "bg-accent-light" : "bg-surface-low"}`}
    >
      <p className="label-engraved text-on-surface-muted">{label}</p>
      <p className="text-3xl font-bold tracking-tight text-primary">{value}</p>
      {sub && (
        <p className={`text-xs font-medium ${subColors[subColor]}`}>{sub}</p>
      )}
      {children}
    </div>
  );
}