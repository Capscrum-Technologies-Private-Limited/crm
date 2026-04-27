"use client";
// Pipeline Page - Last Updated: 2026-04-24T12:05:00Z
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  MoreVertical,
  ChevronRight,
  CheckCircle2,
  Circle,
  Layout,
  Building2,
  TrendingUp,
  Target,
  Clock,
  Pencil,
  Trash2,
  Briefcase,
  Save,
  X,
  PlusCircle,
  Percent,
  GripVertical,
  Filter,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState, Fragment } from "react";
import Link from "next/link";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PipelineStage {
  id: string;
  name: string;
  description: string | null;
  percentage: number;
  order: number;
  isCompleted: boolean;
  completedAt: string | null;
  projectId?: string | null;
}

interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  status: string;
  projects: {
    id: string;
    name: string;
    status: string;
    progress: number;
  }[];
  pipelineStages: PipelineStage[];
}

export default function PipelinePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [allClients, setAllClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);
  const [newStageClient, setNewStageClient] = useState<string | null>(null);
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [isInitializingRoadmap, setIsInitializingRoadmap] = useState(false);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [confirmingStage, setConfirmingStage] = useState<PipelineStage | null>(null);
  const [deletingStageId, setDeletingStageId] = useState<string | null>(null);
  const [reorderingClient, setReorderingClient] = useState<Client | null>(null);
  const [tempStages, setTempStages] = useState<PipelineStage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isApplyingDefaults, setIsApplyingDefaults] = useState(false);

  // New client form state
  const [newClientData, setNewClientData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    status: "Pipeline",
  });

  // Roadmap initialization state
  const [initRoadmapData, setInitRoadmapData] = useState({
    clientId: "",
    projectId: "",
    projectName: "",
    includeDefaults: true,
  });

  const DEFAULT_STAGES = [
    { name: "Onboarding & Proposal", percentage: 20, order: 1, description: "Initial onboarding and proposal submission" },
    { name: "Requirements Gathering", percentage: 20, order: 2, description: "Detailed requirements documentation" },
    { name: "UI/UX Design", percentage: 20, order: 3, description: "Figma design and client approval" },
    { name: "Development Phase", percentage: 30, order: 4, description: "Core development and MVP build" },
    { name: "Deployment", percentage: 10, order: 5, description: "Final deployment and handover" },
  ];

  // New stage form state
  const [newStageData, setNewStageData] = useState({
    name: "",
    description: "",
    percentage: "0",
    order: "0",
  });

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/pipeline");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || `HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.error("Fetch clients failed:", e.message || e);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllClientsList = async () => {
    try {
      const res = await fetch("/api/clients?all=true");
      const data = await res.json();
      setAllClients(data);
    } catch (e) {
      console.error("Failed to fetch all clients list:", e);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchAllClientsList();
  }, []);

  const initializeRoadmap = async () => {
    if (!initRoadmapData.clientId) return;
    
    let targetProjectId = initRoadmapData.projectId;

    try {
      // If a new project name is provided, create the project first
      if (initRoadmapData.projectName) {
        const projectRes = await fetch("/api/projects", {
          method: "POST",
          body: JSON.stringify({
            name: initRoadmapData.projectName,
            clientId: initRoadmapData.clientId,
            status: "PENDING",
          }),
        });
        if (projectRes.ok) {
          const newProject = await projectRes.json();
          targetProjectId = newProject.id;
        }
      }

      const res = await fetch("/api/pipeline", {
        method: "POST",
        body: JSON.stringify({
          clientId: initRoadmapData.clientId,
          projectId: targetProjectId || null,
          isBatch: true,
          stages: initRoadmapData.includeDefaults ? DEFAULT_STAGES : [],
        }),
      });
      if (res.ok) {
        setIsInitializingRoadmap(false);
        setInitRoadmapData({ clientId: "", projectId: "", projectName: "", includeDefaults: true });
        fetchClients();
      }
    } catch (e) {
      console.error("Roadmap initialization failed:", e);
    }
  };

  const handleAddClient = async () => {
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        body: JSON.stringify(newClientData),
      });
      if (res.ok) {
        const client = await res.json();
        setIsAddingClient(false);
        setNewClientData({ companyName: "", contactPerson: "", email: "", status: "Pipeline" });
        fetchAllClientsList();
        // Automatically open roadmap init for this client
        setInitRoadmapData({ ...initRoadmapData, clientId: client.id });
        setIsInitializingRoadmap(true);
      }
    } catch (e) {
      console.error("Failed to add client:", e);
    }
  };

  const toggleStageCompletion = async (stage: PipelineStage) => {
    if (stage.isCompleted) return; // Cannot undo final completion
    setConfirmingStage(stage);
  };

  const handleFinalComplete = async () => {
    if (!confirmingStage) return;
    try {
      const res = await fetch("/api/pipeline", {
        method: "PUT",
        body: JSON.stringify({ id: confirmingStage.id, isCompleted: true }),
      });
      if (res.ok) {
        setConfirmingStage(null);
        fetchClients();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteStage = async (stageId: string) => {
    try {
      const res = await fetch(`/api/pipeline?id=${stageId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeletingStageId(null);
        fetchClients();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLoadDefaults = async () => {
    if (!reorderingClient) return;
    setIsApplyingDefaults(true);
    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        body: JSON.stringify({
          clientId: reorderingClient.id,
          isBatch: true,
          stages: DEFAULT_STAGES,
        }),
      });
      if (res.ok) {
        setReorderingClient(null);
        fetchClients();
      }
    } catch (e) {
      console.error("Failed to apply default stages:", e);
    } finally {
      setIsApplyingDefaults(false);
    }
  };

  const handleApplyReorder = async () => {
    if (!reorderingClient) return;
    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        body: JSON.stringify({
          isReorder: true,
          stages: tempStages.map((item, index) => ({ id: item.id, order: index + 1 }))
        }),
      });
      if (res.ok) {
        setReorderingClient(null);
        fetchClients();
      }
    } catch (e) {
      console.error("Failed to save new order:", e);
    }
  };

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(tempStages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTempStages(items);
  };

  const handleAddStage = async (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    const currentTotal = client?.pipelineStages.reduce((sum, s) => sum + s.percentage, 0) || 0;
    const newWeight = parseInt(newStageData.percentage) || 0;

    if (currentTotal + newWeight > 100) {
      alert(`Warning: Total weight will be ${currentTotal + newWeight}%. Please reduce other stages to keep it at 100%.`);
      return;
    }

    try {
      const nextOrder = client ? client.pipelineStages.length + 1 : 1;
      
      const res = await fetch("/api/pipeline", {
        method: "POST",
        body: JSON.stringify({
          clientId,
          ...newStageData,
          order: nextOrder.toString()
        }),
      });
      if (res.ok) {
        setIsAddingStage(false);
        setNewStageData({ name: "", description: "", percentage: "0", order: "0" });
        fetchClients();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStage = async () => {
    if (!editingStage) return;
    
    // Find the client this stage belongs to
    const client = clients.find(c => c.pipelineStages.some(s => s.id === editingStage.id));
    if (client) {
      const otherStagesWeight = client.pipelineStages
        .filter(s => s.id !== editingStage.id)
        .reduce((sum, s) => sum + s.percentage, 0);
      
      if (otherStagesWeight + editingStage.percentage > 100) {
        alert(`Warning: Total weight will be ${otherStagesWeight + editingStage.percentage}%. Please reduce other stages to keep it at 100%.`);
        return;
      }
    }

    try {
      const res = await fetch("/api/pipeline", {
        method: "PUT",
        body: JSON.stringify({
          id: editingStage.id,
          name: editingStage.name,
          description: editingStage.description,
          percentage: editingStage.percentage,
          order: editingStage.order,
        }),
      });
      if (res.ok) {
        setEditingStage(null);
        fetchClients();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Clock className="w-8 h-8 text-primary opacity-20" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground mb-1">
            Client <span className="text-primary">Roadmaps</span>
          </h2>
          <p className="text-muted-foreground text-sm font-medium opacity-60">
            Tailored onboarding and delivery pipelines for strategic partners.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Input
              placeholder="Search roadmaps..."
              className="h-10 w-64 rounded-md border-slate-200 pl-9 font-medium text-sm focus:ring-primary/20 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
          </div>
          <Button
            variant="outline"
            className="rounded-md font-bold h-10 px-4 border-slate-200 bg-white hover:bg-slate-50"
          >
            <Filter size={18} className="mr-2" />
            Filter
          </Button>
          <Button
            variant="outline"
            className="rounded-md font-bold h-10 px-5 border-slate-200"
            onClick={() => setIsInitializingRoadmap(true)}
          >
            <TrendingUp size={18} className="mr-2" />
            Initialize Roadmap
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <AnimatePresence>
          {clients
            .filter(client => 
              client.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((client) => {
            const totalProgress = client.pipelineStages
              .filter(s => s.isCompleted)
              .reduce((sum, s) => sum + s.percentage, 0);

            return (
              <motion.div
                key={client.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card single-sided-gradient rounded-lg overflow-hidden border-slate-100/10 group shadow-2xl shadow-primary/5"
              >
                {/* Client Header */}
                <div className="p-5 border-b border-slate-100/50 bg-slate-50/30">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-md bg-white border border-slate-200 flex items-center justify-center text-primary shadow-sm group-hover:scale-105 transition-transform">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-foreground tracking-tight">
                          {client.companyName}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                            {client.contactPerson}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full",
                            client.status === "Onboarded" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                          )}>
                            {client.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-2xl font-black text-primary leading-none">
                          {totalProgress}%
                        </p>
                        <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mt-0.5">
                          Completion
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-md font-bold h-9 px-4 border-slate-200 text-xs"
                          onClick={() => {
                            setReorderingClient(client);
                            setTempStages(client.pipelineStages);
                          }}
                        >
                          <Layout size={14} className="mr-1.5" />
                          Customize
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Active Projects Summary */}
                  {client.projects && client.projects.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {client.projects.map(project => (
                        <div key={project.id} className="flex items-center gap-2 px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-600">
                          <Briefcase size={10} className="text-primary" />
                          <span>{project.name}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-primary">{project.progress}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Overall Progress Bar */}
                  <div className="mt-5 relative h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${totalProgress}%` }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-emerald-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Pipeline Stages */}
                <div className="p-8">
                  {client.pipelineStages.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center gap-4">
                      <p className="text-sm font-bold text-muted-foreground/30 uppercase tracking-[0.2em]">
                        No roadmap stages initialized
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg font-bold border-primary/20 text-primary hover:bg-primary/5 px-6"
                        onClick={() => {
                          setNewStageClient(client.id);
                          setIsAddingStage(true);
                        }}
                      >
                        <PlusCircle size={16} className="mr-2" />
                        Add First Stage
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-12">
                      {/* Group stages by Project ID */}
                      {(() => {
                        const projectGroups = client.pipelineStages.reduce((groups: any, stage) => {
                          const pId = stage.projectId || "general";
                          if (!groups[pId]) groups[pId] = [];
                          groups[pId].push(stage);
                          return groups;
                        }, {});

                        return Object.entries(projectGroups).map(([pId, stages]: [string, any], groupIndex) => {
                          const project = client.projects.find(p => p.id === pId);
                          
                          return (
                            <div key={pId} className="space-y-6">
                              <div className="flex items-center gap-3">
                                <div className="h-px flex-1 bg-slate-100" />
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100">
                                  {pId === "general" ? (
                                    <>
                                      <Users size={12} className="text-slate-400" />
                                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">General Onboarding</span>
                                    </>
                                  ) : (
                                    <>
                                      <Briefcase size={12} className="text-primary" />
                                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">{project?.name || "Unknown Project"}</span>
                                    </>
                                  )}
                                </div>
                                <div className="h-px flex-1 bg-slate-100" />
                              </div>

                              <div className="relative">
                                {/* Desktop Flow Path */}
                                <div className="hidden lg:block absolute top-[52px] left-0 right-0 h-0.5 bg-slate-100/50 -z-0" />
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                                  {stages.map((stage: any, index: number) => {
                                    const isFirstPending = !stage.isCompleted && (index === 0 || stages[index-1].isCompleted);
                                    const isLastOverall = index === stages.length - 1;

                                    return (
                                      <div key={stage.id} className="relative group/stage-container">
                                        <motion.div
                                          whileHover={{ y: -4 }}
                                          onClick={() => !stage.isCompleted && toggleStageCompletion(stage)}
                                          className={cn(
                                            "p-5 rounded-xl border transition-all duration-500 flex flex-col justify-between min-h-[140px] relative overflow-hidden",
                                            stage.isCompleted 
                                              ? "bg-white border-emerald-100/50 shadow-sm opacity-90" 
                                              : isFirstPending
                                                ? "bg-white border-primary/30 shadow-xl shadow-primary/5 ring-1 ring-primary/5"
                                                : "bg-white border-slate-100 shadow-sm hover:border-slate-300",
                                            !stage.isCompleted && "cursor-pointer"
                                          )}
                                        >
                                          {/* Active Glow for Current Stage */}
                                          {isFirstPending && (
                                            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                          )}

                                          <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                              <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                                                stage.isCompleted 
                                                  ? "bg-emerald-50 text-emerald-500 scale-110" 
                                                  : isFirstPending
                                                    ? "bg-primary/10 text-primary animate-pulse"
                                                    : "bg-slate-50 text-slate-300"
                                              )}>
                                                {stage.isCompleted ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                                              </div>
                                              <div className="min-w-0">
                                                <h4 className={cn(
                                                  "text-sm font-black tracking-tight truncate leading-tight",
                                                  stage.isCompleted ? "text-emerald-900/70" : "text-slate-900"
                                                )}>
                                                  {stage.name}
                                                </h4>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                  <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded",
                                                    stage.isCompleted ? "bg-emerald-50 text-emerald-600/60" : "bg-slate-50 text-slate-400"
                                                  )}>
                                                    {stage.percentage}%
                                                  </span>
                                                  {isFirstPending && (
                                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest animate-pulse">
                                                      Current
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>

                                            {!stage.isCompleted && (
                                              <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                  <button 
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors flex-shrink-0"
                                                  >
                                                    <MoreVertical size={16} className="text-slate-300" />
                                                  </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl border-slate-100 p-1.5 shadow-xl">
                                                  <DropdownMenuItem 
                                                    className="cursor-pointer font-bold text-xs rounded-lg px-3 py-2"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setEditingStage(stage);
                                                    }}
                                                  >
                                                    <Pencil size={14} className="mr-2 text-primary" /> Edit Stage
                                                  </DropdownMenuItem>
                                                  <DropdownMenuItem 
                                                    className="cursor-pointer font-bold text-xs text-rose-600 rounded-lg px-3 py-2 hover:!bg-rose-50 hover:!text-rose-600"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setDeletingStageId(stage.id);
                                                    }}
                                                  >
                                                    <Trash2 size={14} className="mr-2" /> Delete
                                                  </DropdownMenuItem>
                                                </DropdownMenuContent>
                                              </DropdownMenu>
                                            )}
                                          </div>
                                          
                                          <div className="mt-auto">
                                            {stage.description ? (
                                              <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                                                {stage.description}
                                              </p>
                                            ) : (
                                              <div className="h-4" /> 
                                            )}

                                            {stage.isCompleted && stage.completedAt && (
                                              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-emerald-50">
                                                <Clock size={10} className="text-emerald-400" />
                                                <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">
                                                  {new Date(stage.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </motion.div>

                                        {/* Flow Connector Arrow */}
                                        {!isLastOverall && (
                                          <div className={cn(
                                            "hidden lg:flex absolute -right-4 top-[52px] -translate-y-1/2 w-8 h-8 rounded-full items-center justify-center bg-white border z-20 transition-all duration-500",
                                            stage.isCompleted ? "border-emerald-200 text-emerald-500 shadow-sm" : "border-slate-100 text-slate-200"
                                          )}>
                                            <ArrowRight size={14} className={cn(stage.isCompleted && "animate-pulse")} />
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add Stage Dialog */}
      <Dialog open={isAddingStage} onOpenChange={setIsAddingStage}>
        <DialogContent className="sm:max-w-[450px] !bg-white border-slate-200 rounded-xl p-8 shadow-2xl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">
              Add New <span className="text-primary">Stage</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Stage Name</Label>
              <Input 
                placeholder="e.g., UI/UX Design" 
                className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold text-slate-700 focus:border-primary/50"
                value={newStageData.name}
                onChange={e => setNewStageData({...newStageData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Strategic Scope</Label>
              <Input 
                placeholder="What will be delivered?" 
                className="h-12 rounded-xl bg-slate-50 border-slate-200 font-medium text-slate-600 focus:border-primary/50"
                value={newStageData.description}
                onChange={e => setNewStageData({...newStageData, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Stage Weight (%)</Label>
              <div className="relative">
                <Input 
                  type="number"
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 font-black pr-12 text-slate-700 focus:border-primary/50"
                  value={newStageData.percentage}
                  onChange={e => setNewStageData({...newStageData, percentage: e.target.value})}
                />
                <Percent size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
              </div>
              {(() => {
                const client = clients.find(c => c.id === newStageClient);
                const currentTotal = client?.pipelineStages.reduce((sum, s) => sum + s.percentage, 0) || 0;
                const projectedTotal = currentTotal + (parseInt(newStageData.percentage) || 0);
                if (projectedTotal > 100) {
                  return (
                    <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 animate-pulse">
                      <AlertTriangle size={14} />
                      <p className="text-[10px] font-bold uppercase tracking-wider">
                        Caution: Total weight will reach {projectedTotal}%
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
            <Button 
              className="w-full h-14 rounded-xl premium-gradient text-white font-black text-sm shadow-xl shadow-primary/20 mt-4 hover:scale-[1.02] active:scale-[0.98] transition-all"
              onClick={() => newStageClient && handleAddStage(newStageClient)}
              disabled={!newStageData.name}
            >
              Initialize Stage
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Stage Dialog */}
      <Dialog open={!!editingStage} onOpenChange={() => setEditingStage(null)}>
        <DialogContent className="sm:max-w-[450px] !bg-white border-slate-200 rounded-lg p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight">
              Edit Stage
            </DialogTitle>
          </DialogHeader>
          {editingStage && (
            <div className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Stage Name</Label>
                <Input 
                  className="h-10 rounded-md bg-slate-50 border-slate-200 font-bold text-sm"
                  value={editingStage.name}
                  onChange={e => setEditingStage({...editingStage, name: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Description</Label>
                <Input 
                  className="h-10 rounded-md bg-slate-50 border-slate-200 font-medium text-sm"
                  value={editingStage.description || ""}
                  onChange={e => setEditingStage({...editingStage, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Weight (%)</Label>
                  <div className="relative">
                    <Input 
                      type="number"
                      className="h-10 rounded-md bg-slate-50 border-slate-200 font-black pr-10 text-sm"
                      value={editingStage.percentage}
                      onChange={e => setEditingStage({...editingStage, percentage: parseInt(e.target.value) || 0})}
                    />
                    <Percent size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                  </div>
                  {(() => {
                    const client = clients.find(c => c.pipelineStages.some(s => s.id === editingStage.id));
                    if (client) {
                      const otherStagesWeight = client.pipelineStages
                        .filter(s => s.id !== editingStage.id)
                        .reduce((sum, s) => sum + s.percentage, 0);
                      const projectedTotal = otherStagesWeight + editingStage.percentage;
                      if (projectedTotal > 100) {
                        return (
                          <div className="flex items-center gap-2 mt-1.5 p-1.5 rounded bg-rose-50 border border-rose-100 text-rose-600 animate-pulse">
                            <AlertTriangle size={12} />
                            <p className="text-[9px] font-bold uppercase tracking-wider">
                              Exceeds 100% (Total: {projectedTotal}%)
                            </p>
                          </div>
                        );
                      }
                    }
                    return null;
                  })()}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Order</Label>
                  <Input 
                    type="number"
                    className="h-10 rounded-md bg-slate-50 border-slate-200 font-black text-sm"
                    value={editingStage.order}
                    onChange={e => setEditingStage({...editingStage, order: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <Button 
                className="w-full h-12 rounded-md premium-gradient text-white font-black text-sm shadow-lg shadow-primary/20 mt-2"
                onClick={handleUpdateStage}
              >
                Update Stage
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Initialize Roadmap Dialog */}
      <Dialog open={isInitializingRoadmap} onOpenChange={setIsInitializingRoadmap}>
        <DialogContent className="sm:max-w-[450px] !bg-white border-slate-200 rounded-lg p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight">
              Initialize <span className="text-primary">Roadmap</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Select Client</Label>
                <select 
                  className="w-full h-10 rounded-md bg-slate-50 border border-slate-200 px-3 font-bold focus:outline-none focus:border-primary/50 text-sm"
                  value={initRoadmapData.clientId}
                  onChange={e => {
                    setInitRoadmapData({...initRoadmapData, clientId: e.target.value, projectId: "", projectName: ""});
                  }}
                >
                  <option value="">Choose a client...</option>
                  {allClients.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
              </div>

              {initRoadmapData.clientId && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Link to Project (Optional)</Label>
                  <div className="space-y-3">
                    <select 
                      className="w-full h-10 rounded-md bg-slate-50 border border-slate-200 px-3 font-bold focus:outline-none focus:border-primary/50 text-sm"
                      value={initRoadmapData.projectId}
                      onChange={e => setInitRoadmapData({...initRoadmapData, projectId: e.target.value, projectName: ""})}
                    >
                      <option value="">New Project / General Onboarding</option>
                      {clients.find(c => c.id === initRoadmapData.clientId)?.projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    
                    {!initRoadmapData.projectId && (
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-bold text-slate-400">OR CREATE NEW PROJECT</Label>
                        <Input 
                          placeholder="Project Name (e.g., Q3 Marketing Campaign)"
                          className="h-10 rounded-md bg-slate-50 border-slate-200 font-bold text-sm"
                          value={initRoadmapData.projectName}
                          onChange={e => setInitRoadmapData({...initRoadmapData, projectName: e.target.value})}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-md border border-slate-100">
              <input 
                type="checkbox" 
                id="defaults"
                className="w-3.5 h-3.5 rounded border-slate-300 text-primary focus:ring-primary"
                checked={initRoadmapData.includeDefaults}
                onChange={e => setInitRoadmapData({...initRoadmapData, includeDefaults: e.target.checked})}
              />
              <Label htmlFor="defaults" className="text-[11px] font-bold text-foreground cursor-pointer">
                Use default onboarding stages
              </Label>
            </div>

            {initRoadmapData.includeDefaults && (
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Preview:</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {DEFAULT_STAGES.map(s => (
                    <div key={s.name} className="flex items-center justify-between text-[9px] font-bold text-muted-foreground bg-white p-1.5 rounded border border-slate-100">
                      <span className="truncate mr-2">{s.name}</span>
                      <span className="text-primary">{s.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button 
              className="w-full h-12 rounded-md premium-gradient text-white font-black text-sm shadow-lg shadow-primary/20 mt-2"
              onClick={initializeRoadmap}
              disabled={!initRoadmapData.clientId}
            >
              Start Roadmap
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customize Stages Dialog */}
      <Dialog open={!!reorderingClient} onOpenChange={() => setReorderingClient(null)}>
        <DialogContent className="sm:max-w-[400px] !bg-white border-slate-200 rounded-lg p-0 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white pr-12">
            <DialogTitle className="text-lg font-bold text-slate-900">Customize Columns</DialogTitle>
            <button 
              className="text-primary text-sm font-bold hover:underline"
              onClick={() => reorderingClient && setTempStages(reorderingClient.pipelineStages)}
            >
              Reset
            </button>
          </div>
          
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            <div className="space-y-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Drag to reorder</p>
              <DragDropContext onDragEnd={handleOnDragEnd}>
                <Droppable droppableId="stages">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {tempStages.map((stage, index) => (
                        <Draggable key={stage.id} draggableId={stage.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-md shadow-sm group"
                            >
                              <div className="flex items-center gap-3">
                                <input 
                                  type="checkbox" 
                                  checked={true}
                                  readOnly
                                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-bold text-slate-700">{stage.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                                  onClick={() => setDeletingStageId(stage.id)}
                                >
                                  <Trash2 size={14} />
                                </button>
                                <div {...provided.dragHandleProps} className="text-slate-300 group-hover:text-slate-500 transition-colors cursor-grab active:cursor-grabbing">
                                  <GripVertical size={16} />
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            <div className="space-y-4 pt-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Select to add</p>
              <div className="space-y-3">
                <button 
                  onClick={handleLoadDefaults}
                  disabled={isApplyingDefaults}
                  className="w-full flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 transition-all group"
                >
                   <div className="flex items-center gap-3">
                    <TrendingUp size={18} className="text-primary group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <span className="text-sm font-black text-primary block">Apply Default Onboarding</span>
                      <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">5 Standard Stages</span>
                    </div>
                  </div>
                  {isApplyingDefaults && <Clock size={14} className="animate-spin text-primary" />}
                </button>

                <button 
                  onClick={() => {
                    if (reorderingClient) {
                      setNewStageClient(reorderingClient.id);
                      setIsAddingStage(true);
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 border border-slate-200 border-dashed rounded-md hover:bg-slate-100 transition-colors group"
                >
                   <div className="flex items-center gap-3">
                    <PlusCircle size={16} className="text-slate-400 group-hover:text-primary transition-colors" />
                    <span className="text-sm font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Add custom stage...</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1 h-11 rounded-md font-bold text-slate-600 border-slate-200 bg-white"
              onClick={() => setReorderingClient(null)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 h-11 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-bold"
              onClick={handleApplyReorder}
            >
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Final Completion Confirmation Dialog */}
      <Dialog open={!!confirmingStage} onOpenChange={() => setConfirmingStage(null)}>
        <DialogContent className="sm:max-w-[400px] !bg-white border-slate-200 rounded-lg p-6 shadow-2xl text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <DialogTitle className="text-xl font-black tracking-tight">
              Confirm Final <span className="text-emerald-500">Completion</span>
            </DialogTitle>
            <p className="text-xs font-medium text-muted-foreground mt-2 px-4">
              Mark <span className="font-bold text-foreground">"{confirmingStage?.name}"</span> as finally completed? This action is irreversible.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button 
              variant="outline"
              className="h-11 rounded-md font-black text-xs border-slate-200"
              onClick={() => setConfirmingStage(null)}
            >
              Cancel
            </Button>
            <Button 
              className="h-11 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-lg shadow-emerald-500/20"
              onClick={handleFinalComplete}
            >
              Finalize Stage
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Stage Confirmation Dialog */}
      <Dialog open={!!deletingStageId} onOpenChange={() => setDeletingStageId(null)}>
        <DialogContent className="sm:max-w-[400px] !bg-white border-slate-200 rounded-lg p-6 shadow-2xl text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <Trash2 size={32} className="text-rose-500" />
            </div>
            <DialogTitle className="text-xl font-black tracking-tight">
              Delete <span className="text-rose-500">Stage</span>
            </DialogTitle>
            <p className="text-xs font-medium text-muted-foreground mt-2 px-4">
              Are you sure you want to delete this stage? Its weight will be redistributed among remaining stages.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button 
              variant="outline"
              className="h-11 rounded-md font-black text-xs border-slate-200"
              onClick={() => setDeletingStageId(null)}
            >
              Cancel
            </Button>
            <Button 
              className="h-11 rounded-md bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-lg shadow-rose-500/20"
              onClick={() => deletingStageId && deleteStage(deletingStageId)}
            >
              Delete Stage
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
