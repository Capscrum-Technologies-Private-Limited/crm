"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
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

interface Client {
  id: string;
  companyName: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  goal: number;
  stretchGoal: number;
  startDate: string;
  endDate: string;
  client: Client;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Creation Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    clientId: "",
    status: "IN_PROGRESS",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    totalValue: "",
    advanceAmount: ""
  });

  // Update Form State
  const [updateData, setUpdateData] = useState({
    status: "",
    progress: 0,
    goal: 100,
    stretchGoal: 120,
    endDate: ""
  });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects?page=${page}&t=${Date.now()}`);
      const payload = await res.json();
      setProjects(Array.isArray(payload.data) ? payload.data : []);
      setTotalPages(payload.totalPages || 1);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = () => {
    fetch("/api/clients?all=true")
      .then((res) => res.json())
      .then((data) => setClients(data));
  };

  useEffect(() => {
    fetchProjects();
  }, [page]);

  useEffect(() => {
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
        fetchProjects();
      }
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetFormData = () => {
    setFormData({
      name: "",
      description: "",
      clientId: "",
      status: "IN_PROGRESS",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      totalValue: "",
      advanceAmount: ""
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (!selectedProject) return;
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

  const openUpdateDialog = (project: Project) => {
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">
            Project <span className="text-primary">Deliverables</span>
          </h2>
          <p className="text-muted-foreground text-lg font-medium">Manage complex execution timelines and high-stakes deliverables.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="px-8 py-4 rounded-2xl premium-gradient text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2">
              <Plus size={20} />
              <span>Launch New Project</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] !bg-white border-slate-200 rounded-[2.5rem] p-8 shadow-2xl">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black text-foreground">Project <span className="text-primary">Genesis</span></DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Project Identifier</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                  placeholder="e.g. Q4 Growth Campaign"
                  className="h-14 bg-slate-50 border-slate-200 rounded-2xl text-foreground focus:border-primary/50 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Strategic Scope</Label>
                <textarea 
                  id="description" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full min-h-[120px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all font-medium placeholder:text-muted-foreground/30"
                  placeholder="Define key milestones and success criteria..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientId" className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Client Partner</Label>
                <select 
                  id="clientId" 
                  value={formData.clientId}
                  onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                  required
                  className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl text-foreground px-4 focus:border-primary/50 transition-all appearance-none outline-none"
                >
                  <option value="">Assign to client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.companyName}
                    </option>
                  ))}
                </select>
              </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Project Value (₹)</Label>
                    <Input 
                      type="number"
                      value={formData.totalValue}
                      onChange={(e) => setFormData({...formData, totalValue: e.target.value})}
                      placeholder="Total Contract Value"
                      className="h-12 bg-slate-50 border-slate-200 rounded-xl text-foreground font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Advance Required (₹)</Label>
                    <Input 
                      type="number"
                      value={formData.advanceAmount}
                      onChange={(e) => setFormData({...formData, advanceAmount: e.target.value})}
                      placeholder="Down Payment"
                      className="h-12 bg-slate-50 border-slate-200 rounded-xl text-foreground font-medium"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Kickoff Date</Label>
                    <Input 
                      id="startDate" 
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      required
                      className="h-12 bg-slate-50 border-slate-200 rounded-xl text-foreground font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Delivery Deadline</Label>
                    <Input 
                      id="endDate" 
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="h-12 bg-slate-50 border-slate-200 rounded-xl text-foreground font-medium"
                    />
                  </div>
                </div>
              <DialogFooter className="pt-6">
                <button 
                  type="submit" 
                  disabled={submitting || !formData.clientId} 
                  className="w-full h-14 rounded-2xl premium-gradient text-white font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : "Initiate Execution"}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-8">
        {loading ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-50" />
            <span className="text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Syncing Global Portfolio...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-card rounded-[2.5rem] border-dashed flex flex-col items-center justify-center py-24 space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-muted-foreground/40">
              <Briefcase size={40} />
            </div>
            <div className="text-center">
              <p className="font-extrabold text-2xl text-foreground mb-2">No Active Deployments</p>
              <p className="text-muted-foreground/60 font-medium max-w-sm mx-auto">Your project portfolio is currently quiet. Start by launching a new initiative.</p>
            </div>
            <button onClick={() => setOpen(true)} className="px-6 py-3 rounded-xl bg-slate-100 border border-slate-200 text-foreground font-bold text-xs hover:bg-slate-200 transition-all">Add First Project</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card rounded-[2.5rem] hover:border-primary/30 transition-all group overflow-hidden flex flex-col shadow-2xl"
              >
                <div className="h-2 w-full premium-gradient opacity-30 group-hover:opacity-100 transition-opacity" />
                <div className="p-8 space-y-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border",
                      project.status === "COMPLETED" 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                      : "bg-blue-50 text-blue-600 border-blue-200"
                    )}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openUpdateDialog(project)}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-muted-foreground/60 hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all"
                      >
                         <Settings2 size={16} />
                      </button>
                      <button className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-muted-foreground/60 hover:text-foreground transition-all">
                         <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors leading-[1.1] h-14 overflow-hidden line-clamp-2">
                    {project.name}
                  </h3>

                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between text-[11px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                      <span>Phase Completion</span>
                      <span className="text-primary">{project.progress || 0}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full p-[3px] border border-slate-200">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress || 0}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full premium-gradient rounded-full shadow-[0_0_12px_rgba(59,130,246,0.3)]" 
                      />
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground/60 font-medium line-clamp-2 leading-relaxed h-[3.5rem] mt-2">
                    {project.description || "No strategic scope defined for this deployment."}
                  </p>
                  
                  <div className="mt-8 pt-8 border-t border-slate-200 grid grid-cols-2 gap-6 relative">
                    <div className="absolute top-0 right-0 h-full w-[1px] bg-gradient-to-b from-slate-200 via-slate-200 to-transparent left-1/2 -ml-[0.5px]" />
                    <div className="space-y-1.5 px-2">
                      <p className="text-[10px] uppercase font-black text-muted-foreground/30 tracking-[0.2em]">Delivery</p>
                      <div className="flex items-center gap-2 text-xs text-foreground/80 font-bold">
                        <Calendar size={14} className="text-primary opacity-60" />
                        <span>{new Date(project.startDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5 px-2">
                      <p className="text-[10px] uppercase font-black text-muted-foreground/30 tracking-[0.2em]">Partner</p>
                      <div className="flex items-center gap-2 text-xs text-foreground/80 font-bold">
                        <Briefcase size={14} className="text-primary opacity-60" />
                        <span className="truncate">{project.client.companyName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Update Progress Dialog - Bespoke Style */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent className="sm:max-w-[500px] !bg-white border-slate-200 rounded-[2.5rem] p-8 shadow-2xl">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-black text-foreground">Status <span className="text-primary">Update</span></DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-8">
            <div className="space-y-3">
              <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Current Lifecycle</Label>
              <select 
                value={updateData.status}
                onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl text-foreground px-4 outline-none appearance-none"
              >
                <option value="PENDING">Strategic Planning</option>
                <option value="IN_PROGRESS">Active Execution</option>
                <option value="COMPLETED">Successfully Deployed</option>
              </select>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Milestone Progress</Label>
                <span className="text-xl font-black text-primary">{updateData.progress}%</span>
              </div>
              <div className="relative pt-2">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={updateData.progress}
                  onChange={(e) => setUpdateData({...updateData, progress: parseInt(e.target.value)})}
                  className="w-full h-3 rounded-full appearance-none cursor-pointer bg-slate-100 accent-primary transition-all active:scale-[0.98]"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--primary)) ${updateData.progress}%, rgb(241 245 249) ${updateData.progress}%)`
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Asset Goal</Label>
                <Input 
                  type="number"
                  value={updateData.goal}
                  onChange={(e) => setUpdateData({...updateData, goal: parseInt(e.target.value)})}
                  className="h-12 bg-slate-50 border-slate-200 rounded-xl text-foreground font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Peak Stretch</Label>
                <Input 
                  type="number"
                  value={updateData.stretchGoal}
                  onChange={(e) => setUpdateData({...updateData, stretchGoal: parseInt(e.target.value)})}
                  className="h-12 bg-slate-50 border-slate-200 rounded-xl text-foreground font-bold"
                />
              </div>
            </div>

            <div className="space-y-2 pb-2">
              <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Revised Deadline</Label>
              <Input 
                type="date"
                value={updateData.endDate}
                onChange={(e) => setUpdateData({...updateData, endDate: e.target.value})}
                className="h-14 bg-slate-50 border-slate-200 rounded-2xl text-foreground"
              />
            </div>

            <DialogFooter>
              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full h-14 rounded-2xl premium-gradient text-white font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {submitting ? <Loader2 className="animate-spin" /> : "Commit Status Change"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
