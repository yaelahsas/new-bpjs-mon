"use client";

import { useEffect, useState, useCallback } from "react";
import { useMonitoring } from "@/hooks/use-monitoring";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MetricsGrid } from "@/components/dashboard/metrics-grid";
import { ServiceGrid } from "@/components/dashboard/service-grid";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { StatusChart } from "@/components/dashboard/status-chart";
import { ActivityLog } from "@/components/dashboard/activity-log";
import { Controls } from "@/components/dashboard/controls";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const router = useRouter();
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
    setRunning,
    setUseCdn,
    setInterval: setStoreInterval,
    triggerRefresh,
  } = useMonitoring();

  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/login");
  }, [logout, router]);

  const handleExportExcel = useCallback(async () => {
    const res = await fetch("/api/logs?format=csv");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bpjs-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleExportPdf = useCallback(async () => {
    const res = await fetch("/api/logs?format=pdf");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bpjs-logs-${new Date().toISOString().split("T")[0]}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar onLogout={handleLogout} />
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            className="h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar onLogout={handleLogout} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          isConnected={isConnected}
          isRunning={isRunning}
          lastUpdate={lastUpdate}
          countdown={countdown}
          interval={interval}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <Controls
              interval={interval}
              useCdn={useCdn}
              isRunning={isRunning}
              onIntervalChange={setStoreInterval}
              onCdnChange={setUseCdn}
              onRunningChange={setRunning}
              onRefresh={() => triggerRefresh()}
              onExportExcel={handleExportExcel}
              onExportPdf={handleExportPdf}
            />

            <MetricsGrid summary={summary} totals={totals} />

            <ServiceGrid services={services} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <TrendChart data={chartHistory} services={services} />
              </div>
              <StatusChart summary={summary} />
            </div>

            <ActivityLog logs={logs} />
          </div>
        </main>
      </div>
    </div>
  );
}
