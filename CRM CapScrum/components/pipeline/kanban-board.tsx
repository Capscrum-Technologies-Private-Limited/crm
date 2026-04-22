"use client";

import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  AlertCircle, 
  MoreVertical, 
  Building2, 
  DollarSign,
  Briefcase,
  ChevronRight,
  TrendingUp,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

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

interface KanbanBoardProps {
  initialDeals: Pipeline[];
  stages: string[];
  stageLabels: Record<string, string>;
  stageMetrics: Record<string, { color: string, icon: any }>;
  onDealMove: (dealId: string, newStage: string) => Promise<void>;
  onEdit: (deal: Pipeline) => void;
}

export function KanbanBoard({ 
  initialDeals, 
  stages, 
  stageLabels, 
  stageMetrics,
  onDealMove,
  onEdit 
}: KanbanBoardProps) {
  const [deals, setDeals] = useState<Pipeline[]>(initialDeals);

  useEffect(() => {
    setDeals(initialDeals);
  }, [initialDeals]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStage = destination.droppableId;
    const dealId = draggableId;

    // Optimistic Update
    const updatedDeals = deals.map(d => 
      d.id === dealId ? { ...d, stage: newStage } : d
    );
    setDeals(updatedDeals);

    // Persist to DB
    try {
      await onDealMove(dealId, newStage);
    } catch (error) {
      // Revert if failed
      setDeals(deals);
    }
  };

  const getDealsByStage = (stage: string) => {
    return deals.filter(d => d.stage === stage);
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-8 -mx-6 px-6 scrollbar-thin scrollbar-thumb-slate-200/50 scrollbar-track-transparent hover:scrollbar-thumb-slate-300 transition-all min-h-[600px]">
      <DragDropContext onDragEnd={onDragEnd}>
        {stages.map((stage) => (
          <div key={stage} className="flex-shrink-0 w-72 flex flex-col gap-5">
            <div className="flex flex-col gap-3 px-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]",
                    stageMetrics[stage]?.color.replace('text-', 'bg-') || "bg-primary"
                  )} />
                  <h3 className="font-extrabold text-[11px] uppercase tracking-[0.2em] text-foreground/80 whitespace-nowrap">
                    {stageLabels[stage]}
                  </h3>
                </div>
                <div className="px-2 py-1 rounded-lg bg-slate-100/80 border border-slate-200/50 backdrop-blur-sm">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                    {getDealsByStage(stage).length} 
                  </span>
                </div>
              </div>
              
              {/* Progress Line */}
              <div className="h-[2px] w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={cn(
                  "h-full rounded-full transition-all duration-500",
                  stageMetrics[stage]?.color.replace('text-', 'bg-') || "bg-primary"
                )} style={{ width: getDealsByStage(stage).length > 0 ? '100%' : '10%' }} />
              </div>
            </div>

            <Droppable droppableId={stage}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={cn(
                    "flex-1 rounded-[2.5rem] p-4 transition-all duration-300 min-h-[450px] border border-transparent",
                    snapshot.isDraggingOver 
                      ? "bg-slate-100/60 border-slate-200/50 shadow-inner scale-[0.99]" 
                      : "bg-slate-50/40 hover:bg-slate-50/60"
                  )}
                >
                  <div className="space-y-3">
                    {getDealsByStage(stage).map((deal, index) => (
                      <Draggable key={deal.id} draggableId={deal.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "glass-card p-5 rounded-3xl border border-slate-100 group transition-all duration-200",
                              snapshot.isDragging ? "shadow-2xl ring-2 ring-primary/20 scale-[1.02]" : "hover:shadow-lg hover:border-primary/20"
                            )}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                  <Building2 size={18} />
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-bold text-sm text-foreground truncate max-w-[140px]">
                                    {deal.client?.companyName}
                                  </h4>
                                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                                    ID: {deal.id.slice(-6)}
                                  </p>
                                </div>
                              </div>
                              <button 
                                onClick={() => onEdit(deal)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-foreground"
                              >
                                <MoreVertical size={16} />
                              </button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-baseline gap-1">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">VAL:</span>
                                <span className="font-black text-sm text-foreground">
                                  ₹{(deal.value).toLocaleString()}
                                </span>
                              </div>
                              
                              <div className={cn(
                                "p-2 rounded-lg flex items-center justify-center bg-slate-50",
                                stageMetrics[deal.stage]?.color || "text-primary"
                              )}>
                                {(() => {
                                  const Icon = stageMetrics[deal.stage]?.icon || TrendingUp;
                                  return <Icon size={16} />;
                                })()}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>
    </div>
  );
}
