# CashewTrack — Factory Processing App

Mobile-first cashew processing management system built with **React + Vite + Tailwind CSS**.

---

## Tech Stack

- **React 18** — UI framework
- **Vite 5** — build tool & dev server
- **Tailwind CSS 3** — utility-first styling
- **React Router v6** — client-side routing

---

## Project Structure

```
cashewtrack/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx              # Entry point
    ├── App.jsx               # Router + AppContext (role state)
    ├── index.css             # Tailwind + global component classes
    ├── components/
    │   └── UI.jsx            # All reusable components
    └── pages/
        ├── LoginPage.jsx     # Role selection screen
        ├── HomePage.jsx      # Dashboard nav (role-aware)
        ├── RawLotPage.jsx    # Step 1 — Supervisor only
        ├── SteamingPage.jsx  # Step 2 — Operator + Supervisor
        ├── ShellingPage.jsx  # Step 3 — Operator + Supervisor
        ├── DryingPage.jsx    # Step 4 — Operator + Supervisor
        ├── PeelingPage.jsx   # Step 5 — Operator + Supervisor
        ├── GradingPage.jsx   # Step 6 — Supervisor only
        ├── PackagingPage.jsx # Step 7 — Supervisor only
        └── DashboardPage.jsx # Owner analytics (read-only)
```

---

## Reusable Components (`src/components/UI.jsx`)

| Component        | Description                                      |
|------------------|--------------------------------------------------|
| `InputField`     | text / number / date / time inputs with labels   |
| `SelectDropdown` | Styled native select with label & required mark  |
| `SectionCard`    | White card with optional section title           |
| `MetricCard`     | KPI tile — label + big value + optional color    |
| `MetricsGrid`    | 2-column grid of MetricCards                     |
| `InfoBox`        | Alert banner: `info`, `warning`, `danger`        |
| `PageLayout`     | Full page shell: header + sticky footer button   |
| `StepBar`        | Scrollable pill step indicator                   |
| `RowTwo`         | 2-column grid shorthand                          |
| `useToast`       | Hook — `show(msg)` + `<ToastEl />` component     |

---

## Role Access

| Screen       | Operator | Supervisor | Owner |
|-------------|----------|------------|-------|
| Raw Lot      |          | ✅          |       |
| Steaming     | ✅        | ✅          |       |
| Shelling     | ✅        | ✅          |       |
| Drying       | ✅        | ✅          |       |
| Peeling      | ✅        | ✅          |       |
| Grading      |          | ✅          |       |
| Packaging    |          | ✅          |       |
| Dashboard    |          | ✅          | ✅     |

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
# http://localhost:5173
```

## Build for Production

```bash
npm run build
npm run preview
```

---

## Key UX Patterns

- **Auto-calculated fields** — Net weight, recovery %, efficiency all update live
- **Inline validation** — Required field marks, over-stock warnings, moisture alerts
- **Role-based routing** — Screens hidden based on logged-in role
- **Mobile-first** — Touch-friendly inputs, large tap targets, sticky footer actions
- **Visual metrics** — Progress bars, distribution charts, color-coded KPIs
