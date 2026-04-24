"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Plus,
  Receipt,
  Trash2,
  Loader2,
  Search,
  Tag,
  DollarSign,
  TrendingDown,
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

const CATEGORIES = [
  { value: "OPERATIONS", label: "Operations", color: "bg-blue-50 text-blue-600 border-blue-200" },
  { value: "MARKETING", label: "Marketing", color: "bg-purple-50 text-purple-600 border-purple-200" },
  { value: "SALARIES", label: "Salaries", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  { value: "SOFTWARE", label: "Software", color: "bg-amber-50 text-amber-600 border-amber-200" },
  { value: "TRAVEL", label: "Travel", color: "bg-cyan-50 text-cyan-600 border-cyan-200" },
  { value: "OFFICE", label: "Office", color: "bg-pink-50 text-pink-600 border-pink-200" },
  { value: "OTHER", label: "Other", color: "bg-slate-100 text-slate-600 border-slate-200" },
];

interface Project {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  project?: Project;
}

interface CategoryStat {
  category: string;
  total: number;
  count: number;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [grandTotal, setGrandTotal] = useState(0);
  const [byCategory, setByCategory] = useState<CategoryStat[]>([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "OTHER",
    date: new Date().toISOString().split("T")[0],
    projectId: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (filterCategory) params.set("category", filterCategory);

      const [expRes, prjRes] = await Promise.all([
        fetch(`/api/expenses?${params}`),
        fetch("/api/projects?all=true"),
      ]);
      const [expData, prjData] = await Promise.all([expRes.json(), prjRes.json()]);

      setExpenses(expData.data || []);
      setTotalPages(expData.totalPages || 1);
      setGrandTotal(expData.grandTotal || 0);
      setByCategory(expData.byCategory || []);
      setProjects(Array.isArray(prjData) ? prjData : prjData.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, filterCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setOpen(false);
        setFormData({ description: "", amount: "", category: "OTHER", date: new Date().toISOString().split("T")[0], projectId: "" });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteExpense = async (id: string) => {
    await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
    fetchData();
  };

  const getCategoryConfig = (cat: string) => CATEGORIES.find((c) => c.value === cat) || CATEGORIES[6];

  const filteredExpenses = expenses.filter((e) =>
    e.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">
            Expense <span className="text-primary">Tracker</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg font-medium">
            Track and categorize all business expenses.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="px-8 py-4 rounded-lg premium-gradient text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2">
              <Plus size={20} />
              <span>Add Expense</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] !bg-white border-slate-200 rounded-lg p-6 md:p-8 shadow-2xl">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-black text-foreground">
                New <span className="text-primary">Expense</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Description</Label>
                <Input
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. AWS hosting bill"
                  className="h-12 bg-slate-50 border-slate-200 rounded-md text-foreground font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Amount (₹)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 font-bold">₹</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="h-12 pl-8 bg-slate-50 border-slate-200 rounded-md text-foreground font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Date</Label>
                  <Input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="h-12 bg-slate-50 border-slate-200 rounded-md text-foreground font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Category</Label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-md text-foreground px-4 outline-none font-medium text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
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
              <DialogFooter className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-14 rounded-lg premium-gradient text-white font-black text-sm shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : "Record Expense"}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-lg p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl" />
          <TrendingDown size={22} className="text-red-500 mb-3" />
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Total Expenses</p>
          <p className="text-2xl font-black text-foreground mt-1">
            ₹{(grandTotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
        </div>
        {byCategory.slice(0, 3).map((cat, i) => {
          const cfg = getCategoryConfig(cat.category);
          return (
            <div key={i} className="glass-card rounded-lg p-6 relative overflow-hidden">
              <Tag size={22} className="text-primary/50 mb-3" />
              <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">{cfg.label}</p>
              <p className="text-2xl font-black text-foreground mt-1">
                ₹{(cat.total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-muted-foreground/40 font-medium mt-1">{cat.count} entries</p>
            </div>
          );
        })}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setFilterCategory(""); setPage(1); }}
          className={cn(
            "px-4 py-2 rounded-md text-xs font-bold transition-all border",
            !filterCategory ? "bg-primary text-white border-primary" : "bg-white text-foreground border-slate-200 hover:border-primary/30"
          )}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => { setFilterCategory(cat.value); setPage(1); }}
            className={cn(
              "px-4 py-2 rounded-md text-xs font-bold transition-all border",
              filterCategory === cat.value ? "bg-primary text-white border-primary" : `${cat.color}`
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-foreground">Expense Log</h3>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 pl-12 bg-slate-50 border-slate-200 rounded-lg text-foreground font-medium w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-6 py-5 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Description</th>
                <th className="px-6 py-5 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Category</th>
                <th className="px-6 py-5 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Project</th>
                <th className="px-6 py-5 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Date</th>
                <th className="px-6 py-5 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Amount</th>
                <th className="px-6 py-5 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></td></tr>
              ) : filteredExpenses.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-muted-foreground font-medium">No expenses found.</td></tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const cfg = getCategoryConfig(exp.category);
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-foreground text-sm max-w-[250px] truncate">{exp.description}</td>
                      <td className="px-6 py-4">
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", cfg.color)}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                        {exp.project?.name || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground font-medium">
                        {new Date(exp.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-black text-red-600 whitespace-nowrap">
                        ₹{(exp.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="p-2 rounded-md text-muted-foreground/30 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
          <span className="text-xs font-bold text-muted-foreground">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-md border border-slate-200 text-sm font-bold bg-white text-foreground hover:bg-slate-100 disabled:opacity-50 transition-all"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 rounded-md border border-primary text-sm font-bold bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

