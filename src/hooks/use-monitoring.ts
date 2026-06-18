"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMonitoringStore } from "@/store/monitoring";
import type { MonitoringUpdate } from "@/types/monitoring";

export function useMonitoring() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const {
    isConnected,
    isRunning,
    interval,
    useCdn,
    countdown,
    services,
    summary,
    logs,
    chartHistory,
    lastUpdate,
    totals,
    setConnected,
    setRunning,
    setInterval: setStoreInterval,
    setUseCdn: setStoreCdn,
    setCountdown,
    addUpdate,
  } = useMonitoringStore();

  const sendCommand = useCallback((event: string, data?: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event, data }));
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const isDev = process.env.NODE_ENV === "development";
    const wsHost = isDev
      ? `${window.location.hostname}:3001`
      : window.location.host;
    const wsPath = isDev ? "/" : "/ws";
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${wsHost}${wsPath}`);

    ws.onopen = () => {
      setConnected(true);
      console.log("[WS] Connected");
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === "update") {
          addUpdate(msg.data as MonitoringUpdate);
        } else if (msg.event === "connected") {
          setStoreInterval(msg.data.interval);
        } else if (msg.event === "state") {
          setRunning(msg.data.running);
          setStoreInterval(msg.data.interval);
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, [setConnected, addUpdate, setStoreInterval, setRunning]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  }, [setConnected]);

  const handleSetRunning = useCallback((running: boolean) => {
    setRunning(running);
    sendCommand(running ? "start" : "stop");
    if (running) {
      setCountdown(useMonitoringStore.getState().interval);
    } else {
      setCountdown(0);
    }
  }, [setRunning, sendCommand, setCountdown]);

  const handleSetInterval = useCallback((newInterval: number) => {
    setStoreInterval(newInterval);
    sendCommand("setInterval", { interval: newInterval });
  }, [setStoreInterval, sendCommand]);

  const handleSetCdn = useCallback((cdn: boolean) => {
    setStoreCdn(cdn);
    sendCommand("setCdn", { useCdn: cdn });
  }, [setStoreCdn, sendCommand]);

  const triggerRefresh = useCallback(
    async (cdn?: boolean) => {
      try {
        const res = await fetch("/api/monitor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ useCdn: cdn ?? useCdn }),
        });
        if (!res.ok) throw new Error("Failed to trigger refresh");
      } catch (err) {
        console.error("[Refresh] Error:", err);
      }
    },
    [useCdn]
  );

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  useEffect(() => {
    if (isRunning && isConnected) {
      countdownTimer.current = setInterval(() => {
        const state = useMonitoringStore.getState();
        if (state.countdown > 0) {
          state.setCountdown(state.countdown - 1);
        }
      }, 1000);
    } else {
      if (countdownTimer.current) {
        clearInterval(countdownTimer.current);
        countdownTimer.current = null;
      }
    }
    return () => {
      if (countdownTimer.current) {
        clearInterval(countdownTimer.current);
        countdownTimer.current = null;
      }
    };
  }, [isRunning, isConnected]);

  return {
    isConnected,
    isRunning,
    interval,
    useCdn,
    countdown,
    services,
    summary,
    logs,
    chartHistory,
    lastUpdate,
    totals,
    setRunning: handleSetRunning,
    setUseCdn: handleSetCdn,
    setInterval: handleSetInterval,
    triggerRefresh,
    connect,
    disconnect,
  };
}
