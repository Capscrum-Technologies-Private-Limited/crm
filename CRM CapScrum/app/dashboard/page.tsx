"use client";

import { motion } from "framer-motion";
import {
  Users,
  DollarSign,
  Briefcase,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Receipt,
  Loader2,
  Banknote,
} from "lucide-react";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats {
  clientCount: number;
  projectCount: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  pipelineCount: number;
  wonProjects: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  overdueCount: number;
  totalExpenses: number;
  activities: {
    type: string;
    title: string;
    description: string;
    time: string;
    link?: string;
  }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-40" />
        <span className="text-xs font-black text-muted-foreground/30 uppercase tracking-[0.3em]">
          Loading workspace...
        </span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Failed to load dashboard data.
      </div>
    );
  }

  const cards = [
    {
      title: "Total Clients",
      value: stats.clientCount,
      icon: Users,
      color: "text-blue-600",
      gradient: "from-blue-500/10 to-transparent",
      link: "/dashboard/clients",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      gradient: "from-emerald-500/10 to-transparent",
      link: "/dashboard/invoices",
    },
    {
      title: "Active Projects",
      value: stats.activeProjects,
      icon: Briefcase,
      color: "text-purple-600",
      gradient: "from-purple-500/10 to-transparent",
      link: "/dashboard/projects",
    },
    {
      title: "Pipeline Deals",
      value: stats.pipelineCount,
      icon: TrendingUp,
      color: "text-orange-600",
      gradient: "from-orange-500/10 to-transparent",
      link: "/dashboard/pipeline",
    },
    {
      title: "Invoices Paid",
      value: `₹${stats.totalPaid.toLocaleString()}`,
      icon: Receipt,
      color: "text-teal-600",
      gradient: "from-teal-500/10 to-transparent",
      link: "/dashboard/invoices",
    },
    {
      title: "Total Expenses",
      value: `₹${stats.totalExpenses.toLocaleString()}`,
      icon: Banknote,
      color: "text-red-500",
      gradient: "from-red-500/10 to-transparent",
      link: "/dashboard/expenses",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "client": return Users;
      case "invoice": return Receipt;
      case "project": return Briefcase;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "client": return "text-blue-500 bg-blue-50 border-blue-200";
      case "invoice": return "text-emerald-500 bg-emerald-50 border-emerald-200";
      case "project": return "text-purple-500 bg-purple-50 border-purple-200";
      default: return "text-primary bg-primary/10 border-primary/20";
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
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
          <p className="text-muted-foreground text-lg font-medium">
            Real-time performance metrics across your portfolio.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/projects">
            <button className="px-6 py-3 rounded-2xl premium-gradient text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all">
              New Project
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
      >
        {cards.map((card) => (
          <Link key={card.title} href={card.link}>
            <motion.div
              variants={item}
              className="glass-card p-6 rounded-[2rem] relative overflow-hidden group cursor-pointer hover:border-primary/20 transition-all"
            >
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} -mr-16 -mt-16 rounded-full blur-3xl opacity-50`}
              />

              <div className="flex items-center justify-between mb-6">
                <div
                  className={`p-3.5 rounded-2xl bg-slate-50 border border-slate-200 ${card.color}`}
                >
                  <card.icon size={22} />
                </div>
                <ArrowUpRight
                  className="text-muted-foreground/30 group-hover:text-primary transition-colors"
                  size={18}
                />
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">
                  {card.title}
                </p>
                <h3 className="text-2xl font-black text-foreground tracking-tight">
                  {card.value}
                </h3>
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-7">
        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-4 glass-card p-8 rounded-[2.5rem]"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-foreground">
              Revenue Performance
            </h3>
          </div>
          <div className="h-[400px] w-full">
            <RevenueChart />
          </div>
        </motion.div>

        {/* Activities Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3 glass-card p-8 rounded-[2.5rem]"
        >
          <h3 className="text-xl font-bold text-foreground mb-8">
            Recent Activity
          </h3>
          <div className="space-y-6">
            {stats.activities.length === 0 ? (
              <div className="text-center py-12">
                <Activity
                  size={32}
                  className="mx-auto text-muted-foreground/20 mb-3"
                />
                <p className="text-sm text-muted-foreground/40 font-medium">
                  No recent activity
                </p>
              </div>
            ) : (
              stats.activities.slice(0, 8).map((activity, i) => {
                const IconComp = getActivityIcon(activity.type);
                const colorClass = getActivityColor(activity.type);
                return (
                  <Link
                    key={i}
                    href={activity.link || "#"}
                    className="block"
                  >
                    <div className="flex items-start gap-4 group cursor-pointer">
                      <div className="relative mt-0.5">
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${colorClass}`}
                        >
                          <IconComp size={16} />
                        </div>
                        {i !== stats.activities.length - 1 && i < 7 && (
                          <div className="absolute top-9 left-1/2 w-[1px] h-6 bg-gradient-to-b from-slate-200 to-transparent" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pb-4">
                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground/60 font-medium truncate">
                          {activity.description}
                        </p>
                        <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest mt-1">
                          {timeAgo(activity.time)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Stats Bar */}
      {(stats.totalPending > 0 || stats.overdueCount > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card rounded-[2rem] p-6 flex flex-wrap items-center gap-8"
        >
          {stats.totalPending > 0 && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-sm font-bold text-foreground">
                ₹{stats.totalPending.toLocaleString()} pending
              </span>
            </div>
          )}
          {stats.overdueCount > 0 && (
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-bold text-red-600">
                {stats.overdueCount} overdue invoice
                {stats.overdueCount > 1 ? "s" : ""}
              </span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-bold text-foreground">
              {stats.completedProjects} projects completed
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
