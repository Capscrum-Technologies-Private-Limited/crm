"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Loader2 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    revenue: "",
    shouldOnboard: false
  });

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clients?page=${page}`);
      const payload = await res.json();
      setClients(Array.isArray(payload.data) ? payload.data : []);
      setTotalPages(payload.totalPages || 1);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setOpen(false);
        setFormData({
          companyName: "",
          contactPerson: "",
          email: "",
          phone: "",
          revenue: "",
          shouldOnboard: false
        });
        fetchClients();
      }
    } catch (error) {
      console.error("Error creating client:", error);
    } finally {
      setSubmitting(false);
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
            Client <span className="text-primary">Management</span>
          </h2>
          <p className="text-muted-foreground text-lg font-medium">Manage your elite business relationships and high-value pipeline.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="px-8 py-4 rounded-2xl premium-gradient text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2">
              <Plus size={20} />
              <span>Register New Client</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] !bg-white border-slate-200 rounded-[2.5rem] p-8 shadow-2xl">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black text-foreground">New Client <span className="text-primary">Registry</span></DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Company Identity</Label>
                <Input 
                  id="companyName" 
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  required 
                  placeholder="e.g. Acme Corporation"
                  className="h-14 bg-slate-50 border-slate-200 rounded-2xl text-foreground focus:border-primary/50 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson" className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Point of Contact</Label>
                  <Input 
                    id="contactPerson" 
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                    required 
                    placeholder="Full Name"
                    className="h-12 bg-slate-50 border-slate-200 rounded-xl text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Direct Line</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 ..."
                    className="h-12 bg-slate-50 border-slate-200 rounded-xl text-foreground"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Professional Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                  placeholder="client@acme.com"
                  className="h-12 bg-slate-50 border-slate-200 rounded-xl text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="revenue" className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Project Valuation (₹)</Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">₹</div>
                  <Input 
                    id="revenue" 
                    type="number" 
                    value={formData.revenue}
                    onChange={(e) => setFormData({...formData, revenue: e.target.value})}
                    placeholder="5,00,000"
                    className="h-12 pl-10 bg-slate-50 border-slate-200 rounded-xl text-foreground"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <input 
                  type="checkbox" 
                  id="onboard" 
                  checked={formData.shouldOnboard}
                  onChange={(e) => setFormData({...formData, shouldOnboard: e.target.checked})}
                  className="h-5 w-5 rounded-lg border-slate-300 bg-white text-primary focus:ring-primary/50"
                />
                <Label htmlFor="onboard" className="text-sm font-bold text-foreground cursor-pointer select-none">
                  Automate Portal Sync & Onboarding
                </Label>
              </div>
              <DialogFooter className="pt-6">
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="w-full h-14 rounded-2xl premium-gradient text-white font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Initializing...
                    </>
                  ) : "Finalize Registration"}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-card rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h3 className="text-xl font-bold text-foreground">Active Portfolio</h3>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input 
              placeholder="Search by company or lead..." 
              className="h-12 pl-12 bg-slate-50 border-slate-200 rounded-2xl text-foreground placeholder:text-muted-foreground/30 focus:border-primary/30 transition-all font-medium"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-8 py-6 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Company</th>
                <th className="px-8 py-6 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Key Contact</th>
                <th className="px-8 py-6 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Revenue</th>
                <th className="px-8 py-6 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                       <span className="text-sm font-black text-muted-foreground/40 uppercase tracking-widest">Sycing with Server...</span>
                    </div>
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground/50 font-medium">
                    Workspace is currently empty. Start by adding your first client.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                          {client.companyName.substring(0, 1).toUpperCase()}
                        </div>
                        <span className="font-bold text-foreground text-base">{client.companyName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm">
                      <div className="font-bold text-foreground/80">{client.contactPerson}</div>
                      <div className="text-muted-foreground/40 font-medium mt-0.5">{client.email}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        client.status === "Onboarded" 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                        : "bg-blue-50 text-blue-600 border-blue-200"
                      )}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-bold text-foreground">₹{client.revenue.toLocaleString()}</td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-3 rounded-xl hover:bg-slate-100 text-muted-foreground hover:text-foreground transition-all">
                        <MoreHorizontal size={20} />
                      </button>
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
