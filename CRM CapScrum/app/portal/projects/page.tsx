"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, Clock, ExternalLink, Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PortalProjectsPage() {
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

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col space-y-4">
        <Link href="/portal" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-foreground uppercase tracking-widest">Project Portfolio</h2>
            <p className="text-muted-foreground font-medium mt-1">Detailed view of all your active and archive projects.</p>
          </div>
          <Badge variant="secondary" className="bg-muted text-muted-foreground py-1 px-3">
            {projects.length} Total Projects
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            Loading your projects...
          </div>
        ) : projects.length === 0 ? (
          <Card className="bg-muted/20 border-border border-dashed py-20">
            <CardContent className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground opacity-30">
                <Briefcase size={32} />
              </div>
              <p className="font-bold text-lg text-foreground">No projects found</p>
              <p className="text-sm text-muted-foreground">Contact your account manager to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="bg-card border-border hover:shadow-xl transition-all group overflow-hidden flex flex-col">
                <div className="h-1.5 w-full bg-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className={getStatusColor(project.status) + " px-2 py-0 border-none font-black text-[10px] uppercase"}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                       <ExternalLink size={14} />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {project.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 flex-1 flex flex-col">
                  {/* Progress Bar */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                      <span>Completion</span>
                      <span className="text-primary">{project.progress || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-1000 ease-in-out" 
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                    {project.description || "No description provided."}
                  </p>
                  
                  <div className="pt-6 border-t border-border/50 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Start Date</p>
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-bold">
                        <Calendar size={13} className="text-primary" />
                        <span>{new Date(project.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">Target Date</p>
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-bold justify-end">
                        <span className={project.endDate ? "text-foreground" : "text-muted-foreground"}>
                          {project.endDate ? new Date(project.endDate).toLocaleDateString() : "TBD"}
                        </span>
                        <Clock size={13} className="text-blue-500" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
