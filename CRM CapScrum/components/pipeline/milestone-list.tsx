"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  ChevronLeft, 
  MoreVertical, 
  Building2, 
  DollarSign,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  LucideIcon,
  Pencil,
  Trash2,
  XCircle,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Client {
  id: string;
  companyName: string;
}

interface Pipeline {
  id: string;
  clientId: string;
  stage: string;
  value: number;
  client?: Client;
}

interface MilestoneListProps {
  initialDeals: Pipeline[];
  stages: string[];
  stageLabels: Record<string, string>;
  stageMetrics: Record<string, { color: string, icon: LucideIcon }>;
  onDealMove: (dealId: string, newStage: string) => void;
  onEdit: (deal: Pipeline) => void;
}

export function MilestoneList({ 
  initialDeals, 
  stages, 
  stageLabels, 
  stageMetrics,
  onDealMove,
  onEdit
}: MilestoneListProps) {

  // Robust index matching with normalization
  const getStageIndex = (stage: string) => {
    if (!stage) return 0;
    const normalized = stage.trim().toUpperCase();
    const idx = stages.indexOf(normalized);
    return idx === -1 ? -2 : idx; // -2 denotes unknown/custom stage
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {initialDeals.map((deal) => {
          const currentStageIndex = getStageIndex(deal.stage);
          const isLost = deal.stage === "LOST";
          const isWon = deal.stage === "WON";
          const isTerminal = isLost || isWon;
          
          return (
            <motion.div
              key={deal.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={cn(
                "glass-card rounded-[2rem] p-4 md:p-6 border-slate-100/10 hover:border-primary/20 transition-all group relative overflow-hidden",
                isLost && "border-rose-100/20 bg-rose-50/5",
                isWon && "border-emerald-100/20 bg-emerald-50/5"
              )}
            >
              {/* Background Glow */}
              <div className={cn(
                "absolute top-0 right-0 w-32 h-full opacity-[0.03] pointer-events-none transition-colors",
                isLost ? "bg-rose-500" : isWon ? "bg-emerald-500" : stageMetrics[deal.stage]?.color.replace('text-', 'bg-')
              )} />

              <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr_auto] items-center gap-8 relative z-10">
                {/* 1. Client Info - Anchored */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                    isLost ? "bg-rose-500/10 text-rose-500" : isWon ? "bg-emerald-500/10 text-emerald-500" : 
                    (stageMetrics[deal.stage]?.color.replace('text-', 'bg-').replace('-500', '-500/10') || "bg-slate-100 text-slate-500"),
                    stageMetrics[deal.stage]?.color
                  )}>
                    {isLost ? <XCircle size={24} /> : isWon ? <Trophy size={24} /> : <Building2 size={24} />}
                  </div>
                  <div>
                    <h4 className="font-black text-foreground text-base tracking-tight leading-tight mb-0.5 truncate max-w-[180px]">
                      {deal.client?.companyName || "Private Entity"}
                    </h4>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-primary uppercase tracking-[0.1em]">
                         ₹{(deal.value).toLocaleString('en-IN')}
                       </span>
                       <span className="w-1 h-1 rounded-full bg-slate-300" />
                       <span className={cn(
                         "text-[10px] font-bold uppercase",
                         isLost ? "text-rose-500" : isWon ? "text-emerald-500" : "text-muted-foreground"
                       )}>
                         {stageLabels[deal.stage] || deal.stage}
                       </span>
                    </div>
                  </div>
                </div>

                {/* 2. Milestone Ribbon - Liquid Fluidity */}
                <div className={cn(
                  "w-full overflow-x-auto no-scrollbar py-4 px-1 transition-opacity",
                  isTerminal && "opacity-40 grayscale-[0.5]"
                )}>
                  <div className="flex gap-2 min-w-0">
                    {stages.filter(s => s !== "LOST" && s !== "WON").map((stage, idx) => {
                      const isCompleted = currentStageIndex === -2 ? false : idx < currentStageIndex;
                      const isActive = idx === currentStageIndex;
                      const isUpcoming = idx > currentStageIndex || currentStageIndex === -2;
                      const metric = stageMetrics[stage];

                      return (
                        <div 
                          key={stage}
                          className="flex-1 group/segment relative min-w-[30px]"
                        >
                          <button
                            onClick={() => !isTerminal && onDealMove(deal.id, stage)}
                            type="button"
                            title={stageLabels[stage]}
                            disabled={isTerminal}
                            className={cn(
                              "w-full h-3 rounded-full transition-all duration-500 relative overflow-hidden ring-offset-2 hover:ring-2 hover:ring-slate-200 cursor-pointer",
                              isCompleted && (metric?.color.replace('text-', 'bg-') || "bg-primary"),
                              isActive && (metric?.color.replace('text-', 'bg-').replace('-500', '-500/20') || "bg-primary/20"),
                              isUpcoming && "bg-slate-100 hover:bg-slate-200",
                              isLost && isUpcoming && "bg-rose-50",
                              isWon && isUpcoming && "bg-emerald-50"
                            )}
                          >
                            {isActive && !isTerminal && (
                              <motion.div 
                                layoutId={`pulse-${deal.id}`}
                                className={cn("absolute inset-0", metric?.color.replace('text-', 'bg-'))}
                                animate={{ opacity: [0.4, 0.8, 0.4] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            )}
                          </button>
                          
                          {/* Label on Hover */}
                          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/segment:opacity-100 transition-all pointer-events-none z-50 transform translate-y-2 group-hover/segment:translate-y-0">
                            <span className="text-[10px] font-black uppercase tracking-tight text-white bg-slate-900 px-2.5 py-1.5 rounded-lg shadow-xl shadow-slate-900/10">
                              {stageLabels[stage]}
                            </span>
                            <div className="w-2 h-2 bg-slate-900 rotate-45 mx-auto -mt-1" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Actions - Anchored */}
                <div className="flex items-center gap-4 flex-shrink-0 ml-auto xl:ml-0">
                  {!isTerminal && (
                    <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100 shadow-inner">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentStageIndex > 0) {
                            onDealMove(deal.id, stages[currentStageIndex - 1]);
                          }
                        }}
                        disabled={currentStageIndex <= 0}
                        type="button"
                        className="p-2 hover:bg-white hover:text-primary hover:shadow-sm rounded-lg transition-all disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <div className="w-px h-5 bg-slate-200 mx-1" />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Stop move before terminal stages LOST/WON
                          if (currentStageIndex >= 0 && currentStageIndex < stages.length - 3) {
                            onDealMove(deal.id, stages[currentStageIndex + 1]);
                          }
                        }}
                        disabled={currentStageIndex >= stages.length - 3}
                        type="button"
                        className="p-2 hover:bg-white hover:text-primary hover:shadow-sm rounded-lg transition-all disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}

                  {isLost && (
                    <div className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-500/20">
                      Closed: Lost
                    </div>
                  )}
                  {isWon && (
                    <div className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                      Goal Achieved
                    </div>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer">
                        <MoreVertical size={20} className="text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px] rounded-2xl p-2 shadow-2xl border-slate-100">
                      <DropdownMenuItem 
                        onClick={() => onEdit(deal)}
                        className="cursor-pointer font-bold text-sm rounded-xl h-10 px-3 flex items-center gap-2"
                      >
                        <Pencil size={16} className="text-blue-500" />
                        <span>Edit Parameters</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => !isWon && onDealMove(deal.id, "WON")}
                        className="cursor-pointer font-bold text-sm rounded-xl h-10 px-3 flex items-center gap-2 text-emerald-600"
                      >
                        <Trophy size={16} />
                        <span>Mark as Won</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => !isLost && onDealMove(deal.id, "LOST")}
                        className="cursor-pointer font-bold text-sm rounded-xl h-10 px-3 flex items-center gap-2 text-rose-600"
                      >
                        <XCircle size={16} />
                        <span>Mark as Lost</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
