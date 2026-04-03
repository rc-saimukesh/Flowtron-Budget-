import ProgressBar from "./ProgressBar";
import { formatINR } from "@/context/BudgetContext";

interface Props {
  label: string;
  icon: string;
  spent: number;
  budget: number;
}

export default function BucketCard({ label, icon, spent, budget }: Props) {
  const percent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const isOver = budget > 0 && spent > budget;
  const statusLabel = budget === 0 ? "No budget set" : isOver ? "Over limit" : "Within limit";
  const statusColor = budget === 0 ? "text-on-surface-muted" : isOver ? "text-danger" : "text-success";

  return (
    <div className="bg-surface-low rounded-xl p-5 flex flex-col gap-3 shadow-warm-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="text-sm font-semibold text-primary">{label}</span>
        </div>
        <span className={`text-xs font-semibold ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      <ProgressBar value={spent} max={budget} />

      <div className="flex items-center justify-between">
        <span className="text-xs text-on-surface-muted">
          {formatINR(spent)} / {budget > 0 ? formatINR(budget) : "—"}
        </span>
        <span className="text-xs font-semibold text-on-surface-muted">
          {budget > 0 ? `${percent}%` : ""}
        </span>
      </div>
    </div>
  );
}