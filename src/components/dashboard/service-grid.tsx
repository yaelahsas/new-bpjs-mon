"use client";

import { ServiceCard } from "./service-card";
import type { ServiceResult } from "@/types/monitoring";

interface ServiceGridProps {
  services: Record<string, ServiceResult>;
}

export function ServiceGrid({ services }: ServiceGridProps) {
  const serviceList = Object.values(services);

  if (serviceList.length === 0) {
    return (
      <div id="services" className="text-center text-sm text-muted-foreground py-8">
        Waiting for monitoring data...
      </div>
    );
  }

  return (
    <div id="services" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {serviceList.map((s) => (
        <ServiceCard key={s.key} service={s} />
      ))}
    </div>
  );
}
