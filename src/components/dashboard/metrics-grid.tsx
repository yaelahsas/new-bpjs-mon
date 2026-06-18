"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Activity,
  CheckCircle2,
  Clock,
  Wifi,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MonitoringSummary } from "@/types/monitoring";

interface MetricsGridProps {
  summary: MonitoringSummary | null;
  totals: { requests: number; success: number };
}

export function MetricsGrid({ summary, totals }: MetricsGridProps) {
  const metrics = [
    {
      label: "Total Requests",
      value: totals.requests.toString(),
      icon: Activity,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Success Rate",
      value: summary ? `${summary.success_rate}%` : "--",
      icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
    {
      label: "Avg Response",
      value: summary ? `${Math.round(summary.avg_response)}ms` : "--",
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
    },
    {
      label: "Status",
      value: summary
        ? `${summary.online} OK / ${summary.slow} Slow / ${summary.offline} Down`
        : "--",
      icon: summary && summary.offline > 0 ? AlertTriangle : Wifi,
      color: summary && summary.offline > 0 ? "text-red-500" : "text-emerald-500",
      bg: summary && summary.offline > 0 ? "bg-red-500/10" : "bg-emerald-500/10",
      border: summary && summary.offline > 0 ? "border-red-500/20" : "border-emerald-500/20",
    },
  ];

  return (
    <div id="metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <Card key={m.label} className={cn("border shadow-sm", m.border)}>
          <CardContent className="flex items-center gap-3">
            <div className={cn("rounded-lg p-2", m.bg, m.color)}>
              <m.icon className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-sm font-semibold leading-tight">{m.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
