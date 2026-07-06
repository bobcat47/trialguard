import { useState } from "react";
import { useSearchParams } from "react-router";
import { motion } from "framer-motion";
import {
  Plus,
  Mail,
  Search,
  Trash2,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { differenceInDays } from "date-fns";
import AddTrialModal from "@/components/AddTrialModal";
import Confetti from "@/components/Confetti";
import { toast } from "sonner";

type FilterTab = "active" | "expiring" | "cancelled" | "all";

function getDaysLeft(endDate: Date | string) {
  return differenceInDays(new Date(endDate), new Date());
}

function getStatusBadge(status: string, daysLeft: number) {
  if (daysLeft <= 1) return { 
    bg: "rgba(255,59,92,0.1)", border: "rgba(255,59,92,0.2)", text: "#ff3b5c", label: "Ends Tomorrow", glow: "0 0 8px rgba(255,59,92,0.3)" 
  };
  if (daysLeft <= 7) return { 
    bg: "rgba(255,184,0,0.1)", border: "rgba(255,184,0,0.2)", text: "#ffb800", label: "Expiring Soon", glow: "0 0 8px rgba(255,184,0,0.2)" 
  };
  switch (status) {
    case "active": return { bg: "rgba(0,255,157,0.08)", border: "rgba(0,255,157,0.15)", text: "#00ff9d", label: "Active", glow: "0 0 8px rgba(0,255,157,0.2)" };
    case "cancelled": return { bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.06)", text: "rgba(255,255,255,0.3)", label: "Cancelled", glow: "none" };
    case "expired": return { bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.06)", text: "rgba(255,255,255,0.3)", label: "Expired", glow: "none" };
    default: return { bg: "rgba(0,255,157,0.08)", border: "rgba(0,255,157,0.15)", text: "#00ff9d", label: "Active", glow: "none" };
  }
}

const glassCard = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
  backdropFilter: "blur(20px) saturate(140%)",
  WebkitBackdropFilter: "blur(20px) saturate(140%)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "1rem",
};

