"use client";

import {
  LayoutDashboard,
  Server,
  BarChart3,
  ScrollText,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onLogout: () => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "#metrics" },
  { id: "services", label: "Services", icon: Server, href: "#services" },
  { id: "charts", label: "Charts", icon: BarChart3, href: "#charts" },
  { id: "logs", label: "Logs", icon: ScrollText, href: "#logs" },
];

export function Sidebar({ onLogout }: SidebarProps) {
  const handleNav = (href: string) => {
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          BP
        </div>
        <span className="font-heading text-sm font-semibold">BPJS Monitor</span>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNav(item.href)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </button>
        ))}
      </nav>

      <Separator />

      <div className="flex items-center justify-between p-3">
        <ThemeToggle />
        <Button variant="ghost" size="icon-sm" onClick={onLogout} aria-label="Logout">
          <LogOut className="size-4" />
        </Button>
      </div>
    </aside>
  );
}
