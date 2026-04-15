"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  CreditCard,
  Loader2,
} from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  description: string;
  status: "DRAFT" | "PENDING" | "PAID" | "OVERDUE";
  dueDate: string;
  createdAt: string;
  project?: { name: string } | null;
}

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  const fetchInvoices = () => {
    setLoading(true);
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data) => {
        setInvoices(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePay = async (id: string) => {
    // In production, this redirects to Stripe Checkout:
    // const session = await fetch("/api/stripe/checkout", { method: "POST" })
    // window.location.href = session.url;
    
    setPayingId(id);
    
    // Simulate networking delay for Stripe Redirect
    setTimeout(() => {
      alert("Redirecting to Secure Stripe Checkout Environment...");
      setPayingId(null);
    }, 1500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-max"><CheckCircle2 size={12}/> Paid</span>;
      case "PENDING":
        return <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-max"><Clock size={12}/> Due Soon</span>;
      case "OVERDUE":
        return <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-max"><AlertCircle size={12}/> Overdue</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-max"><FileText size={12}/> Processing</span>;
    }
  };

  const unpaidInvoices = invoices.filter(i => i.status === "PENDING" || i.status === "OVERDUE");
  const paidInvoices = invoices.filter(i => i.status === "PAID");

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Billing <span className="text-primary">&amp; Invoices</span>
        </h2>
        <p className="text-muted-foreground font-medium">Manage your payments and billing history securely.</p>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <AlertCircle className="text-primary" size={24} />
          Action Required
        </h3>
        
        {loading ? (
           <div className="glass-card rounded-[2rem] p-12 flex justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
        ) : unpaidInvoices.length === 0 ? (
          <div className="glass-card rounded-[2rem] p-12 text-center flex flex-col items-center justify-center">
            <CheckCircle2 size={48} className="text-emerald-500 mb-4 opacity-50" />
            <p className="font-bold text-foreground">You're all caught up!</p>
            <p className="text-sm text-muted-foreground mt-1">No pending invoices due at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {unpaidInvoices.map(inv => (
              <div key={inv.id} className="glass-card rounded-[2rem] p-6 md:p-8 flex flex-col border-primary/20 bg-primary/5">
                <div className="flex justify-between items-start mb-6">
                  {getStatusBadge(inv.status)}
                  <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">{inv.invoiceNumber}</span>
                </div>
                
                <h4 className="text-3xl font-black text-foreground mb-2">₹{inv.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</h4>
                <p className="text-sm font-bold text-muted-foreground mb-1">{inv.description}</p>
                <p className="text-[11px] font-medium text-muted-foreground/60 mb-8">Due: {new Date(inv.dueDate).toLocaleDateString()}</p>
                
                <button 
                  onClick={() => handlePay(inv.id)}
                  disabled={payingId === inv.id}
                  className="mt-auto w-full h-14 rounded-2xl bg-foreground text-white font-black text-sm hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {payingId === inv.id ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
                  Pay Securely via Stripe
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6 pt-8">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Receipt className="text-muted-foreground/50" size={24} />
          Payment History
        </h3>
        
        <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Details</th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Amount</th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!loading && paidInvoices.length === 0 ? (
                   <tr><td colSpan={3} className="p-8 text-center text-muted-foreground font-medium text-sm">No payment history available.</td></tr>
                ) : (
                  paidInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 md:px-8 py-4">
                        <div className="flex flex-col truncate w-full md:w-auto">
                          <span className="font-bold text-foreground text-sm truncate">{inv.description}</span>
                          <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest truncate">{inv.invoiceNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 md:px-8 py-4 font-black text-foreground">
                        ₹{inv.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                      <td className="px-6 md:px-8 py-4">
                        {getStatusBadge(inv.status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
