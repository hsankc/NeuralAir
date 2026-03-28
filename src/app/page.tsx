"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
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
} from "lucide-react";

const WalletConnect = dynamic(() => import("@/components/WalletConnect"), { ssr: false });

/* ─────────── HEADER ─────────── */
function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "/dashboard", label: "Gösterge Paneli" },
    { href: "/marketplace", label: "Görev Pazarı" },
    { href: "/sky-charge", label: "Sky-Charge" },
    { href: "/control", label: "Kontrol" },
    { href: "/flight-logs", label: "Uçuş Kayıtları" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-strong shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-[#EDEDED] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-[#050505]" />
              <div className="absolute inset-0 rounded-xl bg-white opacity-20 blur-md group-hover:opacity-40 transition-opacity" />
            </div>
            <span className="text-xl font-bold text-[#EDEDED] tracking-tight">
              NeuralAir
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-accent-cyan transition-colors rounded-lg hover:bg-white/5"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* CTA + Wallet + Mobile toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <WalletConnect />
            </div>
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex btn-primary text-sm !py-2.5 !px-5 rounded-lg"
            >
              <span className="flex items-center gap-2">
                Başlat <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <button
              className="lg:hidden p-2 text-text-secondary hover:text-accent-cyan"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden glass-strong border-t border-border animate-fade-in-up">
          <div className="px-4 py-4 space-y-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block px-4 py-3 text-sm font-medium text-text-secondary hover:text-accent-cyan rounded-lg hover:bg-white/5 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

/* ─────────── HERO SECTION (3D Drone) ─────────── */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-grid">
      {/* Ambient background (obsidian style: very subtle) */}
      <div className="absolute inset-0 bg-[#050505] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#111111] rounded-full blur-[150px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#27272A] bg-[#111111] text-xs font-medium text-[#EDEDED] mb-8 animate-fade-in-up">
          <Radio className="w-3.5 h-3.5" />
          <span>Monad Blokzinciri Üzerinde Çalışıyor</span>
          <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981] animate-pulse" />
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-6 animate-fade-in-up animate-delay-100 text-[#EDEDED]">
          Gökyüzünün Yeni{" "}
          <span className="text-[#A1A1AA]">Protokolü</span>
        </h1>

        <p className="text-lg sm:text-xl text-[#A1A1AA] max-w-2xl mx-auto mb-10 animate-fade-in-up animate-delay-200 leading-relaxed">
          Otonom drone'lar, merkeziyetsiz şarj ağı ve yapay zeka görev dağıtımı.
          <br className="hidden sm:block" />
          <span className="text-[#EDEDED] font-medium">Monad'ın 1 saniye altı finalitesi</span>{" "}
          ile gökyüzünü yönetin.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 animate-fade-in-up animate-delay-300">
          <Link href="/dashboard" className="btn-primary text-lg !py-3.5 !px-8 rounded-xl">
            <span className="flex items-center gap-2">
              Paneli Başlat <ChevronRight className="w-5 h-5" />
            </span>
          </Link>
          <Link href="/marketplace" className="btn-secondary text-lg !py-3.5 !px-8 rounded-xl">
            Görev Pazarını Keşfet
          </Link>
        </div>
      </div>



      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-glow-pulse">
        <span className="text-xs text-text-muted">Keşfet</span>
        <div className="w-5 h-8 rounded-full border border-border flex justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-accent-cyan animate-float" />
        </div>
      </div>
    </section>
  );
}

/* ─────────── STATS BAR ─────────── */
function AnimatedCounter({ target, label }: { target: number; label: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="text-center px-6 py-4">
      <div className="text-3xl sm:text-4xl font-extrabold tabular-nums gradient-text mb-1">
        {count.toLocaleString("tr-TR")}+
      </div>
      <div className="text-sm text-text-secondary">{label}</div>
    </div>
  );
}

