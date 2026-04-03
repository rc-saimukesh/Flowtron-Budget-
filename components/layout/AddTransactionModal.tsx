"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  useBudget,
  getToday,
  getCurrentTime,
  getCurrentMonth,
  Bucket,
  TransactionType,
} from "@/context/BudgetContext";

const DEFAULT_TAGS: Record<Bucket, string[]> = {
  needs: ["Groceries", "Rent", "Utilities", "Transport", "Healthcare", "Other"],
  wants: ["Dining Out", "Entertainment", "Shopping", "Travel", "Subscriptions", "Other"],
  savings: ["Emergency Fund", "Investments", "Retirement", "Goal Savings", "Other"],
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTransactionModal({ isOpen, onClose }: Props) {
  const { addTransaction, getPlanForMonth } = useBudget();
  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  const currentPlan = getPlanForMonth(getCurrentMonth());

  const tagOptions: Record<Bucket, string[]> = {
    needs:
      currentPlan?.lineItems?.needs?.map((i) => i.label).filter(Boolean).length
        ? [...currentPlan.lineItems.needs.map((i) => i.label).filter(Boolean), "Other"]
        : DEFAULT_TAGS.needs,
    wants:
      currentPlan?.lineItems?.wants?.map((i) => i.label).filter(Boolean).length
        ? [...currentPlan.lineItems.wants.map((i) => i.label).filter(Boolean), "Other"]
        : DEFAULT_TAGS.wants,
    savings:
      currentPlan?.lineItems?.savings?.map((i) => i.label).filter(Boolean).length
        ? [...currentPlan.lineItems.savings.map((i) => i.label).filter(Boolean), "Other"]
        : DEFAULT_TAGS.savings,
  };

  const [form, setForm] = useState({
    merchant: "",
    description: "",
    amount: "",
    type: "expense" as TransactionType,
    bucket: "needs" as Bucket,
    tag: tagOptions.needs[0],
    date: getToday(),
    time: getCurrentTime(),
  });

  const [error, setError] = useState("");

  // ── Animation handling ──
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setTimeout(() => setAnimateIn(true), 20);
    } else {
      setAnimateIn(false);
      setTimeout(() => setMounted(false), 300);
    }
  }, [isOpen]);

  // ── Lock body scroll when open ──
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function handleBucketChange(bucket: Bucket) {
    setForm((f) => ({ ...f, bucket, tag: tagOptions[bucket][0] }));
  }

  function handleSubmit() {
    if (!form.merchant.trim()) return setError("Merchant name is required.");
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      return setError("Please enter a valid amount.");

    addTransaction({
      merchant: form.merchant.trim(),
      description: form.description.trim(),
      amount: parseFloat(form.amount),
      type: form.type,
      bucket: form.type === "income" ? "needs" : form.bucket,
      tag: form.type === "income" ? "Income" : form.tag,
      date: form.date,
      time: form.time,
    });

    setForm({
      merchant: "",
      description: "",
      amount: "",
      type: "expense",
      bucket: "needs",
      tag: tagOptions.needs[0],
      date: getToday(),
      time: getCurrentTime(),
    });
    setError("");
    onClose();
  }

  if (!mounted) return null;

  // ── Shared form content ──
  const FormContent = (
    <>
      {/* Type toggle */}
      <div className="flex gap-2 mb-6 p-1 bg-surface-low rounded-lg">
        {(["expense", "income"] as TransactionType[]).map((t) => (
          <button
            key={t}
            onClick={() => setForm((f) => ({ ...f, type: t }))}
            className={`flex-1 py-2 rounded-md text-sm font-semibold capitalize transition-all ${
              form.type === t
                ? "bg-surface text-primary shadow-warm-sm"
                : "text-on-surface-muted hover:text-secondary"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {/* Merchant */}
        <div>
          <label className="label-engraved text-on-surface-muted block mb-1.5">
            Merchant / Source
          </label>
          <input
            type="text"
            placeholder="e.g. Swiggy, Salary"
            value={form.merchant}
            onChange={(e) => setForm((f) => ({ ...f, merchant: e.target.value }))}
            className="w-full bg-surface-low rounded-lg px-4 py-2.5 text-sm text-primary placeholder:text-on-surface-muted outline-none focus:bg-surface-mid transition-colors"
          />
        </div>

        {/* Description */}
        <div>
          <label className="label-engraved text-on-surface-muted block mb-1.5">
            Description (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Monthly groceries"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full bg-surface-low rounded-lg px-4 py-2.5 text-sm text-primary placeholder:text-on-surface-muted outline-none focus:bg-surface-mid transition-colors"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="label-engraved text-on-surface-muted block mb-1.5">
            Amount (₹)
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className="w-full bg-surface-low rounded-lg px-4 py-2.5 text-sm text-primary placeholder:text-on-surface-muted outline-none focus:bg-surface-mid transition-colors"
          />
        </div>

        {/* Bucket + Tag */}
        {form.type === "expense" && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="label-engraved text-on-surface-muted block mb-1.5">
                Bucket
              </label>
              <div className="flex gap-2">
                {(["needs", "wants", "savings"] as Bucket[]).map((b) => (
                  <button
                    key={b}
                    onClick={() => handleBucketChange(b)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                      form.bucket === b
                        ? "bg-primary text-white"
                        : "bg-surface-low text-on-surface-muted hover:bg-surface-mid"
                    }`}
                  >
                    {b === "needs" ? "🏠 " : b === "wants" ? "✨ " : "🐖 "}
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label-engraved text-on-surface-muted block mb-1.5">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {tagOptions[form.bucket].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setForm((f) => ({ ...f, tag }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      form.tag === tag
                        ? "bg-primary text-white"
                        : "bg-tertiary text-tertiary-dark hover:bg-surface-mid"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Date + Time */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="label-engraved text-on-surface-muted block mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full bg-surface-low rounded-lg px-4 py-2.5 text-sm text-primary outline-none focus:bg-surface-mid transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="label-engraved text-on-surface-muted block mb-1.5">
              Time
            </label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              className="w-full bg-surface-low rounded-lg px-4 py-2.5 text-sm text-primary outline-none focus:bg-surface-mid transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-xs text-danger mt-4">{error}</p>}

      {/* Actions */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-lg bg-surface-low text-secondary text-sm font-semibold hover:bg-surface-mid transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-2.5 rounded-lg gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Post Transaction
        </button>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: animateIn ? 1 : 0 }}
        onClick={onClose}
      />

      {/* ── MOBILE — bottom sheet ── */}
      <div
        className="
          relative md:hidden
          w-full bg-surface
          rounded-t-2xl shadow-warm
          transition-transform duration-300 ease-out
          max-h-[92vh] overflow-y-auto
        "
        style={{
          transform: animateIn ? "translateY(0)" : "translateY(100%)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-surface-mid" />
        </div>

        <div className="px-6 pb-8 pt-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-primary">
                Add Transaction
              </h3>
              <p className="text-xs text-on-surface-muted mt-0.5">
                {currentPlan
                  ? "Categories from your current plan"
                  : "Set a budget plan to customize categories"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-surface-mid flex items-center justify-center text-secondary"
            >
              <X size={14} />
            </button>
          </div>

          {FormContent}
        </div>
      </div>

      {/* ── DESKTOP — centered modal ── */}
      <div
        className="
          relative hidden md:block
          bg-surface rounded-2xl shadow-warm
          w-full max-w-md mx-4 p-8
          transition-all duration-300
        "
        style={{
          opacity: animateIn ? 1 : 0,
          transform: animateIn ? "scale(1)" : "scale(0.96)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-primary">Add Transaction</h3>
            <p className="text-xs text-on-surface-muted mt-0.5">
              {currentPlan
                ? "Categories from your current plan"
                : "Set a budget plan to customize categories"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-surface-mid flex items-center justify-center text-secondary hover:bg-surface-dim transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {FormContent}
      </div>
    </div>
  );
}