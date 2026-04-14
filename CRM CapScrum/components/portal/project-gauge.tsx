"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ProjectGaugeProps {
  progress: number;
  goal: number;
  stretchGoal: number;
}

export default function ProjectGauge({ progress, goal, stretchGoal }: ProjectGaugeProps) {
  const [hasMounted, setHasMounted] = useState(false);

  // Normalize progress to max of stretchGoal for the chart
  const maxVal = stretchGoal > 0 ? stretchGoal : 120;
  const currentVal = Math.min(progress, maxVal);
  
  const data = [
    { value: currentVal },
    { value: Math.max(0, maxVal - currentVal) }
  ];

  const COLORS = ["#4F46E5", "#E5E7EB"]; // Indigo-600 and Gray-200

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <div className="w-full aspect-square max-w-[300px] mx-auto bg-muted/20 animate-pulse rounded-full" />;
  }

  return (
    <div className="relative w-full aspect-square max-w-[300px] min-h-[250px] mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={225}
            endAngle={-45}
            innerRadius="75%"
            outerRadius="95%"
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={index === 0 ? 10 : 0} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
        <div className="flex items-baseline gap-1">
          <span className="text-6xl font-black text-foreground">{progress}</span>
          <span className="text-xl font-bold text-muted-foreground">%</span>
        </div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">Current Progress</p>
      </div>

      {/* Markers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Goal Marker (usually at 100%) */}
        <div className="absolute top-[85%] left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-1.5 h-3 bg-foreground rounded-full mb-1" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase">{goal}% Goal</span>
        </div>
      </div>
    </div>
  );
}
