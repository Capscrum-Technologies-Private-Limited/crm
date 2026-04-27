"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Target,
  Flag,
  Clock,
  Users as UsersIcon,
  Check,
  Trash2,
  Loader2,
  Calendar as CalendarIcon,
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

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  date: string;
  type: string;
  color: string;
  completed: boolean;
  projectId: string | null;
  project: { id: string; name: string; status: string } | null;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const TYPE_CONFIG: Record<string, { icon: any; label: string; defaultColor: string }> = {
  MILESTONE: { icon: Flag, label: "Milestone", defaultColor: "#3b82f6" },
  GOAL: { icon: Target, label: "Goal", defaultColor: "#8b5cf6" },
  DEADLINE: { icon: Clock, label: "Deadline", defaultColor: "#ef4444" },
  MEETING: { icon: UsersIcon, label: "Meeting", defaultColor: "#10b981" },
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    type: "MILESTONE",
    color: "#3b82f6",
    projectId: "",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const fetchMilestones = () => {
    setLoading(true);
    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
    fetch(`/api/milestones?month=${monthStr}`)
      .then((res) => res.json())
      .then((data) => {
        setMilestones(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchProjects = () => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((payload) => {
        const data = Array.isArray(payload) ? payload : (payload.data || []);
        setProjects(data);
      });
  };

  useEffect(() => {
    fetchMilestones();
  }, [year, month]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const getMilestonesForDay = (day: number) => {
    return milestones.filter((m) => {
      const d = new Date(m.date);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const goToMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(today.getDate());
  };

  const openCreateForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setFormData({ ...formData, date: dateStr, title: "", description: "", type: "MILESTONE", color: "#3b82f6", projectId: "" });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setOpen(false);
        setFormData({ title: "", description: "", date: "", type: "MILESTONE", color: "#3b82f6", projectId: "" });
        fetchMilestones();
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    await fetch("/api/milestones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed: !completed }),
    });
    fetchMilestones();
  };

  const deleteMilestone = async (id: string) => {
    await fetch(`/api/milestones?id=${id}`, { method: "DELETE" });
    fetchMilestones();
  };

  const selectedDayMilestones = selectedDay ? getMilestonesForDay(selectedDay) : [];

  // Build calendar grid
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">
            Project <span className="text-primary">Calendar</span>
          </h2>
          <p className="text-muted-foreground text-lg font-medium">
            Track milestones, goals, and deadlines across all projects.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={goToToday}
            className="px-6 py-3 rounded-lg bg-slate-100 border border-slate-200 text-foreground font-bold text-sm hover:bg-slate-200 transition-all"
          >
            Today
          </button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="px-8 py-3 rounded-lg premium-gradient text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2">
                <Plus size={20} />
                <span>Add Event</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] !bg-white border-slate-200 rounded-lg p-8 shadow-2xl">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-black text-foreground">
                  New <span className="text-primary">Event</span>
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="e.g. Sprint 3 Review"
                    className="h-14 bg-slate-50 border-slate-200 rounded-lg text-foreground focus:border-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Description</Label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional details..."
                    className="w-full min-h-[80px] rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary/50 font-medium placeholder:text-muted-foreground/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Date</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="h-12 bg-slate-50 border-slate-200 rounded-md text-foreground font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Project</Label>
                    <select
                      value={formData.projectId}
                      onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-md text-foreground px-4 outline-none appearance-none"
                    >
                      <option value="">No project</option>
                      {projects.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Type</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(TYPE_CONFIG).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setFormData({ ...formData, type: key, color: config.defaultColor })}
                          className={cn(
                            "p-3 rounded-md border-2 flex flex-col items-center gap-1.5 transition-all text-center",
                            formData.type === key
                              ? "border-primary bg-primary/5"
                              : "border-slate-200 hover:border-slate-300"
                          )}
                        >
                          <Icon size={18} style={{ color: config.defaultColor }} />
                          <span className="text-[9px] font-black uppercase tracking-wider text-foreground/70">{config.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-14 rounded-lg premium-gradient text-white font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {submitting ? <Loader2 className="animate-spin" /> : "Create Event"}
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-3 glass-card single-sided-gradient rounded-lg overflow-hidden shadow-2xl shadow-primary/5">
          {/* Month Navigation */}
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <button onClick={() => goToMonth(-1)} className="p-3 rounded-md hover:bg-slate-100 text-muted-foreground hover:text-foreground transition-all">
              <ChevronLeft size={20} />
            </button>
            <h3 className="text-2xl font-black text-foreground tracking-tight">
              {MONTHS[month]} <span className="text-primary">{year}</span>
            </h3>
            <button onClick={() => goToMonth(1)} className="p-3 rounded-md hover:bg-slate-100 text-muted-foreground hover:text-foreground transition-all">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200">
            {DAYS.map((d) => (
              <div key={d} className="p-4 text-center text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarCells.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="min-h-[110px] border-b border-r border-slate-100 bg-slate-50/30" />;
              }

              const dayMilestones = getMilestonesForDay(day);
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSelected = day === selectedDay;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  onDoubleClick={() => openCreateForDay(day)}
                  className={cn(
                    "min-h-[110px] border-b border-r border-slate-100 p-2 cursor-pointer transition-colors relative group",
                    isSelected ? "bg-primary/5" : "hover:bg-slate-50",
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all",
                      isToday ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-foreground/70 group-hover:text-foreground"
                    )}>
                      {day}
                    </span>
                    {dayMilestones.length > 0 && (
                      <span className="text-[9px] font-black text-muted-foreground/30">{dayMilestones.length}</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {dayMilestones.slice(0, 3).map((m) => {
                      const Icon = TYPE_CONFIG[m.type]?.icon || Flag;
                      return (
                        <div
                          key={m.id}
                          className={cn(
                            "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold truncate border",
                            m.completed ? "line-through opacity-40" : ""
                          )}
                          style={{
                            backgroundColor: `${m.color}10`,
                            borderColor: `${m.color}30`,
                            color: m.color,
                          }}
                        >
                          <Icon size={10} className="shrink-0" />
                          <span className="truncate">{m.title}</span>
                        </div>
                      );
                    })}
                    {dayMilestones.length > 3 && (
                      <span className="text-[9px] font-bold text-primary px-2">+{dayMilestones.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Selected Day / Upcoming */}
        <div className="space-y-6">
          {/* Selected Day Detail */}
          <div className="glass-card single-sided-gradient rounded-lg p-6 shadow-xl shadow-primary/5">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-black text-foreground">
                {selectedDay
                  ? `${MONTHS[month].slice(0, 3)} ${selectedDay}`
                  : "Select a Day"}
              </h4>
              {selectedDay && (
                <button
                  onClick={() => openCreateForDay(selectedDay)}
                  className="p-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>

            {selectedDay ? (
              selectedDayMilestones.length > 0 ? (
                <div className="space-y-3">
                  {selectedDayMilestones.map((m) => {
                    const Icon = TYPE_CONFIG[m.type]?.icon || Flag;
                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn("p-4 rounded-lg border transition-all group", m.completed ? "opacity-50" : "")}
                        style={{ borderColor: `${m.color}30`, backgroundColor: `${m.color}05` }}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleComplete(m.id, m.completed)}
                            className={cn(
                              "w-6 h-6 rounded-lg border-2 shrink-0 flex items-center justify-center transition-all mt-0.5",
                              m.completed ? "border-emerald-500 bg-emerald-500" : "border-slate-300 hover:border-primary"
                            )}
                          >
                            {m.completed && <Check size={14} className="text-white" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon size={14} style={{ color: m.color }} />
                              <span className={cn("text-sm font-bold text-foreground", m.completed && "line-through")}>
                                {m.title}
                              </span>
                            </div>
                            {m.description && (
                              <p className="text-[11px] text-muted-foreground/50 font-medium">{m.description}</p>
                            )}
                            {m.project && (
                              <span className="inline-block mt-2 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-muted-foreground/60">
                                {m.project.name}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => deleteMilestone(m.id)}
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-muted-foreground/30 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon size={32} className="mx-auto text-muted-foreground/15 mb-3" />
                  <p className="text-sm text-muted-foreground/40 font-medium">No events</p>
                  <button
                    onClick={() => openCreateForDay(selectedDay)}
                    className="mt-3 text-[10px] font-black text-primary uppercase tracking-widest hover:text-primary/80 transition-colors"
                  >
                    + Add Event
                  </button>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <CalendarIcon size={32} className="mx-auto text-muted-foreground/15 mb-3" />
                <p className="text-sm text-muted-foreground/40 font-medium">Click a day to view events</p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="glass-card single-sided-gradient rounded-lg p-6 shadow-xl shadow-primary/5">
            <h4 className="text-sm font-black text-foreground mb-4 uppercase tracking-wider">Legend</h4>
            <div className="space-y-3">
              {Object.entries(TYPE_CONFIG).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${config.defaultColor}15` }}>
                      <Icon size={14} style={{ color: config.defaultColor }} />
                    </div>
                    <span className="text-xs font-bold text-foreground/70">{config.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="glass-card rounded-lg p-6">
            <h4 className="text-sm font-black text-foreground mb-4 uppercase tracking-wider">This Month</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground/50 font-bold">Total Events</span>
                <span className="text-lg font-black text-foreground">{milestones.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground/50 font-bold">Completed</span>
                <span className="text-lg font-black text-emerald-600">{milestones.filter((m) => m.completed).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground/50 font-bold">Pending</span>
                <span className="text-lg font-black text-primary">{milestones.filter((m) => !m.completed).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

