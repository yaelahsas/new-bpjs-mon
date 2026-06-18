import { checkAllServices } from "./bpjs/client";
import { insertLog } from "./db";
import { broadcast } from "./ws-server";

let schedulerTimer: ReturnType<typeof setInterval> | null = null;
let isRunning = false;
let useCdn = false;
let currentInterval = parseInt(process.env.MONITORING_INTERVAL ?? "10", 10);

async function runCheck() {
  if (!isRunning) return;

  try {
    const update = await checkAllServices(useCdn);

    for (const service of update.services) {
      insertLog({
        service_key: service.key,
        service_label: service.label,
        service_type: service.type,
        status: service.status,
        is_valid: service.is_valid,
        message: service.message,
        error_code: service.error_code,
        response_time: service.response_time,
        http_code: service.http_code,
      });
    }

    broadcast(update);
  } catch (err) {
    console.error("[Scheduler] Error during check:", err);
  }
}

export function startScheduler() {
  if (isRunning) return;
  isRunning = true;

  runCheck();
  schedulerTimer = setInterval(runCheck, currentInterval * 1000);

  console.log(`[Scheduler] Started with ${currentInterval}s interval`);
}

export function stopScheduler() {
  isRunning = false;
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
  console.log("[Scheduler] Stopped");
}

export function updateInterval(seconds: number) {
  currentInterval = seconds;
  if (isRunning) {
    if (schedulerTimer) clearInterval(schedulerTimer);
    schedulerTimer = setInterval(runCheck, currentInterval * 1000);
  }
  console.log(`[Scheduler] Interval updated to ${seconds}s`);
}

export function schedulerRunning() {
  return isRunning;
}

export function getInterval() {
  return currentInterval;
}

export function setCdnMode(value: boolean) {
  useCdn = value;
}

export function getCdnMode() {
  return useCdn;
}