export default function MyTrials() {
  const [searchParams] = useSearchParams();
  const [addModalOpen, setAddModalOpen] = useState(searchParams.get("add") === "true");
  const [filterTab, setFilterTab] = useState<FilterTab>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: trialList, isLoading } = trpc.trials.list.useQuery();
  const utils = trpc.useUtils();

  const cancelTrial = trpc.trials.cancel.useMutation({
    onSuccess: (data) => {
      if (data.moneySaved && data.moneySaved > 0) {
        setShowConfetti(true);
        toast.success(`Saved £${data.moneySaved.toFixed(2)}!`);
      }
      utils.trials.list.invalidate();
      utils.trials.stats.invalidate();
      utils.savings.stats.invalidate();
    },
  });

  const updateTrial = trpc.trials.update.useMutation({
    onSuccess: () => {
      utils.trials.list.invalidate();
      toast.success("Auto-cancel updated");
    },
  });

  const filteredTrials = (trialList || []).filter((t) => {
    const daysLeft = getDaysLeft(t.endDate);
    const matchesSearch = t.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    switch (filterTab) {
      case "active": return (t.status === "active" || t.status === "expiring_soon" || t.status === "ending_tomorrow") && matchesSearch;
      case "expiring": return daysLeft <= 7 && daysLeft >= 0 && matchesSearch;
      case "cancelled": return t.status === "cancelled" && matchesSearch;
      case "all": return matchesSearch;
      default: return matchesSearch;
    }
  });

  const activeCount = (trialList || []).filter((t) => t.status === "active" || t.status === "expiring_soon" || t.status === "ending_tomorrow").length;
  const cancelledCount = (trialList || []).filter((t) => t.status === "cancelled").length;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "active", label: "Active" },
    { key: "expiring", label: "Expiring Soon" },
    { key: "cancelled", label: "Cancelled" },
    { key: "all", label: "All" },
  ];

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "0.75rem",
    color: "#e8e8f0",
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white/90">My Trials</h1>
          <p className="text-sm text-white/30 mt-1">{activeCount} active, {cancelledCount} cancelled</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl transition-all hover:brightness-125"
            style={{ ...inputStyle, color: "rgba(255,255,255,0.4)" }}
          >
            <Mail className="w-4 h-4" />
            Connect Email
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="nexus-btn-primary flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Add Trial
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div 
          className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key)}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
              style={filterTab === tab.key ? {
                background: "linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(0,240,255,0.1) 100%)",
                border: "1px solid rgba(139,92,246,0.25)",
                color: "#e8e8f0",
                boxShadow: "0 0 12px rgba(139,92,246,0.1)",
              } : {
                color: "rgba(255,255,255,0.3)",
                border: "1px solid transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trials..."
            className="w-52 h-9 pl-9 pr-3 text-sm placeholder-white/20 outline-none focus:border-[rgba(139,92,246,0.4)] transition-all"
            style={inputStyle}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl nexus-shimmer" style={glassCard} />
          ))}
        </div>
      ) : filteredTrials.length === 0 ? (
        <div className="p-12 text-center" style={glassCard}>
          <p className="text-white/30">No trials found</p>
          <p className="text-sm text-white/20 mt-1">Add a trial or try a different filter</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrials.map((trial, i) => {
            const daysLeft = getDaysLeft(trial.endDate);
            const badge = getStatusBadge(trial.status, daysLeft);
            const totalDays = trial.trialLengthDays;
            const progress = Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100));
            const isActive = trial.status === "active" || trial.status === "expiring_soon" || trial.status === "ending_tomorrow";

            return (
              <motion.div
                key={trial.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 transition-all hover:-translate-y-0.5 group"
                style={{
                  ...glassCard,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${trial.serviceBrandColor || "#8b5cf6"}40 0%, ${trial.serviceBrandColor || "#8b5cf6"}20 100%)`,
                        border: `1px solid ${trial.serviceBrandColor || "#8b5cf6"}40`,
                        boxShadow: `0 0 12px ${trial.serviceBrandColor || "#8b5cf6"}25`,
                      }}
                    >
                      {trial.serviceName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-white/80">{trial.serviceName}</h3>
                        {trial.planName && (
                          <span 
                            className="px-2 py-0.5 text-[11px] rounded-full"
                            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}
                          >{trial.planName}</span>
                        )}
                      </div>
                      <span 
                        className="inline-block mt-1 px-2.5 py-0.5 text-xs font-semibold rounded-full"
                        style={{ background: badge.bg, border: `1px solid ${badge.border}`, color: badge.text, boxShadow: badge.glow }}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-white/20">{isActive ? `${daysLeft}d left` : "Ended"}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-white/25 mb-1">Trial Period</p>
                    <p className="text-sm text-white/70">
                      {new Date(trial.startDate).toLocaleDateString("en-GB", { month: "short", day: "numeric" })} — {new Date(trial.endDate).toLocaleDateString("en-GB", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/25 mb-1">Post-Trial Cost</p>
                    <p className="text-sm text-white/70 font-medium">
                      £{parseFloat(trial.postTrialAmount.toString()).toFixed(2)}/{trial.postTrialPeriod.slice(0, 3)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-white/25 mb-1">Category</p>
                    <span className="text-xs px-2 py-1 rounded-md capitalize" style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}>
                      {trial.serviceCategory}
                    </span>
                  </div>
                </div>

                {isActive && (
                  <div className="mt-3">
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, #8b5cf6, #00ff9d)" }}
                      />
                    </div>
                  </div>
                )}

                {isActive && (
                  <div className="flex items-center gap-2 mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <button
                      onClick={() => cancelTrial.mutate({ id: trial.id, method: "direct_link" })}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all hover:brightness-125"
                      style={{ color: "#ff3b5c", border: "1px solid rgba(255,59,92,0.3)", background: "rgba(255,59,92,0.06)" }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Cancel Trial
                    </button>
                    <button
                      onClick={() => updateTrial.mutate({ id: trial.id, autoCancelEnabled: !trial.autoCancelEnabled })}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-all"
                      style={trial.autoCancelEnabled ? {
                        color: "#00f0ff",
                        background: "rgba(0,240,255,0.08)",
                        border: "1px solid rgba(0,240,255,0.25)",
                        boxShadow: "0 0 8px rgba(0,240,255,0.1)",
                      } : {
                        color: "rgba(255,255,255,0.35)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {trial.autoCancelEnabled ? "Auto-Cancel On" : "Enable Auto-Cancel"}
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg ml-auto transition-all hover:brightness-125" style={{ color: "#00f0ff" }}>
                      <ExternalLink className="w-3.5 h-3.5" />
                      Cancel Guide
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <AddTrialModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}
