"use client";

import { Activity, Wifi, WifiOff, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HeaderProps {
  isConnected: boolean;
  isRunning: boolean;
  lastUpdate: string | null;
  countdown: number;
  interval: number;
}

export function Header({ isConnected, isRunning, lastUpdate, countdown, interval }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <div className="flex items-center gap-3">
        <h1 className="font-heading text-lg font-semibold">Dashboard</h1>
        <Badge
          variant={isRunning ? "default" : "secondary"}
          className="text-xs"
        >
          <Activity className="mr-1 size-3" />
          {isRunning ? "Monitoring" : "Stopped"}
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {isRunning && (
          <div className="flex items-center gap-1.5">
            <Timer className="size-3.5" />
            <span className="text-xs font-mono tabular-nums">
              {countdown}s
            </span>
            <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-1000 ease-linear"
                style={{ width: `${interval > 0 ? (countdown / interval) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {lastUpdate && (
          <span className="text-xs">
            Last: {new Date(lastUpdate).toLocaleTimeString("id-ID")}
          </span>
        )}

        <div
          className={cn(
            "flex items-center gap-1",
            isConnected ? "text-green-500" : "text-red-500"
          )}
        >
          {isConnected ? (
            <Wifi className="size-4" />
          ) : (
            <WifiOff className="size-4" />
          )}
          <span className="text-xs">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>
    </header>
  );
}
