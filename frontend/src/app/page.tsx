"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { Sparkles, Activity, Bot, RefreshCw, Lock, Zap, ArrowRight, Play, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

// Flashcard Component
const Flashcard = ({ icon: Icon, title, description, details }: any) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative h-[280px] w-full"
      style={{ perspective: 1000 }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div 
          className="absolute inset-0 bg-surface-container/40 backdrop-blur-md border border-outline-variant/30 rounded-xl p-8 flex flex-col justify-center items-center text-center shadow-[0_0_20px_rgba(0,0,0,0.1)] group hover:border-primary-fixed-dim/40 transition-colors"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="w-16 h-16 rounded-full bg-primary-container/10 border border-primary-fixed-dim/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-8 h-8 text-primary-fixed-dim" />
          </div>
          <h3 className="font-headline-md text-xl text-on-surface mb-2">{title}</h3>
          <p className="text-on-surface-variant text-sm">{description}</p>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,219,231,0.05),rgba(0,0,0,0.4))] backdrop-blur-xl border border-primary-fixed-dim/40 rounded-xl p-8 flex flex-col justify-center text-left shadow-[0_0_30px_rgba(0,219,231,0.15)]"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <h4 className="font-label-caps text-label-caps text-primary-fixed-dim mb-4 tracking-widest uppercase flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> Inside
          </h4>
          <p className="text-on-surface text-sm leading-relaxed mb-6">{details}</p>
          <button className="flex items-center gap-2 text-[10px] font-label-caps tracking-widest text-on-surface-variant hover:text-primary-fixed-dim transition-colors uppercase mt-auto w-fit">
            Get Started <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function LandingPage() {
  const features = [
    {
      icon: Activity,
      title: "Heatmap Tracking",
      description: "Visualizing progress through high-density heatmaps.",
      details: "Track your consistency and concept mastery over time. We aggregate your executions to build a visual roadmap of your exact skill level across 15+ algorithm patterns."
    },
    {
      icon: Bot,
      title: "AI Mentor",
      description: "Real-time AI logic analysis and debugging.",
      details: "Get sub-millisecond hints tailored precisely to the code you've written. The AI acts as a pair-programmer, guiding you to the solution without giving it away."
    },
    {
      icon: RefreshCw,
      title: "Platform Sync",
      description: "Identify similar problems across platforms instantly.",
      details: "Automatically link and ingest your LeetCode and Codeforces accounts. We'll cross-reference your solved history to prevent duplicate work across environments."
    },
    {
      icon: Target,
      title: "Smart Recommendations",
      description: "Algorithmic curriculum generation based on skill gaps.",
      details: "Stop wondering what to solve next. Our engine recommends the exact LeetCode problems that bridge the gap between your current level and peak performance."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased relative overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,242,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Top Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <img
            alt="Mentra Logo"
            className="h-8 w-8 object-cover rounded flex-shrink-0 shadow-[0_0_15px_rgba(0,242,255,0.3)]"
            src="/logo.jpg"
          />
          <span className="font-headline-md text-headline-md text-on-surface tracking-tight font-bold text-xl">
            MENTRA
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-label-caps text-label-caps uppercase text-on-surface-variant text-[11px] tracking-widest">
          <Link href="#features" className="hover:text-primary-fixed-dim transition-colors">Features</Link>
          <button onClick={() => signIn(undefined, { callbackUrl: "/profile" })} className="hover:text-primary-fixed-dim transition-colors uppercase">Login</button>
          <button onClick={() => signIn(undefined, { callbackUrl: "/profile" })} className="hover:text-primary-fixed-dim transition-colors uppercase">Register</button>
        </div>

        <button 
          onClick={() => signIn(undefined, { callbackUrl: "/profile" })} 
          className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded border border-outline-variant/30 text-on-surface hover:border-primary-fixed-dim/50 hover:text-primary-fixed-dim transition-all text-[11px] font-label-caps tracking-widest uppercase bg-surface-container/30 backdrop-blur-md"
        >
          Get Started
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary-fixed-dim to-secondary-container ring-1 ring-primary-fixed-dim/30"></div>
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-24 pb-32 px-6 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-primary-fixed-dim/30 bg-primary-container/10">
          <span className="w-2 h-2 rounded-full bg-primary-fixed-dim animate-pulse shadow-[0_0_8px_#00dbe7]"></span>
          <span className="font-label-caps text-[10px] text-primary-fixed-dim uppercase tracking-widest">SYSTEM ONLINE V2.0.1</span>
        </div>

        <h1 className="font-display-lg text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-primary-fixed-dim/50 tracking-tighter leading-none mb-6 drop-shadow-[0_0_40px_rgba(0,219,231,0.2)]">
          MASTER THE<br />CORE
        </h1>

        <p className="font-body-md text-on-surface-variant text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
          High-performance DSA training driven by smart tracking. Analyze, optimize, and dominate technical assessments.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <button 
            onClick={() => signIn(undefined, { callbackUrl: "/profile" })}
            className="w-full sm:w-auto px-8 py-4 rounded border border-primary-fixed-dim text-primary-fixed-dim hover:bg-primary hover:text-primary-foreground font-label-caps tracking-widest uppercase transition-all shadow-[inset_0_0_15px_rgba(0,219,231,0.15)] flex items-center justify-center gap-2"
          >
            Get Started
          </button>
          <button className="w-full sm:w-auto px-8 py-4 rounded border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-outline-variant font-label-caps tracking-widest uppercase transition-all flex items-center justify-center gap-2 group">
            <Play className="w-4 h-4 text-outline-variant group-hover:text-on-surface transition-colors" />
            View Demo
          </button>
        </div>
      </main>

      {/* Animated Flashcards Features Section */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-12 mb-20">
        <div className="flex items-center gap-4 mb-12">
          <span className="font-label-caps text-[10px] text-primary-fixed-dim uppercase tracking-widest">Platform Features</span>
          <div className="h-px bg-outline-variant/30 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <Flashcard key={idx} {...feature} />
          ))}
        </div>
      </section>

      {/* Telemetry Stats */}
      <section className="relative z-10 bg-surface-container-low/50 border-y border-outline-variant/20 py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 bg-surface-container/60 border border-outline-variant/30 p-6 rounded-lg">
              <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">PEAK PERFORMANCE</p>
              <h4 className="text-5xl font-display-lg text-on-surface mb-2">94%</h4>
              <p className="text-primary-fixed-dim text-xs font-mono">Memory Optimization</p>
            </div>
            <div className="bg-surface-container/60 border border-outline-variant/30 p-6 rounded-lg">
              <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">RUNTIME METRIC</p>
              <h4 className="text-2xl font-display-lg text-on-surface mb-2">O(n log n)</h4>
              <p className="text-on-surface-variant text-[10px] font-mono">Avg Complexity</p>
            </div>
            <div className="bg-surface-container/60 border border-outline-variant/30 p-6 rounded-lg relative">
              <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-error-container animate-pulse"></span>
              <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">CURRENT STREAK</p>
              <h4 className="text-2xl font-display-lg text-on-surface mb-2">14-Day</h4>
              <p className="text-error-container text-[10px] font-mono">Optimal Path</p>
            </div>
          </div>

          {/* Testimonial */}
          <div>
            <h2 className="text-4xl md:text-5xl font-headline-md text-on-surface mb-2">Smart tracking that</h2>
            <h2 className="text-4xl md:text-5xl font-headline-md text-on-surface italic opacity-80 mb-8">translates to <span className="font-normal not-italic">Offers.</span></h2>
            
            <div className="flex items-start gap-4 bg-surface-container/40 border border-outline-variant/20 p-6 rounded-xl mb-6">
              <div className="w-12 h-12 rounded bg-surface-container-highest border border-primary-fixed-dim/30 shrink-0 overflow-hidden">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4" alt="Avatar" />
              </div>
              <div>
                <p className="text-on-surface-variant text-sm italic mb-2">"The real-time tracking fundamentally rewired how I approach dynamic programming."</p>
                <p className="text-primary-fixed-dim text-[10px] font-label-caps tracking-widest uppercase">L5 SWE Candidate</p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-[10px] text-on-surface-variant bg-surface-container/50 px-3 py-1.5 rounded border border-outline-variant/20">
                <Lock className="w-3 h-3" /> Encryption-grade security
              </span>
              <span className="flex items-center gap-2 text-[10px] text-on-surface-variant bg-surface-container/50 px-3 py-1.5 rounded border border-outline-variant/20">
                <Zap className="w-3 h-3" /> Zero-latency sync
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* Very bottom footer */}
      <div className="relative z-10 py-6 px-8 flex justify-between items-center text-[10px] font-label-caps text-outline-variant tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-outline-variant/50 flex items-center justify-center font-bold text-background rounded-sm">M</div>
          MENTRA SYSTEMS © 2026
        </div>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-on-surface transition-colors">Terminal</Link>
          <Link href="#" className="hover:text-on-surface transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-on-surface transition-colors">Legal</Link>
        </div>
      </div>
    </div>
  );
}
