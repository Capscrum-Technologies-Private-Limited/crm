"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

const STAGES = ["LEAD", "CONTACTED", "PROPOSAL_SENT", "WON", "LOST"];

export default function PipelinePage() {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pipeline")
      .then((res) => res.json())
      .then((data) => {
        setPipelines(data);
        setLoading(false);
      });
  }, []);

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
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            New Deal
          </Button>
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
                           {[1, 2].map(i => (
                             <div key={i} className="w-6 h-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                               JD
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
