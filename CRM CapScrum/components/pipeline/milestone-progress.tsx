"use client";

import { motion } from "framer-motion";
import { Check, Dot, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Milestone {
  id: string;
  label: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isTerminal?: "WON" | "LOST" | null;
}

interface MilestoneProgressProps {
  milestones: Milestone[];
  currentIdx: number;
}

export function MilestoneProgress({ milestones, currentIdx }: MilestoneProgressProps) {
  return (
    <div className="relative flex items-center justify-between w-full py-2">
      {/* Background Track */}
      <div className="absolute h-[2px] bg-slate-100 left-0 right-0 top-1/2 -translate-y-1/2 rounded-full" />
      
      {/* Progress Track */}
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(currentIdx / (milestones.length - 1)) * 100}%` }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="absolute h-[2px] premium-gradient left-0 top-1/2 -translate-y-1/2 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
      />

      {milestones.map((ms, idx) => {
        const isPast = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isFuture = idx > currentIdx;
        const isLast = idx === milestones.length - 1;

        return (
          <div key={ms.id} className="relative flex flex-col items-center">
            {/* The Node */}
            <motion.div
              initial={false}
              animate={{
                scale: isCurrent ? 1.25 : 1,
                backgroundColor: isPast || (isCurrent && ms.isTerminal !== "LOST") ? "var(--primary-hex, #3b82f6)" : "#fff",
                borderColor: (isPast || isCurrent) ? "var(--primary-hex, #3b82f6)" : "#e2e8f0",
              }}
              className={cn(
                "w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 transition-colors shadow-sm",
                isCurrent && "shadow-lg shadow-primary/30 ring-4 ring-primary/20",
                ms.isTerminal === "LOST" && isCurrent && "bg-red-500 border-red-500 ring-red-500/20",
                ms.isTerminal === "WON" && isCurrent && "bg-emerald-500 border-emerald-500 ring-emerald-500/20"
              )}
            >
              {isPast ? (
                <Check className="text-white w-5 h-5" strokeWidth={3} />
              ) : isCurrent ? (
                ms.isTerminal === "LOST" ? (
                  <X className="text-white w-5 h-5" strokeWidth={3} />
                ) : ms.isTerminal === "WON" ? (
                  <Check className="text-white w-5 h-5" strokeWidth={3} />
                ) : (
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-3 h-3 bg-white rounded-full" 
                  />
                )
              ) : (
                <div className="w-2 h-2 bg-slate-200 rounded-full" />
              )}
            </motion.div>

            {/* Label */}
            <div className="absolute -bottom-8 whitespace-nowrap">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-all",
                isPast && "text-muted-foreground/60",
                isCurrent && "text-foreground",
                isFuture && "text-muted-foreground/30",
                ms.isTerminal === "WON" && isCurrent && "text-emerald-600",
                ms.isTerminal === "LOST" && isCurrent && "text-red-600"
              )}>
                {ms.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
