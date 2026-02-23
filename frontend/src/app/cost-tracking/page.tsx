"use client";

export const dynamic = "force-dynamic";

import {
  DollarSign,
  TrendingUp,
  Wallet,
  Receipt,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

import { DashboardPageLayout } from "@/components/templates/DashboardPageLayout";

const MONTHLY_COSTS = [
  { month: "Sep", infrastructure: 1200, api: 800, services: 400 },
  { month: "Oct", infrastructure: 1350, api: 950, services: 420 },
  { month: "Nov", infrastructure: 1100, api: 1100, services: 380 },
  { month: "Dec", infrastructure: 1400, api: 1250, services: 500 },
  { month: "Jan", infrastructure: 1500, api: 1400, services: 450 },
  { month: "Feb", infrastructure: 1300, api: 1600, services: 520 },
];

const RECENT_EXPENSES = [
  { date: "2026-02-18", category: "API Calls", amount: 342.5, description: "OpenAI GPT-4o usage" },
  { date: "2026-02-17", category: "Infrastructure", amount: 89.0, description: "AWS EC2 compute hours" },
  { date: "2026-02-16", category: "API Calls", amount: 215.75, description: "Anthropic Claude usage" },
  { date: "2026-02-15", category: "Services", amount: 49.99, description: "Monitoring subscription" },
  { date: "2026-02-14", category: "Infrastructure", amount: 125.0, description: "Database hosting" },
  { date: "2026-02-13", category: "API Calls", amount: 178.3, description: "Embedding generation" },
  { date: "2026-02-12", category: "Infrastructure", amount: 67.5, description: "CDN bandwidth" },
  { date: "2026-02-11", category: "Services", amount: 29.99, description: "Log aggregation" },
];

function KpiCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">{icon}</div>
      </div>
      <h3 className="font-heading text-4xl font-bold text-slate-900">
        {value}
      </h3>
    </div>
  );
}

function TooltipCard({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; name?: string; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-slate-900/95 px-3 py-2 text-xs text-slate-200 shadow-lg">
      {label ? <div className="text-slate-400">{label}</div> : null}
      <div className="mt-1 space-y-1">
        {payload.map((entry, index) => (
          <div
            key={`${entry.name ?? "value"}-${index}`}
            className="flex items-center justify-between gap-3"
          >
            <span className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-semibold text-slate-100">
              ${(entry.value ?? 0).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CostTrackingPage() {
  const totalSpend = MONTHLY_COSTS.reduce(
    (sum, m) => sum + m.infrastructure + m.api + m.services,
    0,
  );
  const monthlyAvg = totalSpend / MONTHLY_COSTS.length;

  return (
    <DashboardPageLayout
      signedOut={{
        message: "Sign in to view cost tracking.",
        forceRedirectUrl: "/onboarding",
        signUpForceRedirectUrl: "/onboarding",
      }}
      title="Cost Tracking"
      description="Monitor infrastructure and API expenses"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Spend"
          value={`$${totalSpend.toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <KpiCard
          label="Monthly Average"
          value={`$${Math.round(monthlyAvg).toLocaleString()}`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <KpiCard
          label="Budget Remaining"
          value="$4,250"
          icon={<Wallet className="h-4 w-4" />}
        />
        <KpiCard
          label="Cost per Task"
          value="$2.45"
          icon={<Receipt className="h-4 w-4" />}
        />
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="font-heading text-base font-semibold text-slate-900">
            Monthly Cost Breakdown
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Spend by category over the last 6 months
          </p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_COSTS} margin={{ left: 4, right: 12 }}>
              <CartesianGrid vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                width={50}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip content={<TooltipCard />} />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  paddingTop: "8px",
                  fontSize: "12px",
                  color: "#64748b",
                }}
              />
              <Bar
                dataKey="infrastructure"
                name="Infrastructure"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                stackId="costs"
              />
              <Bar
                dataKey="api"
                name="API Calls"
                fill="#7c3aed"
                radius={[0, 0, 0, 0]}
                stackId="costs"
              />
              <Bar
                dataKey="services"
                name="Services"
                fill="#0891b2"
                radius={[4, 4, 0, 0]}
                stackId="costs"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="font-heading text-base font-semibold text-slate-900">
            Recent Expenses
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_EXPENSES.map((expense, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-50 transition hover:bg-slate-50"
                >
                  <td className="px-6 py-3 text-slate-500">{expense.date}</td>
                  <td className="px-6 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-700">
                    {expense.description}
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-slate-900">
                    ${expense.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
