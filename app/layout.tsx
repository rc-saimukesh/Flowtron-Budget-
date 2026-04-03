import type { Metadata } from "next";
import "./globals.css";
import { BudgetProvider } from "@/context/BudgetContext";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: {
    default: "Flowtron Budget",
    template: "%s · Flowtron Budget",
  },
  description:
    "Your personal financial sanctuary. Track spending, plan budgets, and visualize your financial health.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface min-h-screen">
        <BudgetProvider>
          <AppShell>{children}</AppShell>
        </BudgetProvider>
      </body>
    </html>
  );
}