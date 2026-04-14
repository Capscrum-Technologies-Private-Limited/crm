"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MessageSquare, ChevronRight, Activity, TrendingUp } from "lucide-react";
import Link from "next/link";
import ProjectGauge from "@/components/portal/project-gauge";

export default function PortalPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
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

  const activeProject = projects.find(p => p.status !== "COMPLETED") || projects[0];

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col space-y-3">
        <h2 className="text-4xl font-extrabold tracking-tight text-foreground">Client Portal</h2>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed font-medium">
          Monitor your project health, track live progress milestones, and stay connected with your dedicated team.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Progress Gauge Section */}
        <Card className="md:col-span-2 bg-card border-border shadow-xl overflow-hidden flex flex-col relative group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-600" />
          <CardHeader className="pb-2 pt-8 text-center">
            <CardTitle className="text-2xl font-black text-foreground uppercase tracking-tight">Active Project Health</CardTitle>
            <p className="text-sm text-muted-foreground font-bold mt-1">{activeProject?.name || "No active projects"}</p>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : activeProject ? (
              <ProjectGauge 
                progress={activeProject.progress || 0} 
                goal={activeProject.goal || 100} 
                stretchGoal={activeProject.stretchGoal || 120} 
              />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center space-y-4 text-center px-10">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                  <Activity size={32} className="text-muted-foreground opacity-30" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Your project progress will appear here once it's initialized by our team.</p>
              </div>
            )}
            
            {/* Dynamic Summary Grid - 2 Columns */}
            <div className="w-full mt-8 grid grid-cols-2 gap-8 border-t border-border/50 pt-8 px-8">
              <div className="text-center space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</p>
                <div className="flex justify-center">
                  <Badge className={getStatusColor(activeProject?.status || "") + " border-none px-4 py-1 font-bold"}>
                    {activeProject?.status?.replace('_', ' ') || "N/A"}
                  </Badge>
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Est. Delivery</p>
                <p className="text-sm font-black text-foreground">
                  {activeProject?.endDate ? new Date(activeProject.endDate).toLocaleDateString() : "TBD"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar Actions/Info */}
        <div className="space-y-8">
           <Card className="bg-card border-border shadow-md overflow-hidden flex flex-col">
            <CardHeader className="pb-4 pt-6 border-b border-border/30 bg-muted/10">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <MessageSquare size={18} className="text-primary" />
                Direct Support
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-8 text-center space-y-6">
               <p className="text-xs text-muted-foreground font-bold leading-relaxed px-2">Our support team is currently online to assist you with any questions.</p>
               <Link href="/portal/chat">
                 <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-5 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
                   Open Support Chat
                 </Button>
               </Link>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20 shadow-sm overflow-hidden flex flex-col">
            <CardContent className="p-6 flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                 <TrendingUp size={24} />
               </div>
               <div>
                 <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Growth Index</p>
                 <p className="text-xl font-black text-foreground">Accelerating</p>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Project Portfolio Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Project Portfolio</h3>
          <Link href="/portal/projects" className="text-xs font-bold text-primary hover:underline flex items-center gap-1 transition-all">
            View All Projects <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid gap-4">
          {projects.length > 0 ? (
            projects.slice(0, 3).map((project) => (
              <div 
                key={project.id} 
                className="group flex items-center justify-between p-5 rounded-2xl bg-card border border-border/50 hover:bg-muted/30 transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <Briefcase size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-foreground group-hover:text-primary transition-colors text-lg">{project.name}</p>
                    <div className="flex items-center gap-2">
                       <Badge variant="outline" className={getStatusColor(project.status) + " text-[9px] border-none font-extrabold uppercase"}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-muted-foreground text-xs font-bold">•</span>
                      <span className="text-muted-foreground text-[11px] font-bold">Progress: {project.progress || 0}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="hidden md:block w-32 h-2 bg-muted rounded-full overflow-hidden mr-4">
                      <div className="h-full bg-primary" style={{ width: `${project.progress || 0}%` }} />
                   </div>
                   <div 
                    className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary transition-all shadow-sm"
                  >
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            ))
          ) : (
             <p className="text-sm text-muted-foreground py-10 bg-muted/20 rounded-3xl text-center font-bold">No projects available in your portfolio.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <div className={`animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} />
  );
}
