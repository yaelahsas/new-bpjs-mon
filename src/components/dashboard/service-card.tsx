"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Zap, AlertTriangle, XCircle } from "lucide-react";
import type { ServiceResult } from "@/types/monitoring";

interface ServiceCardProps {
  service: ServiceResult;
}

const statusConfig = {
  online: {
    border: "border-l-green-500",
    bg: "bg-green-500/5 dark:bg-green-500/10",
    glow: "shadow-green-500/10",
    badge: "default" as const,
    badgeLabel: "Online",
    icon: Zap,
    iconColor: "text-green-500",
    dot: "bg-green-500",
  },
  slow: {
    border: "border-l-yellow-500",
    bg: "bg-yellow-500/5 dark:bg-yellow-500/10",
    glow: "shadow-yellow-500/10",
    badge: "secondary" as const,
    badgeLabel: "Slow",
    icon: AlertTriangle,
    iconColor: "text-yellow-500",
    dot: "bg-yellow-500",
  },
  offline: {
    border: "border-l-red-500",
    bg: "bg-red-500/5 dark:bg-red-500/10",
    glow: "shadow-red-500/10",
    badge: "destructive" as const,
    badgeLabel: "Offline",
    icon: XCircle,
    iconColor: "text-red-500",
    dot: "bg-red-500",
  },
};

export function ServiceCard({ service }: ServiceCardProps) {
  const config = statusConfig[service.status];
  const StatusIcon = config.icon;

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-l-4 shadow-md transition-all hover:shadow-lg",
        config.border,
        config.bg,
        config.glow
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("relative flex size-8 items-center justify-center rounded-full", config.bg)}>
              <StatusIcon className={cn("size-4", config.iconColor)} />
              {service.status === "online" && (
                <span className="absolute inline-flex size-full animate-ping rounded-full opacity-20 bg-green-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold">{service.label}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {service.type}
              </p>
            </div>
          </div>
          <Badge variant={config.badge} className="text-xs gap-1">
            <span className={cn("inline-block size-1.5 rounded-full", config.dot)} />
            {config.badgeLabel}
          </Badge>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-mono font-medium text-foreground">
              {Math.round(service.response_time)}
            </span>
            <span>ms</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">HTTP</span>
            <span className={cn(
              "font-mono",
              service.http_code === 200 ? "text-green-500" : "text-red-500"
            )}>
              {service.http_code}
            </span>
          </div>
        </div>

        <p className="mt-2 truncate text-xs text-muted-foreground">
          {service.message}
        </p>
      </CardContent>
    </Card>
  );
}
