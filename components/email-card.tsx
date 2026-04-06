"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, ExternalLink, ShieldAlert, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailCardProps {
  sender: string;
  subject: string;
  summary: string;
  urgency: "High" | "Medium" | "Low";
  importanceScore: number;
  time: string;
  category: string;
}

export function EmailCard({
  sender,
  subject,
  summary,
  urgency,
  importanceScore,
  time,
  category,
}: EmailCardProps) {
  const urgencyConfig = {
    High: {
      color: "text-red-400 bg-red-400/10 border-red-400/20",
      glow: "shadow-[0_0_15px_rgba(239,68,68,0.2)]",
      icon: ShieldAlert
    },
    Medium: {
      color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
      glow: "shadow-[0_0_15px_rgba(245,158,11,0.2)]",
      icon: Clock
    },
    Low: {
      color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]",
      icon: CheckCircle2
    },
  };

  const config = urgencyConfig[urgency];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="glass rounded-[2rem] p-7 flex flex-col h-full relative overflow-hidden group border-white/5 hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(168,85,247,0.15)] transition-all duration-500 cursor-default"
    >
      {/* Top Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl primary-gradient flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-110 transition-transform duration-500">
              {sender[0]}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors duration-300">
              {sender.split('<')[0].trim()}
            </h3>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black flex items-center gap-1.5">
              <Clock size={10} />
              {time}
            </p>
          </div>
        </div>
        <div className={cn("px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5", config.color, config.glow)}>
          <Icon size={12} />
          {urgency}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 flex-1">
        <h4 className="text-xl font-black text-foreground leading-tight tracking-tighter group-hover:text-primary transition-colors duration-300">
          {subject}
        </h4>
        <p className="text-sm md:text-base text-white/60 line-clamp-4 group-hover:line-clamp-none transition-all duration-500 leading-relaxed font-medium tracking-tight">
          {summary}
        </p>
      </div>

      {/* Footer Info */}
      <div className="mt-8 space-y-4 opacity-70 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">
              Priority
            </span>
            <span className="text-sm font-black text-primary">{importanceScore}%</span>
          </div>
          <div className="text-[10px] px-3 py-1 rounded-lg bg-white/5 text-muted-foreground border border-white/5 font-black uppercase tracking-widest">
            {category}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${importanceScore}%` }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="h-full primary-gradient glow"
          />
        </div>
      </div>

      {/* Hover Reveal Action */}
      <div className="absolute bottom-6 right-6 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest glow shadow-xl">
           Neural Analysis <ArrowRight size={14} />
        </button>
      </div>

      {/* Background Decorative Element */}
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </motion.div>
  );
}
