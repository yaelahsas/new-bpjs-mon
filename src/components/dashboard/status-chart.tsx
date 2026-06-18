"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { MonitoringSummary } from "@/types/monitoring";

interface StatusChartProps {
  summary: MonitoringSummary | null;
}

const COLORS = ["#22c55e", "#eab308", "#ef4444"];

export function StatusChart({ summary }: StatusChartProps) {
  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          No data yet
        </CardContent>
      </Card>
    );
  }

  const data = [
    { name: "Online", value: summary.online },
    { name: "Slow", value: summary.slow },
    { name: "Offline", value: summary.offline },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                fontSize: 11,
                backgroundColor: "var(--popover)",
                color: "var(--popover-foreground)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
