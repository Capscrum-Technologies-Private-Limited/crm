"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(searchParams?.get("error") || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        const session = await getSession();
        if (session?.user?.role === "CLIENT") {
          router.push("/portal");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[80px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="glass-card rounded-lg shadow-2xl overflow-hidden p-12 md:p-16 flex flex-col relative group">
          <div className="absolute top-0 left-0 w-full h-2 premium-gradient opacity-60" />
          
          <div className="flex flex-col items-center mb-12">
            <motion.div 
              initial={{ opacity: 0, rotate: -20 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 bg-primary/10 blur-[30px] rounded-full" />
              <Image
                src="/logo-square.jpg"
                alt="CapScrum CRM"
                width={128}
                height={128}
                priority
                className="w-32 h-32 object-contain rounded-lg shadow-2xl relative z-10 border border-slate-200"
              />
            </motion.div>
            <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.4em]">Next-Generation Enterprise CRM</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-red-50 border border-red-200 text-red-600 text-[11px] font-black uppercase tracking-widest px-6 py-4 rounded-lg flex items-center justify-center text-center leading-relaxed"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] ml-1">Access Identity</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground/30 group-focus-within/input:text-primary transition-colors" />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter strategic ID"
                    className="w-full h-16 pl-16 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-foreground outline-none focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/30 font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] ml-1">Security Cipher</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground/30 group-focus-within/input:text-primary transition-colors" />
                  </div>
                  <input
                    type="password"
                    placeholder="Enter cipher"
                    className="w-full h-16 pl-16 pr-8 bg-slate-50 border border-slate-200 rounded-lg text-foreground outline-none focus:border-primary/40 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/30 font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full h-18 rounded-lg premium-gradient text-white font-black text-[13px] uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn overflow-hidden"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Authorizing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <span>Sign In</span>
                  <div className="opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all">→</div>
                </div>
              )}
            </button>
          </form>

          <div className="mt-12 pt-10 border-t border-slate-200 flex flex-col items-center gap-6">
            <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">Authorized Personnel Only</p>
            <div className="text-[11px] font-black text-muted-foreground/50 uppercase tracking-[0.15em]">
              New Agent? <span className="text-primary hover:text-primary/80 transition-colors cursor-pointer">Contact Command</span>
            </div>
          </div>
        </div>
        
        {/* Decorative corner accent */}
        <div className="absolute -bottom-8 -right-8 w-24 h-24 premium-gradient blur-[60px] opacity-10" />
      </motion.div>
    </div>
  );
}

