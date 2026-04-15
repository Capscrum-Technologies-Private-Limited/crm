"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { DollarSign, TrendingUp, Filter, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const STAGES = ["LEAD", "CONTACTED", "PROPOSAL_SENT", "WON", "LOST"];

export default function PipelinePage() {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
        setPipelines(data);
        setLoading(false);
      });
  };

  const fetchClients = () => {
    fetch("/api/clients?all=true")
      .then((res) => res.json())
      .then((data) => setClients(data));
  };

  useEffect(() => {
    fetchPipelines();
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setOpen(false);
        setFormData({
          clientId: "",
          stage: "LEAD",
          value: ""
        });
        fetchPipelines();
      }
    } catch (error) {
      console.error("Error creating deal:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "WON": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "LOST": return "bg-destructive/10 text-destructive border-destructive/20";
      case "PROPOSAL_SENT": return "bg-blue-50 text-blue-700 border-blue-200";
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
            Sales <span className="text-primary">Pipeline</span>
          </h2>
          <p className="text-muted-foreground text-lg font-medium">Track high-value deals and capital flow across your workspace.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 rounded-2xl bg-slate-100 border border-slate-200 text-foreground font-bold text-sm hover:bg-slate-200 transition-all flex items-center gap-2">
            <Filter size={18} />
            <span>Filter</span>
          </button>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="px-8 py-4 rounded-2xl premium-gradient text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2">
                <Plus size={20} />
                <span>Initialize New Deal</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] !bg-white border-slate-200 rounded-[2.5rem] p-8 shadow-2xl">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-black text-foreground">Deal <span className="text-primary">Initialization</span></DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="clientId" className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Client Association</Label>
                  <select 
                    id="clientId" 
                    value={formData.clientId}
                    onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                    required
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl text-foreground px-4 focus:border-primary/50 transition-all appearance-none outline-none"
                  >
                    <option value="">Select partner...</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.companyName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stage" className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Pipeline Stage</Label>
                  <select 
                    id="stage" 
                    value={formData.stage}
                    onChange={(e) => setFormData({...formData, stage: e.target.value})}
                    required
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl text-foreground px-4 focus:border-primary/50 transition-all appearance-none outline-none"
                  >
                    {STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value" className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Contract Value (₹)</Label>
                  <Input 
                    id="value" 
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    required
                    placeholder="e.g. 5,00,000"
                    className="h-14 bg-slate-50 border-slate-200 rounded-2xl text-foreground focus:border-primary/50 transition-all"
                  />
                </div>
                <DialogFooter className="pt-6">
                  <button 
                    type="submit" 
                    disabled={submitting || !formData.clientId} 
                    className="w-full h-14 rounded-2xl premium-gradient text-white font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {submitting ? "Processing..." : "Commit to Pipeline"}
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 overflow-x-auto pb-6 custom-scrollbar min-h-[700px]">
        {STAGES.map((stage, sIndex) => (
          <motion.div 
            key={stage} 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: sIndex * 0.1 }}
            className="flex-shrink-0 w-80 space-y-6"
          >
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <h3 className="text-xs font-black text-muted-foreground/50 uppercase tracking-[0.2em]">
                  {stage.replace('_', ' ')}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-black text-primary">
                {pipelines.filter(p => p.stage === stage).length}
              </span>
            </div>
            
            <div className="space-y-4 p-4 rounded-[2.5rem] bg-slate-50/50 border border-slate-200/60 min-h-[600px] transition-all duration-300">
              {loading ? (
                 <div className="flex flex-col items-center justify-center h-40 opacity-30 gap-3">
                   <Loader2 className="animate-spin" size={24} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Sycing...</span>
                 </div>
              ) : pipelines
                .filter((p) => p.stage === stage)
                .map((deal, dIndex) => (
                  <motion.div
                    key={deal.id}
                    layoutId={deal.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="glass-card p-5 rounded-[2rem] group cursor-grab active:cursor-grabbing hover:border-primary/20 transition-all"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <DollarSign size={16} />
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.1em] border",
                        deal.stage === "WON" 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                        : "bg-blue-50 text-blue-600 border-blue-200"
                      )}>
                        {Math.floor(Math.random() * 20) + 1}d Age
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">Company</p>
                        <p className="font-extrabold text-foreground group-hover:text-primary transition-colors truncate">
                          {deal.client.companyName}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black text-foreground">
                            {deal.client.contactPerson.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-3xl font-black text-foreground tracking-widest leading-none drop-shadow-lg scale-y-110">
                            ₹{(deal.value / 1000).toFixed(0)}K
                          </span>
                        </div>
                        <TrendingUp size={16} className="text-emerald-500" />
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
