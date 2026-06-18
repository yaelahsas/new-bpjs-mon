import { NextRequest, NextResponse } from "next/server";
import { getLogs, clearLogs } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const format = searchParams.get("format");
  const service = searchParams.get("service") ?? undefined;
  const start = searchParams.get("start") ?? undefined;
  const end = searchParams.get("end") ?? undefined;
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit")!, 10)
    : undefined;

  const logs = getLogs({ service, start, end, limit });

  if (format === "csv") {
    const headers = [
      "ID",
      "Service",
      "Type",
      "Status",
      "Valid",
      "Response Time",
      "HTTP Code",
      "Message",
      "Timestamp",
    ];
    const rows = (logs as Record<string, unknown>[]).map((l) => [
      l.id,
      l.service_label,
      l.service_type,
      l.status,
      l.is_valid,
      l.response_time,
      l.http_code,
      `"${String(l.message ?? "").replace(/"/g, '""')}"`,
      l.timestamp,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="bpjs-logs-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  if (format === "pdf") {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("BPJS Monitoring Logs", 14, 20);
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleString("id-ID")}`, 14, 28);

    let y = 36;
    doc.setFontSize(7);
    doc.text("Service", 14, y);
    doc.text("Type", 50, y);
    doc.text("Status", 70, y);
    doc.text("Time(ms)", 95, y);
    doc.text("HTTP", 120, y);
    doc.text("Timestamp", 135, y);
    y += 5;

    for (const log of logs as Record<string, unknown>[]) {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(String(log.service_label), 14, y);
      doc.text(String(log.service_type), 50, y);
      doc.text(String(log.status), 70, y);
      doc.text(String(Math.round(log.response_time as number)), 95, y);
      doc.text(String(log.http_code), 120, y);
      doc.text(
        new Date(log.timestamp as string).toLocaleString("id-ID"),
        135,
        y
      );
      y += 4;
    }

    const pdfBuffer = doc.output("arraybuffer");
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="bpjs-logs-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  }

  return NextResponse.json({ logs });
}

export async function DELETE() {
  clearLogs();
  return NextResponse.json({ success: true });
}