function StatsBar() {
  const stats = [
    { target: 156, label: "Aktif Drone" },
    { target: 48, label: "Şarj Podu" },
    { target: 2847, label: "Tamamlanan Görev" },
    { target: 12500, label: "On-Chain İşlem" },
  ];

  return (
    <section className="py-8 border-y border-border bg-bg-secondary/50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <AnimatedCounter key={s.label} target={s.target} label={s.label} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── FEATURES GRID ─────────── */
const features = [
  {
    icon: Zap,
    title: "Sky-Charge DePIN",
    desc: "Pencere kenarı şarj podları ile merkeziyetsiz enerji ağı. Pod sahipleri MON kazanır.",
    color: "text-[#EDEDED]",
    gradient: "from-white/10 to-transparent",
    link: "/sky-charge",
  },
  {
    icon: ShoppingCart,
    title: "Görev Pazarı",
    desc: "Kargo, ziraat, yangın müdahalesi — akıllı kontrat escrowiyle güvenli ödeme.",
    color: "text-[#EDEDED]",
    gradient: "from-white/10 to-transparent",
    link: "/marketplace",
  },
  {
    icon: Map,
    title: "Canlı Gökyüzü Haritası",
    desc: "Tüm drone'ların anlık konum takibi. On-chain uçuş kara kutusu.",
    color: "text-[#EDEDED]",
    gradient: "from-white/10 to-transparent",
    link: "/dashboard",
  },
  {
    icon: Gamepad2,
    title: "Blockchain Kontrol",
    desc: "Web arayüzünden on-chain drone yönlendirme. Monad'ın hızını kanıtla!",
    color: "text-[#EDEDED]",
    gradient: "from-white/10 to-transparent",
    link: "/control",
  },
  {
    icon: Brain,
    title: "AI Dispatcher",
    desc: '\"En yakın dronu gönder\" de, yapay zeka gerisini halleder.',
    color: "text-[#EDEDED]",
    gradient: "from-white/10 to-transparent",
    link: "/dashboard",
  },
];

function FeaturesGrid() {
  return (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-dots pointer-events-none opacity-50" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#EDEDED]">
            Beş Temel <span className="text-[#A1A1AA]">Modül</span>
          </h2>
          <p className="text-[#A1A1AA] max-w-2xl mx-auto">
            Havacılık, blockchain ve yapay zekanın kesiştiği tam entegre bir protokol.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Link
              href={f.link}
              key={f.title}
              className={`glass-card p-6 group cursor-pointer animate-fade-in-up`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
              >
                <f.icon className={`w-7 h-7 ${f.color}`} />
              </div>
              <h3 className="text-lg font-bold mb-2 group-hover:text-accent-cyan transition-colors">
                {f.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs text-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                Keşfet <ChevronRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── HOW IT WORKS ─────────── */
function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Görev Oluştur",
      desc: "Doğal dille veya form ile görev tanımla. AI en uygun dronu seçer.",
    },
    {
      num: "02",
      title: "On-Chain Onay",
      desc: "Monad üzerinde saniyelik escrow kilitleme ve drone atama.",
    },
    {
      num: "03",
      title: "Otonom Uçuş",
      desc: "Drone agent rotayı hesaplar, şarj podlarını planlar, uçuşa geçer.",
    },
    {
      num: "04",
      title: "Teslimat & Ödeme",
      desc: "Görev tamamlanınca escrow serbest kalır. Log zincire yazılır.",
    },
  ];

  return (
    <section className="py-24 px-4 bg-[#0A0A0A] border-y border-[#1A1A1A]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[#EDEDED]">
            Nasıl <span className="text-[#A1A1AA]">Çalışır?</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-6 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-[#27272A]" />

          {steps.map((s, i) => (
            <div key={s.num} className="relative text-center animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
              {/* Number circle */}
              <div className="w-24 h-24 rounded-full border border-[#27272A] bg-[#111111] flex items-center justify-center mx-auto mb-6 relative">
                <span className="text-2xl font-black text-[#EDEDED]">{s.num}</span>
              </div>
              <h3 className="text-lg font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-text-secondary">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── MONAD SHOWCASE ─────────── */
function MonadShowcase() {
  return (
    <section className="py-24 px-4 relative overflow-hidden bg-[#050505]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#111111] rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="glass-card p-8 md:p-12 border border-[#27272A] bg-[#0A0A0A]">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Left - Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#18181A] border border-[#27272A] text-[#EDEDED] text-xs font-medium mb-6">
                <Shield className="w-3.5 h-3.5" />
                Neden Monad?
              </div>
              <h2 className="text-3xl font-bold mb-4 text-[#EDEDED]">
                Havacılıkta her{" "}
                <span className="text-[#34D399]">milisaniye</span>{" "}
                hayattır
              </h2>
              <p className="text-[#A1A1AA] mb-6 leading-relaxed">
                Geleneksel zincirlerde bir drone komutu 15 saniye sürer — drone
                çoktan duvara çarpmıştır. Monad'ın paralel execution mimarisi,
                aynı anda binlerce drone'un on-chain kontrol edilmesini sağlar.
              </p>
              <div className="space-y-3">
                {[
                  "1 saniye altı finality süresi",
                  "10.000+ TPS paralel işlem",
                  "Sürü (Swarm) Multicall desteği",
                  "Değiştirilemez uçuş kara kutusu",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#EDEDED]" />
                    <span className="text-sm text-[#D4D4D8]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Latency comparison terminal */}
            <div className="terminal rounded-xl border border-[#27272A] bg-[#111111]">
              <div className="terminal-header border-b border-[#27272A] bg-[#0A0A0A] p-3 flex px-4">
                <div className="w-3 h-3 rounded-full bg-[#F87171] mr-2" />
                <div className="w-3 h-3 rounded-full bg-[#FBBF24] mr-2" />
                <div className="w-3 h-3 rounded-full bg-[#34D399] mr-2" />
                <span className="text-xs text-[#A1A1AA] ml-2 font-mono">latency_comparison.sh</span>
              </div>
              <div className="terminal-body text-sm space-y-3 p-4 font-mono">
                <div className="text-[#A1A1AA]">$ drone_command --chain ethereum</div>
                <div>
                  <span className="text-[#F87171]">⏱ Finality:</span>{" "}
                  <span className="text-[#EDEDED]">~15.000ms</span>
                </div>
                <div className="text-[#F87171]">✗ Drone: DUVARA_ÇARPTI</div>
                <div className="h-3" />
                <div className="text-[#A1A1AA]">$ drone_command --chain monad</div>
                <div>
                  <span className="text-[#34D399]">⏱ Finality:</span>{" "}
                  <span className="text-[#EDEDED]">~400ms</span>
                </div>
                <div className="text-[#34D399]">✓ Drone: HEDEFTE</div>
                <div className="h-3" />
                <div className="text-[#EDEDED] font-semibold animate-typing-cursor">
                  █ Monad — Gökyüzünün Blokzinciri
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── FOOTER ─────────── */
function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-border">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold gradient-text">NeuralAir</span>
          <span className="text-xs text-text-muted">SkyAgent Protocol v1.0</span>
        </div>
        <div className="text-sm text-text-muted">
          Monad Hackathon 2025 •{" "}
          <span className="text-accent-cyan">Decentralized Autonomous Aviation</span>
        </div>
      </div>
    </footer>
  );
}

/* ─────────── MAIN PAGE ─────────── */
export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <StatsBar />
        <FeaturesGrid />
        <HowItWorks />
        <MonadShowcase />
      </main>
      <Footer />
    </>
  );
}
