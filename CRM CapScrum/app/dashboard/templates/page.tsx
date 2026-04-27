"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Plus,
  FileText,
  Palette,
  Star,
  Trash2,
  Loader2,
  Edit3,
  Eye,
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

const LAYOUTS = [
  { value: "classic", label: "Classic", description: "Traditional professional layout" },
  { value: "modern", label: "Modern", description: "Clean minimal design" },
  { value: "minimal", label: "Minimal", description: "Stripped-down essentials" },
];

const PRESET_COLORS = [
  "#3b82f6", "#8b5cf6", "#ef4444", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#1e293b",
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "INVOICE",
    layout: "classic",
    colorPrimary: "#3b82f6",
    colorSecondary: "#1e293b",
    headerText: "",
    footerText: "Thank you for your business.",
    isDefault: false,
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const resetForm = () => {
    setFormData({ name: "", type: "INVOICE", layout: "classic", colorPrimary: "#3b82f6", colorSecondary: "#1e293b", headerText: "", footerText: "Thank you for your business.", isDefault: false });
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = "/api/templates";
      const method = editing ? "PATCH" : "POST";
      const body = editing ? { id: editing.id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setOpen(false);
        resetForm();
        fetchTemplates();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    await fetch(`/api/templates?id=${id}`, { method: "DELETE" });
    fetchTemplates();
  };

  const editTemplate = (t: any) => {
    setEditing(t);
    setFormData({
      name: t.name,
      type: t.type,
      layout: t.layout,
      colorPrimary: t.colorPrimary,
      colorSecondary: t.colorSecondary,
      headerText: t.headerText || "",
      footerText: t.footerText || "",
      isDefault: t.isDefault,
    });
    setOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">
            Invoice <span className="text-primary">Templates</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg font-medium">
            Create and manage reusable templates for invoices.
          </p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <button className="px-8 py-4 rounded-lg premium-gradient text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2">
              <Plus size={20} />
              <span>New Template</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] !bg-white border-slate-200 rounded-lg p-6 md:p-8 shadow-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-black text-foreground">
                {editing ? "Edit" : "New"} <span className="text-primary">Template</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Template Name</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Professional Blue"
                  className="h-12 bg-slate-50 border-slate-200 rounded-md text-foreground font-medium"
                />
              </div>

              {/* Layout */}
              <div className="space-y-2">
                <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Layout Style</Label>
                <div className="grid grid-cols-3 gap-3">
                  {LAYOUTS.map((l) => (
                    <button
                      key={l.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, layout: l.value })}
                      className={cn(
                        "p-4 rounded-md border-2 transition-all text-center",
                        formData.layout === l.value
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <p className="text-sm font-bold text-foreground">{l.label}</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-1">{l.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-2">
                <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Primary Color</Label>
                <div className="flex items-center gap-3 flex-wrap">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, colorPrimary: color })}
                      className={cn(
                        "w-10 h-10 rounded-md transition-all border-2",
                        formData.colorPrimary === color ? "border-foreground scale-110 shadow-lg" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={formData.colorPrimary}
                    onChange={(e) => setFormData({ ...formData, colorPrimary: e.target.value })}
                    className="w-10 h-10 rounded-md cursor-pointer border-0"
                  />
                </div>
              </div>

              {/* Footer text */}
              <div className="space-y-2">
                <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Footer Text</Label>
                <Input
                  value={formData.footerText}
                  onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                  placeholder="Thank you for your business."
                  className="h-12 bg-slate-50 border-slate-200 rounded-md text-foreground font-medium"
                />
              </div>

              {/* Default toggle */}
              <div className="flex items-center gap-3 p-4 rounded-md bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="h-5 w-5 rounded-lg"
                />
                <Label htmlFor="isDefault" className="text-sm font-bold text-foreground cursor-pointer">
                  Set as default template
                </Label>
              </div>

              <DialogFooter className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-14 rounded-lg premium-gradient text-white font-black text-sm shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : editing ? "Save Changes" : "Create Template"}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto opacity-40" />
          </div>
        ) : templates.length === 0 ? (
          <div className="col-span-full glass-card single-sided-gradient rounded-lg border-dashed py-20 text-center shadow-xl shadow-primary/5">
            <FileText size={40} className="mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-lg font-bold text-foreground/40">No templates yet</p>
            <p className="text-sm text-muted-foreground/40 mt-1">Create your first invoice template to get started.</p>
          </div>
        ) : (
          templates.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card single-sided-gradient rounded-lg overflow-hidden group hover:border-primary/20 transition-all shadow-xl shadow-primary/5"
            >
              {/* Color preview bar */}
              <div className="h-3 w-full" style={{ backgroundColor: t.colorPrimary }} />

              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-foreground">{t.name}</h3>
                      {t.isDefault && (
                        <Star size={14} className="text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground/50 font-medium mt-1 uppercase tracking-wider">
                      {t.layout} • {t.type.toLowerCase()}
                    </p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-md border-2 border-white shadow-lg"
                    style={{ backgroundColor: t.colorPrimary }}
                  />
                </div>

                {t.footerText && (
                  <p className="text-xs text-muted-foreground/40 font-medium italic truncate">
                    "{t.footerText}"
                  </p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-muted-foreground/40">
                    {t._count?.invoices || 0} invoices
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editTemplate(t)}
                      className="p-2 rounded-md text-muted-foreground/40 hover:text-primary hover:bg-primary/5 transition-all"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => deleteTemplate(t.id)}
                      className="p-2 rounded-md text-muted-foreground/40 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}

