"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import AddTransactionModal from "@/components/layout/AddTransactionModal";
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

function BottomNav({ onAdd }: { onAdd: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* FAB */}
      <button
        onClick={onAdd}
        className="
          fixed bottom-20 right-4 z-50
          md:hidden
          w-14 h-14 rounded-full
          gradient-primary text-white
          shadow-warm flex items-center justify-center
          active:scale-95 transition-transform
        "
      >
        <Plus size={22} />
      </button>

      {/* Bottom Nav */}
      <nav
        className="
          fixed bottom-0 left-0 right-0 z-40
          md:hidden
          border-t border-surface-mid
          px-2 py-2
          flex items-center justify-around
        "
        style={{ background: "rgba(252, 249, 247, 0.92)", backdropFilter: "blur(20px)" }}
      >
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all"
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={isActive ? "text-accent" : "text-on-surface-muted"}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                )}
              </div>
              <span
                className={`text-[10px] font-semibold ${
                  isActive ? "text-accent" : "text-on-surface-muted"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar onAddTransaction={() => setModalOpen(true)} />
      </div>

      {/* Main content */}
      <main className="
        md:ml-56
        min-h-screen
        px-4 py-6
        md:px-10 md:py-10
        pb-24 md:pb-10
      ">
        {children}
      </main>

      {/* Mobile nav — separate component so usePathname works independently */}
      <BottomNav onAdd={() => setModalOpen(true)} />

      {/* Modal */}
      <AddTransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}