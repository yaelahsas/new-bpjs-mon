import "dotenv/config";
import { createServer } from "http";
import { parse } from "url";
import next from "next";
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

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const wss = new WebSocketServer({ server, path: "/ws" });
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

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
