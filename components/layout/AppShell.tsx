"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import AddTransactionModal from "@/components/layout/AddTransactionModal";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Sidebar onAddTransaction={() => setModalOpen(true)} />
      <main className="ml-56 min-h-screen px-10 py-10">
        {children}
      </main>
      <AddTransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}