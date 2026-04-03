"use client";

import { Bell } from "lucide-react";
import { useBudget, getCurrentMonth, formatINR } from "@/context/BudgetContext";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const { getMonthSummary } = useBudget();
  const summary = getMonthSummary(getCurrentMonth());

  return (
    <header className="flex items-center justify-between mb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-primary leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-on-surface-muted mt-0.5 label-engraved">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Quick balance pill */}
        {summary.remaining !== 0 && (
          <div
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
              summary.isOverBudget
                ? "bg-danger-light text-danger"
                : "bg-success-light text-success"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                summary.isOverBudget ? "bg-danger" : "bg-success"
              }`}
            />
            {summary.isOverBudget ? "Over budget" : formatINR(summary.remaining) + " remaining"}
          </div>
        )}

        {/* Bell */}
        <button className="w-9 h-9 rounded-lg bg-surface-low flex items-center justify-center text-secondary hover:bg-surface-mid transition-colors relative">
          <Bell size={15} />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold select-none">
          FB
        </div>
      </div>
    </header>
  );
}