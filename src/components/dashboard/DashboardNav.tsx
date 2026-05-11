"use client";

import Link from "next/link";
import { Activity, Map as MapIcon, Zap, Crosshair, Clock } from "lucide-react";

export function DashboardNav() {
  const links = [
    { href: "/dashboard", label: "Dashboard", icon: Activity, active: true },
    { href: "/marketplace", label: "Marketplace", icon: MapIcon },
    { href: "/sky-charge", label: "Sky-Charge", icon: Zap },
    { href: "/control", label: "Control Panel", icon: Crosshair },
    { href: "/flight-logs", label: "Flight Logs", icon: Clock },
  ];

  return (
    <nav className="space-y-1.5">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            l.active
              ? "bg-accent-cyan/10 text-accent-cyan shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-white/5"
          }`}
        >
          <l.icon className="w-4.5 h-4.5" />
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
