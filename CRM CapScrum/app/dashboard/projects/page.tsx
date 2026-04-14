"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, Calendar, Clock, ExternalLink, Loader2, Settings2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Creation Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    clientId: "",
    status: "IN_PROGRESS",
    startDate: new Date().toISOString().split('T')[0],
    endDate: ""
  });

  // Update Form State
  const [updateData, setUpdateData] = useState({
    status: "",
    progress: 0,
    goal: 100,
    stretchGoal: 120,
    endDate: ""
  });

  const fetchProjects = () => {
    setLoading(true);
    fetch(`/api/projects?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      });
  };

  const fetchClients = () => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => setClients(data));
  };

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setOpen(false);
        setFormData({
          name: "",
          description: "",
          clientId: "",
          status: "IN_PROGRESS",
          startDate: new Date().toISOString().split('T')[0],
          endDate: ""
        });
        fetchProjects();
      }
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
      });
      
      if (res.ok) {
        setUpdateOpen(false);
        fetchProjects();
      }
    } catch (error) {
      console.error("Error updating project:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const openUpdateDialog = (project: any) => {
    setSelectedProject(project);
    setUpdateData({
      status: project.status,
      progress: project.progress || 0,
      goal: project.goal || 100,
      stretchGoal: project.stretchGoal || 120,
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : ""
    });
    setUpdateOpen(true);
  };

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
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              <Plus className="mr-2 h-4 w-4" /> Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-foreground">Project Name</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                  placeholder="e.g. Website Redesign"
                  className="bg-background border-input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-foreground">Description</Label>
                <textarea 
                  id="description" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
                  placeholder="Describe the project goals and scope..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="clientId" className="text-foreground">Select Client</Label>
                <select 
                  id="clientId" 
                  value={formData.clientId}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                  required
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
                >
                  <option value="">Select a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.companyName} ({client.contactPerson})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate" className="text-foreground">Start Date</Label>
                  <Input 
                    id="startDate" 
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                    className="bg-background border-input"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate" className="text-foreground">End Date (Optional)</Label>
                  <Input 
                    id="endDate" 
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="bg-background border-input"
                  />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" disabled={submitting || !formData.clientId} className="w-full">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : "Create Project"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Update Progress Dialog */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent className="sm:max-w-[425px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Update {selectedProject?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-6 pt-4">
            <div className="grid gap-3">
              <Label className="text-foreground">Project Status</Label>
              <select 
                value={updateData.status}
                onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            
            <div className="grid gap-3">
              <div className="flex justify-between items-center">
                <Label className="text-foreground">Progress Completion (%)</Label>
                <span className="text-sm font-bold text-primary">{updateData.progress}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={updateData.progress}
                onChange={(e) => setUpdateData({...updateData, progress: parseInt(e.target.value)})}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary"
                style={{
                  background: `linear-gradient(to right, hsl(var(--primary)) ${updateData.progress}%, hsl(var(--muted)) ${updateData.progress}%)`
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label className="text-foreground">Target Goal</Label>
                <Input 
                  type="number"
                  value={updateData.goal}
                  onChange={(e) => setUpdateData({...updateData, goal: parseInt(e.target.value)})}
                  className="bg-background border-input"
                />
              </div>
              <div className="grid gap-3">
                <Label className="text-foreground">Stretch Goal</Label>
                <Input 
                  type="number"
                  value={updateData.stretchGoal}
                  onChange={(e) => setUpdateData({...updateData, stretchGoal: parseInt(e.target.value)})}
                  className="bg-background border-input"
                />
              </div>
            </div>

            <div className="grid gap-3">
              <Label className="text-foreground">Updated Delivery Date</Label>
              <Input 
                type="date"
                value={updateData.endDate}
                onChange={(e) => setUpdateData({...updateData, endDate: e.target.value})}
                className="bg-background border-input"
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={submitting} className="w-full shadow-lg shadow-primary/20">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
              <Button variant="outline" className="border-border" onClick={() => setOpen(true)}>Add Project</Button>
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
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5" 
                        onClick={() => openUpdateDialog(project)}
                        aria-label="Update project status"
                      >
                         <Settings2 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" aria-label="View project details">
                         <ExternalLink size={16} />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {project.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 flex-1 flex flex-col">
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <span>Progress</span>
                      <span className="text-primary font-extrabold">{project.progress || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500 ease-in-out" 
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed h-10">
                    {project.description || "No description provided."}
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
