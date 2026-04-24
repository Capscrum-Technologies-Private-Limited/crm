"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  CheckCircle2,
  Circle,
  Building2,
  Clock,
  ArrowRight,
  Briefcase,
  GitGraph,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PipelineStage {
  id: string;
  name: string;
  description: string | null;
  percentage: number;
  order: number;
  isCompleted: boolean;
  completedAt: string | null;
  projectId?: string | null;
}

interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  status: string;
  projects: {
    id: string;
    name: string;
    status: string;
    progress: number;
  }[];
  pipelineStages: PipelineStage[];
}

export default function PortalRoadmapPage() {
  const [clientData, setClientData] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRoadmap = async () => {
    try {
      const res = await fetch("/api/pipeline");
      if (!res.ok) throw new Error("Failed to fetch roadmap");
      const data = await res.json();
      // The API now returns an array with just the client's data if role is CLIENT
      if (Array.isArray(data) && data.length > 0) {
        setClientData(data[0]);
      }
    } catch (e) {
      console.error("Roadmap fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin opacity-40" />
        <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.3em]">
          Syncing Strategic Path...
        </span>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 glass-card rounded-2xl border-dashed">
        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
          <GitGraph size={40} className="text-muted-foreground/20" />
        </div>
        <h3 className="text-2xl font-black text-foreground tracking-tight">No Roadmap Found</h3>
        <p className="text-muted-foreground text-sm font-medium mt-2 max-w-xs">
          Your strategic onboarding and project roadmaps haven't been initialized yet.
        </p>
      </div>
    );
  }

  const totalProgress = clientData.pipelineStages
    .filter(s => s.isCompleted)
    .reduce((sum, s) => sum + s.percentage, 0);

  return (
    <div className="space-y-10 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-5xl font-black tracking-tighter text-foreground uppercase">
            Strategic <span className="text-primary">Roadmap</span>
          </h2>
          <p className="text-lg text-muted-foreground/60 font-medium">
            Real-time visual path for <span className="text-foreground font-black uppercase tracking-tight">{clientData.companyName}</span>
          </p>
        </div>
        <div className="text-right glass-card px-8 py-4 rounded-2xl shadow-xl">
          <p className="text-4xl font-black text-primary leading-none tracking-tighter">
            {totalProgress}%
          </p>
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mt-1.5">
            Global Completion
          </p>
        </div>
      </div>

      {/* Main Roadmap Area */}
      <div className="space-y-12">
        {clientData.pipelineStages.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-2xl border-dashed">
             <p className="text-sm font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
               Operational stages pending initialization
             </p>
          </div>
        ) : (
          <div className="flex flex-col gap-16">
            {/* Group stages by Project ID */}
            {(() => {
              const projectGroups = clientData.pipelineStages.reduce((groups: any, stage) => {
                const pId = stage.projectId || "general";
                if (!groups[pId]) groups[pId] = [];
                groups[pId].push(stage);
                return groups;
              }, {});

              return Object.entries(projectGroups).map(([pId, stages]: [string, any]) => {
                const project = clientData.projects.find(p => p.id === pId);
                
                return (
                  <motion.div 
                    key={pId} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-slate-100" />
                      <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-white border border-slate-100 shadow-sm">
                        {pId === "general" ? (
                          <>
                            <Users size={14} className="text-slate-400" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Corporate Onboarding</span>
                          </>
                        ) : (
                          <>
                            <Briefcase size={14} className="text-primary" />
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">{project?.name || "Active Initiative"}</span>
                          </>
                        )}
                      </div>
                      <div className="h-px flex-1 bg-slate-100" />
                    </div>

                    <div className="relative">
                      {/* Desktop Flow Path */}
                      <div className="hidden lg:block absolute top-[52px] left-0 right-0 h-0.5 bg-slate-100/50 -z-0" />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                        {stages.map((stage: any, index: number) => {
                          const isFirstPending = !stage.isCompleted && (index === 0 || stages[index-1].isCompleted);
                          const isLastOverall = index === stages.length - 1;

                          return (
                            <div key={stage.id} className="relative group/stage-container">
                              <motion.div
                                whileHover={{ y: -4 }}
                                className={cn(
                                  "p-6 rounded-2xl border transition-all duration-500 flex flex-col justify-between min-h-[160px] relative overflow-hidden",
                                  stage.isCompleted 
                                    ? "bg-white border-emerald-100 shadow-sm" 
                                    : isFirstPending
                                      ? "bg-white border-primary/30 shadow-2xl shadow-primary/5 ring-1 ring-primary/10"
                                      : "bg-white border-slate-100 shadow-sm"
                                )}
                              >
                                {/* Active Accent */}
                                {isFirstPending && (
                                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                                )}

                                <div className="flex items-start justify-between gap-4 mb-4">
                                  <div className="flex items-center gap-4 min-w-0">
                                    <div className={cn(
                                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                                      stage.isCompleted 
                                        ? "bg-emerald-50 text-emerald-500 scale-110 shadow-inner" 
                                        : isFirstPending
                                          ? "bg-primary/10 text-primary animate-pulse shadow-inner"
                                          : "bg-slate-50 text-slate-300"
                                    )}>
                                      {stage.isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className={cn(
                                        "text-base font-black tracking-tight truncate leading-tight uppercase",
                                        stage.isCompleted ? "text-emerald-900/60" : "text-slate-900"
                                      )}>
                                        {stage.name}
                                      </h4>
                                      <div className="flex items-center gap-2 mt-1.5">
                                        <span className={cn(
                                          "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                                          stage.isCompleted ? "bg-emerald-50 text-emerald-600/60" : "bg-slate-50 text-slate-400"
                                        )}>
                                          {stage.percentage}% Weight
                                        </span>
                                        {isFirstPending && (
                                          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">
                                            ACTIVE
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="mt-auto">
                                  {stage.description ? (
                                    <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed italic">
                                      "{stage.description}"
                                    </p>
                                  ) : (
                                    <div className="h-4" /> 
                                  )}

                                  {stage.isCompleted && stage.completedAt && (
                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-emerald-50/50">
                                      <Clock size={12} className="text-emerald-400" />
                                      <p className="text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.2em]">
                                        Validated {new Date(stage.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </motion.div>

                              {/* Flow Connector */}
                              {!isLastOverall && (
                                <div className={cn(
                                  "hidden lg:flex absolute -right-4 top-[60px] -translate-y-1/2 w-9 h-9 rounded-full items-center justify-center bg-white border z-20 transition-all duration-500 shadow-md",
                                  stage.isCompleted ? "border-emerald-200 text-emerald-500" : "border-slate-100 text-slate-200"
                                )}>
                                  <ArrowRight size={16} className={cn(stage.isCompleted && "animate-pulse")} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                );
              });
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
