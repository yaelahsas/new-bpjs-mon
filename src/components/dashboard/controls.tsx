"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Play, Square, FileSpreadsheet, FileText } from "lucide-react";

interface ControlsProps {
  interval: number;
  useCdn: boolean;
  isRunning: boolean;
  onIntervalChange: (val: number) => void;
  onCdnChange: (val: boolean) => void;
  onRunningChange: (val: boolean) => void;
  onRefresh: () => void;
  onExportExcel: () => void;
  onExportPdf: () => void;
}

export function Controls({
  interval,
  useCdn,
  isRunning,
  onIntervalChange,
  onCdnChange,
  onRunningChange,
  onRefresh,
  onExportExcel,
  onExportPdf,
}: ControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="outline" size="sm" onClick={onRefresh}>
        <RefreshCw className="mr-1 size-3" />
        Refresh
      </Button>

      <Button
        variant={isRunning ? "destructive" : "default"}
        size="sm"
        onClick={() => onRunningChange(!isRunning)}
      >
        {isRunning ? (
          <Square className="mr-1 size-3" />
        ) : (
          <Play className="mr-1 size-3" />
        )}
        {isRunning ? "Stop" : "Start"}
      </Button>

      <Select
        value={String(interval)}
        onValueChange={(v) => onIntervalChange(Number(v))}
      >
        <SelectTrigger size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">5s</SelectItem>
          <SelectItem value="10">10s</SelectItem>
          <SelectItem value="30">30s</SelectItem>
          <SelectItem value="60">60s</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Switch
          checked={useCdn}
          onCheckedChange={onCdnChange}
          size="sm"
        />
        <span className="text-xs text-muted-foreground">CDN</span>
      </div>

      <div className="ml-auto flex gap-2">
        <Button variant="outline" size="sm" onClick={onExportExcel}>
          <FileSpreadsheet className="mr-1 size-3" />
          Excel
        </Button>
        <Button variant="outline" size="sm" onClick={onExportPdf}>
          <FileText className="mr-1 size-3" />
          PDF
        </Button>
      </div>
    </div>
  );
}
