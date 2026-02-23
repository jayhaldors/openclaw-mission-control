"use client";

export const dynamic = "force-dynamic";

import { Cpu, Hash, MessageSquare, Zap } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

import { DashboardPageLayout } from "@/components/templates/DashboardPageLayout";

const TOKEN_USAGE_OVER_TIME = [
  { date: "Feb 10", prompt: 45000, completion: 32000 },
  { date: "Feb 12", prompt: 52000, completion: 38000 },
  { date: "Feb 14", prompt: 48000, completion: 35000 },
  { date: "Feb 16", prompt: 61000, completion: 44000 },
  { date: "Feb 18", prompt: 58000, completion: 41000 },
  { date: "Feb 20", prompt: 72000, completion: 53000 },
  { date: "Feb 22", prompt: 65000, completion: 47000 },
];

const MODEL_BREAKDOWN = [
  { model: "GPT-4o", calls: 1240, promptTokens: 185000, completionTokens: 132000, cost: 892.5 },
  { model: "Claude 3.5 Sonnet", calls: 980, promptTokens: 156000, completionTokens: 118000, cost: 645.0 },
  { model: "Claude Opus 4", calls: 320, promptTokens: 82000, completionTokens: 61000, cost: 1120.0 },
  { model: "GPT-4o-mini", calls: 3500, promptTokens: 210000, completionTokens: 95000, cost: 124.5 },
  { model: "Claude Haiku 3.5", calls: 4200, promptTokens: 168000, completionTokens: 72000, cost: 78.0 },
];

function KpiCard({
  label,
  value,
  sublabel,
  icon,
}: {
  label: string;
  value: string;
  sublabel?: string;
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
      {sublabel ? (
        <p className="mt-2 text-xs text-slate-500">{sublabel}</p>
      ) : null}
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
              {(entry.value ?? 0).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LlmUsePage() {
  const totalPrompt = MODEL_BREAKDOWN.reduce((s, m) => s + m.promptTokens, 0);
  const totalCompletion = MODEL_BREAKDOWN.reduce(
    (s, m) => s + m.completionTokens,
    0,
  );
  const totalCalls = MODEL_BREAKDOWN.reduce((s, m) => s + m.calls, 0);
  const totalTokens = totalPrompt + totalCompletion;

  return (
    <DashboardPageLayout
      signedOut={{
        message: "Sign in to view LLM usage.",
        forceRedirectUrl: "/onboarding",
        signUpForceRedirectUrl: "/onboarding",
      }}
      title="LLM Use"
      description="Track model usage, token consumption, and API call metrics"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Tokens"
          value={totalTokens.toLocaleString()}
          sublabel="Prompt + completion"
          icon={<Hash className="h-4 w-4" />}
        />
        <KpiCard
          label="Prompt Tokens"
          value={totalPrompt.toLocaleString()}
          icon={<MessageSquare className="h-4 w-4" />}
        />
        <KpiCard
          label="Completion Tokens"
          value={totalCompletion.toLocaleString()}
          icon={<Zap className="h-4 w-4" />}
        />
        <KpiCard
          label="API Calls"
          value={totalCalls.toLocaleString()}
          icon={<Cpu className="h-4 w-4" />}
        />
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="font-heading text-base font-semibold text-slate-900">
            Token Usage Over Time
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Prompt and completion tokens by day
          </p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={TOKEN_USAGE_OVER_TIME}
              margin={{ left: 4, right: 12 }}
            >
              <CartesianGrid vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                width={50}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
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
              <Area
                type="monotone"
                dataKey="prompt"
                name="Prompt Tokens"
                stackId="tokens"
                fill="#bfdbfe"
                stroke="#2563eb"
                fillOpacity={0.8}
              />
              <Area
                type="monotone"
                dataKey="completion"
                name="Completion Tokens"
                stackId="tokens"
                fill="#e9d5ff"
                stroke="#7c3aed"
                fillOpacity={0.8}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="font-heading text-base font-semibold text-slate-900">
            Model Breakdown
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3">Model</th>
                <th className="px-6 py-3 text-right">API Calls</th>
                <th className="px-6 py-3 text-right">Prompt Tokens</th>
                <th className="px-6 py-3 text-right">Completion Tokens</th>
                <th className="px-6 py-3 text-right">Cost</th>
              </tr>
            </thead>
            <tbody>
              {MODEL_BREAKDOWN.map((row) => (
                <tr
                  key={row.model}
                  className="border-b border-slate-50 transition hover:bg-slate-50"
                >
                  <td className="px-6 py-3 font-medium text-slate-900">
                    {row.model}
                  </td>
                  <td className="px-6 py-3 text-right text-slate-700">
                    {row.calls.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-right text-slate-700">
                    {row.promptTokens.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-right text-slate-700">
                    {row.completionTokens.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-right font-medium text-slate-900">
                    ${row.cost.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-medium text-slate-900">
                <td className="px-6 py-3">Total</td>
                <td className="px-6 py-3 text-right">
                  {totalCalls.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-right">
                  {totalPrompt.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-right">
                  {totalCompletion.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-right">
                  $
                  {MODEL_BREAKDOWN.reduce((s, m) => s + m.cost, 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </DashboardPageLayout>
  );
}
