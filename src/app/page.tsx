"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { BrandLogo } from "@/components/BrandLogo";
import {
  ArrowRight,
  ArrowUpRight,
  BatteryCharging,
  ChevronDown,
  Eye,
  FileText,
  Flame,
  Map as MapIcon,
  Menu,
  Package,
  Radio,
  Shield,
  ShoppingCart,
  Siren,
  Sparkles,
  Terminal as TerminalIcon,
  Tractor,
  X,
  Zap,
} from "lucide-react";

const WalletConnect = dynamic(() => import("@/components/WalletConnect"), { ssr: false });

const NAV = [
  { id: "context", label: "Vision" },
  { id: "modules", label: "Modules" },
  { id: "flow", label: "Flow" },
  { id: "fleet", label: "Fleet" },
  { id: "hardware", label: "Hardware" },
  { id: "stack", label: "Stack" },
] as const;

function scrollToId(id: string) {
  const root = document.getElementById("landing-scroll");
  const target = document.getElementById(id);
  if (!root || !target) return;
  root.scrollTo({ top: target.offsetTop, behavior: "smooth" });
}

/* ═══════════════════ ARKA PLAN KATMANI ═══════════════════ */

function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Ana zemin: koyu mor-mavi bir uzay tonu */}
      <div className="absolute inset-0 bg-[#0a0612]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0a1f] via-[#080614] to-[#06080f]" />

      {/* Aurora blob 1 — yeşil */}
      <div
        className="aurora-blob absolute top-[-20%] left-[-15%] h-[60vw] w-[60vw] rounded-full blur-[120px]"
        style={{
          background: "radial-gradient(closest-side, rgba(20,241,149,0.25), transparent 70%)",
        }}
      />
      {/* Aurora blob 2 — mor */}
      <div
        className="aurora-blob-2 absolute top-[10%] right-[-20%] h-[55vw] w-[55vw] rounded-full blur-[140px]"
        style={{
          background: "radial-gradient(closest-side, rgba(167,139,250,0.22), transparent 70%)",
        }}
      />
      {/* Alt aurora */}
      <div
        className="aurora-blob absolute bottom-[-25%] left-[20%] h-[45vw] w-[45vw] rounded-full blur-[120px]"
        style={{
          background: "radial-gradient(closest-side, rgba(34,211,238,0.18), transparent 70%)",
          animationDelay: "-10s",
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 80%)",
        }}
      />

      {/* Dot pattern üstte ince */}
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_50%,transparent_30%,rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
}

/* ═══════════════════ HEADER ═══════════════════ */

function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const root = document.getElementById("landing-scroll");
    if (!root) return;
    const onScroll = () => setScrolled(root.scrollTop > 24);
    root.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => root.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const go = useCallback((id: string) => {
    setOpen(false);
    if (id === "hero") {
      document.getElementById("landing-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      scrollToId(id);
    }
  }, []);

  return (
    <header
      className={`fixed left-1/2 top-4 z-[60] -translate-x-1/2 transition-all duration-500 ${
        scrolled ? "w-[min(960px,calc(100%-2rem))]" : "w-[min(1100px,calc(100%-2rem))]"
      }`}
    >
      <div
        className={`flex h-14 items-center justify-between gap-3 rounded-2xl border px-3 pl-4 transition-all duration-500 ${
          scrolled
            ? "border-white/[0.1] bg-[#0a0612]/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-xl"
            : "border-white/[0.06] bg-white/[0.02] backdrop-blur-md"
        }`}
      >
        <button type="button" onClick={() => go("hero")} className="flex shrink-0 items-center gap-2.5">
          <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <BrandLogo size={32} className="h-full w-full rounded-lg" priority />
          </span>
          <span className="text-[14px] font-semibold tracking-tight text-white">NeuralAir</span>
        </button>

        <nav className="hidden items-center gap-7 md:flex lg:gap-9">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              className="text-[13px] font-medium text-zinc-400 transition-colors hover:text-white"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden max-w-[200px] sm:block [&_button]:max-w-full [&_button]:!truncate [&_button]:!rounded-lg [&_button]:!border-white/10 [&_button]:!bg-white/[0.06] [&_button]:!px-3 [&_button]:!py-1.5 [&_button]:!text-[13px] [&_button]:!text-zinc-100">
            <WalletConnect />
          </div>
          <Link
            href="/dashboard"
            className="hidden h-9 shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-400 px-3.5 text-[13px] font-semibold text-zinc-950 shadow-[0_0_20px_-6px_rgba(52,211,153,0.6)] transition-[filter,transform] hover:brightness-105 sm:inline-flex"
          >
            Console
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-zinc-300 md:hidden"
            aria-expanded={open}
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="mt-2 rounded-2xl border border-white/10 bg-[#0a0612]/95 p-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-zinc-200 hover:bg-white/[0.06]"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-3 space-y-2 border-t border-white/[0.08] pt-3">
            <WalletConnect />
            <Link
              href="/dashboard"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-400 text-[13px] font-semibold text-zinc-950"
              onClick={() => setOpen(false)}
            >
              Open Console
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

/* ═══════════════════ ORTAK BİLEŞENLER ═══════════════════ */

function Section({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`relative min-h-[100dvh] w-full snap-start snap-always ${className}`}
    >
      {children}
    </section>
  );
}

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex w-full justify-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 backdrop-blur-md">
        <span className="font-mono text-[10px] text-emerald-400">{index}</span>
        <span className="h-3 w-px bg-white/15" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-300">{label}</span>
      </div>
    </div>
  );
}

function SpotlightCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} onMouseMove={onMove} className={`spotlight-wrap ${className}`}>
      {children}
    </div>
  );
}

const glassBase =
  "relative rounded-2xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-2xl shadow-[0_24px_80px_-32px_rgba(0,0,0,0.7)]";

/* ═══════════════════ 1 · HERO ═══════════════════ */

function HeroSection() {
  return (
    <Section id="hero" className="flex min-h-[100dvh] flex-col items-center text-center">
      <div className="relative z-[10] mx-auto flex w-full max-w-4xl flex-col items-center px-5 pb-16 pt-[max(7.5rem,calc(env(safe-area-inset-top,0px)+5.5rem))] sm:pb-24 sm:pt-[8.5rem] md:pt-40 lg:pt-44">
        {/* Üst rozet */}
        <div className="landing-in landing-in-d1 group inline-flex cursor-default items-center gap-2 rounded-full border border-emerald-400/25 bg-gradient-to-r from-emerald-500/[0.1] via-emerald-500/[0.06] to-violet-500/[0.08] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/95 shadow-[0_0_28px_-8px_rgba(52,211,153,0.4)]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300" />
          </span>
          Solana DePIN · DAAN Protocol
        </div>

        {/* Ana başlık */}
        <h1 className="mt-10 text-balance text-5xl font-black leading-[0.98] tracking-[-0.04em] text-white sm:text-7xl md:text-[5.5rem] md:leading-[0.92] lg:text-[6.25rem]">
          <span className="landing-in landing-in-d2 block">Autonomous Drone Network.</span>
          <span className="landing-in landing-in-d3 mt-2 block">
            On a Single <span className="text-shimmer">Protocol</span>.
          </span>
        </h1>

        {/* Açıklama */}
        <p className="landing-in landing-in-d4 mt-7 max-w-2xl text-balance text-base leading-relaxed text-zinc-400 sm:text-lg">
          NeuralAir unifies AI dispatch, DePIN charging pods and an open mission marketplace
          <span className="text-zinc-300"> on Solana </span>
          into a single coordination layer.
        </p>

        {/* CTA'lar */}
        <div className="landing-in landing-in-d5 mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-400 via-emerald-400 to-teal-400 px-7 text-sm font-semibold text-zinc-950 shadow-[0_0_30px_-6px_rgba(52,211,153,0.55)] transition-[filter,transform] hover:brightness-105 active:scale-[0.99]"
          >
            <span className="relative">Open Live Demo</span>
            <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            {/* shine */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Link>

          <button
            type="button"
            onClick={() => scrollToId("context")}
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-7 text-sm font-medium text-zinc-100 backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/[0.06]"
          >
            Learn More
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* Mini stats */}
        <div className="landing-in landing-in-d6 mx-auto mt-20 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { v: "<400ms", k: "ON-CHAIN LATENCY", s: "Telemetry target" },
            { v: "Devnet", k: "NETWORK", s: "Connect with Phantom" },
            { v: "7", k: "DRONE CATEGORIES", s: "Cargo · Agriculture · Firefighting…" },
          ].map((row, i) => (
            <SpotlightCard key={row.k} className={`${glassBase} p-5 text-left ${i === 1 ? "border-beam" : ""}`}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{row.k}</p>
              <p className="mt-2 font-mono text-2xl font-medium tabular-nums text-white">{row.v}</p>
              <p className="mt-1 text-xs text-zinc-500">{row.s}</p>
            </SpotlightCard>
          ))}
        </div>

        {/* Scroll hint */}
        <button
          type="button"
          onClick={() => scrollToId("context")}
          className="landing-in landing-in-d6 mt-14 flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-zinc-600 transition-colors hover:text-zinc-300"
        >
          Scroll Down
          <ChevronDown className="h-3.5 w-3.5 animate-bounce" />
        </button>
      </div>
    </Section>
  );
}

