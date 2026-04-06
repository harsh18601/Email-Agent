"use client";

import { motion, AnimatePresence } from "framer-motion";
import { EmailCard } from "@/components/email-card";
import { 
  Filter, 
  LayoutDashboard, 
  Mail, 
  RefreshCw, 
  Search, 
  Settings, 
  Sparkles,
  Zap,
  ShieldCheck,
  Clock,
  MessageSquare,
  LogOut
} from "lucide-react";
import { useEffect, useState } from "react";
import { fetchUserEmails } from "./actions";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { AIAssistant } from "@/components/ai-assistant";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [mode, setMode] = useState<"grid" | "assistant">("grid");

  const loadEmails = async () => {
    try {
      setLoading(true);
      const data = await fetchUserEmails();
      setEmails(data);
    } catch (error) {
      console.error("Failed to load emails:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmails();
  }, []);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await fetch("/api/emails/fetch");
      if (res.ok) {
        await loadEmails();
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setSyncing(false);
    }
  };

  const filteredEmails = emails.filter(e => 
    e.subject.toLowerCase().includes(search.toLowerCase()) || 
    e.sender.toLowerCase().includes(search.toLowerCase())
  );

  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Premium Sidebar */}
      <aside className="w-72 glass border-r hidden lg:flex flex-col p-8 h-screen sticky top-0 overflow-hidden">
        {/* Fixed Header */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 group mb-10 shrink-0"
        >
          <div className="w-12 h-12 rounded-2xl primary-gradient flex items-center justify-center glow transition-transform group-hover:scale-110 duration-500">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tighter hero-gradient uppercase italic leading-none">AETHER</h1>
            <p className="text-[10px] font-bold text-primary tracking-[0.4em] uppercase leading-none mt-1">Intelligence</p>
          </div>
        </motion.div>

        {/* Scrollable Nav Area */}
        <nav className="flex-1 overflow-y-auto space-y-8 scrollbar-hide pr-2">
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-black pl-5 mb-4">Command Center</p>
            <NavLink 
              icon={<LayoutDashboard size={22} />} 
              label="Intelligence Feed" 
              active={mode === "grid"} 
              onClick={() => setMode("grid")}
            />
            <NavLink 
              icon={<MessageSquare size={22} />} 
              label="Neural Assistant" 
              active={mode === "assistant"}
              onClick={() => setMode("assistant")}
              badge="Active"
            />
          </div>
          
          <div className="space-y-3 pt-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-black pl-5 mb-4">Neural Data</p>
            <NavLink icon={<Mail size={22} />} label="Inner Circle" />
            <NavLink icon={<Zap size={22} />} label="Priority Ops" badge="4" />
          </div>
          
          <div className="space-y-3 pt-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-black pl-5 mb-4">Settings</p>
            <NavLink icon={<ShieldCheck size={20} />} label="Security" />
            <NavLink icon={<Settings size={20} />} label="Preferences" />
          </div>
        </nav>

        {/* Fixed Footer */}
        <div className="mt-8 shrink-0 space-y-4">
          <div className="glass p-5 rounded-2xl border-primary/20 bg-primary/5 space-y-3 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-bold text-primary mb-1">PRO PLAN</p>
              <h4 className="text-sm font-bold">Unlimited Analysis</h4>
              <button className="mt-3 w-full py-2 rounded-xl bg-primary text-xs font-bold hover:glow transition-all">Upgrade</button>
            </div>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
          </div>

          <button 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-white/20 hover:text-red-400 hover:bg-red-400/5 transition-all text-[10px] font-black uppercase tracking-[0.2em] group border border-transparent hover:border-red-400/10"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            Terminal Disconnect
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 lg:px-12 py-10 space-y-12 h-screen">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-5xl font-black tracking-tighter hero-gradient mb-2">
              {mode === "grid" ? "Neural Ingest" : "Assistant Matrix"}
            </h2>
            <p className="text-muted-foreground font-medium">
              {mode === "grid" 
                ? `Monitoring ${emails.length} points of interest in your digital perimeter.`
                : "Autonomous conversational intelligence at your disposal."}
            </p>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <div className="glass flex items-center gap-3 px-5 py-3 rounded-2xl border-white/5 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-500 w-full lg:w-80">
              <Search size={18} className="text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Scan intelligence data..." 
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleSync}
                disabled={syncing}
                className="glass w-12 h-12 flex items-center justify-center rounded-2xl glass-hover active:scale-95 transition-all text-muted-foreground disabled:opacity-50"
                title="Synchronize Grid"
              >
                <RefreshCw size={20} className={cn(syncing && "animate-spin text-primary glow")} />
              </button>
              <button className="glass w-12 h-12 flex items-center justify-center rounded-2xl glass-hover active:scale-95 transition-all text-muted-foreground">
                <Filter size={20} />
              </button>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {mode === "grid" ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* Dynamic Stats Section */}
              <motion.section 
                variants={containerVars}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <StatCard 
                  label="Critical Alerts" 
                  value={emails.filter(e => e.urgency === "High").length.toString()} 
                  icon={<AlertCircleIcon />} 
                  color="text-red-500" 
                  delay={0.1}
                />
                <StatCard 
                  label="Network Health" 
                  value="Optimal" 
                  icon={<ShieldCheck size={20} />} 
                  color="text-primary" 
                  delay={0.2}
                />
                <StatCard 
                  label="AI Productivity" 
                  value={`+${(emails.length * 0.2).toFixed(1)}h`} 
                  icon={<Clock size={20} />} 
                  color="text-green-500" 
                  delay={0.3}
                />
              </motion.section>

              {/* Priority Feed */}
              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary rounded-full glow" />
                    <h3 className="text-2xl font-black tracking-tight uppercase italic">Intelligence stream</h3>
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="h-64 glass rounded-3xl animate-pulse bg-white/5" />
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    variants={containerVars}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredEmails.map((email) => (
                        <motion.div
                          key={email.id}
                          variants={itemVars}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="h-full"
                        >
                          <EmailCard {...email} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {filteredEmails.length === 0 && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full py-32 flex flex-col items-center justify-center glass rounded-3xl border-dashed border-white/10"
                      >
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                          <Mail size={40} className="text-muted-foreground/30" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No active intelligence detected</h3>
                        <p className="text-muted-foreground text-sm max-w-sm text-center">Your neural perimeter is clear. Click synchronize to scan for new incoming data points.</p>
                        <button 
                          onClick={handleSync}
                          className="mt-8 px-8 py-3 rounded-2xl primary-gradient text-sm font-bold glow hover:scale-105 active:scale-95 transition-all"
                        >
                          Establish Connection
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-[calc(100vh-250px)]"
            >
              <AIAssistant />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavLink({ icon, label, active = false, badge, onClick }: { icon: React.ReactNode; label: string; active?: boolean; badge?: string; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
      "w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-500 relative group",
      active 
        ? "bg-primary/10 text-primary glow border border-primary/20" 
        : "text-muted-foreground hover:bg-white/5 hover:text-white"
    )}>
      <span className={cn("transition-transform duration-500", !active && "group-hover:scale-110 group-hover:text-primary")}>
        {icon}
      </span>
      <span className="font-bold text-sm tracking-tight">{label}</span>
      {badge && (
        <span className="ml-auto w-5 h-5 rounded-lg bg-primary text-white text-[10px] font-black flex items-center justify-center glow">
          {badge}
        </span>
      )}
      {active && <motion.div layoutId="active-nav" className="absolute left-0 w-1 h-6 bg-primary rounded-r-full glow" />}
    </button>
  );
}

function StatCard({ label, value, icon, color, delay }: { label: string; value: string; icon: React.ReactNode; color: string; delay: number }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        show: { opacity: 1, scale: 1 }
      }}
      className="glass p-8 rounded-3xl space-y-6 relative overflow-hidden group hover:border-primary/30 transition-all duration-500"
    >
      <div className="flex items-center justify-between relative z-10">
        <div className="p-3 rounded-2xl bg-white/5 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-500">
          {icon}
        </div>
        <div className="flex flex-col items-end">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black mb-1">{label}</p>
          <h4 className={cn("text-3xl font-black tracking-tighter", color)}>{value}</h4>
        </div>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative">
        <motion.div 
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ delay, duration: 1, ease: "easeOut" }}
          className={cn("absolute inset-0 bg-gradient-to-r from-transparent via-current opacity-20", color)}
        />
      </div>
      {/* Background glow */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700" />
    </motion.div>
  );
}

function AlertCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
