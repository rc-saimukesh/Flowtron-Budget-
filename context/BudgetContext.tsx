"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  ReactNode,
} from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Bucket = "needs" | "wants" | "savings";
export type TransactionType = "expense" | "income";

export interface Transaction {
  id: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  amount: number;
  description: string;
  merchant: string;
  bucket: Bucket;
  tag: string; // sub-category e.g. "Groceries"
  type: TransactionType;
}

export interface CategoryBudgets {
  needs: number;
  wants: number;
  savings: number;
}

export interface LineItem {
  id: string;
  label: string;
  amount: string;
}

export interface BucketLineItems {
  needs: LineItem[];
  wants: LineItem[];
  savings: LineItem[];
}

export interface MonthPlan {
  month: string;
  totalBudget: number;
  categoryBudgets: CategoryBudgets;
  projectedIncome: number;
  lineItems?: BucketLineItems; // optional so old data doesn't break
}

export interface BudgetState {
  transactions: Transaction[];
  plans: MonthPlan[];
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: BudgetState = {
  transactions: [],
  plans: [],
};

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "DELETE_TRANSACTION"; payload: string } // id
  | { type: "SET_PLAN"; payload: MonthPlan }
  | { type: "LOAD_STATE"; payload: BudgetState };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function budgetReducer(state: BudgetState, action: Action): BudgetState {
  switch (action.type) {
    case "LOAD_STATE":
      return action.payload;

    case "ADD_TRANSACTION":
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };

    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };

    case "SET_PLAN": {
      const exists = state.plans.find((p) => p.month === action.payload.month);
      return {
        ...state,
        plans: exists
          ? state.plans.map((p) =>
              p.month === action.payload.month ? action.payload : p
            )
          : [...state.plans, action.payload],
      };
    }

    default:
      return state;
  }
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7); // "YYYY-MM"
}

export function getToday(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export function getCurrentTime(): string {
  return new Date().toTimeString().slice(0, 5); // "HH:MM"
}

// Get all transactions for a specific month "YYYY-MM"
export function getTransactionsByMonth(
  transactions: Transaction[],
  month: string
): Transaction[] {
  return transactions.filter((t) => t.date.startsWith(month));
}

// Get all transactions for a specific day "YYYY-MM-DD"
export function getTransactionsByDay(
  transactions: Transaction[],
  day: string
): Transaction[] {
  return transactions.filter((t) => t.date === day);
}

// Get all transactions for a specific year "YYYY"
export function getTransactionsByYear(
  transactions: Transaction[],
  year: string
): Transaction[] {
  return transactions.filter((t) => t.date.startsWith(year));
}

// Total expenses for a list of transactions
export function getTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
}

// Total income for a list of transactions
export function getTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
}

// Expenses grouped by bucket for a list of transactions
export function getExpensesByBucket(
  transactions: Transaction[]
): CategoryBudgets {
  const expenses = transactions.filter((t) => t.type === "expense");
  return {
    needs: expenses
      .filter((t) => t.bucket === "needs")
      .reduce((sum, t) => sum + t.amount, 0),
    wants: expenses
      .filter((t) => t.bucket === "wants")
      .reduce((sum, t) => sum + t.amount, 0),
    savings: expenses
      .filter((t) => t.bucket === "savings")
      .reduce((sum, t) => sum + t.amount, 0),
  };
}

// Format number as INR
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface BudgetContextValue {
  state: BudgetState;
  dispatch: React.Dispatch<Action>;
  // Convenience helpers exposed to all pages
  addTransaction: (t: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  setPlan: (plan: MonthPlan) => void;
  getPlanForMonth: (month: string) => MonthPlan | undefined;
  getMonthSummary: (month: string) => {
    totalExpenses: number;
    totalIncome: number;
    remaining: number;
    byBucket: CategoryBudgets;
    plan: MonthPlan | undefined;
    isOverBudget: boolean;
  };
}

const BudgetContext = createContext<BudgetContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "flowtron_budget_v1";

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(budgetReducer, initialState);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: BudgetState = JSON.parse(stored);
        dispatch({ type: "LOAD_STATE", payload: parsed });
      }
    } catch (e) {
      console.warn("Flowtron: Failed to load saved data.", e);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Sync to localStorage on every state change — but only after hydration
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("Flowtron: Failed to save data.", e);
    }
  }, [state, hydrated]);

  const addTransaction = (t: Omit<Transaction, "id">) => {
    dispatch({
      type: "ADD_TRANSACTION",
      payload: { ...t, id: generateId() },
    });
  };

  const deleteTransaction = (id: string) => {
    dispatch({ type: "DELETE_TRANSACTION", payload: id });
  };

  const setPlan = (plan: MonthPlan) => {
    dispatch({ type: "SET_PLAN", payload: plan });
  };

  const getPlanForMonth = (month: string) =>
    state.plans.find((p) => p.month === month);

  const getMonthSummary = (month: string) => {
    const txns = getTransactionsByMonth(state.transactions, month);
    const totalExpenses = getTotalExpenses(txns);
    const totalIncome = getTotalIncome(txns);
    const plan = getPlanForMonth(month);
    const byBucket = getExpensesByBucket(txns);
    const remaining = (plan?.projectedIncome ?? totalIncome) - totalExpenses;
    const isOverBudget =
      (plan?.totalBudget ?? 0) > 0 &&
      totalExpenses > (plan?.totalBudget ?? 0);

    return {
      totalExpenses,
      totalIncome,
      remaining,
      byBucket,
      plan,
      isOverBudget,
    };
  };

  // Don't render children until localStorage has been read
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-sm text-on-surface-muted">Loading your sanctuary...</p>
      </div>
    );
  }

  return (
    <BudgetContext.Provider
      value={{
        state,
        dispatch,
        addTransaction,
        deleteTransaction,
        setPlan,
        getPlanForMonth,
        getMonthSummary,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBudget(): BudgetContextValue {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error("useBudget must be used within a BudgetProvider");
  return ctx;
}