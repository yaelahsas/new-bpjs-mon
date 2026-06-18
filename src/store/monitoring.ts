import { create } from "zustand";
import type {
  MonitoringState,
  MonitoringUpdate,
  ServiceResult,
  LogEntry,
  ChartDataPoint,
} from "@/types/monitoring";
import { format } from "date-fns";

export const useMonitoringStore = create<MonitoringState>((set, get) => ({
  isConnected: false,
  isRunning: false,
  interval: 10,
  useCdn: false,
  countdown: 0,
  services: {},
  summary: null,
  logs: [],
  chartHistory: [],
  lastUpdate: null,
  totals: { requests: 0, success: 0 },

  setConnected: (connected: boolean) => set({ isConnected: connected }),
  setRunning: (running: boolean) => set({ isRunning: running }),
  setInterval: (interval: number) => set({ interval }),
  setUseCdn: (useCdn: boolean) => set({ useCdn }),
  setCountdown: (countdown: number) => set({ countdown }),

  addUpdate: (update: MonitoringUpdate) => {
    const state = get();
    const servicesMap: Record<string, ServiceResult> = {};
    for (const s of update.services) {
      servicesMap[s.key] = s;
    }

    const newLogs: LogEntry[] = update.services.map((s) => ({
      id: `${s.key}-${Date.now()}`,
      ts: update.timestamp,
      endpoint: s.label,
      mode: s.type,
      status: s.status === "online" ? "success" : s.status === "slow" ? "slow" : "error",
      response_time: s.response_time,
      http_code: s.http_code,
      message: s.message,
      label: s.label,
    }));

    const chartPoint: ChartDataPoint = {
      time: format(new Date(update.timestamp), "HH:mm:ss"),
    };
    for (const s of update.services) {
      chartPoint[s.key] = s.response_time;
    }

    const totalRequests = state.totals.requests + update.services.length;
    const totalSuccess =
      state.totals.success + update.services.filter((s) => s.is_valid).length;

    set({
      services: servicesMap,
      summary: update.summary,
      logs: [...newLogs, ...state.logs].slice(0, 200),
      chartHistory: [...state.chartHistory, chartPoint].slice(-30),
      lastUpdate: update.timestamp,
      totals: { requests: totalRequests, success: totalSuccess },
      countdown: state.interval,
    });
  },
}));
