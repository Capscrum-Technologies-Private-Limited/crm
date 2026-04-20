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
  ArrowRight
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
import { MilestoneProgress } from "@/components/pipeline/milestone-progress";

const STAGES = ["LEAD", "CONTACTED", "PROPOSAL_SENT", "WON", "LOST"];

const STAGE_LABELS: Record<string, string> = {
  LEAD: "Lead Acquisition",
  CONTACTED: "Initial Contact",
  PROPOSAL_SENT: "Proposal Negotiation",
  WON: "Deal Won",
  LOST: "Deal Lost",
};

const STAGE_METRICS: Record<string, { color: string, icon: any }> = {
  LEAD: { color: "text-blue-500", icon: Layers },
  CONTACTED: { color: "text-violet-500", icon: Calendar },
  PROPOSAL_SENT: { color: "text-amber-500", icon: TrendingUp },
  WON: { color: "text-emerald-500", icon: CheckCircle2 },
  LOST: { color: "text-red-500", icon: AlertCircle },
};

export default function PipelinePage() {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
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
    stage: "LEAD",
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
    setFormData({ clientId: "", stage: "LEAD", value: "" });
    setEditId(null);
  };

  const handleEdit = (deal: any) => {
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
  const activeValue = pipelines.filter(p => !["WON", "LOST"].includes(p.stage)).reduce((sum, p) => sum + (p.value || 0), 0);
  const wonValue = pipelines.filter(p => p.stage === "WON").reduce((sum, p) => sum + (p.value || 0), 0);

  const filteredPipelines = filterStage === "ALL" 
    ? pipelines 
    : pipelines.filter(p => p.stage === filterStage);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">
            Deal <span className="text-primary">Roadmap</span>
          </h2>
          <p className="text-muted-foreground text-lg font-medium">Strategic milestone tracking for high-stakes capital ventures.</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-[2.5rem] p-8 border-slate-100/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors" />
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-2">Total Pipeline</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">₹{(totalValue / 1000000).toFixed(1)}M</span>
            <span className="text-xs font-bold text-muted-foreground/60">Gross Valuation</span>
          </div>
        </div>
        <div className="glass-card rounded-[2.5rem] p-8 border-slate-100/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-amber-500/10 transition-colors" />
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-2">Active Capital</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground">₹{(activeValue / 1000).toFixed(0)}K</span>
            <span className="text-xs font-bold text-amber-600">In Progression</span>
          </div>
        </div>
        <div className="glass-card rounded-[2.5rem] p-8 border-slate-100/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-2">Secured Revenue</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">₹{(wonValue / 1000).toFixed(0)}K</span>
            <span className="text-xs font-bold text-emerald-600/60">Successfully Won</span>
          </div>
        </div>
      </div>

      {/* Milestone Track List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
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
          <AnimatePresence mode="popLayout">
            {filteredPipelines.map((deal, idx) => {
              const currentIdx = getStageIndex(deal.stage);
              const isWon = deal.stage === "WON";
              const isLost = deal.stage === "LOST";
              const isProcessing = processingId === deal.id;

              // Display stages for tracker (terminal stages are WON/LOST)
              const milestoneData = [
                { id: "lead", label: "Lead", isCompleted: currentIdx > 0, isCurrent: currentIdx === 0 },
                { id: "contact", label: "Contact", isCompleted: currentIdx > 1, isCurrent: currentIdx === 1 },
                { id: "proposal", label: "Proposal", isCompleted: currentIdx > 2, isCurrent: currentIdx === 2 },
                { 
                  id: "outcome", 
                  label: isLost ? "Lost" : isWon ? "Won" : "Closing", 
                  isCompleted: isWon, 
                  isCurrent: currentIdx >= 3,
                  isTerminal: isWon ? "WON" : isLost ? "LOST" : null
                }
              ];

              return (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "glass-card p-1 rounded-[3rem] group transition-all duration-500",
                    isWon ? "hover:border-emerald-500/30" : isLost ? "hover:border-red-500/30" : "hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5"
                  )}
                >
                  <div className="p-8 md:p-10 flex flex-col lg:flex-row items-center gap-10">
                    {/* Deal Header Info */}
                    <div className="flex-shrink-0 w-full lg:w-72 flex items-center gap-6">
                      <div className={cn(
                        "w-16 h-16 rounded-[1.5rem] flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform",
                        isWon ? "bg-emerald-50 text-emerald-600" : isLost ? "bg-red-50 text-red-600" : "bg-slate-100 text-foreground"
                      )}>
                        <Building2 size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mb-1">Entity</p>
                        <h4 className="text-xl font-black text-foreground truncate group-hover:text-primary transition-colors">
                          {deal.client?.companyName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                           <DollarSign size={12} className="text-primary" />
                           <span className="text-sm font-black text-foreground">₹{(deal.value || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Milestone Tracker */}
                    <div className="flex-1 w-full px-6 py-4">
                      <MilestoneProgress 
                        milestones={milestoneData} 
                        currentIdx={currentIdx >= 3 ? 3 : currentIdx} 
                      />
                    </div>

                    {/* Action Hub */}
                    <div className="flex-shrink-0 flex items-center gap-4">
                      {!(isWon || isLost) ? (
                        <div className="flex gap-2">
                          <button 
                            disabled={isProcessing}
                            onClick={() => updateStage(deal.id, STAGES[currentIdx + 1])}
                            className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                          >
                            {isProcessing ? <Loader2 className="animate-spin" size={18} /> : (
                              <>
                                <span>Advance to {STAGES[currentIdx + 1].replace('_',' ')}</span>
                                <ArrowRight size={18} />
                              </>
                            )}
                          </button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 text-foreground flex items-center justify-center hover:bg-slate-100 transition-all">
                                <ChevronRight className="rotate-90 md:rotate-0" size={20} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px] rounded-[1.5rem] p-2 shadow-2xl">
                              <DropdownMenuLabel className="text-[10px] font-black text-muted-foreground/40 uppercase px-3">Quick Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="p-3 text-emerald-600 font-bold rounded-xl cursor-pointer" onClick={() => updateStage(deal.id, "WON")}>
                                Mark as Won
                              </DropdownMenuItem>
                              <DropdownMenuItem className="p-3 text-red-600 font-bold rounded-xl cursor-pointer" onClick={() => updateStage(deal.id, "LOST")}>
                                Mark as Lost
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="p-3 font-bold rounded-xl cursor-pointer" onClick={() => handleEdit(deal)}>
                                Edit Valuation
                              </DropdownMenuItem>
                              <DropdownMenuItem className="p-3 text-muted-foreground/60 font-bold rounded-xl cursor-pointer" onClick={() => handleDelete(deal.id)}>
                                Retract Deal
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4">
                           <div className={cn(
                             "px-6 py-3 rounded-2xl flex items-center gap-3 font-black text-sm uppercase tracking-widest",
                             isWon ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                           )}>
                             {isWon ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                             <span>{isWon ? "Success" : "Concluded"}</span>
                           </div>
                           <button 
                            onClick={() => handleEdit(deal)}
                            className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-foreground transition-all flex items-center justify-center"
                           >
                            <Pencil size={16} />
                           </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
