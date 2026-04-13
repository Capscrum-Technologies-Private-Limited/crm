"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, Calendar, Clock, ExternalLink } from "lucide-react";

export default function ProjectsPage() {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Projects</h2>
          <p className="text-muted-foreground">Manage deliverables and project timelines.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
          <Plus className="mr-2 h-4 w-4" /> Create Project
        </Button>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <Card className="bg-muted/30 border-border border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Briefcase size={32} />
              </div>
              <div className="text-center">
                <p className="font-bold text-lg text-foreground">No projects found</p>
                <p className="text-sm text-muted-foreground">Get started by creating your first project.</p>
              </div>
              <Button variant="outline" className="border-border">Add Project</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="bg-card border-border hover:shadow-lg transition-all group overflow-hidden flex flex-col">
                <div className="h-1.5 w-full bg-primary opacity-20 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className={getStatusColor(project.status) + " px-2 py-0"}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                       <ExternalLink size={16} />
                    </Button>
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {project.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {project.description || "No description provided. Click to add project details and scope."}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-border/50 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Start Date</p>
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                        <Calendar size={14} className="text-primary" />
                        <span>{new Date(project.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Client</p>
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-bold">
                        <Briefcase size={14} className="text-blue-600" />
                        <span className="truncate">{project.client.companyName}</span>
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
