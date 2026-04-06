"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { Mail, Lock, Moon, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");

  return (
    <div className="min-h-screen bg-[#050510] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[450px] glass rounded-[3rem] p-10 border-white/5 shadow-2xl relative z-10"
      >
        {/* Moon Icon Header */}
        <div className="flex justify-center mb-10">
          <div className="w-16 h-16 rounded-full bg-black border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            <Moon size={28} className="text-white fill-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-center tracking-[0.3em] uppercase mb-10 hero-gradient">
          {mode === "signup" ? "Create Account" : "Access Neural Grid"}
        </h2>

        {/* Mode Toggle */}
        <div className="flex p-1.5 bg-black/40 rounded-2xl border border-white/5 mb-10">
          <button 
            onClick={() => setMode("login")}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${mode === "login" ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/60"}`}
          >
            Login
          </button>
          <button 
             onClick={() => setMode("signup")}
             className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${mode === "signup" ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/60"}`}
          >
            Signup
          </button>
        </div>

        {/* Form Matrix */}
        <div className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="email" 
              placeholder="Email Address"
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-white/20"
            />
          </div>
          
          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="password" 
              placeholder="Password"
              className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-white/20"
            />
          </div>

          <button className="w-full py-5 mt-6 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-white/90 active:scale-[0.98] transition-all shadow-xl">
            {mode === "signup" ? "Sign Up" : "Confirm Access"}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-10">
          <div className="h-[1px] flex-1 bg-white/5" />
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Or Continue With</span>
          <div className="h-[1px] flex-1 bg-white/5" />
        </div>

        {/* Google Secondary Auth */}
        <button 
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full py-4 bg-black/60 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-xs font-bold hover:bg-black/80 hover:border-white/20 transition-all group"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale group-hover:grayscale-0 transition-all" alt="G" />
          <span>Google</span>
        </button>
      </motion.div>

      {/* Security Footer */}
      <div className="absolute bottom-8 text-[10px] text-white/20 font-bold uppercase tracking-widest flex items-center gap-4">
        <span>Encrypted Tunnel Active</span>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    </div>
  );
}