/* ═══════════════════ 2 · VİZYON ═══════════════════ */

function ContextSection() {
  const rows = [
    { now: "Single provider, closed market", next: "Open mission market, anyone can post" },
    { now: "Centralized charging infrastructure (insufficient)", next: "Sky-Charge DePIN: distributed pods, passive yield" },
    { now: "Manual dispatch, delayed payouts", next: "AI dispatcher + Solana settles in sub-second" },
  ];

  return (
    <Section id="context" className="flex flex-col items-center justify-center">
      <div className="relative z-[1] mx-auto w-full max-w-5xl px-5 py-24 text-center sm:py-28">
        <SectionLabel index="01" label="Vision" />
        <h2 className="mx-auto mt-8 max-w-4xl text-balance text-center text-4xl font-black leading-[1] tracking-[-0.035em] text-white sm:text-5xl md:text-[3.75rem] md:leading-[1]">
          The drone economy is ready for a <span className="text-shimmer">decentralized</span> coordination layer.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-zinc-400 sm:text-lg">
          Current fleet platforms are limited by closed APIs, manual dispatch and centralized payment rails.
          NeuralAir flips that loop.
        </p>

        <div className="mx-auto mt-16 flex max-w-4xl flex-col items-center gap-12 text-center text-sm sm:flex-row sm:items-start sm:gap-16 sm:text-left">
          {/* Bugün */}
          <div className="min-w-0 w-full max-w-md flex-1">
            <div className="mb-6 flex items-center justify-center gap-2.5 sm:justify-start">
              <span className="h-2 w-2 rounded-full bg-zinc-500" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500">Today</span>
            </div>
            <ul className="mx-auto space-y-5 max-sm:max-w-sm sm:mx-0">
              {rows.map((r, i) => (
                <li key={i} className="flex justify-center gap-3 text-[15px] leading-relaxed text-zinc-500 sm:justify-start">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-sm bg-zinc-700" />
                  <span>{r.now}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* NeuralAir */}
          <div className="min-w-0 w-full max-w-md flex-1">
            <div className="mb-6 flex items-center justify-center gap-2.5 sm:justify-start">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                NeuralAir
              </span>
            </div>
            <ul className="mx-auto space-y-5 max-sm:max-w-sm sm:mx-0">
              {rows.map((r, i) => (
                <li key={i} className="flex justify-center gap-3 text-[15px] leading-relaxed text-zinc-200 sm:justify-start">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-sm bg-emerald-400" />
                  <span>{r.next}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mx-auto mt-16 max-w-2xl text-balance text-sm text-zinc-500 sm:text-base">
          The full mission → payment → flight → charge loop runs under a single protocol,
          <span className="text-emerald-300"> on-chain and transparent</span>.
        </p>
      </div>
    </Section>
  );
}

/* ═══════════════════ 3 · MODÜLLER ═══════════════════ */

function ModulesSection() {
  const modules = [
    {
      tag: "fleet/map",
      title: "SkyMap",
      desc: "Real-time fleet telemetry on MapLibre GL; route and mission geometry layers.",
      href: "/dashboard",
      icon: MapIcon,
    },
    {
      tag: "marketplace",
      title: "Mission Market",
      desc: "On-chain escrow listings with a wallet-signed acceptance flow.",
      href: "/marketplace",
      icon: ShoppingCart,
    },
    {
      tag: "depin/skycharge",
      title: "Sky-Charge",
      desc: "Distributed charging stations; kWh-based $SOL settlement flow.",
      href: "/sky-charge",
      icon: BatteryCharging,
    },
    {
      tag: "ai/dispatcher",
      title: "AI Dispatcher",
      desc: "Parses natural-language commands; OpenAI with a local fallback engine.",
      href: "/dashboard",
      icon: Sparkles,
    },
    {
      tag: "agent/terminal",
      title: "Agent Terminal",
      desc: "Streams Fleet, Charging and Emergency agent decisions live.",
      href: "/dashboard",
      icon: TerminalIcon,
    },
    {
      tag: "control/fpv",
      title: "Manual Control",
      desc: "Remote operator takeover interface with FPV preview.",
      href: "/control",
      icon: Zap,
    },
    {
      tag: "logs/flight",
      title: "Flight Logs",
      desc: "Telemetry summaries and an immutable audit trail.",
      href: "/flight-logs",
      icon: FileText,
    },
  ];

  return (
    <Section id="modules" className="flex flex-col items-center justify-center">
      <div className="relative z-[1] mx-auto w-full max-w-6xl px-5 py-24 text-center sm:py-28">
        <SectionLabel index="02" label="Modules" />
        <h2 className="mx-auto mt-8 max-w-3xl text-balance text-center text-4xl font-black leading-[1] tracking-[-0.035em] text-white sm:text-5xl md:text-[3.5rem]">
          Seven modules, one protocol surface.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-balance text-sm leading-relaxed text-zinc-400 sm:text-base">
          Every card opens a live page. Jump in with a single click.
        </p>

        <div className="mx-auto mt-14 flex max-w-[85rem] flex-wrap justify-center gap-3 text-left">
          {modules.map((m) => (
            <Link
              key={m.tag}
              href={m.href}
              className="group flex w-full min-[420px]:w-[calc(50%-0.375rem)] md:w-[calc(33.333%-0.66rem)] lg:w-[calc(25%-0.5625rem)] lg:max-w-[17.5rem]"
            >
              <SpotlightCard
                className={`${glassBase} flex h-full min-h-[150px] w-full flex-col p-5 transition-[border-color,background-color] hover:border-white/15 hover:bg-white/[0.035]`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-emerald-400/15 to-violet-500/[0.08]">
                    <m.icon className="h-4 w-4 text-emerald-300" strokeWidth={1.7} />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-emerald-300" />
                </div>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-emerald-400/80">
                  {m.tag}
                </p>
                <h3 className="mt-1 text-[15px] font-semibold tracking-tight text-white">{m.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-zinc-500">{m.desc}</p>
              </SpotlightCard>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════ 4 · AKIŞ ═══════════════════ */

function FlowSection() {
  const flows = [
    {
      letter: "A",
      title: "Mission Lifecycle",
      tag: "Primary Flow",
      tone: "from-emerald-400/30 to-emerald-500/5 text-emerald-300 border-emerald-400/30",
      steps: [
        { t: "Mission Posted", d: "Type, payment and target coordinates are defined on the market." },
        { t: "Wallet Connected", d: "Phantom connects to Devnet; escrow payment is locked." },
        { t: "Dispatcher Matches", d: "FleetAgent assigns a drone based on battery, location and sensors." },
        { t: "Operation Tracked", d: "Payment auto-releases when the mission completes." },
      ],
    },
    {
      letter: "B",
      title: "Sky-Charge DePIN",
      tag: "Charging Economy",
      tone: "from-violet-400/30 to-violet-500/5 text-violet-300 border-violet-400/30",
      steps: [
        { t: "Pod Deployed", d: "An operator deploys a charging pod and connects their wallet." },
        { t: "Drone Approaches", d: "ChargingAgent routes to the nearest available pod." },
        { t: "Charging Begins", d: "Pod opens a session and begins kWh metering." },
        { t: "Micropayment", d: "$SOL auto-settles when charging completes." },
      ],
    },
    {
      letter: "C",
      title: "Manual Control",
      tag: "Operator Flow",
      tone: "from-cyan-400/30 to-cyan-500/5 text-cyan-300 border-cyan-400/30",
      steps: [
        { t: "Operator Connects", d: "An authorized user picks a drone from /control." },
        { t: "Autonomy Disabled", d: "FleetAgent hands decision authority to the operator." },
        { t: "Live Telemetry", d: "FPV camera and telemetry stream with low latency." },
        { t: "Handover Back", d: "Operation ends; the drone returns to autonomous mode." },
      ],
    },
  ];

  return (
    <Section id="flow" className="flex flex-col items-center justify-center">
      <div className="relative z-[1] mx-auto w-full max-w-6xl px-5 py-24 text-center sm:py-28">
        <SectionLabel index="03" label="Flow" />
        <h2 className="mx-auto mt-8 max-w-3xl text-balance text-center text-4xl font-black leading-[1] tracking-[-0.035em] text-white sm:text-5xl md:text-[3.5rem]">
          Three parallel flows, <span className="text-shimmer">one coordination</span> layer.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-center text-sm leading-relaxed text-zinc-400 sm:text-base">
          The system runs the mission loop, charging economy and manual takeover in parallel.
        </p>

        <div className="mx-auto mt-14 grid max-w-5xl gap-3 text-center md:grid-cols-3 md:text-left">
          {flows.map((f) => (
            <SpotlightCard key={f.letter} className={`${glassBase} flex flex-col p-5 sm:p-6`}>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br font-mono text-base font-semibold ${f.tone}`}
                >
                  {f.letter}
                </span>
                <div className="sm:min-w-0 sm:flex-1 sm:text-left">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{f.tag}</p>
                  <h3 className="text-base font-semibold text-white">{f.title}</h3>
                </div>
              </div>

              <ol className="mx-auto mt-6 max-w-sm space-y-4 text-left sm:mx-0 sm:max-w-none">
                {f.steps.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] font-mono text-[10px] text-zinc-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold text-white">{s.t}</p>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-zinc-500">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════ 5 · FİLO ═══════════════════ */

function FleetSection() {
  const fleet = [
    { cat: "Cargo", icon: Package, hw: "DJI FlyCart 30", spec: "30 kg payload · 16 km" },
    { cat: "Agriculture", icon: Tractor, hw: "DJI Agras T50", spec: "50 L tank · RTK GPS" },
    { cat: "Firefighting", icon: Flame, hw: "DJI Matrice 350 RTK + H30T", spec: "Thermal · 55 min" },
    { cat: "Traffic", icon: Eye, hw: "Autel EVO Max 4T", spec: "160x zoom · 42 min" },
    { cat: "Surveillance", icon: Radio, hw: "Skydio X10", spec: "AI target tracking · 5 km" },
    { cat: "Security", icon: Shield, hw: "Parrot ANAFI USA", spec: "Thermal + 32x · NDAA" },
    { cat: "Search & Rescue", icon: Siren, hw: "DJI Matrice 30T", spec: "Thermal · IP55 · 10 km" },
  ];

  return (
    <Section id="fleet" className="flex flex-col items-center justify-center">
      <div className="relative z-[1] mx-auto w-full max-w-6xl px-5 py-24 text-center sm:py-28">
        <SectionLabel index="04" label="Fleet" />
        <h2 className="mx-auto mt-8 max-w-3xl text-balance text-center text-4xl font-black leading-[1] tracking-[-0.035em] text-white sm:text-5xl md:text-[3.5rem]">
          Seven categories, field-ready hardware.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-balance text-sm leading-relaxed text-zinc-400 sm:text-base">
          Brands are reference suggestions. NeuralAir works with any <span className="text-zinc-300">MAVLink</span>-compatible airframe.
        </p>

        <div className="mx-auto mt-14 flex max-w-[85rem] flex-wrap justify-center gap-3 text-left">
          {fleet.map((d) => (
            <SpotlightCard
              key={d.cat}
              className={`${glassBase} flex w-full min-[420px]:w-[calc(50%-0.375rem)] flex-col p-4 transition-colors hover:border-white/15 sm:p-5 md:w-[calc(33.333%-0.66rem)] lg:w-[calc(25%-0.5625rem)] lg:max-w-[17.5rem]`}
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-emerald-400/15 to-violet-500/[0.08]">
                  <d.icon className="h-4 w-4 text-emerald-300" strokeWidth={1.6} />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
                  {d.cat}
                </span>
              </div>
              <h3 className="mt-4 text-[14px] font-semibold tracking-tight text-white">{d.hw}</h3>
              <p className="mt-1 font-mono text-[10.5px] text-emerald-300/85">{d.spec}</p>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════ 6 · DONANIM ═══════════════════ */

function HardwareSection() {
  const stack = [
    { label: "Flight Controller", value: "Pixhawk 4 / CubePilot", note: "Fleet command over MAVLink" },
    { label: "Edge AI", value: "NVIDIA Jetson Orin Nano", note: "Obstacle detection and computer vision" },
    { label: "Connectivity", value: "4G/5G + WireGuard", note: "Uninterrupted Solana RPC access" },
    { label: "Sensors", value: "RTK GPS · Thermal · ADS-B", note: "±2 cm positioning, airspace awareness" },
    { label: "Identity", value: "Ed25519 keystore", note: "Drone-signed proof-of-flight" },
  ];

  return (
    <Section id="hardware" className="flex flex-col items-center justify-center">
      <div className="relative z-[1] mx-auto w-full max-w-6xl px-5 py-24 text-center sm:py-28">
        <div className="mb-10">
          <SectionLabel index="05" label="Hardware" />
        </div>
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-12 lg:flex-row lg:justify-center lg:gap-14 xl:gap-20">
          <div className="w-full max-w-xl shrink-0 text-center">
            <h2 className="text-balance text-4xl font-black leading-[1] tracking-[-0.035em] text-white sm:text-5xl md:text-[3.25rem]">
              Edge architecture <span className="text-shimmer">open</span> to industry-standard hardware.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              NeuralAir is built to talk directly to known flight controllers and edge AI modules.
              An open hardware guide ({" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-emerald-300">HARDWARE.md</code>{" "}
              ) is ready for field integration.
            </p>

            <ul className="mx-auto mt-8 max-w-xl divide-y divide-white/[0.06] border-y border-white/[0.06] text-left">
              {stack.map((s) => (
                <li key={s.label} className="flex items-start gap-4 py-4">
                  <span className="mt-2 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      {s.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">{s.value}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{s.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Diyagram */}
          <SpotlightCard className={`${glassBase} border-beam relative aspect-[4/5] w-full max-w-sm shrink-0 overflow-hidden p-6 sm:max-w-md sm:p-8`}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_30%,rgba(20,241,149,0.1),transparent)]" />
            <EdgeNodeDiagram />
          </SpotlightCard>
        </div>
      </div>
    </Section>
  );
}

function EdgeNodeDiagram() {
  return (
    <svg viewBox="0 0 320 400" className="relative h-full w-full" aria-label="NeuralAir Edge Node">
      <g opacity="0.85">
        <ellipse cx="160" cy="60" rx="80" ry="6" fill="rgba(255,255,255,0.04)" />
        <line x1="80" y1="60" x2="240" y2="60" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <circle cx="80" cy="60" r="14" fill="rgba(52,211,153,0.06)" stroke="rgba(52,211,153,0.4)" />
        <circle cx="240" cy="60" r="14" fill="rgba(52,211,153,0.06)" stroke="rgba(52,211,153,0.4)" />
        <circle cx="80" cy="60" r="2" fill="rgba(52,211,153,0.9)">
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="240" cy="60" r="2" fill="rgba(52,211,153,0.9)">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>

      <g>
        <rect x="55" y="100" width="210" height="180" rx="10" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" />
        <text x="160" y="122" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.45)" fontFamily="monospace" letterSpacing="2">
          NEURALAIR EDGE NODE
        </text>
        <line x1="65" y1="132" x2="255" y2="132" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

        {[
          { y: 152, label: "Jetson Orin", note: "AI · Vision" },
          { y: 184, label: "Pixhawk Cube", note: "MAVLink FC" },
          { y: 216, label: "4G/5G Modem", note: "Solana RPC" },
          { y: 248, label: "Ed25519", note: "Signed Telemetry" },
        ].map((row) => (
          <g key={row.y}>
            <rect x="70" y={row.y - 10} width="180" height="22" rx="5" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" />
            <circle cx="82" cy={row.y + 1} r="3" fill="rgba(52,211,153,0.8)" />
            <text x="92" y={row.y + 5} fontSize="11" fill="rgba(255,255,255,0.85)" fontFamily="monospace">
              {row.label}
            </text>
            <text x="244" y={row.y + 5} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.4)" fontFamily="monospace">
              {row.note}
            </text>
          </g>
        ))}
      </g>

      <g>
        <line x1="160" y1="280" x2="160" y2="320" stroke="rgba(52,211,153,0.4)" strokeWidth="1" strokeDasharray="3 3">
          <animate attributeName="stroke-dashoffset" values="0;-12" dur="1.2s" repeatCount="indefinite" />
        </line>
        <rect x="100" y="320" width="120" height="40" rx="8" fill="rgba(167,139,250,0.1)" stroke="rgba(167,139,250,0.3)" />
        <text x="160" y="345" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.85)" fontFamily="monospace">
          SOLANA DEVNET
        </text>
      </g>
    </svg>
  );
}

/* ═══════════════════ 7 · TEKNOLOJİ ═══════════════════ */

const TECH_LOGOS = [
  "Next.js 16",
  "React 19",
  "TypeScript 5",
  "Tailwind 4",
  "@solana/web3.js",
  "Phantom",
  "Anchor / Rust",
  "MapLibre GL",
  "Supabase",
  "OpenAI gpt-4o-mini",
  "MAVLink 2",
  "ROS 2",
  "WireGuard",
  "Vercel",
  "GitHub Actions",
];

function StackSection() {
  const groups = [
    {
      title: "Frontend",
      items: ["Next.js 16", "React 19", "TypeScript 5", "Tailwind CSS 4", "Lucide"],
    },
    {
      title: "Web3",
      items: ["@solana/web3.js", "Phantom", "Anchor / Rust", "Ed25519"],
    },
    {
      title: "Maps",
      items: ["MapLibre GL JS", "Leaflet", "Turf.js"],
    },
    {
      title: "Backend",
      items: ["Supabase", "Realtime WS", "Edge Functions"],
    },
    {
      title: "AI & Automation",
      items: ["OpenAI", "Fallback", "FleetAgent", "ChargingAgent", "EmergencyAgent"],
    },
    {
      title: "Hardware",
      items: ["MAVLink 2", "ROS 2", "WireGuard"],
    },
  ];

  return (
    <Section id="stack" className="flex flex-col items-center justify-center">
      <div className="relative z-[1] mx-auto w-full max-w-6xl px-5 py-24 text-center sm:py-28">
        <SectionLabel index="06" label="Stack" />
        <h2 className="mx-auto mt-8 max-w-3xl text-balance text-center text-4xl font-black leading-[1] tracking-[-0.035em] text-white sm:text-5xl md:text-[3.5rem]">
          Modern web stack, on-chain client, hardware bridge.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-balance text-sm leading-relaxed text-zinc-400 sm:text-base">
          A clean, fast frontend; a backend that speaks directly to chain and hardware.
        </p>

        {/* Marquee */}
        <div
          className="marquee-pause relative mx-auto mt-12 w-full overflow-hidden"
          style={
            {
              maskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
              WebkitMaskImage:
                "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
              "--marquee-duration": "32s",
              "--marquee-gap": "1.5rem",
            } as CSSProperties
          }
        >
          <div className="marquee-track">
            {[...TECH_LOGOS, ...TECH_LOGOS].map((logo, i) => (
              <span
                key={`${logo}-${i}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 font-mono text-[12px] font-medium text-zinc-300 backdrop-blur"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
                {logo}
              </span>
            ))}
          </div>
        </div>

        {/* Group list */}
        <div className="mx-auto mt-12 grid max-w-5xl justify-items-center gap-x-10 gap-y-10 text-center sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <div key={g.title} className="w-full max-w-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-400/80">
                {g.title}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {g.items.map((it) => (
                  <span
                    key={it}
                    className="rounded-md border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 font-mono text-[11px] text-zinc-300"
                  >
                    {it}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ═══════════════════ 8 · CTA + FOOTER ═══════════════════ */

function CtaFooterSection() {
  return (
    <Section id="cta" className="flex flex-col items-center justify-center">
      <div className="relative z-[1] mx-auto flex w-full max-w-5xl flex-col items-center px-5 py-24 text-center sm:py-28">
        <SectionLabel index="07" label="Launch" />
        <h2 className="mx-auto mt-8 max-w-4xl text-balance text-center text-5xl font-black leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl md:text-7xl">
          Ready? Jump into the <span className="text-shimmer">console</span>.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-balance text-center text-base leading-relaxed text-zinc-400 sm:text-lg">
          Connect a wallet, post a mission, track the fleet. Every module is live.
        </p>
        <div className="mt-10 flex w-full flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-7 text-sm font-semibold text-zinc-950 shadow-[0_0_30px_-6px_rgba(52,211,153,0.55)] transition-[filter,transform] hover:brightness-105 active:scale-[0.99]"
          >
            <span className="relative">Open Console</span>
            <ArrowRight className="relative h-4 w-4" />
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-7 text-sm font-medium text-zinc-100 backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/[0.06]"
          >
            Open Market
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <footer className="mx-auto mt-20 flex max-w-4xl flex-col items-center justify-between gap-4 border-t border-white/[0.08] pt-8 text-xs text-zinc-500 sm:flex-row sm:gap-8">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 overflow-hidden rounded-md border border-white/10">
              <BrandLogo size={24} className="h-full w-full rounded-md" />
            </span>
            <span className="font-medium text-zinc-300">NeuralAir</span>
            <span className="text-zinc-600">·</span>
            <span>2026</span>
          </div>
          <p className="max-w-md text-center text-[12px] leading-relaxed text-zinc-500">
            Autonomous aviation demo for the Solana ecosystem. Production deployment requires separate processes.
          </p>
          <a
            href="https://github.com/hsankc/NeuralAir"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
          >
            <GithubIcon />
            github.com/hsankc/NeuralAir
          </a>
        </footer>
      </div>
    </Section>
  );
}

/* ═══════════════════ KÜÇÜK SVG ═══════════════════ */

function GithubIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.07c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.34.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18.92-.26 1.9-.39 2.88-.39s1.96.13 2.88.39c2.2-1.49 3.16-1.18 3.16-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.4-5.26 5.69.41.36.78 1.05.78 2.12v3.14c0 .31.21.67.79.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

/* ═══════════════════ ROOT ═══════════════════ */

export default function HomePage() {
  return (
    <div className="fixed inset-0 z-0 text-zinc-200">
      <AuroraBackground />
      <LandingHeader />
      <main
        id="landing-scroll"
        className="h-[100dvh] snap-y snap-mandatory overflow-y-auto overflow-x-hidden scroll-smooth overscroll-y-contain"
      >
        <HeroSection />
        <ContextSection />
        <ModulesSection />
        <FlowSection />
        <FleetSection />
        <HardwareSection />
        <StackSection />
        <CtaFooterSection />
      </main>
    </div>
  );
}
