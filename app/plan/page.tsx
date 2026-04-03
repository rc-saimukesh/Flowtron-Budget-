"use client";

import PageTransition from "@/components/layout/PageTransition";
import { useState, useEffect } from "react";
import {
  useBudget,
  getCurrentMonth,
  formatINR,
  MonthPlan,
} from "@/context/BudgetContext";
import TopBar from "@/components/layout/TopBar";
import { Plus, Trash2, Copy } from "lucide-react";

// ── Month navigation helpers ──────────────────────────────────────────────────

function getMonthOffset(offset: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return d.toISOString().slice(0, 7);
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

// ── Sub-category line item ────────────────────────────────────────────────────

interface LineItem {
  id: string;
  label: string;
  amount: string;
}

interface BucketSectionProps {
  title: string;
  icon: string;
  color: string;
  items: LineItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onChange: (id: string, field: "label" | "amount", value: string) => void;
}

function BucketSection({
  title,
  icon,
  color,
  items,
  onAdd,
  onRemove,
  onChange,
}: BucketSectionProps) {
  const total = items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

  return (
    <PageTransition>
    <div className="bg-surface-low rounded-xl p-6 shadow-warm-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${color}`}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-bold text-primary">{title}</h3>
          <p className="text-xs text-on-surface-muted">
            {items.length} line item{items.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Line items */}
      <div className="flex flex-col gap-2 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 group">
            <input
              type="text"
              value={item.label}
              onChange={(e) => onChange(item.id, "label", e.target.value)}
              placeholder="Category name"
              className="flex-1 bg-surface rounded-lg px-3 py-2 text-sm text-primary placeholder:text-on-surface-muted outline-none focus:bg-surface-mid transition-colors"
            />
            <div className="flex items-center gap-1 bg-surface rounded-lg px-3 py-2 w-32">
              <span className="text-xs text-on-surface-muted">₹</span>
              <input
                type="number"
                value={item.amount}
                onChange={(e) => onChange(item.id, "amount", e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent text-sm text-primary text-right outline-none w-full"
              />
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg bg-danger-light flex items-center justify-center text-danger hover:bg-danger hover:text-white"
            >
              <Trash2 size={11} />
            </button>
          </div>
        ))}
      </div>

      {/* Add line item */}
      <button
        onClick={onAdd}
        className="flex items-center gap-2 text-xs text-accent font-semibold hover:text-primary transition-colors"
      >
        <Plus size={13} />
        Add item
      </button>

      {/* Total */}
      <div className="mt-4 pt-4 border-t border-surface-mid flex items-center justify-between">
        <p className="label-engraved text-on-surface-muted">
          Total {title}
        </p>
        <p className="text-sm font-bold text-primary">{formatINR(total)}</p>
      </div>
    </div>
    </PageTransition>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeId() {
  return Math.random().toString(36).slice(2, 9);
}

function makeDefaultItems(labels: string[]): LineItem[] {
  return labels.map((label) => ({ id: makeId(), label, amount: "" }));
}

const DEFAULT_NEEDS = ["Rent / Mortgage", "Groceries", "Utilities", "Transport"];
const DEFAULT_WANTS = ["Dining Out", "Entertainment", "Personal Shopping"];
const DEFAULT_SAVINGS = ["Emergency Fund", "Investments", "Goal Savings"];

// ─────────────────────────────────────────────────────────────────────────────

export default function PlanPage() {
  const { getPlanForMonth, setPlan, getMonthSummary } = useBudget();

  // Month tabs: prev, current, next
  const months = [-1, 0, 1].map(getMonthOffset);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // Form state
  const [mainSalary, setMainSalary] = useState("");
  const [sideIncome, setSideIncome] = useState("");
  const [needsItems, setNeedsItems] = useState<LineItem[]>(
    makeDefaultItems(DEFAULT_NEEDS)
  );
  const [wantsItems, setWantsItems] = useState<LineItem[]>(
    makeDefaultItems(DEFAULT_WANTS)
  );
  const [savingsItems, setSavingsItems] = useState<LineItem[]>(
    makeDefaultItems(DEFAULT_SAVINGS)
  );
  const [saved, setSaved] = useState(false);

  // Load existing plan when month changes
  useEffect(() => {
    const plan = getPlanForMonth(selectedMonth);
    if (plan) {
      setMainSalary(plan.projectedIncome.toString());
      setSideIncome("");
      // Restore actual line items if they were saved, otherwise fall back
      setNeedsItems(
        plan.lineItems?.needs?.length
          ? plan.lineItems.needs
          : makeDefaultItems(DEFAULT_NEEDS)
      );
      setWantsItems(
        plan.lineItems?.wants?.length
          ? plan.lineItems.wants
          : makeDefaultItems(DEFAULT_WANTS)
      );
      setSavingsItems(
        plan.lineItems?.savings?.length
          ? plan.lineItems.savings
          : makeDefaultItems(DEFAULT_SAVINGS)
      );
    } else {
      setMainSalary("");
      setSideIncome("");
      setNeedsItems(makeDefaultItems(DEFAULT_NEEDS));
      setWantsItems(makeDefaultItems(DEFAULT_WANTS));
      setSavingsItems(makeDefaultItems(DEFAULT_SAVINGS));
    }
    setSaved(false);
  }, [selectedMonth]);

  // ── Computed totals ──
  const totalIncome =
    (parseFloat(mainSalary) || 0) + (parseFloat(sideIncome) || 0);
  const needsTotal = needsItems.reduce(
    (s, i) => s + (parseFloat(i.amount) || 0), 0
  );
  const wantsTotal = wantsItems.reduce(
    (s, i) => s + (parseFloat(i.amount) || 0), 0
  );
  const savingsTotal = savingsItems.reduce(
    (s, i) => s + (parseFloat(i.amount) || 0), 0
  );
  const totalAllocated = needsTotal + wantsTotal + savingsTotal;
  const unassigned = totalIncome - totalAllocated;
  const allocatedPercent =
    totalIncome > 0 ? Math.min((totalAllocated / totalIncome) * 100, 100) : 0;

  // ── Line item handlers ──
  function addItem(
    setter: React.Dispatch<React.SetStateAction<LineItem[]>>
  ) {
    setter((prev) => [...prev, { id: makeId(), label: "", amount: "" }]);
  }

  function removeItem(
    setter: React.Dispatch<React.SetStateAction<LineItem[]>>,
    id: string
  ) {
    setter((prev) => prev.filter((i) => i.id !== id));
  }

  function changeItem(
    setter: React.Dispatch<React.SetStateAction<LineItem[]>>,
    id: string,
    field: "label" | "amount",
    value: string
  ) {
    setter((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  }

  // ── Copy from previous month ──
  function copyFromPrevious() {
    const prevMonth = getMonthOffset(
      months.indexOf(selectedMonth) - 1 - (months[0] === selectedMonth ? 0 : 1)
    );
    const prevPlan = getPlanForMonth(prevMonth);
    if (!prevPlan) return alert("No plan found for the previous month.");
    setMainSalary(prevPlan.projectedIncome.toString());
    setNeedsItems([
      { id: makeId(), label: "Needs Budget", amount: prevPlan.categoryBudgets.needs.toString() },
    ]);
    setWantsItems([
      { id: makeId(), label: "Wants Budget", amount: prevPlan.categoryBudgets.wants.toString() },
    ]);
    setSavingsItems([
      { id: makeId(), label: "Savings Budget", amount: prevPlan.categoryBudgets.savings.toString() },
    ]);
  }

  // ── Save plan ──
 function handleSave() {
  const plan: MonthPlan = {
    month: selectedMonth,
    projectedIncome: totalIncome,
    totalBudget: totalAllocated,
    categoryBudgets: {
      needs: needsTotal,
      wants: wantsTotal,
      savings: savingsTotal,
    },
    lineItems: {
      needs: needsItems,
      wants: wantsItems,
      savings: savingsItems,
    },
  };
  setPlan(plan);
  setSaved(true);
  setTimeout(() => setSaved(false), 2500);
}

  const summary = getMonthSummary(selectedMonth);

  return (
    <div>
      <TopBar
        title={`Planning for ${formatMonthShort(selectedMonth)}`}
        subtitle="Curate your financial landscape for the upcoming month"
      />

      {/* ── Month tabs ── */}
      <div className="flex items-center gap-1 mb-10">
        {months.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              selectedMonth === m
                ? "bg-primary text-white"
                : "text-on-surface-muted hover:text-secondary"
            }`}
          >
            {formatMonthShort(m)}
          </button>
        ))}

        <div className="ml-auto">
          <button
            onClick={copyFromPrevious}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-low text-secondary text-sm font-semibold hover:bg-surface-mid transition-colors shadow-warm-sm"
          >
            <Copy size={14} />
            Copy from Previous Month
          </button>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-3 gap-6">

        {/* ── Left column: Income + Allocation ── */}
        <div className="flex flex-col gap-4">
          {/* Projected Income */}
          <div className="bg-surface-low rounded-xl p-6 shadow-warm-sm">
            <p className="label-engraved text-on-surface-muted mb-4">
              Projected Income
            </p>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-on-surface-muted block mb-1.5">
                  Main Salary
                </label>
                <div className="flex items-center gap-2 bg-surface rounded-lg px-3 py-2.5">
                  <span className="text-sm text-on-surface-muted">₹</span>
                  <input
                    type="number"
                    value={mainSalary}
                    onChange={(e) => setMainSalary(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-sm text-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-on-surface-muted block mb-1.5">
                  Freelance / Side Gig
                </label>
                <div className="flex items-center gap-2 bg-surface rounded-lg px-3 py-2.5">
                  <span className="text-sm text-on-surface-muted">₹</span>
                  <input
                    type="number"
                    value={sideIncome}
                    onChange={(e) => setSideIncome(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-sm text-primary outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-surface-mid flex items-center justify-between">
              <p className="text-xs text-on-surface-muted">Total Projected</p>
              <p className="text-sm font-bold text-primary">
                {formatINR(totalIncome)}
              </p>
            </div>
          </div>

          {/* Allocation Status */}
          <div className="gradient-primary rounded-xl p-6 shadow-warm">
            <p className="label-engraved text-white/50 mb-4">
              Allocation Status
            </p>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold text-white">
                {Math.round(allocatedPercent)}%
              </span>
              <span className="text-xs text-white/50">allocated</span>
            </div>
            <p className="text-sm font-semibold text-white mb-4">
              {formatINR(totalAllocated)}
            </p>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${allocatedPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-white/50">Unassigned Funds</p>
              <p
                className={`text-sm font-bold ${
                  unassigned < 0 ? "text-danger" : "text-accent"
                }`}
              >
                {formatINR(Math.abs(unassigned))}
                {unassigned < 0 ? " over" : ""}
              </p>
            </div>
          </div>

          {/* Actual vs Plan (if month has transactions) */}
          {summary.totalExpenses > 0 && (
            <div className="bg-surface-low rounded-xl p-6 shadow-warm-sm">
              <p className="label-engraved text-on-surface-muted mb-4">
                Actual Spending
              </p>
              <div className="flex flex-col gap-2">
                {(["needs", "wants", "savings"] as const).map((b) => {
                  const spent = summary.byBucket[b];
                  const budget =
                    b === "needs"
                      ? needsTotal
                      : b === "wants"
                      ? wantsTotal
                      : savingsTotal;
                  const pct =
                    budget > 0 ? Math.round((spent / budget) * 100) : 0;
                  const isOver = spent > budget && budget > 0;
                  return (
                    <div key={b}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs capitalize text-on-surface-muted">
                          {b}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            isOver ? "text-danger" : "text-success"
                          }`}
                        >
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full h-1 bg-surface-mid rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isOver ? "bg-danger" : "bg-accent"
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Right 2 columns: Bucket sections ── */}
        <div className="col-span-2 grid grid-cols-2 gap-4 content-start">
          <BucketSection
            title="Needs"
            icon="🏠"
            color="bg-accent-light"
            items={needsItems}
            onAdd={() => addItem(setNeedsItems)}
            onRemove={(id) => removeItem(setNeedsItems, id)}
            onChange={(id, f, v) => changeItem(setNeedsItems, id, f, v)}
          />
          <BucketSection
            title="Wants"
            icon="✨"
            color="bg-tertiary"
            items={wantsItems}
            onAdd={() => addItem(setWantsItems)}
            onRemove={(id) => removeItem(setWantsItems, id)}
            onChange={(id, f, v) => changeItem(setWantsItems, id, f, v)}
          />
          <BucketSection
            title="Savings"
            icon="🐖"
            color="bg-success-light"
            items={savingsItems}
            onAdd={() => addItem(setSavingsItems)}
            onRemove={(id) => removeItem(setSavingsItems, id)}
            onChange={(id, f, v) => changeItem(setSavingsItems, id, f, v)}
          />

          {/* Insight card */}
          <div className="bg-surface-low rounded-xl p-6 shadow-warm-sm flex flex-col justify-between">
            <div>
              <p className="label-engraved text-accent mb-3">
                Insight of the Month
              </p>
              <h4 className="text-editorial text-primary leading-snug mb-3">
                Small shifts create grand sanctuaries.
              </h4>
              {unassigned > 0 && totalIncome > 0 ? (
                <p className="text-xs text-on-surface-muted">
                  You have{" "}
                  <span className="font-semibold text-primary">
                    {formatINR(unassigned)}
                  </span>{" "}
                  unassigned. Consider moving some to Savings to build your
                  financial sanctuary.
                </p>
              ) : unassigned < 0 ? (
                <p className="text-xs text-on-surface-muted">
                  You've allocated{" "}
                  <span className="font-semibold text-danger">
                    {formatINR(Math.abs(unassigned))}
                  </span>{" "}
                  more than your income. Review your buckets.
                </p>
              ) : (
                <p className="text-xs text-on-surface-muted">
                  Set your projected income above to see personalized insights.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Save button ── */}
      <div className="mt-10 flex items-center justify-end gap-4">
        {saved && (
          <p className="text-sm text-success font-semibold">
            ✓ Plan saved successfully
          </p>
        )}
        <button
          onClick={handleSave}
          className="gradient-primary text-white px-8 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-warm"
        >
          Save Plan for {formatMonthShort(selectedMonth)}
        </button>
      </div>
    </div>
  );
}