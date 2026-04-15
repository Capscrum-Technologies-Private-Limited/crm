"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ProjectGaugeProps {
  progress: number;
  goal: number;
  stretchGoal: number;
}

export default function ProjectGauge({ progress, goal, stretchGoal }: ProjectGaugeProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <div className="w-full aspect-square max-w-[300px] mx-auto bg-slate-100 animate-pulse rounded-full" />;
  }

  // Circular Gauge Calculations
  const size = 300;
  const strokeWidth = 24;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  
  // We use a 270 degree arc (from 135 to 405)
  const arcLength = 0.75; 
  const totalOffset = circumference * (1 - arcLength);
  const activeCircumference = circumference * arcLength;
  
  const percentage = Math.min(progress, 150); // Allow some overflow for visual effect
  const progressOffset = activeCircumference * (1 - percentage / 100);

  return (
    <div className="relative w-full aspect-square max-w-[300px] mx-auto group">
      {/* Decorative Glow */}
      <div className="absolute inset-0 bg-primary/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      
      <svg 
        viewBox={`0 0 ${size} ${size}`} 
        className="w-full h-full -rotate-[225deg] filter drop-shadow-[0_0_20px_rgba(59,130,246,0.08)]"
      >
        {/* Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.05)"
          strokeWidth={strokeWidth}
          strokeDasharray={activeCircumference}
          strokeDashoffset={0}
          strokeLinecap="round"
        />
        
        {/* Progress Path */}
        <motion.circle
          initial={{ strokeDashoffset: activeCircumference }}
          animate={{ strokeDashoffset: progressOffset }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#premium-gauge-gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={activeCircumference}
          strokeLinecap="round"
          className="drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]"
        />

        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="premium-gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(280, 65%, 60%)" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center Intelligence Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="flex items-baseline gap-1"
        >
          <span className="text-7xl font-black text-foreground tracking-tighter drop-shadow-2xl">
            {progress}
          </span>
          <span className="text-xl font-black text-primary">%</span>
        </motion.div>
        
        <div className="mt-2 flex flex-col items-center">
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] ml-1">
            Performance Index
          </p>
          <div className="h-1 w-12 bg-slate-200 rounded-full mt-3 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 1 }}
              className="h-full premium-gradient" 
            />
          </div>
        </div>
      </div>

      {/* Dynamic Markers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[85%] left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mb-2 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
          <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">
            Baseline Goal: {goal}%
          </span>
        </div>
      </div>
    </div>
  );
}
