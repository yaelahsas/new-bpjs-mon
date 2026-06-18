"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ChartDataPoint, ServiceResult } from "@/types/monitoring";

interface TrendChartProps {
  data: ChartDataPoint[];
  services: Record<string, ServiceResult>;
}

const COLORS = [
  "#22c55e", "#3b82f6", "#eab308", "#ef4444", "#a855f7",
  "#06b6d4", "#f97316", "#ec4899", "#14b8a6", "#8b5cf6",
  "#84cc16", "#f43f5e",
];

export function TrendChart({ data, services }: TrendChartProps) {
  const keys = Object.keys(services);

  if (data.length === 0) {
    return (
      <Card id="charts">
        <CardHeader>
          <CardTitle className="text-sm">Response Time Trend</CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center text-sm text-muted-foreground">
          No data yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="charts">
      <CardHeader>
        <CardTitle className="text-sm">Response Time Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10 }}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 10 }}
              label={{ value: "ms", position: "insideTopLeft", fontSize: 10 }}
              className="text-muted-foreground"
            />
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
            {keys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={1.5}
                dot={false}
                name={services[key]?.label ?? key}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
