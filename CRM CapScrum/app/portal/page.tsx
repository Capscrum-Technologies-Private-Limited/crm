"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Briefcase, MessageSquare, ChevronRight, Activity, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";
import ProjectGauge from "@/components/portal/project-gauge";

export default function PortalPage() {
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

  const activeProject = Array.isArray(projects) 
    ? (projects.find(p => p.status !== "COMPLETED") || projects[0])
    : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 max-w-6xl mx-auto pb-20"
    >
      <div className="flex flex-col space-y-4">
        <h2 className="text-5xl font-black tracking-tight text-foreground leading-tight">
          Client <span className="text-primary">Intelligence</span>
        </h2>
        <p className="text-xl text-muted-foreground/60 max-w-2xl leading-relaxed font-medium">
          Real-time execution analytics and strategic milestone tracking for your active enterprise initiatives.
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-3">
        {/* Progress Gauge Section */}
        <div className="md:col-span-2 glass-card rounded-[3rem] shadow-2xl overflow-hidden flex flex-col relative group pt-12 pb-8 px-8">
          <div className="absolute top-0 left-0 w-full h-2 premium-gradient opacity-50" />
          
          <div className="text-center mb-4">
            <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter">
              Project <span className="text-primary">Vitality</span>
            </h3>
            <p className="text-sm text-muted-foreground/40 font-black mt-2 uppercase tracking-[0.2em]">{activeProject?.name || "Initializing Portfolio..."}</p>
          </div>

          <div className="flex flex-col items-center justify-center py-8">
            {loading ? (
              <div className="h-[300px] flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-40" />
                <span className="text-[10px] font-black text-foreground opacity-20 uppercase tracking-[0.3em]">Syncing Neural Data...</span>
              </div>
            ) : activeProject ? (
              <ProjectGauge 
                progress={activeProject.progress || 0} 
                goal={activeProject.goal || 100} 
                stretchGoal={activeProject.stretchGoal || 120} 
              />
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center space-y-6 text-center px-10">
                <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border border-slate-200 flex items-center justify-center shadow-inner">
                  <Activity size={40} className="text-muted-foreground opacity-20" />
                </div>
                <p className="text-sm text-muted-foreground/40 font-medium max-w-xs uppercase tracking-widest leading-loose">Awaiting project initialization by your strategic account lead.</p>
              </div>
            )}
            
            {/* Dynamic Summary Grid */}
            <div className="w-full mt-12 grid grid-cols-2 gap-12 border-t border-slate-200 pt-10 relative">
               <div className="absolute top-0 right-1/2 h-full w-[1px] bg-gradient-to-b from-slate-200 to-transparent" />
               <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em]">Operational Status</p>
                <div className="flex justify-center">
                  <span className={cn(
                    "px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                    activeProject?.status === "COMPLETED" 
                    ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                    : "bg-blue-50 text-blue-600 border-blue-200"
                  )}>
                    {activeProject?.status?.replace('_', ' ') || "OFFLINE"}
                  </span>
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em]">Strategic Deadline</p>
                <div className="flex flex-col items-center">
                  <p className="text-lg font-black text-foreground drop-shadow-sm">
                    {activeProject?.endDate ? new Date(activeProject.endDate).toLocaleDateString() : "TBD"}
                  </p>
                  <p className="text-[8px] font-bold text-muted-foreground/20 uppercase tracking-widest">Global Standard</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Actions/Info */}
        <div className="space-y-10">
           <div className="glass-card rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden group">
             <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
             <div className="w-20 h-20 rounded-[1.5rem] bg-slate-50 border border-slate-200 flex items-center justify-center text-primary mb-6 shadow-xl group-hover:scale-110 transition-transform">
               <MessageSquare size={32} />
             </div>
             <h4 className="text-xl font-black text-foreground mb-2 tracking-tight">Direct Support</h4>
             <p className="text-[11px] text-muted-foreground/40 font-bold leading-loose uppercase tracking-widest mb-8">Synchronous assistance required? Our lead analysts are online.</p>
             <Link href="/portal/chat" className="w-full">
               <button className="w-full h-14 rounded-2xl premium-gradient text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.03] active:scale-[0.98] transition-all">
                 Launch Secure Chat
               </button>
             </Link>
           </div>

          <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 flex items-center gap-6 shadow-lg group hover:bg-slate-100 transition-all">
             <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shadow-inner">
               <TrendingUp size={28} />
             </div>
             <div>
               <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] mb-1">Growth Index</p>
               <p className="text-2xl font-black text-foreground tracking-tighter">Accelerating</p>
             </div>
          </div>
        </div>
      </div>

      {/* Project Portfolio Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase">
            Project <span className="text-primary">Portfolio</span>
          </h3>
          <Link href="/portal/projects" className="text-[10px] font-black text-primary/60 hover:text-primary flex items-center gap-2 transition-all uppercase tracking-[0.2em]">
            Export Narrative <ChevronRight size={14} className="opacity-50" />
          </Link>
        </div>
        <div className="grid gap-6">
          {projects.length > 0 ? (
            projects.slice(0, 3).map((project, index) => (
              <motion.div 
                key={project.id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group flex items-center justify-between p-8 rounded-[2.5rem] glass-card hover:border-primary/20 transition-all cursor-pointer shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 h-full w-1 premium-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-muted-foreground/30 group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-inner">
                    <Briefcase size={28} />
                  </div>
                  <div className="space-y-2">
                    <p className="font-black text-foreground group-hover:text-primary transition-colors text-2xl tracking-tighter">{project.name}</p>
                    <div className="flex items-center gap-3">
                       <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        project.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-blue-50 text-blue-600 border-blue-200"
                       )}>
                        {project.status.replace('_', ' ')}
                      </span>
                      <span className="text-muted-foreground/20 text-xs font-bold">•</span>
                      <span className="text-muted-foreground/40 text-[10px] font-bold uppercase tracking-widest">Progress: <span className="text-primary font-black ml-1">{project.progress || 0}%</span></span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-10">
                   <div className="hidden lg:block w-48 h-2 bg-slate-100 rounded-full p-[2px] border border-slate-200 relative overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress || 0}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full premium-gradient rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
                      />
                   </div>
                   <div 
                    className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-muted-foreground/20 group-hover:text-primary group-hover:border-primary/30 transition-all shadow-xl"
                  >
                    <ChevronRight size={22} />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
             <div className="py-20 glass-card rounded-[2.5rem] border-dashed text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-muted-foreground/10">
                  <Briefcase size={32} />
                </div>
                <p className="text-sm text-muted-foreground/20 uppercase tracking-[0.3em] font-black">Portfolio Empty</p>
             </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
