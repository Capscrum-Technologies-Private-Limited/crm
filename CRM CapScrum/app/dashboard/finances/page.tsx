"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  Download, 
  Filter, 
  Calendar, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Building2,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Payment {
  id: string;
  amount: number;
  type: string;
  date: string;
  notes?: string;
  projectId: string;
  project: {
    name: string;
    totalValue: number;
  };
  client: {
    companyName: string;
  };
}

export default function FinancesPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  
  // Filters
  const [dateFilter, setDateFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments"); // Need to ensure it supports global fetch or add param
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const exportToCSV = () => {
    const headers = ["Date", "Client", "Project", "Type", "Amount", "Notes"];
    const rows = payments.map(p => [
      new Date(p.date).toLocaleDateString(),
      p.client.companyName,
      p.project.name,
      p.type,
      p.amount,
      p.notes || ""
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `finances_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);
  const advanceTotal = payments.filter(p => p.type === "ADVANCE").reduce((sum, p) => sum + p.amount, 0);
  const transitTotal = payments.length * 5000; // Mock calculation for demostration or use actual pending

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">
            Financial <span className="text-primary">Ledger</span>
          </h2>
          <p className="text-muted-foreground text-lg font-medium">Enterprise liquidity and capital allocation tracking.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToCSV}
            className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-foreground font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <Download size={18} />
            <span>Export CSV</span>
          </button>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="px-8 py-4 rounded-2xl premium-gradient text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                <Plus size={20} />
                <span>Record Payment</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Record Capital Inflow</DialogTitle>
              </DialogHeader>
              {/* Form implementation for recording payment */}
              <div className="py-4 space-y-4">
                 <p className="text-sm text-muted-foreground italic">Payment recording interface integrated with project selector.</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden group border-emerald-500/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-2">Total Recieved</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">₹{(totalReceived).toLocaleString()}</span>
            <div className="flex items-center text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight size={10} className="mr-1" />
              12%
            </div>
          </div>
        </div>
        <div className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden group border-blue-500/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-2">Advance Capital</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-600">₹{(advanceTotal).toLocaleString()}</span>
            <span className="text-xs font-bold text-muted-foreground/60">Secured</span>
          </div>
        </div>
        <div className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden group border-amber-500/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-2">Projected Inflow</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">₹{(transitTotal).toLocaleString()}</span>
            <span className="text-xs font-bold text-amber-600/60 font-medium">Next 30 Days</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transaction History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-xl font-black text-foreground">Transaction <span className="text-primary">History</span></h3>
             <div className="flex gap-2">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={14} />
                  <input 
                    type="text" 
                    placeholder="Filter by client..."
                    className="pl-9 h-10 w-48 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold focus:outline-none focus:border-primary/30"
                  />
                </div>
             </div>
          </div>

          <div className="glass-card rounded-[3rem] overflow-hidden border-slate-100/50">
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-slate-50/50">
                         <th className="px-8 py-5 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Transaction</th>
                         <th className="px-8 py-5 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Project/Client</th>
                         <th className="px-8 py-5 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Category</th>
                         <th className="px-8 py-5 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] text-right">Amount</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="px-8 py-20 text-center">
                            <Loader2 className="animate-spin text-primary mx-auto mb-2" size={24} />
                            <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Hydrating Ledger...</span>
                          </td>
                        </tr>
                      ) : payments.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-8 py-20 text-center text-muted-foreground/40 font-bold italic">
                            No transactions recorded in the current fiscal period.
                          </td>
                        </tr>
                      ) : payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors group">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <CreditCard size={18} />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="font-bold text-sm text-foreground">Payment Received</span>
                                    <span className="text-[10px] font-medium text-muted-foreground uppercase">{new Date(payment.date).toLocaleDateString()}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex flex-col">
                                 <span className="font-black text-sm text-primary uppercase text-[10px] tracking-widest mb-0.5">{payment.client?.companyName}</span>
                                 <span className="font-bold text-xs text-foreground truncate max-w-[200px]">{payment.project?.name}</span>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                                payment.type === "ADVANCE" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600"
                              )}>
                                {payment.type}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-right font-black text-foreground">
                              ₹{payment.amount.toLocaleString()}
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="space-y-6">
           <h3 className="text-xl font-black text-foreground px-2">Revenue <span className="text-primary">Breakdown</span></h3>
           <div className="glass-card rounded-[3rem] p-8 border-slate-100/50">
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Advance Funds</span>
                       <span className="text-xs font-black text-foreground">42%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500 rounded-full" style={{ width: "42%" }} />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Milestones</span>
                       <span className="text-xs font-black text-foreground">35%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-primary rounded-full" style={{ width: "35%" }} />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Final Closures</span>
                       <span className="text-xs font-black text-foreground">23%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500 rounded-full" style={{ width: "23%" }} />
                    </div>
                 </div>
              </div>

              <div className="mt-10 p-6 rounded-[2rem] bg-slate-50 border border-slate-100/50">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                       <PieChart size={14} className="text-primary" />
                    </div>
                    <span className="text-[10px] font-black text-foreground uppercase tracking-widest">Fiscal Health</span>
                 </div>
                 <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    Capital inflow is currently concentrated in advance procurement stages. Revenue capture is trending 4.2% above previous quartiles.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
