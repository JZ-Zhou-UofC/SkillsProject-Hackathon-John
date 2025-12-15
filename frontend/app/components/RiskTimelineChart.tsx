"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Row = {
  created_at: string;
  shutdown_risk: number;
  bearing_risk?: number;
};

export default function RiskTimelineChart({ data }: { data: Row[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis
            dataKey="created_at"
            tickFormatter={(v) => new Date(v).toLocaleTimeString()}
          />
          <YAxis domain={[0, 1]} />
          <Tooltip
            labelFormatter={(v) =>
              new Date(v).toLocaleString()
            }
          />
          <Line
            type="monotone"
            dataKey="shutdown_risk"
            stroke="#dc2626"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="bearing_risk"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
