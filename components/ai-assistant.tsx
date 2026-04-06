"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  Trash2, 
  Loader2,
  ShieldAlert,
  MailWarning,
  ArrowRight
} from "lucide-react";

interface EmailInsight {
  id: string;
  sender: string;
  subject: string;
  summary: string;
  urgency: "High" | "Medium" | "Low";
  importanceScore: number;
  time: string;
  category: string;
}

interface Draft {
  to: string;
  subject: string;
  body: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  draft?: Draft;
}

export function AIAssistant({ emails }: { emails: EmailInsight[] }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suspiciousAlerts = useMemo(
    () => emails.filter((email) => email.urgency === "High").length,
    [emails]
  );
  const paymentEmails = useMemo(
    () => emails.filter((email) => isFinanceCategory(email.category)).length,
    [emails]
  );
  const autoRespondCandidates = useMemo(
    () => emails.filter((email) => email.urgency !== "High").slice(0, 3).length,
    [emails]
  );
  const inboxRiskScore = useMemo(() => {
    if (emails.length === 0) return 0;

    return Math.round(emails.reduce((sum, email) => sum + email.importanceScore, 0) / emails.length);
  }, [emails]);
  const recentActivity = useMemo(
    () => emails.slice(0, 5),
    [emails]
  );
  const categoryBreakdown = useMemo(
    () => buildCategoryBreakdown(emails),
    [emails]
  );

  useEffect(() => {
    setMessages([
      {
        id: "assistant-welcome",
        role: "assistant",
        content: buildWelcomeMessage(suspiciousAlerts, paymentEmails, inboxRiskScore),
      },
    ]);
  }, [inboxRiskScore, paymentEmails, suspiciousAlerts]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const focusInput = () => {
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  const handleSend = async (tone = "Professional") => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        body: JSON.stringify({ action: "compose", prompt: input, tone }),
      });
      const data = await response.json();

      if (data.subject) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "I turned that into a ready-to-review draft. You can refine the tone, send it, or keep investigating first.",
            draft: data,
          },
        ]);
      } else {
        throw new Error(data.error || "Failed to generate draft");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "assistant", content: `Error: ${message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const refineDraft = async (newTone: string, originalPrompt: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        body: JSON.stringify({ action: "compose", prompt: `Rewrite the following as a ${newTone} email: ${originalPrompt}`, tone: newTone }),
      });
      const data = await response.json();
      setMessages((prev) => {
        const last = [...prev];
        const lastMessage = last[last.length - 1];
        if (lastMessage) {
          lastMessage.draft = data as Draft;
        }
        return last;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dispatchEmail = async (draft: Draft) => {
    setLoading(true);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        body: JSON.stringify({ action: "send", draft }),
      });
      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: "assistant", content: "Response sent successfully. I can help you review the next threat or draft another reply." },
        ]);
      } else {
        throw new Error("Failed to dispatch email");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to dispatch email";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-[calc(100vh-220px)] min-h-[720px] flex-col overflow-hidden bg-black/5">
      <div className="grid flex-1 gap-6 overflow-hidden px-4 pb-6 md:px-8 xl:grid-cols-[1.3fr_0.75fr]">
        <div className="flex min-h-0 flex-col overflow-hidden rounded-[2rem] border border-white/5 bg-black/10">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 pb-56 md:p-8 md:pb-64 space-y-10 scrollbar-hide scroll-smooth"
          >
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === "assistant" ? "bg-primary/20 text-primary border border-primary/20" : "bg-white/10 text-white"}`}>
                    {msg.role === "assistant" ? <Bot size={20} /> : <User size={20} />}
                  </div>
                  <div className="space-y-4 max-w-[85%] lg:max-w-2xl">
                    <div className={`p-5 rounded-2xl ${msg.role === "assistant" ? "glass text-sm text-foreground/90 leading-relaxed shadow-xl border-white/5" : "bg-primary text-white text-sm font-medium shadow-[0_0_20px_rgba(168,85,247,0.3)]"}`}>
                      {msg.content}
                    </div>

                    {msg.draft && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass border-primary/30 rounded-[2rem] overflow-hidden shadow-2xl relative group"
                      >
                        <div className="p-6 md:p-8 space-y-6">
                          <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div className="flex items-center gap-2">
                              <Sparkles size={16} className="text-primary glow" />
                              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Aether Response Draft</span>
                            </div>
                            <Trash2 size={16} className="text-white/20 hover:text-red-400 cursor-pointer transition-colors" />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Recipient Target</label>
                            <p className="text-lg font-black tracking-tight hero-gradient">{msg.draft.to || "Unspecified Terminal"}</p>
                          </div>

                          <div className="p-6 bg-black/60 rounded-[2rem] border border-white/5 text-sm text-white/80 leading-relaxed font-medium">
                             <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: msg.draft.body }} />
                          </div>

                          <div className="space-y-3">
                             <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Refine Tone</p>
                             <div className="flex flex-wrap gap-2">
                              {["Friendly", "Formal", "Casual", "Professional"].map((t) => (
                                <button
                                  key={t}
                                  onClick={() => refineDraft(t, msg.content)}
                                  className="px-4 py-2 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 hover:text-primary transition-all border border-white/5"
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-4 pt-4">
                             <button 
                                onClick={() => {
                                  if (msg.draft) {
                                    void dispatchEmail(msg.draft);
                                  }
                                }}
                                className="flex-1 py-5 primary-gradient rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 glow hover:scale-[1.02] active:scale-[0.98] transition-all"
                             >
                                <Send size={18} />
                                Send Response
                             </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-primary opacity-50 pl-14">
                   <Loader2 className="animate-spin" size={18} />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">Investigating signals...</span>
                 </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <aside className="min-h-0 space-y-8 overflow-y-auto py-2 scrollbar-hide">
          <div className="glass rounded-[2rem] p-6 border-white/5">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">Auto Insight Panel</p>
            <div className="mt-4 space-y-3">
              <InsightCard
                icon={<ShieldAlert size={18} />}
                title={`${suspiciousAlerts} threats need attention`}
                detail={suspiciousAlerts > 0 ? "High-risk security signals were detected and should be reviewed first." : "No critical threats are active right now."}
                tone="red"
              />
              <InsightCard
                icon={<MailWarning size={18} />}
                title={`${autoRespondCandidates} emails can be auto-responded`}
                detail="Use the copilot to draft quick replies for lower-risk messages without leaving the investigation flow."
                tone="violet"
              />
            </div>
          </div>

          <div className="glass rounded-[2rem] p-6 border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35">Recent Activity</p>
                <h4 className="mt-2 text-lg font-bold">Latest analyzed emails</h4>
              </div>
              <ArrowRight size={16} className="text-primary" />
            </div>
            <div className="mt-5 space-y-3">
              {recentActivity.map((email) => (
                <div key={email.id} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-white">{email.subject}</p>
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{email.urgency}</span>
                  </div>
                  <p className="mt-2 text-sm text-white/50">{email.time}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-[2rem] p-6 border-white/5">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/35">Category Signal Mix</p>
            <div className="mt-5 space-y-4">
              {categoryBreakdown.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-white/80">{item.label}</span>
                    <span className="text-white/45">{item.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div className={`h-full rounded-full ${item.barClass}`} style={{ width: `${item.width}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="sticky bottom-0 z-30 border-t border-white/5 bg-[rgba(10,10,15,0.88)] p-4 backdrop-blur-2xl shadow-[0_-20px_60px_rgba(0,0,0,0.45)] md:p-6">
        <div className="mx-auto max-w-4xl space-y-3">
          <div className="flex flex-wrap gap-2">
            {["Summarize inbox", "Show threats", "Draft reply"].map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setInput(prompt);
                  focusInput();
                }}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/70 hover:border-primary/30 hover:bg-primary/10 hover:text-primary transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
          <div className="glass p-3 rounded-[2.5rem] flex items-center gap-3 shadow-2xl border-primary/40 glow group focus-within:border-primary focus-within:shadow-[0_0_35px_rgba(139,92,246,0.35)] transition-all min-h-[84px]">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
              <Sparkles size={24} />
            </div>
            <input 
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={focusInput}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about threats, summarize emails, or draft replies..."
              className="flex-1 bg-transparent border-none focus:outline-none text-white text-base font-medium px-4 placeholder:text-white/20"
            />
            <button 
              onClick={() => handleSend()}
              className="w-12 h-12 rounded-full primary-gradient flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all text-white group-hover:glow"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildWelcomeMessage(suspiciousAlerts: number, paymentEmails: number, inboxRiskScore: number) {
  if (suspiciousAlerts > 0 || paymentEmails > 0) {
    return `I found ${suspiciousAlerts} suspicious login alert${suspiciousAlerts === 1 ? "" : "s"} and ${paymentEmails} payment-related email${paymentEmails === 1 ? "" : "s"}. Your inbox risk score is ${inboxRiskScore}%. Want me to summarize, investigate, or draft a response?`;
  }

  return `Your inbox risk score is ${inboxRiskScore}%. I can highlight the most important emails, summarize today’s activity, or help you draft replies faster.`;
}

function buildCategoryBreakdown(emails: EmailInsight[]) {
  const total = Math.max(emails.length, 1);
  const groups = [
    { label: "Security", count: emails.filter((email) => isSecurityCategory(email.category)).length, barClass: "bg-red-400" },
    { label: "Finance", count: emails.filter((email) => isFinanceCategory(email.category)).length, barClass: "bg-amber-400" },
    { label: "Promotions", count: emails.filter((email) => isPromotionCategory(email.category)).length, barClass: "bg-emerald-400" },
  ];

  return groups.map((group) => ({
    ...group,
    width: Math.max(8, Math.round((group.count / total) * 100)),
  }));
}

function isFinanceCategory(category: string) {
  const value = category.toLowerCase();
  return value.includes("finance") || value.includes("billing") || value.includes("invoice");
}

function isSecurityCategory(category: string) {
  return category.toLowerCase().includes("security");
}

function isPromotionCategory(category: string) {
  const value = category.toLowerCase();
  return value.includes("promo") || value.includes("marketing") || value.includes("newsletter");
}

function InsightCard({
  icon,
  title,
  detail,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  tone: "red" | "violet";
}) {
  const toneClass = {
    red: "border-red-400/20 bg-red-400/10",
    violet: "border-primary/20 bg-primary/10",
  };

  return (
    <div className={`rounded-2xl border p-4 ${toneClass[tone]}`}>
      <div className="flex items-center gap-3 text-white">
        {icon}
        <p className="font-bold">{title}</p>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-white/65">{detail}</p>
    </div>
  );
}
