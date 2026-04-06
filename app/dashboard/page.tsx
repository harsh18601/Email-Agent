"use client";

import { motion, AnimatePresence } from "framer-motion";
import { EmailCard } from "@/components/email-card";
import { 
  Briefcase,
  BellRing,
  Bot,
  BrainCircuit,
  Filter, 
  LayoutDashboard, 
  Mail, 
  ShieldAlert,
  RefreshCw, 
  Search, 
  Settings, 
  Sparkles,
  Zap,
  ShieldCheck,
  Clock,
  MessageSquare,
  LogOut,
  TrendingUp
} from "lucide-react";
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { fetchUserEmails } from "./actions";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { AIAssistant } from "@/components/ai-assistant";

type EmailUrgency = "High" | "Medium" | "Low";

type EmailItem = {
  id: string;
  sender: string;
  subject: string;
  summary: string;
  urgency: EmailUrgency;
  importanceScore: number;
  time: string;
  category: string;
};

type SeverityFilter = "All" | EmailUrgency;
type CategoryFilter = "All" | "Security" | "Finance" | "Promotions";
type FeedAction = "safe" | "investigate" | "ignore";

const severityFilters: SeverityFilter[] = ["All", "High", "Medium", "Low"];
const categoryFilters: CategoryFilter[] = ["All", "Security", "Finance", "Promotions"];
const INITIAL_VISIBLE_EMAILS = 10;
const LOAD_MORE_STEP = 10;

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [mode, setMode] = useState<"grid" | "assistant">("grid");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("All");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [actionState, setActionState] = useState<Record<string, FeedAction>>({});
  const [visibleEmails, setVisibleEmails] = useState(INITIAL_VISIBLE_EMAILS);
  const deferredSearch = useDeferredValue(search);

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

  const unresolvedAlerts = useMemo(
    () => emails.filter((email) => email.urgency === "High" && actionState[email.id] !== "safe").length,
    [actionState, emails]
  );

  const reviewedCount = useMemo(() => Object.keys(actionState).length, [actionState]);

  const aiHoursSaved = useMemo(
    () => (emails.reduce((sum, email) => sum + email.importanceScore, 0) / 120).toFixed(1),
    [emails]
  );
  const newEmailCount = useMemo(() => emails.length, [emails]);
  const inboxRiskScore = useMemo(() => averageScore(emails), [emails]);
  const autoRespondCandidates = useMemo(
    () => emails.filter((email) => email.urgency !== "High").slice(0, 3).length,
    [emails]
  );

  const filteredEmails = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return emails.filter((email) => {
      const matchesSearch =
        !query ||
        email.subject.toLowerCase().includes(query) ||
        email.sender.toLowerCase().includes(query) ||
        email.summary.toLowerCase().includes(query);
      const matchesSeverity = severityFilter === "All" || email.urgency === severityFilter;
      const matchesCategory =
        categoryFilter === "All" || normalizeCategory(email.category) === categoryFilter;
      const notIgnored = actionState[email.id] !== "ignore";

      return matchesSearch && matchesSeverity && matchesCategory && notIgnored;
    });
  }, [actionState, categoryFilter, deferredSearch, emails, severityFilter]);

  const recommendations = useMemo(
    () => emails.filter((email) => email.urgency !== "Low").slice(0, 3).map(buildRecommendation),
    [emails]
  );

  const displayedEmails = useMemo(
    () => filteredEmails.slice(0, visibleEmails),
    [filteredEmails, visibleEmails]
  );

  useEffect(() => {
    setVisibleEmails(INITIAL_VISIBLE_EMAILS);
  }, [deferredSearch, severityFilter, categoryFilter, mode]);

  const handleAction = (id: string, action: FeedAction) => {
    setActionState((current) => ({
      ...current,
      [id]: action,
    }));
  };

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
            <p className="text-[10px] font-bold text-primary tracking-[0.4em] uppercase leading-none mt-1">Email Intelligence</p>
          </div>
        </motion.div>

        {/* Scrollable Nav Area */}
        <nav className="flex-1 overflow-y-auto space-y-8 scrollbar-hide pr-2">
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-black pl-5 mb-4">Command Center</p>
            <NavLink 
              icon={<LayoutDashboard size={22} />} 
              label="Threat Review" 
              active={mode === "grid"} 
              onClick={() => startTransition(() => setMode("grid"))}
            />
            <NavLink 
              icon={<MessageSquare size={22} />} 
              label="AI Assistant" 
              active={mode === "assistant"}
              onClick={() => startTransition(() => setMode("assistant"))}
              badge="Active"
            />
          </div>
          
          <div className="space-y-3 pt-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-black pl-5 mb-4">Operational Views</p>
            <NavLink icon={<Mail size={22} />} label="Inbox Radar" />
            <NavLink icon={<Zap size={22} />} label="Priority Ops" badge={unresolvedAlerts.toString()} />
          </div>
          
          <div className="space-y-3 pt-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-black pl-5 mb-4">Settings</p>
            <NavLink icon={<ShieldCheck size={20} />} label="Security" />
            <NavLink icon={<Settings size={20} />} label="Preferences" />
          </div>
        </nav>

        {/* Fixed Footer */}
        <div className="mt-8 shrink-0 space-y-4">
          <div className="glass p-5 rounded-2xl border-primary/15 bg-primary/[0.04] space-y-4 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-bold text-primary mb-1">LIVE OPS</p>
              <h4 className="text-sm font-bold">Today&apos;s coverage</h4>
              <div className="mt-4 space-y-4 text-sm">
                <SidebarMetric label="Inbox indexed" value={`${emails.length} items`} progress={Math.min(100, emails.length * 18)} tone="violet" />
                <SidebarMetric label="Threats reviewed" value={`${reviewedCount}`} progress={Math.min(100, reviewedCount * 25)} tone="red" />
                <SidebarMetric label="Avg risk" value={`${inboxRiskScore}%`} progress={Math.max(10, inboxRiskScore)} tone="amber" />
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-primary/6 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-50 leading-relaxed shadow-[0_0_25px_rgba(16,185,129,0.1)]">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-200/80">Trust Layer</p>
            <p className="mt-2">Privacy-first routing and authenticated inbox access keep analysis scoped to your account.</p>
          </div>

          <div className="glass rounded-2xl p-5 border-white/5">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-black mb-4">Quick Actions</p>
            <div className="space-y-2">
              <SidebarActionButton icon={<BellRing size={16} />} label={`Review ${unresolvedAlerts} critical alerts`} onClick={() => setSeverityFilter("High")} />
              <SidebarActionButton icon={<RefreshCw size={16} />} label={`Scan ${newEmailCount} indexed emails`} onClick={handleSync} />
              <SidebarActionButton icon={<BrainCircuit size={16} />} label={`View ${inboxRiskScore}% risk breakdown`} onClick={() => startTransition(() => setMode("assistant"))} />
            </div>
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
      <main className="flex h-screen flex-1 flex-col overflow-y-auto px-6 py-10 lg:px-12">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-primary">
              <ShieldCheck size={14} />
              Real-time AI email intelligence
            </div>
            <h2 className="text-5xl font-black tracking-tighter hero-gradient">
              {mode === "grid" ? "AI-powered threat detection for your inbox" : "AI copilot for email investigations"}
            </h2>
            <p className="max-w-3xl text-muted-foreground font-medium text-lg">
              {mode === "grid" 
                ? `Review live alerts, triage suspicious activity, and surface the messages that need action first. ${unresolvedAlerts > 0 ? `${unresolvedAlerts} unresolved threats are waiting.` : "No critical threats need immediate action."}`
                : "Ask follow-up questions, summarize inbox patterns, and investigate threats without leaving the dashboard."}
            </p>
            {mode === "grid" && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSeverityFilter("High")}
                  className="inline-flex items-center gap-2 rounded-2xl primary-gradient px-5 py-3 text-sm font-bold text-white glow hover:scale-[1.02] transition-transform"
                >
                  <BellRing size={16} />
                  Review Alerts
                </button>
                <button
                  onClick={handleSync}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white/90 hover:border-primary/30 hover:bg-primary/10 transition-colors"
                >
                  <RefreshCw size={16} className={cn(syncing && "animate-spin")} />
                  Scan Inbox
                </button>
                <button
                  onClick={() => startTransition(() => setMode("assistant"))}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white/90 hover:border-primary/30 hover:bg-primary/10 transition-colors"
                >
                  <Bot size={16} />
                  View Insights
                </button>
              </div>
            )}
          </motion.div>
          
          <div className="flex items-center gap-4">
            <div className="glass flex items-center gap-3 px-5 py-3 rounded-2xl border-white/5 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-500 w-full lg:w-80">
              <Search size={18} className="text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Ask anything about your inbox, detect threats, or search alerts..." 
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
              className="space-y-12 pt-12"
            >
              <section className="glass rounded-[2rem] p-7 lg:p-8 border-white/8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.10),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.06),transparent_28%)]" />
                <div className="relative z-10 grid gap-8 xl:grid-cols-[1.35fr_0.9fr]">
                  <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-white/70">
                      <Sparkles size={14} className="text-primary" />
                      AI Summary
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-3xl font-black tracking-tight">
                        {unresolvedAlerts > 0
                          ? `You have ${unresolvedAlerts} critical threat${unresolvedAlerts === 1 ? "" : "s"} and ${recommendations.length} recommended next step${recommendations.length === 1 ? "" : "s"} today.`
                          : `Your inbox is stable. ${recommendations.length} AI recommendation${recommendations.length === 1 ? "" : "s"} are ready for review.`}
                      </h3>
                      <p className="max-w-2xl text-base text-white/65 leading-relaxed">
                        Aether monitors high-risk sign-ins, finance-sensitive messages, and urgent communications so you can move from signal to action faster.
                      </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <SummaryPill icon={<BellRing size={16} />} label="Critical now" value={`${unresolvedAlerts}`} tone="red" />
                      <SummaryPill icon={<TrendingUp size={16} />} label="Coverage" value={`${emails.length} emails`} tone="violet" />
                      <SummaryPill icon={<Clock size={16} />} label="Time saved" value={`${aiHoursSaved}h`} tone="emerald" />
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <WorkflowStep icon={<ShieldAlert size={16} />} title="Detect" detail={`${unresolvedAlerts} alerts identified`} />
                      <WorkflowStep icon={<BrainCircuit size={16} />} title="Investigate" detail="Use AI to explain risk signals" />
                      <WorkflowStep icon={<Briefcase size={16} />} title="Act" detail={`${autoRespondCandidates} emails ready for response`} />
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/8 bg-black/16 p-6 space-y-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.25em] text-white/35 font-black">Recommended Actions</p>
                      <h4 className="mt-2 text-lg font-bold">What to do next</h4>
                    </div>
                    <div className="space-y-3">
                      {recommendations.map((recommendation) => (
                        <div key={recommendation.key} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                          <p className="text-sm font-bold text-white">{recommendation.title}</p>
                          <p className="mt-1 text-sm leading-relaxed text-white/55">{recommendation.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Dynamic Stats Section */}
              <motion.section 
                variants={containerVars}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <StatCard 
                  label="Critical Alerts" 
                  value={unresolvedAlerts.toString()} 
                  icon={<AlertCircleIcon />} 
                  color="text-red-500" 
                  delay={0.1}
                  detail={unresolvedAlerts > 0 ? `${unresolvedAlerts} unresolved threat${unresolvedAlerts === 1 ? "" : "s"}` : "No action needed"}
                  trend={unresolvedAlerts > 0 ? "High risk inbox activity" : "Inbox risk stable"}
                  onClick={() => setSeverityFilter("High")}
                />
                <StatCard 
                  label="Inbox Health" 
                  value={unresolvedAlerts > 0 ? "Review" : "Stable"} 
                  icon={<ShieldCheck size={20} />} 
                  color="text-primary" 
                  delay={0.2}
                  detail={`Last updated ${getLastUpdated(emails)}`}
                  trend={unresolvedAlerts > 0 ? "Suspicious activity detected" : "No action needed"}
                  onClick={() => {
                    setSeverityFilter("All");
                    setCategoryFilter("Security");
                  }}
                />
                <StatCard 
                  label="AI Productivity" 
                  value={`+${aiHoursSaved}h`} 
                  icon={<Clock size={20} />} 
                  color="text-green-500" 
                  delay={0.3}
                  detail={`${reviewedCount} reviewed this session`}
                  trend="Trend up 20% today"
                  onClick={() => startTransition(() => setMode("assistant"))}
                />
              </motion.section>

              {/* Priority Feed */}
              <section className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-primary rounded-full glow" />
                      <h3 className="text-2xl font-black tracking-tight uppercase italic">Intelligence stream</h3>
                    </div>
                    <p className="text-sm text-white/45">
                      Showing {Math.min(displayedEmails.length, filteredEmails.length)} of {filteredEmails.length} analyzed emails
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {severityFilters.map((filter) => (
                        <FilterChip
                          key={filter}
                          active={severityFilter === filter}
                          onClick={() => setSeverityFilter(filter)}
                        >
                          {filter}
                        </FilterChip>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {categoryFilters.map((filter) => (
                        <FilterChip
                          key={filter}
                          active={categoryFilter === filter}
                          onClick={() => setCategoryFilter(filter)}
                        >
                          {filter}
                        </FilterChip>
                      ))}
                    </div>
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
                      {displayedEmails.map((email) => (
                        <motion.div
                          key={email.id}
                          variants={itemVars}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="h-full"
                        >
                          <EmailCard
                            {...email}
                            status={actionState[email.id]}
                            onMarkSafe={() => handleAction(email.id, "safe")}
                            onInvestigate={() => handleAction(email.id, "investigate")}
                            onIgnore={() => handleAction(email.id, "ignore")}
                          />
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
                        <h3 className="text-xl font-bold mb-2">No alerts match this view</h3>
                        <p className="text-muted-foreground text-sm max-w-sm text-center">Adjust the filters or run a fresh inbox scan to surface new insights and threat signals.</p>
                        <button 
                          onClick={handleSync}
                          className="mt-8 px-8 py-3 rounded-2xl primary-gradient text-sm font-bold glow hover:scale-105 active:scale-95 transition-all"
                        >
                          Sync with Gmail
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {!loading && filteredEmails.length > visibleEmails && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => setVisibleEmails((current) => current + LOAD_MORE_STEP)}
                      className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white/85 hover:border-primary/30 hover:bg-primary/10 transition-colors"
                    >
                      Load {Math.min(LOAD_MORE_STEP, filteredEmails.length - visibleEmails)} more emails
                    </button>
                  </div>
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
              className="h-[calc(100vh-220px)] pt-12"
            >
              <AIAssistant emails={emails} />
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

function StatCard({
  label,
  value,
  icon,
  color,
  delay,
  detail,
  trend,
  onClick,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  delay: number;
  detail: string;
  trend: string;
  onClick?: () => void;
}) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        show: { opacity: 1, scale: 1 }
      }}
      className="glass p-8 rounded-3xl space-y-6 relative overflow-hidden group hover:border-primary/30 transition-all duration-500"
    >
      <button onClick={onClick} className="w-full text-left">
        <div className="flex items-center justify-between relative z-10">
          <div className="p-3 rounded-2xl bg-white/5 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-500">
            {icon}
          </div>
          <div className="flex flex-col items-end">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black mb-1">{label}</p>
            <h4 className={cn("text-3xl font-black tracking-tighter", color)}>{value}</h4>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-white/75">{detail}</p>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-white/35">
            <span>{trend}</span>
            <span>Open</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden relative">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ delay, duration: 1, ease: "easeOut" }}
              className={cn("absolute inset-0 bg-gradient-to-r from-transparent via-current opacity-20", color)}
            />
          </div>
        </div>
      </button>
      {/* Background glow */}
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700" />
    </motion.div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.22em] transition-all",
        active
          ? "border-primary/40 bg-primary/15 text-primary glow"
          : "border-white/10 bg-white/5 text-white/55 hover:border-white/20 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function SummaryPill({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "red" | "violet" | "emerald";
}) {
  const toneStyles = {
    red: "border-red-400/20 bg-red-400/10 text-red-100",
    violet: "border-primary/20 bg-primary/10 text-violet-100",
    emerald: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
  };

  return (
    <div className={cn("rounded-2xl border px-4 py-3", toneStyles[tone])}>
      <div className="flex items-center gap-2 text-sm font-bold">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-xl font-black tracking-tight">{value}</p>
    </div>
  );
}

function SidebarMetric({
  label,
  value,
  progress,
  tone,
}: {
  label: string;
  value: string;
  progress: number;
  tone: "violet" | "red" | "amber";
}) {
  const barTone = {
    violet: "bg-primary",
    red: "bg-red-400",
    amber: "bg-amber-400",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-white/55">{label}</span>
        <span className="font-bold text-white">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div className={`h-full rounded-full ${barTone[tone]}`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function SidebarActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void | Promise<void>;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 hover:border-primary/30 hover:bg-primary/10 hover:text-white transition-all"
    >
      <span className="text-primary">{icon}</span>
      {label}
    </button>
  );
}

function WorkflowStep({
  icon,
  title,
  detail,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
      <div className="flex items-center gap-2 text-sm font-bold text-white">
        <span className="text-primary">{icon}</span>
        {title}
      </div>
      <p className="mt-2 text-sm text-white/55">{detail}</p>
    </div>
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

function normalizeCategory(category: string): CategoryFilter {
  const value = category.toLowerCase();

  if (value.includes("security")) return "Security";
  if (value.includes("finance") || value.includes("billing") || value.includes("invoice")) return "Finance";
  if (value.includes("promo") || value.includes("marketing") || value.includes("newsletter")) return "Promotions";
  return "Security";
}

function buildRecommendation(email: EmailItem) {
  if (normalizeCategory(email.category) === "Security") {
    return {
      key: email.id,
      title: "Review suspicious account activity",
      description: `Inspect "${email.subject}" and verify whether the sign-in or security event was expected.`,
    };
  }

  if (normalizeCategory(email.category) === "Finance") {
    return {
      key: email.id,
      title: "Validate finance-related request",
      description: `Cross-check "${email.subject}" before approving any transfer, invoice, or billing change.`,
    };
  }

  return {
    key: email.id,
    title: "Triage priority communication",
    description: `Use Aether to summarize "${email.subject}" and decide whether it should be escalated or dismissed.`,
  };
}

function averageScore(emails: EmailItem[]) {
  if (emails.length === 0) return 0;

  return Math.round(emails.reduce((sum, email) => sum + email.importanceScore, 0) / emails.length);
}

function getLastUpdated(emails: EmailItem[]) {
  if (emails.length === 0) return "just now";

  return emails[0]?.time ?? "just now";
}
