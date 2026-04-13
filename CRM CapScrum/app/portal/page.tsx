"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MessageSquare, ChevronRight, Activity } from "lucide-react";
import Link from "next/link";

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

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="flex flex-col space-y-3">
        <h2 className="text-4xl font-extrabold tracking-tight text-foreground">Welcome to your Portal</h2>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Track your active project progress, view recent updates, and communicate directly with our support team.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="bg-card border-border shadow-md overflow-hidden flex flex-col">
          <div className="h-1.5 w-full bg-blue-500" />
          <CardHeader className="pb-4 pt-6">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Briefcase size={22} className="text-blue-600" />
              </div>
              My Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-6">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></span>
                Loading projects...
              </div>
            ) : projects.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 bg-muted/20 rounded-xl px-4 text-center">No active projects linked to your account yet.</p>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <div key={project.id} className="group flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all cursor-pointer">
                    <div className="space-y-1">
                      <p className="font-bold text-foreground group-hover:text-primary transition-colors">{project.name}</p>
                      <Badge variant="outline" className={getStatusColor(project.status) + " text-[10px]"}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary transition-all shadow-sm">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-md overflow-hidden flex flex-col">
          <div className="h-1.5 w-full bg-emerald-500" />
          <CardHeader className="pb-4 pt-6">
            <CardTitle className="text-xl font-bold flex items-center gap-3">
              <div className="bg-emerald-50 p-2 rounded-lg">
                <MessageSquare size={22} className="text-emerald-600" />
              </div>
              Direct Support
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
             <div className="flex-1 space-y-6">
               <div className="bg-muted/30 rounded-2xl p-6 border border-dashed border-border flex flex-col items-center text-center space-y-4 font-medium text-muted-foreground">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm max-w-[240px]">Our team is online and ready to help you with your projects.</p>
               </div>
               
               <div className="space-y-3 pt-2">
                 <p className="text-xs uppercase font-bold text-muted-foreground tracking-widest pl-1">Recent Activity</p>
                 <div className="flex items-center gap-3 p-3 rounded-lg border border-border/30 bg-muted/10 opacity-60 grayscale">
                    <Activity size={14} />
                    <span className="text-xs font-medium">New project brief uploaded</span>
                 </div>
               </div>
             </div>

             <div className="mt-8">
               <Link href="/portal/chat">
                 <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 shadow-lg shadow-primary/20">
                   Open Support Chat
                 </Button>
               </Link>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
