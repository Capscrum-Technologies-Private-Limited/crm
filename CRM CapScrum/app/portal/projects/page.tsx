"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Briefcase, Calendar, Clock, ExternalLink, Activity, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function PortalProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((payload) => {
        // Handle paginated response structure { data: [], totalPages: n }
        const data = Array.isArray(payload) ? payload : (payload.data || []);
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch projects:", err);
        setLoading(false);
      });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "IN_PROGRESS": return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 max-w-6xl mx-auto pb-20"
    >
      <div className="flex flex-col space-y-4">
        <Link href="/portal" className="inline-flex items-center gap-2 text-[10px] font-black text-muted-foreground/40 hover:text-primary transition-all uppercase tracking-[0.2em] group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Intelligence Matrix
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-5xl font-black tracking-tight text-foreground leading-tight uppercase tracking-tighter">
              Operational <span className="text-primary">Portfolio</span>
            </h2>
            <p className="text-lg text-muted-foreground/60 font-medium mt-2">Comprehensive lifecycle analysis for all enterprise deployments.</p>
          </div>
          <div className="px-6 py-2 rounded-full glass-card text-[10px] font-black text-primary uppercase tracking-[0.2em] shadow-xl">
            {projects.length} Secure Pulses
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        {loading ? (
          <div className="text-center py-32 flex flex-col items-center gap-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-30" />
            <span className="text-[10px] font-black text-foreground opacity-20 uppercase tracking-[0.3em]">Querying Global Repository...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-card rounded-[3rem] border-dashed py-32 flex flex-col items-center justify-center space-y-8">
            <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-muted-foreground/10">
              <Briefcase size={44} />
            </div>
            <div className="text-center">
              <p className="font-black text-3xl text-foreground tracking-tighter mb-2">Portfolio Uninitialized</p>
              <p className="text-sm text-muted-foreground/40 font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed">Contact your strategic operations lead to initialize your first initiative.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-[3rem] hover:border-primary/20 transition-all group overflow-hidden flex flex-col shadow-2xl relative"
              >
                <div className="h-2 w-full premium-gradient opacity-20 group-hover:opacity-100 transition-opacity" />
                <div className="p-10 space-y-10 flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <span className={cn(
                      "px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                      project.status === "COMPLETED" 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                      : "bg-blue-50 text-blue-600 border-blue-200"
                    )}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-muted-foreground/20 group-hover:text-primary group-hover:bg-primary/5 group-hover:border-primary/20 transition-all cursor-pointer shadow-xl">
                       <ExternalLink size={18} />
                    </div>
                  </div>

                  <h3 className="text-3xl font-black text-foreground group-hover:text-primary transition-colors tracking-tighter leading-[1.1]">
                    {project.name}
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">
                      <span>Phase Performance</span>
                      <span className="text-primary">{project.progress || 0}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full p-[3px] border border-slate-200 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress || 0}%` }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                        className="h-full premium-gradient rounded-full shadow-[0_0_12px_rgba(59,130,246,0.3)]" 
                      />
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground/60 leading-relaxed flex-1 font-medium">
                    {project.description || "Strategic narrative pending for this operational pulse."}
                  </p>
                  
                  <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 relative">
                    <div className="absolute top-0 right-1/2 h-full w-[1px] bg-gradient-to-b from-slate-200 to-transparent" />
                    <div className="space-y-1.5 px-2">
                      <p className="text-[9px] uppercase font-black text-muted-foreground/20 tracking-[0.3em]">Deployment</p>
                      <div className="flex items-center gap-2 text-xs text-foreground/80 font-black">
                        <Calendar size={14} className="text-primary opacity-60" />
                        <span>{new Date(project.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5 px-2 text-right">
                      <p className="text-[9px] uppercase font-black text-muted-foreground/20 tracking-[0.3em]">Target Apex</p>
                      <div className="flex items-center gap-2 text-xs text-foreground/80 font-black justify-end">
                        <span className={project.endDate ? "text-foreground" : "text-muted-foreground/40 font-bold"}>
                          {project.endDate ? new Date(project.endDate).toLocaleDateString() : "TBD"}
                        </span>
                        <Clock size={14} className="text-primary opacity-60" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
