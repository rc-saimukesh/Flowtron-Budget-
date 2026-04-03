"use client";

import PageTransition from "@/components/layout/PageTransition";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useBudget,
  getCurrentMonth,
  formatINR,
  getTransactionsByMonth,
  getTotalExpenses,
  getTotalIncome,
  getExpensesByBucket,
} from "@/context/BudgetContext";
import TopBar from "@/components/layout/TopBar";
import ProgressBar from "@/components/ui/ProgressBar";
import BudgetBarChart from "@/components/charts/BudgetBarChart";
import SpendingDonutChart from "@/components/charts/SpendingDonutChart";
import EmptyState from "@/components/ui/EmptyState";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMonthOffset(base: string, offset: number): string {
  const [year, month] = base.split("-").map(Number);
  const d = new Date(year, month - 1 + offset, 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function formatMonthLabel(month: string): string {
  const [year, m] = month.split("-");
  return new Date(Number(year), Number(m) - 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function formatMonthShort(month: string): string {
  const [year, m] = month.split("-");
  return new Date(Number(year), Number(m) - 1).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

// Derive a headline based on financial health
function getHeadline(isOver: boolean, savingsPct: number): { title: string; subtitle: string } {
  if (isOver) {
    return {
      title: "Course Correction.",
      subtitle:
        "Every sanctuary needs a moment of reflection. This month stretched beyond its boundaries — use this as your compass for next month.",
    };
  }
  if (savingsPct >= 20) {
    return {
      title: "Refined Balance.",
      subtitle:
        "Your sanctuary remains balanced. This month, you navigated through expenses with intentionality and grace.",
    };
  }
  return {
    title: "Steady Progress.",
    subtitle:
      "You stayed within your means this month. Small, consistent steps build the most enduring sanctuaries.",
  };
}

const BUCKET_CONFIG = [
  {
    key: "needs" as const,
    label: "Needs",
    icon: "🏠",
    sub: "Essential sanctuary upkeep",
  },
  {
    key: "wants" as const,
    label: "Wants",
    icon: "✨",
    sub: "Curated experiences",
  },
  {
    key: "savings" as const,
    label: "Savings",
    icon: "🐖",
    sub: "Building the future",
  },
];

const DONUT_COLORS = {
  needs: "#b58863",
  wants: "#3d4d55",
  savings: "#2d6a4f",
};

// ─────────────────────────────────────────────────────────────────────────────

export default function ReportPage() {
  const { state, getPlanForMonth } = useBudget();
  const router = useRouter();

  // Month selector — default to current month
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // Build list of months that have transactions
  const availableMonths = Array.from(
    new Set(state.transactions.map((t) => t.date.slice(0, 7)))
  ).sort((a, b) => b.localeCompare(a));

  // If no months available, also show current month as option
  const monthOptions = availableMonths.includes(selectedMonth)
    ? availableMonths
    : [selectedMonth, ...availableMonths];

  // ── Data for selected month ──
  const txns = getTransactionsByMonth(state.transactions, selectedMonth);
  const plan = getPlanForMonth(selectedMonth);
  const totalExpenses = getTotalExpenses(txns);
  const totalIncome = getTotalIncome(txns);
  const byBucket = getExpensesByBucket(txns);
  const netSavings =
    (plan?.projectedIncome ?? totalIncome) - totalExpenses;
  const isOverBudget =
    plan && plan.totalBudget > 0 && totalExpenses > plan.totalBudget;
  const savingsPct =
    totalIncome > 0 ? (byBucket.savings / totalIncome) * 100 : 0;

  const headline = getHeadline(!!isOverBudget, savingsPct);

  // ── Bar chart data ──
  const barData = BUCKET_CONFIG.map(({ key, label }) => ({
    name: label,
    budgeted: plan?.categoryBudgets[key] ?? 0,
    actual: byBucket[key],
  }));

  // ── Donut chart data ──
  const donutData = BUCKET_CONFIG.map(({ key, label }) => ({
    name: label,
    value: byBucket[key],
    color: DONUT_COLORS[key],
  }));

  // ── Top spending tag ──
  const tagMap = new Map<string, number>();
  txns
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      tagMap.set(t.tag, (tagMap.get(t.tag) ?? 0) + t.amount);
    });
  const topTag = Array.from(tagMap.entries()).sort(
    ([, a], [, b]) => b - a
  )[0];

  const nextMonth = getMonthOffset(selectedMonth, 1);

  return (
    <PageTransition>
    <div>
      <TopBar
        title="Reports"
        subtitle="Monthly Sanctuary Summary"
      />

      {/* ── Month selector ── */}
      <div className="flex items-center gap-2 mb-10 flex-wrap">
        {monthOptions.slice(0, 6).map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              selectedMonth === m
                ? "bg-primary text-white"
                : "text-on-surface-muted hover:text-secondary bg-surface-low"
            }`}
          >
            {formatMonthShort(m)}
          </button>
        ))}
      </div>

      {txns.length === 0 && !plan ? (
        <EmptyState
          icon="📊"
          title={`No data for ${formatMonthLabel(selectedMonth)}`}
          subtitle="Add transactions and set a budget plan to generate your report."
        />
      ) : (
        <>
          {/* ── Editorial hero ── */}
          <div className="grid grid-cols-3 gap-8 mb-12">
            <div className="col-span-2">
              <p className="label-engraved text-on-surface-muted mb-4">
                Monthly Sanctuary Summary · {formatMonthLabel(selectedMonth)}
              </p>
              <h1 className="text-display text-primary mb-4">
                {headline.title}
              </h1>
              <p className="text-sm text-on-surface-muted max-w-md leading-relaxed">
                {headline.subtitle}
              </p>
            </div>

            {/* Net savings card */}
            <div className="bg-surface-low rounded-xl p-6 shadow-warm-sm flex flex-col justify-center">
              <p className="label-engraved text-on-surface-muted mb-3">
                Net Savings
              </p>
              <p
                className={`text-3xl font-bold mb-3 ${
                  netSavings >= 0 ? "text-primary" : "text-danger"
                }`}
              >
                {netSavings >= 0 ? "+" : ""}
                {formatINR(netSavings)}
              </p>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold w-fit ${
                  isOverBudget
                    ? "bg-danger-light text-danger"
                    : "bg-success-light text-success"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOverBudget ? "bg-danger" : "bg-success"
                  }`}
                />
                {isOverBudget ? "Over Budget" : "Under Budget"}
              </span>

              {/* Income vs expense breakdown */}
              <div className="mt-4 pt-4 border-t border-surface-mid flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-muted">Income</span>
                  <span className="font-semibold text-accent">
                    +{formatINR(totalIncome)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-muted">Expenses</span>
                  <span className="font-semibold text-primary">
                    -{formatINR(totalExpenses)}
                  </span>
                </div>
                {plan && (
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-muted">Budget</span>
                    <span className="font-semibold text-secondary">
                      {formatINR(plan.totalBudget)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Pillars of Stewardship ── */}
          <div className="mb-12">
            <h2 className="text-lg font-bold text-primary mb-6">
              Pillars of Stewardship
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {BUCKET_CONFIG.map(({ key, label, icon, sub }) => {
                const spent = byBucket[key];
                const budget = plan?.categoryBudgets[key] ?? 0;
                const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
                const isOver = budget > 0 && spent > budget;
                const isAchieved = key === "savings" && budget > 0 && spent >= budget;

                let statusLabel = "No budget set";
                let statusColor = "text-on-surface-muted";
                if (budget > 0) {
                  if (isAchieved) {
                    statusLabel = "Achieved";
                    statusColor = "text-success";
                  } else if (isOver) {
                    statusLabel = "Over Limit";
                    statusColor = "text-danger";
                  } else {
                    statusLabel = "Within Limit";
                    statusColor = "text-success";
                  }
                }

                return (
                  <div
                    key={key}
                    className="bg-surface-low rounded-xl p-6 shadow-warm-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-surface-mid flex items-center justify-center text-xl">
                        {icon}
                      </div>
                      <span
                        className={`label-engraved ${statusColor}`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-primary">{label}</h3>
                    <p className="text-xs text-on-surface-muted mb-4">{sub}</p>

                    <ProgressBar value={spent} max={budget} />

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-on-surface-muted">
                        {formatINR(spent)} / {budget > 0 ? formatINR(budget) : "—"}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          isOver ? "text-danger" : "text-on-surface-muted"
                        }`}
                      >
                        {budget > 0 ? `${pct}%` : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Charts row ── */}
          <div className="grid grid-cols-5 gap-6 mb-12">
            {/* Bar chart */}
            <div className="col-span-3 bg-surface-low rounded-xl p-6 shadow-warm-sm">
              <h3 className="text-sm font-bold text-primary mb-1">
                The Month at a Glance
              </h3>
              <p className="text-xs text-on-surface-muted mb-6">
                Visualizing your allocation against reality.
              </p>
              <BudgetBarChart data={barData} />
            </div>

            {/* Right panel */}
            <div className="col-span-2 flex flex-col gap-4">
              {/* Donut */}
              <div className="bg-surface-low rounded-xl p-6 shadow-warm-sm flex-1">
                <h3 className="text-sm font-bold text-primary mb-4">
                  Spending Breakdown
                </h3>
                <SpendingDonutChart
                  data={donutData}
                  total={totalExpenses}
                />
              </div>

              {/* Top category */}
              {topTag && (
                <div className="gradient-primary rounded-xl p-5 shadow-warm">
                  <p className="label-engraved text-white/50 mb-2">
                    Top Category
                  </p>
                  <p className="text-lg font-bold text-white">{topTag[0]}</p>
                  <p className="text-xs text-white/60 mt-1">
                    {formatINR(topTag[1])} spent
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Insightful Trends ── */}
          <div className="grid grid-cols-3 gap-6 mb-12">
            {/* Transaction count */}
            <div className="bg-surface-low rounded-xl p-6 shadow-warm-sm">
              <p className="label-engraved text-on-surface-muted mb-3">
                Transaction Volume
              </p>
              <p className="text-3xl font-bold text-primary">
                {txns.filter((t) => t.type === "expense").length}
              </p>
              <p className="text-xs text-on-surface-muted mt-1">
                expenses recorded
              </p>
            </div>

            {/* Avg daily spend */}
            <div className="bg-surface-low rounded-xl p-6 shadow-warm-sm">
              <p className="label-engraved text-on-surface-muted mb-3">
                Avg Daily Spend
              </p>
              <p className="text-3xl font-bold text-primary">
                {formatINR(
                  txns.filter((t) => t.type === "expense").length > 0
                    ? totalExpenses /
                        new Set(
                          txns
                            .filter((t) => t.type === "expense")
                            .map((t) => t.date)
                        ).size
                    : 0
                )}
              </p>
              <p className="text-xs text-on-surface-muted mt-1">
                per active day
              </p>
            </div>

            {/* Savings rate */}
            <div className="bg-surface-low rounded-xl p-6 shadow-warm-sm">
              <p className="label-engraved text-on-surface-muted mb-3">
                Savings Rate
              </p>
              <p className="text-3xl font-bold text-primary">
                {totalIncome > 0
                  ? `${Math.round(
                      ((totalIncome - totalExpenses) / totalIncome) * 100
                    )}%`
                  : "—"}
              </p>
              <p className="text-xs text-on-surface-muted mt-1">
                of income retained
              </p>
            </div>
          </div>

          {/* ── CTA Banner ── */}
          <div
            className="rounded-2xl overflow-hidden relative"
            style={{ background: "linear-gradient(135deg, #10232a 0%, #3d4d55 100%)" }}
          >
            <div className="px-10 py-12 text-center relative z-10">
              <p className="label-engraved text-white/40 mb-4">
                Next Steps
              </p>
              <h2 className="text-editorial text-white mb-3">
                Ready to plan for {formatMonthLabel(nextMonth)}?
              </h2>
              <p className="text-sm text-white/60 mb-8 max-w-md mx-auto">
                Extend the serenity of your financial stewardship into the next
                season.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => router.push("/plan")}
                  className="px-6 py-3 rounded-lg bg-white text-primary text-sm font-bold hover:bg-surface transition-colors"
                >
                  Begin {formatMonthShort(nextMonth)} Planning
                </button>
                <button
                  onClick={() => router.push("/transactions")}
                  className="px-6 py-3 rounded-lg border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
                >
                  View Ledger
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
    </PageTransition>
  );
}