"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Plus, 
  Search, 
  Trash2, 
  Loader2,
  Shield,
  Users,
  Mail,
  Eye,
  EyeOff,
  Copy,
  Check
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

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "TEAM"
  });

  const fetchMembers = () => {
    setLoading(true);
    fetch("/api/users/team")
      .then((res) => res.json())
      .then((data) => {
        setMembers(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  const copyCredentials = () => {
    const text = `Email: ${formData.email}\nPassword: ${formData.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/users/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create team member");
        return;
      }

      setSuccess(`${data.name} has been added to the team!`);
      setTimeout(() => {
        setOpen(false);
        setFormData({ name: "", email: "", password: "", role: "TEAM" });
        setSuccess("");
        setError("");
        fetchMembers();
      }, 1500);
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the team? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/users/team?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchMembers();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete team member");
      }
    } catch (err) {
      alert("An unexpected error occurred");
    } finally {
      setDeletingId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === "ADMIN") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    return "bg-blue-50 text-blue-600 border-blue-200";
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
            Team <span className="text-primary">Management</span>
          </h2>
          <p className="text-muted-foreground text-lg font-medium">Create and manage login credentials for your team of 5.</p>
        </div>
        
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setError(""); setSuccess(""); } }}>
          <DialogTrigger asChild>
            <button className="px-8 py-4 rounded-lg premium-gradient text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2">
              <Plus size={20} />
              <span>Add Team Member</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] !bg-white border-slate-200 rounded-lg p-8 shadow-2xl">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black text-foreground">New Team <span className="text-primary">Member</span></DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold px-5 py-3 rounded-lg"
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm font-bold px-5 py-3 rounded-lg flex items-center gap-2"
                >
                  <Check size={16} />
                  {success}
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Full Name</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                  placeholder="e.g. Rahul Sharma"
                  className="h-14 bg-slate-50 border-slate-200 rounded-lg text-foreground focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/30" />
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                    placeholder="team@capscrum.com"
                    className="h-14 pl-12 bg-slate-50 border-slate-200 rounded-lg text-foreground focus:border-primary/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Password</Label>
                  <button 
                    type="button" 
                    onClick={generatePassword}
                    className="text-[10px] font-black text-primary uppercase tracking-[0.15em] hover:text-primary/80 transition-colors"
                  >
                    Auto-Generate
                  </button>
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required 
                    minLength={6}
                    placeholder="Min. 6 characters"
                    className="h-14 bg-slate-50 border-slate-200 rounded-lg text-foreground focus:border-primary/50 pr-24"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 rounded-lg hover:bg-slate-200 text-muted-foreground/40 hover:text-foreground transition-all"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    {formData.email && formData.password && (
                      <button 
                        type="button" 
                        onClick={copyCredentials}
                        className="p-2 rounded-lg hover:bg-slate-200 text-muted-foreground/40 hover:text-primary transition-all"
                        title="Copy credentials"
                      >
                        {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">Role</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: "TEAM"})}
                    className={cn(
                      "p-4 rounded-lg border-2 text-left transition-all",
                      formData.role === "TEAM"
                        ? "border-primary bg-primary/5" 
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <Users size={20} className={formData.role === "TEAM" ? "text-primary mb-2" : "text-muted-foreground/40 mb-2"} />
                    <p className="text-sm font-bold text-foreground">Team Member</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">Dashboard access</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: "ADMIN"})}
                    className={cn(
                      "p-4 rounded-lg border-2 text-left transition-all",
                      formData.role === "ADMIN"
                        ? "border-amber-400 bg-amber-50" 
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <Shield size={20} className={formData.role === "ADMIN" ? "text-amber-600 mb-2" : "text-muted-foreground/40 mb-2"} />
                    <p className="text-sm font-bold text-foreground">Admin</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">Full access</p>
                  </button>
                </div>
              </div>

              <DialogFooter className="pt-4">
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="w-full h-14 rounded-lg premium-gradient text-white font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : "Create Team Login"}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card single-sided-gradient rounded-lg p-6 shadow-xl shadow-primary/5">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Total Members</p>
              <p className="text-3xl font-black text-foreground">{members.length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card single-sided-gradient rounded-lg p-6 shadow-xl shadow-primary/5">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-600">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Admins</p>
              <p className="text-3xl font-black text-foreground">{members.filter(m => m.role === "ADMIN").length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card single-sided-gradient rounded-lg p-6 shadow-xl shadow-primary/5">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Team Members</p>
              <p className="text-3xl font-black text-foreground">{members.filter(m => m.role === "TEAM").length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Table */}
      <div className="glass-card single-sided-gradient rounded-lg overflow-hidden shadow-2xl shadow-primary/5">
        <div className="p-8 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h3 className="text-xl font-bold text-foreground">Team Directory</h3>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input 
              placeholder="Search team members..." 
              className="h-12 pl-12 bg-slate-50 border-slate-200 rounded-lg text-foreground placeholder:text-muted-foreground/30 focus:border-primary/30 font-medium"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-8 py-6 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Member</th>
                <th className="px-8 py-6 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Email</th>
                <th className="px-8 py-6 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Role</th>
                <th className="px-8 py-6 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Joined</th>
                <th className="px-8 py-6 text-xs font-black text-muted-foreground/40 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                      <span className="text-sm font-black text-muted-foreground/40 uppercase tracking-widest">Loading team...</span>
                    </div>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-slate-50 flex items-center justify-center text-muted-foreground/20">
                        <Users size={32} />
                      </div>
                      <div>
                        <p className="font-bold text-foreground mb-1">No team members yet</p>
                        <p className="text-sm text-muted-foreground/50">Click "Add Team Member" to create your first team login.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-11 h-11 rounded-md flex items-center justify-center font-black text-sm",
                          member.role === "ADMIN" 
                            ? "bg-amber-50 text-amber-600 border border-amber-200" 
                            : "bg-primary/10 text-primary border border-primary/20"
                        )}>
                          {member.name ? member.name.substring(0, 2).toUpperCase() : "??"}
                        </div>
                        <span className="font-bold text-foreground text-base">{member.name || "Unnamed"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-muted-foreground font-medium">{member.email}</td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        getRoleBadge(member.role)
                      )}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-muted-foreground/60 font-medium">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleDelete(member.id, member.name || member.email)}
                        disabled={deletingId === member.id}
                        className="p-3 rounded-md hover:bg-red-50 text-muted-foreground/30 hover:text-red-500 transition-all disabled:opacity-50"
                        title="Remove team member"
                      >
                        {deletingId === member.id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && members.length > 0 && (
          <div className="px-8 py-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">{members.length} team members</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

