# Flowtron Budget 🌿
### Your Personal Financial Sanctuary

A beautiful, cozy budget tracking web app built with Next.js. Track your daily spending, plan monthly budgets, and visualize your financial health — all stored locally in your browser with no account required.

---

## ✨ Features

- **Dashboard** — Live liquidity snapshot, bucket progress bars, and recent activity at a glance
- **Ledger Archive** — Full transaction history with Daily / Monthly / Yearly grouping, search, and category filters
- **Budget Planning** — Set monthly income, allocate per-bucket targets (Needs / Wants / Savings) with custom line items
- **Reports** — Editorial end-of-month summary with over/under budget status, charts, and insights
- **Quick Add** — Add transactions instantly from any page via the sidebar CTA
- **Persistent Storage** — All data saved to browser localStorage — no login, no server needed
- **INR Currency** — Built specifically for ₹ (Indian Rupee)

---

## 🗂 Project Structure

```
flowtron-budget/
├── app/
│   ├── page.tsx                  # Dashboard
│   ├── transactions/page.tsx     # Ledger Archive
│   ├── plan/page.tsx             # Budget Planning
│   ├── report/page.tsx           # Monthly Reports
│   ├── layout.tsx                # Root layout + metadata
│   ├── globals.css               # Design tokens + Tailwind v4 theme
│   └── not-found.tsx             # 404 page
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx          # Client shell (sidebar + modal state)
│   │   ├── Sidebar.tsx           # Navigation + Add Transaction CTA
│   │   ├── TopBar.tsx            # Page header + balance pill
│   │   ├── AddTransactionModal.tsx # Quick add form
│   │   └── PageTransition.tsx    # Fade + slide transition wrapper
│   ├── ui/
│   │   ├── StatCard.tsx          # Summary stat cards
│   │   ├── BucketCard.tsx        # Needs/Wants/Savings progress card
│   │   ├── ProgressBar.tsx       # Warm progress bar
│   │   ├── TransactionRow.tsx    # Single transaction row
│   │   ├── GroupedTransactions.tsx # Grouped transaction list
│   │   └── EmptyState.tsx        # Empty state placeholder
│   └── charts/
│       ├── BudgetBarChart.tsx    # Budgeted vs Actual bar chart
│       └── SpendingDonutChart.tsx # Spending breakdown donut chart
├── context/
│   └── BudgetContext.tsx         # Global state + localStorage sync
└── public/
    └── logo.png                  # Your brand logo
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Icons | Lucide React |
| Font | Manrope (Google Fonts) |
| Storage | Browser localStorage |
| Deployment | Vercel |

---

## 🎨 Design System

Built on the **"Curated Sanctuary"** design language — warm, editorial, and intentionally calm.

| Token | Value | Use |
|---|---|---|
| `surface` | `#fcf9f7` | Page background |
| `surface-low` | `#f6f3f1` | Cards, grouping |
| `primary` | `#000b10` | Headings, CTA |
| `accent` | `#b58863` | Highlights, income |
| `tertiary` | `#ebe0de` | Chips, tags |
| `danger` | `#c0392b` | Over budget |
| `success` | `#2d6a4f` | Under budget |

**Rules:**
- No 1px dividers — use surface tone shifts
- Warm glow shadows only: `rgba(125, 86, 53, 0.08)`
- Manrope font throughout
- Generous whitespace — breathe, don't crowd

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/flowtron-budget.git

# Navigate into the project
cd flowtron-budget

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## 🗺 Roadmap

### v1 — Current (localStorage)
- [x] Dashboard with live summary
- [x] Transaction management
- [x] Monthly budget planning
- [x] End-of-month reports with charts
- [x] Custom sub-categories per bucket
- [x] Daily / Monthly / Yearly views

### v2 — Planned (Persistent)
- [ ] User authentication
- [ ] Cloud database sync (PostgreSQL / Supabase)
- [ ] Multi-device support
- [ ] Export to PDF / CSV
- [ ] Recurring transactions
- [ ] Email monthly report digest

---
