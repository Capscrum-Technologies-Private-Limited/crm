"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  DollarSign, 
  Briefcase, 
  TrendingUp,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { useEffect, useState } from "react";

interface Stats {
  clientCount: number;
  pipelineCount: number;
  wonProjects: number;
  totalRevenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats") // Assuming an API route for client-side fetch in the new UI
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {
        // Fallback for demo if API not ready
        setStats({
          clientCount: 1,
          pipelineCount: 0,
          wonProjects: 0,
          totalRevenue: 50000
        });
      });
  }, []);

  if (!stats) return <div className="animate-pulse space-y-8 p-8">Loading...</div>;

  const cards = [
    {
      title: "Total Clients",
      value: stats.clientCount,
      icon: Users,
      color: "text-blue-600",
      gradient: "from-blue-500/10 to-transparent",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      gradient: "from-emerald-500/10 to-transparent",
    },
    {
      title: "Project Wins",
      value: stats.wonProjects,
      icon: Briefcase,
      color: "text-purple-600",
      gradient: "from-purple-500/10 to-transparent",
    },
    {
      title: "Pipeline Count",
      value: stats.pipelineCount,
      icon: TrendingUp,
      color: "text-orange-600",
      gradient: "from-orange-500/10 to-transparent",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">
            Workspace <span className="text-primary">Overview</span>
          </h2>
          <p className="text-muted-foreground text-lg font-medium">Welcome back, Super Admin. Here's your real-time performance.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 rounded-2xl bg-slate-100 border border-slate-200 text-foreground font-bold text-sm hover:bg-slate-200 transition-all">
            Export Data
          </button>
          <button className="px-6 py-3 rounded-2xl premium-gradient text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all">
            New Project
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {cards.map((card) => (
          <motion.div 
            key={card.title} 
            variants={item}
            className="glass-card p-6 rounded-[2rem] relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} -mr-16 -mt-16 rounded-full blur-3xl opacity-50`} />
            
            <div className="flex items-center justify-between mb-8">
              <div className={`p-4 rounded-2xl bg-slate-50 border border-slate-200 ${card.color}`}>
                <card.icon size={24} />
              </div>
              <ArrowUpRight className="text-muted-foreground/30 group-hover:text-primary transition-colors" size={20} />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
                {card.title}
              </p>
              <h3 className="text-3xl font-black text-foreground tracking-tight">
                {card.value}
              </h3>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">+12%</span>
              <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Growth</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-7">
        {/* Chart Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-4 glass-card p-8 rounded-[2.5rem]"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-foreground">Revenue Performance</h3>
            <div className="flex gap-2">
              {['7D', '1M', '1Y'].map((t) => (
                <button key={t} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${t === '1M' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground hover:bg-slate-100'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[400px] w-full">
            <RevenueChart />
          </div>
        </motion.div>
        
        {/* Activities Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-3 glass-card p-8 rounded-[2.5rem]"
        >
          <h3 className="text-xl font-bold text-foreground mb-8">Pulse Activities</h3>
          <div className="space-y-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-4 group cursor-pointer">
                <div className="relative mt-1">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                    <Activity size={18} />
                  </div>
                  {i !== 5 && (
                    <div className="absolute top-10 left-1/2 w-[1px] h-8 bg-gradient-to-b from-slate-200 to-transparent" />
                  )}
                </div>
                <div className="flex-1 border-b border-slate-100 pb-6 last:border-0">
                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Client Onboarding</p>
                  <p className="text-xs text-muted-foreground/60 font-medium">New premium client synced via API</p>
                  <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest mt-2">{i * 2} mins ago</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
