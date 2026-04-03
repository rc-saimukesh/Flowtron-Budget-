"use client";

import {
  useBudget,
  getCurrentMonth,
  formatINR,
  getTransactionsByMonth,
} from "@/context/BudgetContext";
import TopBar from "@/components/layout/TopBar";
import StatCard from "@/components/ui/StatCard";
import BucketCard from "@/components/ui/BucketCard";
import TransactionRow from "@/components/ui/TransactionRow";
import PageTransition from "@/components/layout/PageTransition";

const BUCKETS = [
  { key: "needs" as const, label: "Needs", icon: "🏠" },
  { key: "wants" as const, label: "Wants", icon: "✨" },
  { key: "savings" as const, label: "Savings", icon: "🐖" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default function DashboardPage() {
  const { state, getMonthSummary, deleteTransaction } = useBudget();
  const month = getCurrentMonth();
  const summary = getMonthSummary(month);
  const monthTxns = getTransactionsByMonth(state.transactions, month);
  const recent = monthTxns.slice(0, 5);

  const monthLabel = new Date().toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastSummary = getMonthSummary(lastMonth.toISOString().slice(0, 7));
  const vsLastMonth =
    lastSummary.totalExpenses > 0
      ? Math.round(
          ((summary.totalExpenses - lastSummary.totalExpenses) /
            lastSummary.totalExpenses) *
            100
        )
      : null;

  return (
    <PageTransition>
      <div>
        <TopBar
          title={`Good ${getGreeting()}`}
          subtitle={`Monthly Insight · ${monthLabel}`}
        />

        {/* ── Hero liquidity banner ── */}
        <div className="gradient-primary rounded-2xl px-6 py-6 md:px-8 md:py-7 mb-6 md:mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="label-engraved text-white/50 mb-2">
                Current Liquidity
              </p>
              <p className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                {formatINR(summary.remaining)}
              </p>
              <p className="text-sm text-white/60 mt-2">
                {summary.isOverBudget
                  ? "⚠ You've exceeded your budget"
                  : `${vsLastMonth !== null ? Math.abs(vsLastMonth) : 0}% from last month`}
              </p>
            </div>

            {summary.plan && (
              <div className="bg-white/10 rounded-xl px-5 py-4 md:text-right md:min-w-[180px]">
                <p className="label-engraved text-white/50 mb-1">
                  Monthly Budget Goal
                </p>
                <p className="text-2xl font-bold text-white">
                  {formatINR(summary.totalExpenses)}
                </p>
                <p className="text-xs text-white/50 mt-1">
                  of {formatINR(summary.plan.totalBudget)}
                </p>
                <div className="mt-3 w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{
                      width: `${Math.min(
                        (summary.totalExpenses / summary.plan.totalBudget) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 md:mb-10">
          <StatCard
            label="Total Spent This Month"
            value={formatINR(summary.totalExpenses)}
            sub={
              vsLastMonth !== null
                ? `${vsLastMonth > 0 ? "▲" : "▼"} ${Math.abs(vsLastMonth)}% vs last month`
                : "No data from last month"
            }
            subColor={
              vsLastMonth !== null && vsLastMonth > 0 ? "danger" : "success"
            }
          />
          <StatCard
            label="Primary Income"
            value={formatINR(summary.totalIncome)}
            sub={
              summary.plan?.projectedIncome
                ? `Projected: ${formatINR(summary.plan.projectedIncome)}`
                : "No income recorded"
            }
            subColor="muted"
          />
          <StatCard
            label="Remaining Amount"
            value={formatINR(summary.remaining)}
            sub={
              summary.isOverBudget
                ? "⚠ Over budget this month"
                : "You're on track"
            }
            subColor={summary.isOverBudget ? "danger" : "success"}
            highlight
          />
        </div>

        {/* ── Two column on desktop, stacked on mobile ── */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8">

          {/* Bucket progress */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-bold text-primary mb-4">
              Sanctuary Budget
            </h3>
            <div className="flex flex-col gap-3">
              {BUCKETS.map(({ key, label, icon }) => (
                <BucketCard
                  key={key}
                  label={label}
                  icon={icon}
                  spent={summary.byBucket[key]}
                  budget={summary.plan?.categoryBudgets[key] ?? 0}
                />
              ))}
            </div>

            {!summary.plan && (
              <div className="mt-4 p-4 bg-accent-light rounded-xl">
                <p className="text-xs text-accent font-semibold">
                  💡 Set a budget plan to see progress
                </p>
                <p className="text-xs text-on-surface-muted mt-1">
                  Go to Budgeting to set your monthly targets.
                </p>
              </div>
            )}
          </div>

          {/* Recent transactions */}
          <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-primary">
                Recent Activity
              </h3>
              
                <a href="/transactions"
                className="text-xs text-accent font-semibold hover:underline"
              >
                View Ledger →
              </a>
            </div>

            {recent.length === 0 ? (
              <div className="bg-surface-low rounded-xl p-8 text-center">
                <p className="text-2xl mb-2">🌱</p>
                <p className="text-sm font-semibold text-primary">
                  No transactions yet
                </p>
                <p className="text-xs text-on-surface-muted mt-1">
                  Tap the + button to record your first entry.
                </p>
              </div>
            ) : (
              <div className="bg-surface-low rounded-xl px-4 divide-y divide-surface-mid">
                {recent.map((txn) => (
                  <TransactionRow
                    key={txn.id}
                    transaction={txn}
                    onDelete={deleteTransaction}
                    showDelete
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}