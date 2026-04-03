import { Transaction, formatINR } from "@/context/BudgetContext";
import { Trash2 } from "lucide-react";

const BUCKET_ICONS: Record<string, string> = {
  needs: "🏠",
  wants: "✨",
  savings: "🐖",
  income: "💼",
};

interface Props {
  transaction: Transaction;
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}

export default function TransactionRow({
  transaction,
  onDelete,
  showDelete = false,
}: Props) {
  const { id, merchant, description, tag, type, bucket, date, time, amount } =
    transaction;

  const icon = type === "income" ? BUCKET_ICONS.income : BUCKET_ICONS[bucket];
  const isIncome = type === "income";

  // Format date: "2026-04-02" → "Apr 02, 2026"
  const formattedDate = new Date(date + "T00:00:00").toLocaleDateString(
    "en-IN",
    { month: "short", day: "2-digit", year: "numeric" }
  );

  return (
    <div className="flex items-center gap-4 py-4 group">
      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-surface-mid flex items-center justify-center text-lg flex-shrink-0">
        {icon}
      </div>

      {/* Merchant + description */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-primary truncate">{merchant}</p>
        <p className="text-xs text-on-surface-muted truncate">
          {description || tag}
        </p>
      </div>

      {/* Tag chip */}
      <div className="hidden md:block">
        <span className="px-2.5 py-1 rounded-full bg-tertiary text-tertiary-dark text-xs font-semibold uppercase tracking-wide">
          {tag}
        </span>
      </div>

      {/* Date + time */}
      <div className="text-right hidden lg:block">
        <p className="text-xs text-on-surface-muted">{formattedDate}</p>
        <p className="text-xs text-on-surface-muted">{time}</p>
      </div>

      {/* Amount */}
      <div className="text-right min-w-[80px]">
        <p
          className={`text-sm font-bold ${
            isIncome ? "text-accent" : "text-primary"
          }`}
        >
          {isIncome ? "+" : "-"} {formatINR(amount)}
        </p>
      </div>

      {/* Delete */}
      {showDelete && onDelete && (
        <button
          onClick={() => onDelete(id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg bg-danger-light flex items-center justify-center text-danger hover:bg-danger hover:text-white"
        >
          <Trash2 size={12} />
        </button>
      )}
    </div>
  );
}