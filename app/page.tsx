"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Sparkles, ArrowRight, Shield, Zap, Target, Loader2 } from "lucide-react";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  const handleConnect = () => {
    if (status === "authenticated") {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-12 overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-6 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/20 text-primary text-xs font-black uppercase tracking-[0.2em] mb-4">
          <Sparkles size={14} />
          Autonomous Neural Perimeter
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-[calc(-0.05em)] hero-gradient leading-none uppercase">
          Aether <span className="text-primary opacity-80 italic lowercase font-serif tracking-tighter">Intelligence</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-muted-foreground/80 text-lg md:text-xl font-medium leading-relaxed tracking-tight">
          The next generation of autonomous email dispatch. Neural priority detection, 
          AI-driven summarization, and elite inbox monitoring.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <button 
          onClick={handleConnect}
          disabled={status === "loading"}
          className="group relative px-10 py-5 rounded-3xl primary-gradient text-white font-black text-lg glow hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 min-w-[280px] justify-center"
        >
          {status === "loading" ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              {status === "authenticated" ? "Launch Neural Grid" : "Establish Connection"}
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </motion.div>

      {/* Feature Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full"
      >
        <FeatureCard 
          icon={<Shield className="text-primary" />} 
          title="Neural Filtering" 
          desc="Advanced priority detection using Groq-powered inference." 
        />
        <FeatureCard 
          icon={<Zap className="text-indigo-400" />} 
          title="Instant Context" 
          desc="Upstash Vector RAG for deep semantic email understanding." 
        />
        <FeatureCard 
          icon={<Target className="text-violet-400" />} 
          title="Action Priority" 
          desc="Identifying deadlines and task items before you even read." 
        />
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="glass p-8 rounded-[2rem] border-white/5 text-left space-y-4 hover:border-primary/30 transition-colors">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
