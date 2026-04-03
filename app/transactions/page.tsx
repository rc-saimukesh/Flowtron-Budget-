"use client";

import PageTransition from "@/components/layout/PageTransition";
import { useState, useMemo } from "react";
import {
  useBudget,
  Transaction,
  getTransactionsByMonth,
  getTransactionsByYear,
  getTotalExpenses,
  getTotalIncome,
  formatINR,
  getCurrentMonth,
} from "@/context/BudgetContext";
import TopBar from "@/components/layout/TopBar";
import StatCard from "@/components/ui/StatCard";
import GroupedTransactions from "@/components/ui/GroupedTransactions";
import EmptyState from "@/components/ui/EmptyState";
import { Search, SlidersHorizontal } from "lucide-react";

type TimeView = "daily" | "monthly" | "yearly";
type BucketFilter = "all" | "needs" | "wants" | "savings" | "income";

// ── Grouping helpers ──────────────────────────────────────────────────────────

function groupByDay(transactions: Transaction[]) {
  const map = new Map<string, Transaction[]>();
  transactions.forEach((t) => {
    const existing = map.get(t.date) ?? [];
    map.set(t.date, [...existing, t]);
  });

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, txns]) => ({
      label: new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      transactions: txns,
      totalExpenses: getTotalExpenses(txns),
      totalIncome: getTotalIncome(txns),
    }));
}

function groupByMonth(transactions: Transaction[]) {
  const map = new Map<string, Transaction[]>();
  transactions.forEach((t) => {
    const key = t.date.slice(0, 7); // "YYYY-MM"
    const existing = map.get(key) ?? [];
    map.set(key, [...existing, t]);
  });

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, txns]) => {
      const [year, month] = key.split("-");
      return {
        label: new Date(Number(year), Number(month) - 1).toLocaleDateString(
          "en-IN",
          { month: "long", year: "numeric" }
        ),
        transactions: txns,
        totalExpenses: getTotalExpenses(txns),
        totalIncome: getTotalIncome(txns),
      };
    });
}

function groupByYear(transactions: Transaction[]) {
  const map = new Map<string, Transaction[]>();
  transactions.forEach((t) => {
    const key = t.date.slice(0, 4); // "YYYY"
    const existing = map.get(key) ?? [];
    map.set(key, [...existing, t]);
  });

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, txns]) => ({
      label: key,
      transactions: txns,
      totalExpenses: getTotalExpenses(txns),
      totalIncome: getTotalIncome(txns),
    }));
}

// ─────────────────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const { state, deleteTransaction, getMonthSummary } = useBudget();
  const [view, setView] = useState<TimeView>("monthly");
  const [bucketFilter, setBucketFilter] = useState<BucketFilter>("all");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const month = getCurrentMonth();
  const year = new Date().getFullYear().toString();
  const summary = getMonthSummary(month);

  // ── Filter transactions ──
  const filtered = useMemo(() => {
    let txns = state.transactions;

    // Time filter
    if (view === "daily" || view === "monthly") {
      txns = getTransactionsByMonth(txns, month);
    } else {
      txns = getTransactionsByYear(txns, year);
    }

    // Bucket filter
    if (bucketFilter !== "all") {
      if (bucketFilter === "income") {
        txns = txns.filter((t) => t.type === "income");
      } else {
        txns = txns.filter(
          (t) => t.type === "expense" && t.bucket === bucketFilter
        );
      }
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      txns = txns.filter(
        (t) =>
          t.merchant.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tag.toLowerCase().includes(q)
      );
    }

    return txns;
  }, [state.transactions, view, bucketFilter, search, month, year]);

  // ── Group ──
  const groups = useMemo(() => {
    if (view === "daily") return groupByDay(filtered);
    if (view === "monthly") return groupByMonth(filtered);
    return groupByYear(filtered);
  }, [filtered, view]);

  // ── Month label ──
  const monthLabel = new Date().toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const BUCKET_FILTERS: { key: BucketFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "needs", label: "🏠 Needs" },
    { key: "wants", label: "✨ Wants" },
    { key: "savings", label: "🐖 Savings" },
    { key: "income", label: "💼 Income" },
  ];

  return (
    <PageTransition>
    <div>
      <TopBar
        title="Ledger Archive"
        subtitle={`Monthly Insight · ${monthLabel}`}
      />

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard
          label="Total Spent This Month"
          value={formatINR(summary.totalExpenses)}
          sub={
            summary.plan
              ? `Budget: ${formatINR(summary.plan.totalBudget)}`
              : "No budget set"
          }
          subColor="muted"
        />
        <StatCard
          label="Primary Income"
          value={formatINR(summary.totalIncome)}
          sub="This month"
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

      {/* ── Controls ── */}
      <div className="flex items-center justify-between mb-6 gap-4">
        {/* Time toggle */}
        <div className="flex items-center gap-1 p-1 bg-surface-low rounded-lg">
          {(["daily", "monthly", "yearly"] as TimeView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold capitalize transition-all ${
                view === v
                  ? "bg-surface text-primary shadow-warm-sm"
                  : "text-on-surface-muted hover:text-secondary"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Search + filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-surface-low rounded-lg px-3 py-2">
            <Search size={14} className="text-on-surface-muted" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-primary placeholder:text-on-surface-muted outline-none w-48"
            />
          </div>

          <button
            onClick={() => setShowFilters((f) => !f)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showFilters
                ? "bg-primary text-white"
                : "bg-surface-low text-secondary hover:bg-surface-mid"
            }`}
          >
            <SlidersHorizontal size={14} />
            Category
          </button>
        </div>
      </div>

      {/* ── Bucket filter chips ── */}
      {showFilters && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {BUCKET_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setBucketFilter(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                bucketFilter === key
                  ? "bg-primary text-white"
                  : "bg-tertiary text-tertiary-dark hover:bg-surface-mid"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Table header ── */}
      <div className="grid grid-cols-12 gap-4 px-4 mb-2">
        <p className="col-span-5 label-engraved text-on-surface-muted">
          Merchant & Details
        </p>
        <p className="col-span-3 label-engraved text-on-surface-muted">
          Category
        </p>
        <p className="col-span-2 label-engraved text-on-surface-muted">
          Timeline
        </p>
        <p className="col-span-2 label-engraved text-on-surface-muted text-right">
          Amount
        </p>
      </div>

      {/* ── Grouped transactions ── */}
      {groups.length === 0 ? (
        <EmptyState
          icon="📭"
          title="No transactions found"
          subtitle={
            search
              ? `No results for "${search}". Try a different search.`
              : "Add your first transaction using the button in the sidebar."
          }
        />
      ) : (
        <GroupedTransactions groups={groups} onDelete={deleteTransaction} />
      )}

      {/* ── Load more ── */}
      {groups.length > 0 && (
        <div className="text-center mt-10">
          <p className="label-engraved text-on-surface-muted">
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}{" "}
            shown
          </p>
        </div>
      )}
    </div>
    </PageTransition>
  );
}