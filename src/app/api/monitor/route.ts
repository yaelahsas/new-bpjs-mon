import { NextRequest, NextResponse } from "next/server";
import { checkAllServices } from "@/lib/bpjs/client";
import { insertLog } from "@/lib/db";
import { broadcast } from "@/lib/ws-server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const useCdn = body.useCdn ?? false;

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

    return NextResponse.json({ success: true, data: update });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
