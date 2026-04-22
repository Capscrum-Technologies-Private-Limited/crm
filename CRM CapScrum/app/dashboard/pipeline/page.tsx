"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  DollarSign, 
  TrendingUp, 
  Filter, 
  Plus, 
  Loader2, 
  ChevronRight, 
  Pencil, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  Briefcase,
  LucideIcon
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MilestoneProgress, type Milestone } from "@/components/pipeline/milestone-progress";
import { MilestoneList } from "@/components/pipeline/milestone-list";

const STAGES = [
  "LEAD_IDENTIFICATION", 
  "ONBOARDING_PROPOSAL", 
  "REQUIREMENTS_DISCOVERY", 
  "DOCUMENTATION", 
  "PAYMENT_STRUCTURING", 
  "UI_DESIGN", 
  "ARCHITECTURE", 
  "PROJECT_EXECUTION", 
  "FINAL_PAYMENT", 
  "DEPLOYMENT",
  "LOST",
  "WON"
];

const STAGE_LABELS: Record<string, string> = {
  LEAD_IDENTIFICATION: "Lead Generation",
  ONBOARDING_PROPOSAL: "Proposals",
  REQUIREMENTS_DISCOVERY: "Discovery Calls",
  DOCUMENTATION: "Requirements",
  PAYMENT_STRUCTURING: "Financial Setup",
  UI_DESIGN: "UI Design",
  ARCHITECTURE: "Architecture",
  PROJECT_EXECUTION: "Execution",
  FINAL_PAYMENT: "Final Settlement",
  DEPLOYMENT: "Deployment",
  LOST: "Lost / Abandoned",
  WON: "Deal Secured",
};

const STAGE_METRICS: Record<string, { color: string, icon: LucideIcon }> = {
  LEAD_IDENTIFICATION: { color: "text-blue-500", icon: Layers },
  ONBOARDING_PROPOSAL: { color: "text-indigo-500", icon: Plus },
  REQUIREMENTS_DISCOVERY: { color: "text-violet-500", icon: Calendar },
  DOCUMENTATION: { color: "text-sky-500", icon: Briefcase },
  PAYMENT_STRUCTURING: { color: "text-amber-500", icon: DollarSign },
  UI_DESIGN: { color: "text-pink-500", icon: Layers },
  ARCHITECTURE: { color: "text-cyan-500", icon: Building2 },
  PROJECT_EXECUTION: { color: "text-orange-500", icon: TrendingUp },
  FINAL_PAYMENT: { color: "text-emerald-500", icon: CheckCircle2 },
  DEPLOYMENT: { color: "text-green-500", icon: ArrowRight },
  LOST: { color: "text-rose-500", icon: X },
  WON: { color: "text-emerald-400", icon: CheckCircle2 },
};

interface Client {
  id: string;
  companyName: string;
}

interface Pipeline {
  id: string;
  clientId: string;
  stage: string;
  value: number;
  client?: Client;
}

