"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Zap, AlertTriangle, XCircle } from "lucide-react";
import type { LogEntry } from "@/types/monitoring";
import { format } from "date-fns";

interface ActivityLogProps {
  logs: LogEntry[];
}

const statusConfig = {
  success: {
    border: "border-green-500/20",
    bg: "bg-green-500/5",
    icon: Zap,
    iconColor: "text-green-500",
    badgeVariant: "default" as const,
  },
  slow: {
    border: "border-yellow-500/20",
    bg: "bg-yellow-500/5",
    icon: AlertTriangle,
    iconColor: "text-yellow-500",
    badgeVariant: "secondary" as const,
  },
  error: {
    border: "border-red-500/20",
    bg: "bg-red-500/5",
    icon: XCircle,
    iconColor: "text-red-500",
    badgeVariant: "destructive" as const,
  },
};

export function ActivityLog({ logs }: ActivityLogProps) {
  return (
    <Card id="logs">
      <CardHeader>
        <CardTitle className="text-sm">Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No activity yet
            </p>
          ) : (
            <div className="space-y-1.5">
              {logs.map((log) => {
                const config = statusConfig[log.status];
                const StatusIcon = config.icon;
                return (
                  <div
                    key={log.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-2.5 text-xs transition-colors",
                      config.border,
                      config.bg
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <StatusIcon className={cn("size-3.5 shrink-0", config.iconColor)} />
                      <Badge
                        variant={config.badgeVariant}
                        className="text-[10px] px-1.5"
                      >
                        {log.mode.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{log.endpoint}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span className="font-mono tabular-nums">
                        {Math.round(log.response_time)}ms
                      </span>
                      <span className="font-mono">
                        {format(new Date(log.ts), "HH:mm:ss")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
