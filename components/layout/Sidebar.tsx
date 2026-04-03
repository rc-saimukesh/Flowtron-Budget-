"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  BarChart2,
  Plus,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Budgeting", href: "/plan", icon: Target },
  { label: "Reports", href: "/report", icon: BarChart2 },
];

interface SidebarProps {
  onAddTransaction: () => void;
}

export default function Sidebar({ onAddTransaction }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 flex flex-col justify-between py-8 px-4 z-40"
      style={{ background: "#f6f3f1" }}
    >
      {/* Logo */}
      <div>
        <div className="px-3 mb-10">
          <div className="flex items-center gap-2 mb-1">
            <img
    src="/logo.png"
    alt="Flowtron Budget"
    className="w-6 h-6 object-contain"
  />
            <h1 className="text-sm font-bold tracking-tight text-primary">
              Flowtron Budget
            </h1>
          </div>
          <p className="label-engraved text-on-surface-muted pl-8">
            Financial Sanctuary
          </p>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    isActive
                      ? "bg-surface text-primary shadow-warm-sm"
                      : "text-secondary hover:bg-surface hover:text-primary"
                  }`}
              >
                <Icon
                  size={15}
                  className={
                    isActive ? "text-accent" : "text-on-surface-muted"
                  }
                />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col gap-3 px-1">
        {/* Storage indicator */}
        <div className="px-2 py-2 rounded-lg bg-surface">
          <p className="label-engraved text-on-surface-muted mb-1">
            Storage
          </p>
          <p className="text-xs text-secondary font-medium">
            Local · Free Plan
          </p>
          <div className="mt-2 w-full h-1 bg-surface-mid rounded-full overflow-hidden">
            <div className="h-full w-1/4 bg-accent rounded-full" />
          </div>
        </div>

        {/* Add Transaction CTA */}
        <button
          onClick={onAddTransaction}
          className="w-full flex items-center justify-center gap-2 gradient-primary text-white text-sm font-semibold py-3 rounded-lg shadow-warm transition-all hover:opacity-90 hover:shadow-none active:scale-95"
        >
          <Plus size={15} />
          Add Transaction
        </button>
      </div>
    </aside>
  );
}