export default function PipelinePage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filter state
  const [filterStage, setFilterStage] = useState<string>("ALL");

  // Form State
  const [formData, setFormData] = useState({
    clientId: "",
    stage: "LEAD_IDENTIFICATION",
    value: ""
  });

  const fetchPipelines = () => {
    setLoading(true);
    fetch("/api/pipeline")
      .then((res) => res.json())
      .then((data) => {
        setPipelines(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchClients = () => {
    fetch("/api/clients?all=true")
      .then((res) => res.json())
      .then((data) => setClients(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => {
    fetchPipelines();
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const payload = editId ? { ...formData, id: editId } : formData;
      const res = await fetch("/api/pipeline", {
        method: editId ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        setOpen(false);
        resetForm();
        fetchPipelines();
      }
    } catch (error) {
      console.error("Error saving deal:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ clientId: "", stage: "LEAD_IDENTIFICATION", value: "" });
    setEditId(null);
  };

  const handleEdit = (deal: Pipeline) => {
    setEditId(deal.id);
    setFormData({
      clientId: deal.clientId,
      stage: deal.stage,
      value: deal.value.toString(),
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to retire this deal?")) return;
    try {
      const res = await fetch(`/api/pipeline?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchPipelines();
    } catch (e) {
      console.error(e);
    }
  };

  const updateStage = async (dealId: string, newStage: string) => {
    setProcessingId(dealId);
    try {
      const res = await fetch("/api/pipeline", {
        method: "PUT",
        body: JSON.stringify({ id: dealId, stage: newStage }),
      });
      if (res.ok) {
        setPipelines(prev => prev.map(p => p.id === dealId ? { ...p, stage: newStage } : p));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const getStageIndex = (stage: string) => STAGES.indexOf(stage);

  // Summary stats
  const totalValue = pipelines.reduce((sum, p) => sum + (p.value || 0), 0);
  const activeValue = pipelines.filter(p => !["FINAL_PAYMENT", "DEPLOYMENT"].includes(p.stage)).reduce((sum, p) => sum + (p.value || 0), 0);
  const wonValue = pipelines.filter(p => p.stage === "DEPLOYMENT").reduce((sum, p) => sum + (p.value || 0), 0);

  const filteredPipelines = filterStage === "ALL" 
    ? pipelines 
    : pipelines.filter(p => p.stage === filterStage);

  const conversionRate = pipelines.length > 0 
    ? ((pipelines.filter(p => p.stage === "DEPLOYMENT").length / pipelines.length) * 100).toFixed(1)
    : "0.0";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">
            Deal <span className="text-primary">Roadmap</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg font-medium opacity-80">Strategic milestone tracking for high-stakes capital ventures.</p>
        </div>
        <div className="flex gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-foreground font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                <Filter size={18} />
                <span>{filterStage === "ALL" ? "All Tracks" : STAGE_LABELS[filterStage]}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] rounded-[1.5rem] p-2 shadow-2xl border-slate-100">
              <DropdownMenuLabel className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-1 px-3">Filter Progression</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer font-bold text-sm rounded-xl mb-1 h-10 px-3" onClick={() => setFilterStage("ALL")}>
                Global Overview
              </DropdownMenuItem>
              {STAGES.map(stage => (
                <DropdownMenuItem key={stage} className="cursor-pointer font-bold text-sm rounded-xl mb-1 h-10 px-3" onClick={() => setFilterStage(stage)}>
                  {STAGE_LABELS[stage]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) resetForm();
          }}>
            <DialogTrigger asChild>
              <button className="px-8 py-4 rounded-2xl premium-gradient text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                <Plus size={20} />
                <span>Initialize Track</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] !bg-white border-slate-100 rounded-[2.5rem] p-8 shadow-2xl">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-black text-foreground">
                  Deal <span className="text-primary">{editId ? "Modification" : "Initialization"}</span>
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Enterprise Partner</Label>
                  <select 
                    value={formData.clientId}
                    onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                    required
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl text-foreground px-4 focus:border-primary/50 transition-all appearance-none outline-none font-bold"
                  >
                    <option value="">Select partner entity...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.companyName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Lifecycle Stage</Label>
                    <select 
                      value={formData.stage}
                      onChange={(e) => setFormData({...formData, stage: e.target.value})}
                      required
                      className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl text-foreground px-4 focus:border-primary/50 transition-all appearance-none outline-none font-bold"
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Valuation (₹)</Label>
                    <Input 
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: e.target.value})}
                      required
                      placeholder="5,00,000"
                      className="h-14 bg-slate-50 border-slate-100 rounded-2xl text-foreground font-black"
                    />
                  </div>
                </div>
                <DialogFooter className="pt-6">
                  <button 
                    type="submit" 
                    disabled={submitting || !formData.clientId} 
                    className="w-full h-14 rounded-2xl premium-gradient text-white font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {submitting ? "Synchronizing..." : editId ? "Update Parameters" : "Launch Deal"}
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card rounded-[2.5rem] p-6 border-slate-100/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors" />
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-2">Total Pipeline</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">₹{(totalValue / 1000000).toFixed(1)}M</span>
            <span className="text-xs font-bold text-muted-foreground/60">Gross Valuation</span>
          </div>
        </div>
        <div className="glass-card rounded-[2.5rem] p-6 border-slate-100/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-amber-500/10 transition-colors" />
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-2">Conversion Rate</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{conversionRate}%</span>
            <span className="text-xs font-bold text-amber-600/60 font-medium">Capture Ratio</span>
          </div>
        </div>
        <div className="glass-card rounded-[2.5rem] p-6 border-slate-100/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-2">Secured Revenue</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">₹{(wonValue / 1000).toFixed(0)}K</span>
            <span className="text-xs font-bold text-emerald-600/60">Successfully Won</span>
          </div>
        </div>
      </div>

      {/* Milestone Track List */}
      <div className="min-h-[600px] bg-slate-50/20 rounded-[3rem] p-4 border border-slate-100/50">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-50">
            <Loader2 className="animate-spin text-primary" size={40} />
            <span className="text-xs font-black uppercase tracking-[0.4em] ml-2">Syncing Deal Cloud...</span>
          </div>
        ) : filteredPipelines.length === 0 ? (
          <div className="glass-card rounded-[3rem] p-20 flex flex-col items-center gap-6 border-dashed border-2 bg-slate-50/50">
             <Building2 size={60} className="text-muted-foreground/20" />
             <div className="text-center">
               <h3 className="text-xl font-black text-foreground mb-2">No Active Tracks Found</h3>
               <p className="text-muted-foreground/60 max-w-sm mx-auto font-medium">Initialize a new deal to begin tracking its progression through the strategic pipeline.</p>
             </div>
             <button onClick={() => setOpen(true)} className="px-8 py-4 rounded-2xl bg-white border border-slate-200 text-foreground font-bold text-sm hover:border-primary/50 transition-all shadow-sm">
                Begin Initialization
             </button>
          </div>
        ) : (
          <MilestoneList 
            initialDeals={pipelines}
            stages={STAGES}
            stageLabels={STAGE_LABELS}
            stageMetrics={STAGE_METRICS}
            onDealMove={updateStage}
            onEdit={handleEdit}
          />
        )}
      </div>
    </motion.div>
  );
}
