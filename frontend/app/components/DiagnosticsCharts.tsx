"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* -------------------------
   Types
------------------------- */

type DiagnosticRow = {
  created_at: string;
  output_current: number;
  exhaust_chemical_percentage: number;
};

/* -------------------------
   Main Component
------------------------- */

export default function DiagnosticsCharts({
  data,
}: {
  data: DiagnosticRow[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="bg-white p-6 rounded-xl border space-y-6">
      {/* Toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        {open ? "Hide Diagnostics" : "Show Diagnostics"}
      </button>

      {open && (
        <div className="space-y-8">
          {/* Output Current Chart */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">
              Output Current Over Time
            </h3>

            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data}>
                <XAxis
                  dataKey="created_at"
                  tickFormatter={formatDate}
                  minTickGap={40}
                />
                <YAxis
                  label={{
                    value: "Current (A)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  labelFormatter={formatDateTime}
                  formatter={(v: number) => [`${v} A`, "Current"]}
                />
                <Line
                  type="monotone"
                  dataKey="output_current"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Exhaust Chemical Percentage Chart */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">
              Exhaust Chemical Percentage Over Time
            </h3>

            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data}>
                <XAxis
                  dataKey="created_at"
                  tickFormatter={formatDate}
                  minTickGap={40}
                />
                <YAxis
                  domain={[0, 1]}
                  tickFormatter={(v) => `${Math.round(v * 100)}%`}
                  label={{
                    value: "Chemical %",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  labelFormatter={formatDateTime}
                  formatter={(v: number) => [
                    `${Math.round(v * 100)}%`,
                    "Chemical %",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="exhaust_chemical_percentage"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </section>
  );
}

/* -------------------------
   Helpers
------------------------- */

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString();
}
