export type ServiceType = "vclaim" | "antrol";
export type ServiceStatus = "online" | "slow" | "offline";

export interface BpjsEndpoint {
  key: string;
  label: string;
  type: ServiceType;
  endpoint: string;
}

export interface ServiceResult {
  key: string;
  label: string;
  type: ServiceType;
  status: ServiceStatus;
  is_valid: boolean;
  message: string;
  error_code: string | null;
  response_time: number;
  http_code: number;
  timestamp: string;
}

export interface MonitoringSummary {
  total: number;
  online: number;
  slow: number;
  offline: number;
  success_rate: number;
  avg_response: number;
}

export interface MonitoringUpdate {
  summary: MonitoringSummary;
  services: ServiceResult[];
  timestamp: string;
}

export interface LogEntry {
  id: string;
  ts: string;
  endpoint: string;
  mode: ServiceType;
  status: "success" | "slow" | "error";
  response_time: number;
  http_code: number;
  message: string;
  label?: string;
}

export interface ChartDataPoint {
  time: string;
  [key: string]: number | string;
}

export interface MonitoringState {
  isConnected: boolean;
  isRunning: boolean;
  interval: number;
  useCdn: boolean;
  countdown: number;
  services: Record<string, ServiceResult>;
  summary: MonitoringSummary | null;
  logs: LogEntry[];
  chartHistory: ChartDataPoint[];
  lastUpdate: string | null;
  totals: { requests: number; success: number };
  setConnected: (connected: boolean) => void;
  setRunning: (running: boolean) => void;
  setInterval: (interval: number) => void;
  setUseCdn: (useCdn: boolean) => void;
  setCountdown: (countdown: number) => void;
  addUpdate: (update: MonitoringUpdate) => void;
}
