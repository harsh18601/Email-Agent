"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, ShieldAlert, ArrowRight, SearchCheck, ShieldCheck, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmailCardProps {
  sender: string;
  subject: string;
  summary: string;
  urgency: "High" | "Medium" | "Low";
  importanceScore: number;
  time: string;
  category: string;
  status?: "safe" | "investigate" | "ignore";
  onMarkSafe?: () => void;
  onInvestigate?: () => void;
  onIgnore?: () => void;
}

export function EmailCard({
  sender,
  subject,
  summary,
  urgency,
  importanceScore,
  time,
  category,
  status,
  onMarkSafe,
  onInvestigate,
  onIgnore,
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
  const riskLabel = importanceScore >= 80 ? "High" : importanceScore >= 55 ? "Medium" : "Low";
  const statusLabel = {
    safe: "Marked safe",
    investigate: "Under review",
    ignore: "Ignored",
  }[status ?? "investigate"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative flex h-full cursor-default flex-col overflow-hidden rounded-[2rem] border border-white/8 bg-[rgba(12,12,18,0.82)] p-7 backdrop-blur-2xl transition-all duration-500 group hover:border-primary/30 hover:shadow-[0_24px_60px_rgba(139,92,246,0.14)]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.10),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_28%)]" />

      {/* Top Header */}
      <div className="relative z-10 mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl primary-gradient text-lg font-black text-white shadow-lg transition-transform duration-500 group-hover:scale-105">
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
      <div className="relative z-10 flex flex-1 flex-col space-y-5">
        <h4 className="text-xl font-black text-foreground leading-tight tracking-tighter group-hover:text-primary transition-colors duration-300">
          {urgency === "High" ? `AI detected unusual activity: ${subject}` : subject}
        </h4>
        <p className="line-clamp-3 text-sm font-medium leading-relaxed tracking-tight text-white/62 md:text-[15px]">
          {summary}
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/35 font-black">Risk Score</p>
            <p className="mt-2 text-3xl font-black text-white">{importanceScore}%</p>
            <p className="mt-2 text-sm text-white/50">Risk: {riskLabel}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/35 font-black">Reason</p>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{buildRiskReason(category, urgency, sender)}</p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 mt-8 space-y-4 opacity-90 transition-opacity">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">
              AI Status
            </span>
            <span className="text-sm font-black text-primary">{statusLabel}</span>
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

      <div className="relative z-10 mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={onMarkSafe}
          className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-200 transition-colors hover:bg-emerald-400/15"
        >
          <ShieldCheck size={14} />
          Mark Safe
        </button>
        <button
          onClick={onInvestigate}
          className="flex items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-primary transition-colors hover:bg-primary/15"
        >
          <SearchCheck size={14} />
          Investigate
        </button>
      </div>

      <div className="relative z-10 mt-3 flex items-center justify-between">
        <button
          onClick={onIgnore}
          className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/35 hover:text-red-300 transition-colors"
        >
          <Trash2 size={14} />
          Ignore
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest glow shadow-xl">
          Review Insight <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}

function buildRiskReason(category: string, urgency: "High" | "Medium" | "Low", sender: string) {
  const normalizedCategory = category.toLowerCase();

  if (normalizedCategory.includes("security")) {
    return "Security-related language and sender behavior suggest this could affect account access or trust.";
  }

  if (normalizedCategory.includes("finance") || normalizedCategory.includes("billing")) {
    return "Finance signals detected. Verify the sender and requested action before approving any payment or change.";
  }

  if (urgency === "High") {
    return "Aether raised this for review because the sender or language pattern looks unusually urgent.";
  }

  return `Prioritized because ${sender.split("<")[0].trim()} appears relevant to recent inbox activity and follow-up timing.`;
}
