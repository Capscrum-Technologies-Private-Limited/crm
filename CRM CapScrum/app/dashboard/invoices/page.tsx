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
  Download,
  Trash2,
  Send,
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

interface InvoiceItem {
  id?: string;
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
  client: { companyName: string; contactPerson: string };
  project?: { name: string } | null;
  items: InvoiceItem[];
  template?: { id: string; name: string; layout: string; colorPrimary: string } | null;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    clientId: "",
    projectId: "",
    dueDate: "",
    notes: "",
    taxRate: "0",
    discount: "0",
    templateId: "",
  });

  const [lineItems, setLineItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, rate: 0, amount: 0 },
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, cliRes, prjRes, tmpRes] = await Promise.all([
        fetch(`/api/invoices?page=${page}`),
        fetch("/api/clients?all=true"),
        fetch("/api/projects?all=true"),
        fetch("/api/templates"),
      ]);

      const [invPayload, cliData, prjPayload, tmpData] = await Promise.all([
        invRes.json(),
        cliRes.json(),
        prjRes.json(),
        tmpRes.ok ? tmpRes.json() : [],
      ]);

      setInvoices(Array.isArray(invPayload.data) ? invPayload.data : []);
      setTotalPages(invPayload.totalPages || 1);
      setClients(Array.isArray(cliData) ? cliData : cliData.data || []);
      setProjects(Array.isArray(prjPayload) ? prjPayload : prjPayload.data || []);
      setTemplates(Array.isArray(tmpData) ? tmpData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page]);

  const updateLineItem = (index: number, field: string, value: string | number) => {
    const updated = [...lineItems];
    (updated[index] as any)[field] = value;
    if (field === "quantity" || field === "rate") {
      updated[index].amount = Number(updated[index].quantity) * Number(updated[index].rate);
    }
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = subtotal * (parseFloat(formData.taxRate) / 100);
  const discountAmount = parseFloat(formData.discount) || 0;
  const grandTotal = subtotal + taxAmount - discountAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: lineItems.filter((i) => i.description && i.rate > 0),
        }),
      });

      if (res.ok) {
        setOpen(false);
        setFormData({ clientId: "", projectId: "", dueDate: "", notes: "", taxRate: "0", discount: "0", templateId: "" });
        setLineItems([{ description: "", quantity: 1, rate: 0, amount: 0 }]);
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

  const downloadPDF = async (id: string) => {
    setDownloading(id);
    try {
      const res = await fetch(`/api/invoices/${id}/pdf`);
      if (!res.ok) throw new Error("PDF generation failed");

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
      console.error("Download error:", err);
    } finally {
      setDownloading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { icon: any; color: string; label: string }> = {
      PAID: { icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600 border-emerald-200", label: "Paid" },
      PENDING: { icon: Clock, color: "bg-amber-50 text-amber-600 border-amber-200", label: "Pending" },
      SENT: { icon: Send, color: "bg-blue-50 text-blue-600 border-blue-200", label: "Sent" },
      OVERDUE: { icon: AlertCircle, color: "bg-red-50 text-red-600 border-red-200", label: "Overdue" },
      DRAFT: { icon: FileText, color: "bg-slate-100 text-slate-600 border-slate-200", label: "Draft" },
    };
    const cfg = configs[status] || configs.DRAFT;
    const Icon = cfg.icon;
    return (
      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-max border", cfg.color)}>
        <Icon size={12} /> {cfg.label}
      </span>
    );
  };

  const filteredInvoices = invoices.filter(
    (i) =>
      i.client.companyName.toLowerCase().includes(search.toLowerCase()) ||
      i.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  const totalOutstanding = invoices
    .filter((i) => i.status === "PENDING" || i.status === "OVERDUE" || i.status === "SENT")
    .reduce((acc, curr) => acc + (curr.total || curr.amount), 0);
  const totalPaid = invoices
    .filter((i) => i.status === "PAID")
    .reduce((acc, curr) => acc + (curr.total || curr.amount), 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">
            Invoicing <span className="text-primary">&amp; Billing</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg font-medium">
            Create invoices with line items, download PDFs, and track payments.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="px-8 py-4 rounded-lg premium-gradient text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
              <Plus size={20} />
              <span>Create Invoice</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] !bg-white border-slate-200 rounded-lg p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-black text-foreground">
                New <span className="text-primary">Invoice</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Client & Project */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Client</Label>
                  <select
                    required
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-md text-foreground px-4 outline-none font-medium text-sm"
                  >
                    <option value="">Select Client...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.companyName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Project (Opt)</Label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-md text-foreground px-4 outline-none font-medium text-sm"
                  >
                    <option value="">None</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">
                    Line Items
                  </Label>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                  >
                    <Plus size={14} /> Add Row
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-[1fr_80px_100px_100px_40px] gap-0 bg-slate-100 text-[10px] font-black text-muted-foreground/50 uppercase tracking-wider">
                    <div className="px-3 py-2.5">Description</div>
                    <div className="px-3 py-2.5 text-center">Qty</div>
                    <div className="px-3 py-2.5 text-right">Rate (₹)</div>
                    <div className="px-3 py-2.5 text-right">Amount</div>
                    <div className="px-3 py-2.5"></div>
                  </div>
                  {lineItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[1fr_80px_100px_100px_40px] gap-0 border-t border-slate-100 items-center"
                    >
                      <input
                        placeholder="e.g. Website Design"
                        value={item.description}
                        onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                        className="px-3 py-3 text-sm text-foreground outline-none bg-transparent font-medium placeholder:text-muted-foreground/30"
                      />
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(idx, "quantity", parseFloat(e.target.value) || 1)}
                        className="px-3 py-3 text-sm text-foreground text-center outline-none bg-transparent font-medium border-l border-slate-100"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate || ""}
                        onChange={(e) => updateLineItem(idx, "rate", parseFloat(e.target.value) || 0)}
                        className="px-3 py-3 text-sm text-foreground text-right outline-none bg-transparent font-medium border-l border-slate-100"
                      />
                      <div className="px-3 py-3 text-sm font-bold text-foreground text-right border-l border-slate-100">
                        ₹{(item.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        className="p-2 text-muted-foreground/30 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-72 space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Subtotal</span>
                    <span className="font-bold text-foreground">
                      ₹{(subtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="text-muted-foreground font-medium">Tax (%)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.taxRate}
                      onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                      className="w-20 h-8 text-right text-sm font-bold bg-white border border-slate-200 rounded-lg px-2 outline-none text-foreground"
                    />
                  </div>
                  {taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Tax Amount</span>
                      <span className="font-medium text-foreground">
                        +₹{(taxAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="text-muted-foreground font-medium">Discount (₹)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className="w-20 h-8 text-right text-sm font-bold bg-white border border-slate-200 rounded-lg px-2 outline-none text-foreground"
                    />
                  </div>
                  <div className="pt-2 border-t border-slate-300 flex justify-between">
                    <span className="text-base font-black text-foreground">Total</span>
                    <span className="text-base font-black text-primary">
                      ₹{(grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Due Date, Template, Notes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Due Date</Label>
                  <Input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="h-12 bg-slate-50 border-slate-200 rounded-md text-foreground font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Template</Label>
                  <select
                    value={formData.templateId}
                    onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-md text-foreground px-4 outline-none font-medium text-sm"
                  >
                    <option value="">Default</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Notes</Label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Payment terms, additional info..."
                  className="w-full min-h-[80px] rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 font-medium placeholder:text-muted-foreground/30"
                />
              </div>

              <DialogFooter className="pt-4">
                <button
                  type="submit"
                  disabled={submitting || !formData.clientId || lineItems.every((i) => !i.description)}
                  className="w-full h-14 rounded-lg premium-gradient text-white font-black text-sm shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
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
        <div className="glass-card rounded-lg p-6 text-foreground relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
          <Receipt size={24} className="text-primary mb-4 relative z-10" />
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] relative z-10">
            Total Outstanding
          </p>
          <p className="text-3xl font-black mt-1 relative z-10">
            ₹{(totalOutstanding || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="glass-card rounded-lg p-6 text-foreground relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          <CheckCircle2 size={24} className="text-emerald-500 mb-4 relative z-10" />
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] relative z-10">
            Total Paid
          </p>
          <p className="text-3xl font-black mt-1 relative z-10">
            ₹{(totalPaid || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="glass-card rounded-lg p-6 text-foreground relative overflow-hidden group bg-slate-50 border-slate-200">
          <AlertCircle size={24} className="text-red-500 mb-4" />
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
            Overdue Invoices
          </p>
          <p className="text-3xl font-black mt-1 text-red-600">
            {invoices.filter((i) => i.status === "OVERDUE").length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-lg overflow-hidden flex flex-col">
        <div className="p-6 md:p-8 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-foreground">Invoice Repository</h3>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder="Search by client or invoice number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 pl-12 bg-slate-50 border-slate-200 rounded-lg text-foreground font-medium w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-5 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Invoice</th>
                <th className="px-6 py-5 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Client</th>
                <th className="px-6 py-5 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Items</th>
                <th className="px-6 py-5 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Total</th>
                <th className="px-6 py-5 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-5 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <Loader2 className="animate-spin mx-auto text-primary" />
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground font-medium">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 w-[220px] max-w-[220px]">
                      <div className="flex flex-col truncate">
                        <span className="font-bold text-foreground text-sm truncate">{inv.invoiceNumber}</span>
                        <span className="text-[10px] text-muted-foreground/50 font-medium">
                          Due: {new Date(inv.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 truncate max-w-[180px]">
                      <span className="font-bold text-foreground text-sm truncate block">{inv.client.companyName}</span>
                      {inv.project && (
                        <span className="text-[10px] text-muted-foreground/50 font-medium">{inv.project.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-foreground">
                        {inv.items?.length || 1} item{(inv.items?.length || 1) > 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-foreground whitespace-nowrap">
                      ₹{(inv.total || inv.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(inv.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadPDF(inv.id)}
                          disabled={downloading === inv.id}
                          className="p-2.5 rounded-md bg-slate-50 border border-slate-200 text-muted-foreground hover:text-primary hover:border-primary/20 transition-all disabled:opacity-50"
                          title="Download PDF"
                        >
                          {downloading === inv.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Download size={14} />
                          )}
                        </button>
                        {inv.status !== "PAID" && (
                          <select
                            onChange={(e) => updateStatus(inv.id, e.target.value)}
                            value={inv.status}
                            className="h-9 text-xs px-2 bg-white border border-slate-200 rounded-lg font-bold text-foreground cursor-pointer shadow-sm focus:outline-none focus:border-primary w-[110px]"
                          >
                            <option value="DRAFT">Draft</option>
                            <option value="PENDING">Pending</option>
                            <option value="SENT">Sent</option>
                            <option value="OVERDUE">Overdue</option>
                            <option value="PAID">Mark Paid</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
          <span className="text-xs font-bold text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-md border border-slate-200 text-sm font-bold bg-white text-foreground hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 rounded-md border border-primary text-sm font-bold bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

