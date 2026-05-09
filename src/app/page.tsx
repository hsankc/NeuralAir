"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useLanguage, tx } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";
import {
  Zap,
  Map,
  Gamepad2,
  Brain,
  ShoppingCart,
  ChevronRight,
  ArrowRight,
  Radio,
  Shield,
  Cpu,
  Menu,
  X,
  Package,
  Tractor,
  Flame,
  Eye,
  Server,
  Activity,
  BatteryCharging,
  Network,
  Lock,
  Box
} from "lucide-react";

const WalletConnect = dynamic(() => import("@/components/WalletConnect"), { ssr: false });

/* ─────────── HEADER ─────────── */
function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { locale, toggle } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/[0.05]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center shadow-md overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#14F195]/20 to-[#9945FF]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Cpu className="w-5 h-5 text-[#EDEDED] relative z-10" />
            </div>
            <span className="text-xl font-bold text-[#EDEDED] tracking-tight">
              NeuralAir
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 bg-white/[0.03] px-6 py-2.5 rounded-full border border-white/[0.05] backdrop-blur-md">
            <a href="#nasil-calisir" className="text-sm font-medium text-[#A1A1AA] hover:text-[#14F195] transition-colors">{tx(t.nav.architecture, locale)}</a>
            <a href="#donanim" className="text-sm font-medium text-[#A1A1AA] hover:text-[#14F195] transition-colors">{tx(t.nav.hardware, locale)}</a>
            <a href="#filo" className="text-sm font-medium text-[#A1A1AA] hover:text-[#14F195] transition-colors">{tx(t.nav.fleet, locale)}</a>
            <a href="#moduller" className="text-sm font-medium text-[#A1A1AA] hover:text-[#14F195] transition-colors">{tx(t.nav.modules, locale)}</a>
          </nav>

          <div className="flex items-center gap-4">
            {/* ── Language Toggle ── */}
            <button
              onClick={toggle}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs font-bold tracking-wider hover:bg-white/[0.1] transition-all"
            >
              <span className={locale === "tr" ? "text-[#14F195]" : "text-[#A1A1AA]"}>TR</span>
              <span className="text-[#52525B]">|</span>
              <span className={locale === "en" ? "text-[#14F195]" : "text-[#A1A1AA]"}>EN</span>
            </button>

            <div className="hidden sm:block">
              <WalletConnect />
            </div>
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#14F195] to-[#0DD175] text-[#050505] px-5 py-2.5 rounded-xl font-bold hover:brightness-110 transition-all shadow-[0_0_20px_rgba(20,241,149,0.2)]"
            >
              {tx(t.nav.launchPanel, locale)} <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="lg:hidden p-2 text-[#A1A1AA]" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-[#0F1523] border-b border-white/[0.05] px-4 py-4 space-y-2 backdrop-blur-2xl">
          <a href="#nasil-calisir" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-[#EDEDED] font-medium bg-white/[0.03] rounded-lg">{tx(t.nav.architecture, locale)}</a>
          <a href="#donanim" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-[#EDEDED] font-medium bg-white/[0.03] rounded-lg">{tx(t.nav.hardware, locale)}</a>
          <a href="#filo" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-[#EDEDED] font-medium bg-white/[0.03] rounded-lg">{tx(t.nav.fleet, locale)}</a>
          <a href="#moduller" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-[#EDEDED] font-medium bg-white/[0.03] rounded-lg">{tx(t.nav.modules, locale)}</a>
          <Link href="/dashboard" className="block px-4 py-3 text-[#14F195] font-bold bg-[#14F195]/10 rounded-lg text-center mt-4">{tx(t.nav.launchPanel, locale)}</Link>
        </div>
      )}
    </header>
  );
}

/* ─────────── HERO ─────────── */
function Hero() {
  const { locale } = useLanguage();
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-screen">
      <div className="absolute inset-0 bg-[#0B0F19] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#111A30] via-[#0B0F19] to-[#080B14]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#14F195]/[0.05] rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-[#60A5FA]/[0.08] rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#14F195]/20 bg-[#14F195]/10 backdrop-blur-md shadow-[0_0_15px_rgba(20,241,149,0.15)] mb-8">
          <Radio className="w-4 h-4 text-[#14F195] animate-pulse" />
          <span className="text-xs font-bold text-[#14F195] uppercase tracking-wider">{tx(t.hero.badge, locale)}</span>
        </div>
        
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1] text-white">
          {tx(t.hero.titleLine1, locale)} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14F195] via-[#0DD175] to-[#9945FF]">
            {tx(t.hero.titleLine2, locale)}
          </span>
        </h1>
        
        <p className="mt-6 text-lg md:text-xl text-[#A1A1AA] max-w-3xl mx-auto leading-relaxed mb-12 font-medium">
          {tx(t.hero.subtitle, locale)}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
          <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#14F195] to-[#0DD175] text-[#050505] rounded-xl font-bold text-lg hover:brightness-110 transition-all shadow-[0_0_30px_rgba(20,241,149,0.3)] flex items-center justify-center gap-2 group">
            {tx(t.hero.cta, locale)} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#nasil-calisir" className="w-full sm:w-auto px-8 py-4 bg-white/[0.05] border border-white/[0.1] text-white rounded-xl font-bold text-lg hover:bg-white/[0.1] backdrop-blur-md transition-all flex items-center justify-center">
            {tx(t.hero.howItWorks, locale)}
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─────────── ARCHITECTURE ─────────── */
function Architecture() {
  const { locale } = useLanguage();
  const steps = t.arch.steps.map((s, i) => ({
    icon: [ShoppingCart, Brain, Activity, Lock][i],
    title: tx(s.title, locale),
    desc: tx(s.desc, locale),
  }));

  return (
    <section id="nasil-calisir" className="py-24 bg-[#0F1523] relative border-t border-white/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">{tx(t.arch.title, locale)}</h2>
          <p className="text-[#A1A1AA] max-w-2xl mx-auto text-lg">{tx(t.arch.subtitle, locale)}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <div className="hidden lg:block absolute top-[3.5rem] left-[12%] right-[12%] h-[1px] bg-gradient-to-r from-transparent via-white/[0.2] to-transparent -z-0" />
          {steps.map((step, i) => (
            <div key={i} className="relative bg-white/[0.02] border border-white/[0.05] p-8 rounded-2xl backdrop-blur-xl hover:bg-white/[0.04] hover:border-white/[0.1] transition-all z-10 group">
              <div className="w-16 h-16 bg-[#151B2E] border border-white/[0.08] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-[#14F195]/50 transition-all shadow-inner">
                <step.icon className="w-8 h-8 text-[#14F195]" />
              </div>
              <h3 className="font-bold text-xl text-white mb-3">{step.title}</h3>
              <p className="text-[#71717A] text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── HARDWARE ─────────── */
function Hardware() {
  const { locale } = useLanguage();
  return (
    <section id="donanim" className="py-24 bg-[#0B0F19] relative border-t border-white/[0.02] overflow-hidden">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#60A5FA]/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#60A5FA]/10 border border-[#60A5FA]/20 text-[#60A5FA] text-xs font-bold uppercase tracking-wider mb-6">
              <Cpu className="w-4 h-4" /> {tx(t.hw.badge, locale)}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              {tx(t.hw.titleLine1, locale)} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] to-[#9945FF]">{tx(t.hw.titleLine2, locale)}</span>
            </h2>
            <p className="text-[#A1A1AA] text-lg mb-10 leading-relaxed">
              {tx(t.hw.subtitle, locale)}
            </p>

            <div className="space-y-6">
              <div className="flex gap-5 p-4 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-white/[0.05] transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[#60A5FA]/10 border border-[#60A5FA]/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(96,165,250,0.15)]">
                  <Box className="w-6 h-6 text-[#60A5FA]" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">Pixhawk 4 / Cube Orange</h4>
                  <p className="text-[#71717A] text-sm mt-1.5 leading-relaxed">{tx(t.hw.pixhawk.desc, locale)}</p>
                </div>
              </div>
              <div className="flex gap-5 p-4 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-white/[0.05] transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[#14F195]/10 border border-[#14F195]/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(20,241,149,0.15)]">
                  <Brain className="w-6 h-6 text-[#14F195]" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">NVIDIA Jetson Nano</h4>
                  <p className="text-[#71717A] text-sm mt-1.5 leading-relaxed">{tx(t.hw.jetson.desc, locale)}</p>
                </div>
              </div>
              <div className="flex gap-5 p-4 rounded-xl hover:bg-white/[0.02] border border-transparent hover:border-white/[0.05] transition-colors">
                <div className="w-12 h-12 rounded-xl bg-[#9945FF]/10 border border-[#9945FF]/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(153,69,255,0.15)]">
                  <Network className="w-6 h-6 text-[#9945FF]" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">4G LTE & Solana RPC</h4>
                  <p className="text-[#71717A] text-sm mt-1.5 leading-relaxed">{tx(t.hw.lte.desc, locale)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square bg-[#0F1523] rounded-[2rem] overflow-hidden border border-white/[0.05] shadow-2xl relative flex items-center justify-center p-8 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:24px_24px]">
               {/* Abstraction of a hardware stack with glassmorphism */}
               <div className="w-full max-w-sm space-y-5">
                 <div className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-2xl border border-white/[0.08] shadow-2xl">
                   <div className="flex items-center justify-between mb-4">
                     <span className="font-bold text-white">Jetson Nano (AI Edge)</span>
                     <span className="text-[10px] bg-[#14F195]/20 text-[#14F195] border border-[#14F195]/30 px-2.5 py-1 rounded-full font-bold uppercase">{tx(t.hw.active, locale)}</span>
                   </div>
                   <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-[#14F195] to-[#0DD175] w-3/4 animate-pulse shadow-[0_0_10px_#14F195]" />
                   </div>
                   <div className="text-xs text-[#71717A] mt-3 font-mono">Vision Processing: 34fps</div>
                 </div>

                 <div className="bg-[#151B2E] p-6 rounded-2xl border border-white/[0.05] shadow-2xl">
                   <div className="flex items-center justify-between mb-4">
                     <span className="font-bold text-white">Pixhawk Cube</span>
                     <span className="text-[10px] bg-[#60A5FA]/10 text-[#60A5FA] border border-[#60A5FA]/20 px-2.5 py-1 rounded-full font-bold uppercase">MAVLink</span>
                   </div>
                   <div className="flex justify-between text-[11px] text-[#A1A1AA] font-mono bg-white/[0.02] p-3 rounded-lg">
                     <span>P: +2.4°</span>
                     <span>R: -0.1°</span>
                     <span className="text-[#14F195]">Y: 145°</span>
                   </div>
                 </div>

                 <div className="bg-white/[0.02] backdrop-blur-md p-6 rounded-2xl border border-white/[0.05] shadow-2xl flex items-center justify-between">
                   <div className="flex flex-col">
                     <span className="font-bold text-white mb-1">Telemetri Linki</span>
                     <span className="text-[10px] text-[#71717A] font-mono">POST /api/telemetry (42ms)</span>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-[#9945FF]/10 border border-[#9945FF]/30 flex items-center justify-center">
                     <Radio className="w-4 h-4 text-[#9945FF] animate-ping" />
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── DRONE FLEET ─────────── */
function Fleet() {
  const { locale } = useLanguage();
  const fleet = [
    { id:"cargo", name:tx(t.fleet.cargo.name,locale), icon:Package, color:"text-[#60A5FA]", bg:"bg-[#60A5FA]/10", border:"border-[#60A5FA]/20", hover:"hover:border-[#60A5FA]/50 hover:shadow-[0_0_30px_rgba(96,165,250,0.1)]", specs:"5kg • 15km", desc:tx(t.fleet.cargo.desc,locale) },
    { id:"agri", name:tx(t.fleet.agri.name,locale), icon:Tractor, color:"text-[#14F195]", bg:"bg-[#14F195]/10", border:"border-[#14F195]/20", hover:"hover:border-[#14F195]/50 hover:shadow-[0_0_30px_rgba(20,241,149,0.1)]", specs:"20L Tank • RTK GPS", desc:tx(t.fleet.agri.desc,locale) },
    { id:"fire", name:tx(t.fleet.fire.name,locale), icon:Flame, color:"text-[#FF4D6A]", bg:"bg-[#FF4D6A]/10", border:"border-[#FF4D6A]/20", hover:"hover:border-[#FF4D6A]/50 hover:shadow-[0_0_30px_rgba(255,77,106,0.1)]", specs:"Thermal • 120km/h", desc:tx(t.fleet.fire.desc,locale) },
    { id:"traffic", name:tx(t.fleet.traffic.name,locale), icon:Eye, color:"text-[#FBBF24]", bg:"bg-[#FBBF24]/10", border:"border-[#FBBF24]/20", hover:"hover:border-[#FBBF24]/50 hover:shadow-[0_0_30px_rgba(251,191,36,0.1)]", specs:"100x Zoom • 24/7", desc:tx(t.fleet.traffic.desc,locale) },
  ];

  return (
    <section id="filo" className="py-24 bg-[#0F1523] border-t border-white/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">{tx(t.fleet.title, locale)}</h2>
          <p className="text-[#A1A1AA] max-w-2xl mx-auto text-lg">
            {tx(t.fleet.subtitle, locale)}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {fleet.map((d) => (
            <div key={d.id} className={`bg-[#151B2E] rounded-2xl p-8 border ${d.border} ${d.hover} transition-all duration-300 group`}>
              <div className={`w-14 h-14 ${d.bg} rounded-xl border ${d.border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <d.icon className={`w-7 h-7 ${d.color}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{d.name}</h3>
              <div className={`text-[10px] font-bold uppercase tracking-wider ${d.color} ${d.bg} border ${d.border} inline-block px-3 py-1 rounded-md mb-4`}>
                {d.specs}
              </div>
              <p className="text-[#71717A] text-sm leading-relaxed">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── MODULES ─────────── */
function Modules() {
  const { locale } = useLanguage();
  const modules = [
    { title:tx(t.modules.dashboard.title,locale), icon:Activity, desc:tx(t.modules.dashboard.desc,locale), link:"/dashboard", color:"group-hover:text-[#14F195]" },
    { title:tx(t.modules.marketplace.title,locale), icon:ShoppingCart, desc:tx(t.modules.marketplace.desc,locale), link:"/marketplace", color:"group-hover:text-[#9945FF]" },
    { title:tx(t.modules.skycharge.title,locale), icon:BatteryCharging, desc:tx(t.modules.skycharge.desc,locale), link:"/sky-charge", color:"group-hover:text-[#FBBF24]" },
    { title:tx(t.modules.fpv.title,locale), icon:Gamepad2, desc:tx(t.modules.fpv.desc,locale), link:"/control", color:"group-hover:text-[#60A5FA]" },
    { title:tx(t.modules.logs.title,locale), icon:Server, desc:tx(t.modules.logs.desc,locale), link:"/flight-logs", color:"group-hover:text-[#14F195]" },
  ];

  return (
    <section id="moduller" className="py-24 bg-[#0B0F19] text-white border-t border-white/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 md:flex md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-black mb-6">{tx(t.modules.title, locale)}</h2>
            <p className="text-[#A1A1AA] text-lg">{tx(t.modules.subtitle, locale)}</p>
          </div>
          <Link href="/dashboard" className="hidden md:inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.1] text-white font-bold px-6 py-3 rounded-xl hover:bg-white/[0.1] backdrop-blur-md transition-colors mt-6 md:mt-0">
            {tx(t.modules.explore, locale)} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((m, i) => (
            <Link key={i} href={m.link} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-8 hover:bg-white/[0.04] hover:border-white/[0.1] backdrop-blur-sm transition-all group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/[0.1] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <m.icon className="w-10 h-10 text-white/[0.6] mb-6 group-hover:scale-110 transition-transform" />
              <h3 className={`text-xl font-bold mb-3 text-white transition-colors ${m.color}`}>{m.title}</h3>
              <p className="text-sm text-[#71717A] leading-relaxed mb-8">{m.desc}</p>
              <div className={`text-xs font-bold text-white/[0.6] flex items-center gap-2 transition-colors ${m.color}`}>
                {tx(t.modules.goTo, locale)} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── FOOTER ─────────── */
function Footer() {
  const { locale } = useLanguage();
  return (
    <footer className="bg-[#0F1523] border-t border-white/[0.05] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-white block text-lg">NeuralAir</span>
            <span className="text-[10px] text-[#A1A1AA] uppercase tracking-widest">SkyAgent Protocol</span>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3">
          {["Solana", "Next.js", "TypeScript", "Tailwind CSS", "Anchor", "MapLibre", "Phantom"].map((tech) => (
            <span key={tech} className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.05] rounded-lg text-xs font-medium text-[#A1A1AA] hover:text-white hover:bg-white/[0.08] transition-colors">
              {tech}
            </span>
          ))}
        </div>

        <div className="text-sm text-[#71717A] font-medium flex items-center gap-2">
          © 2026 {tx(t.footer.openSource, locale)} <span className="text-[#14F195] font-bold">DePIN</span>
        </div>
      </div>
    </footer>
  );
}

/* ─────────── MAIN LAYOUT ─────────── */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#EDEDED] selection:bg-[#14F195]/30 selection:text-white font-sans">
      <Header />
      <main>
        <Hero />
        <Architecture />
        <Hardware />
        <Fleet />
        <Modules />
      </main>
      <Footer />
    </div>
  );
}
