import { WebSocketServer, WebSocket } from "ws";
import type { MonitoringUpdate } from "@/types/monitoring";

export interface WsMessage {
  event: string;
  data?: Record<string, unknown>;
}

let wssInstance: WebSocketServer | null = null;
let messageHandler: ((msg: WsMessage) => void) | null = null;

export function setupWebSocket(
  wss: WebSocketServer,
  onMessage?: (msg: WsMessage) => void
) {
  wssInstance = wss;
  messageHandler = onMessage ?? null;

  wss.on("connection", (ws: WebSocket) => {
    console.log("[WS] Client connected. Total:", wss.clients.size);

    ws.send(
      JSON.stringify({
        event: "connected",
        data: {
          message: "Connected to BPJS Monitor WebSocket",
          interval: parseInt(process.env.MONITORING_INTERVAL ?? "10", 10),
        },
      })
    );

    ws.on("message", (data) => {
      if (!messageHandler) return;
      try {
        const msg = JSON.parse(data.toString());
        messageHandler(msg);
      } catch {
        // ignore parse errors
      }
    });

    ws.on("close", () => {
      console.log("[WS] Client disconnected. Total:", wss.clients.size);
    });

    ws.on("error", (err) => {
      console.error("[WS] Error:", err.message);
    });
  });
}

export function broadcast(update: MonitoringUpdate) {
  if (!wssInstance) return;

  const message = JSON.stringify({
    event: "update",
    data: update,
  });

  wssInstance.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export function getWss(): WebSocketServer | null {
  return wssInstance;
}
