import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, CreditCard, Mail, Hexagon, PiggyBank, Settings, Plus } from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const actions = [
  { label: "Go to Dashboard", icon: Hexagon, shortcut: "⌘1", action: "/" },
  { label: "View My Trials", icon: CreditCard, shortcut: "⌘2", action: "/trials" },
  { label: "Email Scan", icon: Mail, shortcut: "⌘3", action: "/email-scan" },
  { label: "Auto-Cancel", icon: Hexagon, shortcut: "⌘4", action: "/auto-cancel" },
  { label: "Money Saved", icon: PiggyBank, shortcut: "⌘5", action: "/money-saved" },
  { label: "Settings", icon: Settings, shortcut: "⌘6", action: "/settings" },
  { label: "Add New Trial", icon: Plus, shortcut: "⌘N", action: "add-trial" },
];

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    if (!query.trim()) return actions;
    const q = query.toLowerCase();
    return actions.filter((a) => a.label.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => { setSelected(0); }, [query]);
  useEffect(() => { if (!open) setQuery(""); }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => (s + 1) % filtered.length); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => (s - 1 + filtered.length) % filtered.length); }
      else if (e.key === "Enter") {
        e.preventDefault();
        const item = filtered[selected];
        if (item) { onClose(); item.action === "add-trial" ? navigate("/trials?add=true") : navigate(item.action); }
      } else if (e.key === "Escape") { onClose(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, filtered, selected, onClose, navigate]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={onClose}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, ease: "easeOut" }} className="relative w-[560px] overflow-hidden rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)", backdropFilter: "blur(40px) saturate(160%)", WebkitBackdropFilter: "blur(40px) saturate(160%)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.08)" }} onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-0 left-4 right-4 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(0,240,255,0.4), rgba(139,92,246,0.4), transparent)" }} />
            <div className="flex items-center gap-3 px-4 h-14" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <Search className="w-5 h-5 text-white/20" />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search trials, services, or actions..." className="flex-1 bg-transparent text-sm text-white/80 placeholder-white/20 outline-none" />
              <button onClick={onClose} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/5"><X className="w-4 h-4 text-white/20" /></button>
            </div>
            <div className="max-h-[320px] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-white/20">No results found</div>
              ) : (
                filtered.map((item, i) => (
                  <button key={item.label} className="w-full flex items-center gap-3 px-4 h-10 text-sm transition-colors" style={i === selected ? { background: "linear-gradient(90deg, rgba(139,92,246,0.1) 0%, rgba(0,240,255,0.05) 100%)", color: "#e8e8f0" } : { color: "rgba(255,255,255,0.35)" }} onClick={() => { onClose(); item.action === "add-trial" ? navigate("/trials?add=true") : navigate(item.action); }} onMouseEnter={() => setSelected(i)}>
                    <item.icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <kbd className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>{item.shortcut}</kbd>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
