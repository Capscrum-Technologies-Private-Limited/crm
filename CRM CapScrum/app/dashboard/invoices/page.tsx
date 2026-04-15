"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Plus,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Search,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  description: string;
  status: "DRAFT" | "PENDING" | "PAID" | "OVERDUE";
  dueDate: string;
  createdAt: string;
  client: { companyName: string; contactPerson: string };
  project?: { name: string } | null;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    clientId: "",
    projectId: "",
    amount: "",
    description: "",
    dueDate: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, cliRes, prjRes] = await Promise.all([
        fetch(`/api/invoices?page=${page}`),
        fetch("/api/clients?all=true"),
        fetch("/api/projects?all=true"),
      ]);
      const [invPayload, cliData, prjPayload] = await Promise.all([
        invRes.json(),
        cliRes.json(),
        prjRes.json(),
      ]);

      setInvoices(Array.isArray(invPayload.data) ? invPayload.data : []);
      setTotalPages(invPayload.totalPages || 1);
      setClients(Array.isArray(cliData.data) ? cliData.data : (Array.isArray(cliData) ? cliData : []));
      setProjects(Array.isArray(prjPayload.data) ? prjPayload.data : (Array.isArray(prjPayload) ? prjPayload : []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (res.ok) {
        setOpen(false);
        setFormData({ clientId: "", projectId: "", amount: "", description: "", dueDate: "" });
        fetchData();
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-max"><CheckCircle2 size={12}/> Paid</span>;
      case "PENDING":
        return <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-max"><Clock size={12}/> Pending</span>;
      case "OVERDUE":
        return <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-max"><AlertCircle size={12}/> Overdue</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-max"><FileText size={12}/> Draft</span>;
    }
  };

  const filteredInvoices = invoices.filter(i => 
    i.client.companyName.toLowerCase().includes(search.toLowerCase()) ||
    i.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  const totalOutstanding = invoices.filter(i => i.status === "PENDING" || i.status === "OVERDUE").reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = invoices.filter(i => i.status === "PAID").reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">
            Invoicing <span className="text-primary">&amp; Billing</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg font-medium">Manage client billing and track incoming revenue.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="px-8 py-4 rounded-2xl premium-gradient text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
              <Plus size={20} />
              <span>Create Invoice</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] !bg-white border-slate-200 rounded-[2.5rem] p-6 md:p-8 shadow-2xl">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black text-foreground">New <span className="text-primary">Invoice</span></DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Client</Label>
                  <select
                    required
                    value={formData.clientId}
                    onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl text-foreground px-4 outline-none font-medium text-sm"
                  >
                    <option value="">Select Client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Project (Opt)</Label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl text-foreground px-4 outline-none font-medium text-sm"
                  >
                    <option value="">None</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Amount (₹)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 font-bold">₹</span>
                  <Input 
                    type="number" step="0.01" min="0" required
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="1500.00"
                    className="h-14 pl-8 bg-slate-50 border-slate-200 rounded-2xl text-foreground text-lg font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Description line item</Label>
                <Input 
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="e.g. Website Design - Phase 1"
                  className="h-14 bg-slate-50 border-slate-200 rounded-2xl text-foreground font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Due Date</Label>
                <Input 
                  type="date" required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="h-14 bg-slate-50 border-slate-200 rounded-2xl text-foreground font-medium"
                />
              </div>

              <DialogFooter className="pt-4">
                <button 
                  type="submit" disabled={submitting} 
                  className="w-full h-14 rounded-2xl premium-gradient text-white font-black text-sm shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : "Issue Invoice"}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="glass-card rounded-[2rem] p-6 text-foreground relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
          <Receipt size={24} className="text-primary mb-4 relative z-10" />
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] relative z-10">Total Outstanding</p>
          <p className="text-3xl font-black mt-1 relative z-10">₹{totalOutstanding.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>
        <div className="glass-card rounded-[2rem] p-6 text-foreground relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          <CheckCircle2 size={24} className="text-emerald-500 mb-4 relative z-10" />
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] relative z-10">Total Paid</p>
          <p className="text-3xl font-black mt-1 relative z-10">₹{totalPaid.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>
        <div className="glass-card rounded-[2rem] p-6 text-foreground relative overflow-hidden group bg-slate-50 border-slate-200">
           <AlertCircle size={24} className="text-red-500 mb-4" />
           <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Overdue Entities</p>
           <p className="text-3xl font-black mt-1 text-red-600">{invoices.filter(i => i.status === "OVERDUE").length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col">
        <div className="p-6 md:p-8 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-foreground">Invoice Repository</h3>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input 
              placeholder="Search by client or invoice number..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 pl-12 bg-slate-50 border-slate-200 rounded-2xl text-foreground font-medium w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-5 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Invoice</th>
                <th className="px-6 py-5 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Client</th>
                <th className="px-6 py-5 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Amount</th>
                <th className="px-6 py-5 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-5 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></td></tr>
              ) : filteredInvoices.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground font-medium">No invoices found.</td></tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 w-[250px] max-w-[250px]">
                      <div className="flex flex-col truncate">
                        <span className="font-bold text-foreground truncate">{inv.description}</span>
                        <span className="text-[10px] font-black text-muted-foreground/50 uppercase truncate">{inv.invoiceNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 truncate max-w-[200px]">
                      <span className="font-bold text-foreground text-sm truncate block">{inv.client.companyName}</span>
                    </td>
                    <td className="px-6 py-4 font-black text-foreground whitespace-nowrap">
                      ₹{inv.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(inv.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {inv.status !== "PAID" && (
                        <select 
                          onChange={(e) => updateStatus(inv.id, e.target.value)}
                          value={inv.status}
                          className="h-8 md:h-10 text-xs px-2 md:px-3 bg-white border border-slate-200 rounded-lg font-bold text-foreground cursor-pointer shadow-sm focus:outline-none focus:border-primary w-[120px]"
                        >
                          <option value="DRAFT">Draft</option>
                          <option value="PENDING">Pending</option>
                          <option value="OVERDUE">Overdue</option>
                          <option value="PAID">Mark Paid</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
           <span className="text-xs font-bold text-muted-foreground">Page {page} of {totalPages}</span>
           <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold bg-white text-foreground hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                 Prev
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-xl border border-primary text-sm font-bold bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                 Next
              </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
