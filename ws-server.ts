import "dotenv/config";
import { WebSocketServer } from "ws";
import { setupWebSocket, broadcast } from "./src/lib/ws-server";
import {
  startScheduler,
  stopScheduler,
  updateInterval,
  setCdnMode,
  schedulerRunning,
  getInterval,
} from "./src/lib/monitor-scheduler";

const wsPort = parseInt(process.env.WS_PORT ?? "3001", 10);

const wss = new WebSocketServer({ port: wsPort });

setupWebSocket(wss, (msg) => {
  if (msg.event === "start") {
    startScheduler();
    broadcast({ event: "state", data: { running: true, interval: getInterval() } } as any);
  } else if (msg.event === "stop") {
    stopScheduler();
    broadcast({ event: "state", data: { running: false, interval: getInterval() } } as any);
  } else if (msg.event === "setInterval") {
    updateInterval((msg.data as any).interval);
    broadcast({ event: "state", data: { running: schedulerRunning(), interval: getInterval() } } as any);
  } else if (msg.event === "setCdn") {
    setCdnMode((msg.data as any).useCdn);
  }
});

console.log(`> WebSocket server running on ws://localhost:${wsPort}/`);
