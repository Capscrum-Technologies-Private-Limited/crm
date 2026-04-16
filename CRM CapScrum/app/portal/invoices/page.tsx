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
  Download,
  Send,
} from "lucide-react";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  amount: number;
  description: string;
  notes: string | null;
  status: string;
  dueDate: string;
  createdAt: string;
  project?: { name: string } | null;
  items: InvoiceItem[];
}

export default function PortalInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchInvoices = () => {
    setLoading(true);
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((payload) => {
        const data = Array.isArray(payload) ? payload : payload.data || [];
        setInvoices(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePay = async (id: string) => {
    setPayingId(id);
    setTimeout(() => {
      alert("Redirecting to Secure Stripe Checkout Environment...");
      setPayingId(null);
    }, 1500);
  };

  const downloadPDF = async (id: string) => {
    setDownloading(id);
    try {
      const res = await fetch(`/api/invoices/${id}/pdf`);
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { icon: any; color: string; label: string }> = {
      PAID: { icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600 border-emerald-200", label: "Paid" },
      PENDING: { icon: Clock, color: "bg-amber-50 text-amber-600 border-amber-200", label: "Due Soon" },
      SENT: { icon: Send, color: "bg-blue-50 text-blue-600 border-blue-200", label: "Sent" },
      OVERDUE: { icon: AlertCircle, color: "bg-red-50 text-red-600 border-red-200", label: "Overdue" },
      DRAFT: { icon: FileText, color: "bg-slate-100 text-slate-600 border-slate-200", label: "Processing" },
    };
    const cfg = configs[status] || configs.DRAFT;
    const Icon = cfg.icon;
    return (
      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-max border", cfg.color)}>
        <Icon size={12} /> {cfg.label}
      </span>
    );
  };

  const getDisplayTotal = (inv: Invoice) => inv.total || inv.amount || 0;

  const unpaidInvoices = invoices.filter(
    (i) => i.status === "PENDING" || i.status === "OVERDUE" || i.status === "SENT"
  );
  const paidInvoices = invoices.filter((i) => i.status === "PAID");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-5xl mx-auto"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Billing <span className="text-primary">&amp; Invoices</span>
        </h2>
        <p className="text-muted-foreground font-medium">
          View invoices, download PDFs, and manage your payments.
        </p>
      </div>

      {/* Unpaid invoices */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <AlertCircle className="text-primary" size={24} />
          Action Required
        </h3>

        {loading ? (
          <div className="glass-card rounded-[2rem] p-12 flex justify-center">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
          </div>
        ) : unpaidInvoices.length === 0 ? (
          <div className="glass-card rounded-[2rem] p-12 text-center flex flex-col items-center justify-center">
            <CheckCircle2 size={48} className="text-emerald-500 mb-4 opacity-50" />
            <p className="font-bold text-foreground">You're all caught up!</p>
            <p className="text-sm text-muted-foreground mt-1">
              No pending invoices due at this time.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {unpaidInvoices.map((inv) => (
              <div
                key={inv.id}
                className="glass-card rounded-[2rem] p-6 md:p-8 flex flex-col border-primary/20 bg-primary/5"
              >
                <div className="flex justify-between items-start mb-4">
                  {getStatusBadge(inv.status)}
                  <span className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">
                    {inv.invoiceNumber}
                  </span>
                </div>

                <h4 className="text-3xl font-black text-foreground mb-2">
                  ₹{getDisplayTotal(inv).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h4>

                {/* Line items preview */}
                {inv.items && inv.items.length > 0 ? (
                  <div className="space-y-1 mb-3">
                    {inv.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-medium truncate mr-2">
                          {item.description}
                        </span>
                        <span className="font-bold text-foreground whitespace-nowrap">
                          ₹{item.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {inv.items.length > 3 && (
                      <p className="text-[10px] text-muted-foreground/50">
                        +{inv.items.length - 3} more items
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-bold text-muted-foreground mb-1">
                    {inv.description}
                  </p>
                )}

                {inv.project && (
                  <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">
                    {inv.project.name}
                  </p>
                )}
                <p className="text-[11px] font-medium text-muted-foreground/60 mb-6">
                  Due: {new Date(inv.dueDate).toLocaleDateString()}
                </p>

                <div className="mt-auto flex gap-3">
                  <button
                    onClick={() => handlePay(inv.id)}
                    disabled={payingId === inv.id}
                    className="flex-1 h-12 rounded-2xl bg-foreground text-white font-black text-sm hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {payingId === inv.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <CreditCard size={16} />
                    )}
                    Pay Now
                  </button>
                  <button
                    onClick={() => downloadPDF(inv.id)}
                    disabled={downloading === inv.id}
                    className="h-12 px-4 rounded-2xl border border-slate-200 bg-white text-foreground font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {downloading === inv.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Download size={16} />
                    )}
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment History */}
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
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                    Invoice
                  </th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                    Items
                  </th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                    Total
                  </th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                    Status
                  </th>
                  <th className="px-6 md:px-8 py-5 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!loading && paidInvoices.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-muted-foreground font-medium text-sm"
                    >
                      No payment history available.
                    </td>
                  </tr>
                ) : (
                  paidInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 md:px-8 py-4">
                        <div className="flex flex-col truncate">
                          <span className="font-bold text-foreground text-sm truncate">
                            {inv.invoiceNumber}
                          </span>
                          {inv.project && (
                            <span className="text-[10px] text-muted-foreground/50 font-medium">
                              {inv.project.name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 md:px-8 py-4 text-sm text-foreground font-medium">
                        {inv.items?.length || 1} item{(inv.items?.length || 1) > 1 ? "s" : ""}
                      </td>
                      <td className="px-6 md:px-8 py-4 font-black text-foreground">
                        ₹{getDisplayTotal(inv).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 md:px-8 py-4">{getStatusBadge(inv.status)}</td>
                      <td className="px-6 md:px-8 py-4">
                        <button
                          onClick={() => downloadPDF(inv.id)}
                          disabled={downloading === inv.id}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-muted-foreground hover:text-primary hover:border-primary/20 transition-all disabled:opacity-50"
                          title="Download PDF"
                        >
                          {downloading === inv.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Download size={14} />
                          )}
                        </button>
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
