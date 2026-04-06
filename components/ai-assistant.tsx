"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  RefreshCcw, 
  CheckCircle, 
  Trash2, 
  ChevronRight,
  Loader2
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  draft?: {
    to: string;
    subject: string;
    body: string;
  };
}

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hey there! I'm here to help you get your emails done. Just tell me what you need to send and to whom, and I'll handle the writing for you.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

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
            content: "I've drafted a premium response based on your request. How does this look?",
            draft: data,
          },
        ]);
      } else {
        throw new Error(data.error || "Failed to generate draft");
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "assistant", content: `Error: ${err.message}` },
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
        last[last.length - 1].draft = data;
        return last;
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dispatchEmail = async (draft: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        body: JSON.stringify({ action: "send", draft }),
      });
      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: "assistant", content: "Successfully dispatched. Connection established." },
        ]);
      } else {
        throw new Error("Failed to dispatch email");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-black/5 relative">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-12 space-y-12 scrollbar-hide scroll-smooth"
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
                          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Aether Neural Dispatch</span>
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
                         <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Neural Tone Refinement</p>
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
                            onClick={() => dispatchEmail(msg.draft)}
                            className="flex-1 py-5 primary-gradient rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 glow hover:scale-[1.02] active:scale-[0.98] transition-all"
                         >
                            <Send size={18} />
                            Establish Connection
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
               <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">Neural Computing...</span>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Command Bar - Fixed Position with proper spacing */}
      <div className="p-6 md:p-8 border-t border-white/5 bg-black/40 backdrop-blur-3xl z-30">
        <div className="max-w-4xl mx-auto">
          <div className="glass p-2.5 rounded-[2.5rem] flex items-center gap-3 shadow-2xl border-primary/30 glow group focus-within:border-primary transition-all">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
              <Sparkles size={24} />
            </div>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Draft an intelligence dispatch..."
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
