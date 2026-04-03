import TransactionRow from "./TransactionRow";
import { Transaction } from "@/context/BudgetContext";

interface Group {
  label: string;
  transactions: Transaction[];
  totalExpenses: number;
  totalIncome: number;
}

interface Props {
  groups: Group[];
  onDelete: (id: string) => void;
}

function formatINRCompact(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function GroupedTransactions({ groups, onDelete }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.label}>
          {/* Group header */}
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="label-engraved text-on-surface-muted">{group.label}</p>
            <div className="flex items-center gap-3">
              {group.totalIncome > 0 && (
                <span className="text-xs font-semibold text-accent">
                  + {formatINRCompact(group.totalIncome)}
                </span>
              )}
              {group.totalExpenses > 0 && (
                <span className="text-xs font-semibold text-on-surface-muted">
                  − {formatINRCompact(group.totalExpenses)}
                </span>
              )}
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-surface-low rounded-xl px-4 divide-y divide-surface-mid">
            {group.transactions.map((txn) => (
              <TransactionRow
                key={txn.id}
                transaction={txn}
                onDelete={onDelete}
                showDelete
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}