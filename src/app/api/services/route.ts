import { NextResponse } from "next/server";
import { getLogs } from "@/lib/db";

export async function GET() {
  // Get the latest log entry for each service
  const logs = getLogs({ limit: 1000 }) as Record<string, unknown>[];

  const latestByService = new Map<string, Record<string, unknown>>();
  for (const log of logs) {
    const key = log.service_key as string;
    if (!latestByService.has(key)) {
      latestByService.set(key, log);
    }
  }

  return NextResponse.json({
    services: Array.from(latestByService.values()),
  });
}
