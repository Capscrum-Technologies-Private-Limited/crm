"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    fetch("/api/clients")
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Sales Pipeline</h2>
          <p className="text-muted-foreground">Track deals and revenue opportunities across stages.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-card border-border">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" /> New Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Add New Deal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
                <div className="grid gap-2">
                  <Label htmlFor="stage" className="text-foreground">Pipeline Stage</Label>
                  <select 
                    id="stage" 
                    value={formData.stage}
                    onChange={(e) => setFormData({...formData, stage: e.target.value})}
                    required
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
                  >
                    {STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="value" className="text-foreground">Deal Value (₹)</Label>
                  <Input 
                    id="value" 
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    required
                    placeholder="e.g. 150000"
                    className="bg-background border-input"
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={submitting || !formData.clientId} className="w-full">
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : "Add Deal"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {STAGES.map((stage) => (
          <div key={stage} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stage.replace('_', ' ')}</h3>
              <Badge variant="secondary" className="bg-muted text-muted-foreground">
                {pipelines.filter(p => p.stage === stage).length}
              </Badge>
            </div>
            
            <div className="space-y-4 min-h-[500px] bg-muted/30 rounded-2xl p-3 border border-dashed border-border transition-colors">
              {loading ? (
                 <div className="flex justify-center p-8 opacity-50">
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                 </div>
              ) : pipelines
                .filter((p) => p.stage === stage)
                .map((deal) => (
                  <Card key={deal.id} className="bg-card border-border hover:shadow-md transition-all cursor-grab active:cursor-grabbing group">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{deal.client.companyName}</p>
                        <Badge variant="outline" className={getStageColor(deal.stage) + " text-[10px] h-5"}>
                          {Math.floor(Math.random() * 30)}d
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-foreground font-bold text-lg">
                        <span className="text-muted-foreground text-sm font-normal">₹</span>
                        <span>{deal.value.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                        <div className="flex -space-x-2">
                           {[1].map(i => (
                             <div key={i} className="w-6 h-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                               {deal.client.contactPerson.substring(0, 2).toUpperCase()}
                             </div>
                           ))}
                        </div>
                        <div className="ml-auto text-[10px] text-muted-foreground flex items-center gap-1">
                          <TrendingUp size={10} className="text-emerald-600" />
                          High
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
