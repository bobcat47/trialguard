import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  CreditCard,
  Clock,
  PiggyBank,
  ShieldCheck,
  Plus,
  AlertTriangle,
  ChevronRight,
  Hexagon,
  CheckCircle,
  XCircle,
  Mail,
  Banknote,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { format, differenceInDays } from "date-fns";
import AddTrialModal from "@/components/AddTrialModal";
import Confetti from "@/components/Confetti";
import { toast } from "sonner";

function getDaysLeft(endDate: Date | string) {
  return differenceInDays(new Date(endDate), new Date());
}

function getDaysColor(days: number) {
  if (days <= 1) return "text-[#ff3b5c]";
  if (days <= 3) return "text-[#ffb800]";
  if (days <= 7) return "text-[#ffb800]";
  return "text-[#00ff9d]";
}

function getDaysGlow(days: number) {
  if (days <= 1) return { textShadow: "0 0 10px rgba(255,59,92,0.5)" };
  if (days <= 7) return { textShadow: "0 0 10px rgba(255,184,0,0.4)" };
  return { textShadow: "0 0 10px rgba(0,255,157,0.4)" };
}

const activityIcons: Record<string, typeof CheckCircle> = {
  trial_cancelled: CheckCircle,
  trial_added: Plus,
  trial_expired: XCircle,
  email_scanned: Mail,
  money_saved: Banknote,
  auto_cancel_completed: ShieldCheck,
};

const activityColors: Record<string, string> = {
  trial_cancelled: "#00ff9d",
  trial_added: "#00f0ff",
  trial_expired: "#ff3b5c",
  email_scanned: "#8b5cf6",
  money_saved: "#00ff9d",
  auto_cancel_completed: "#00ff9d",
};

const glassCard = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
  backdropFilter: "blur(20px) saturate(140%)",
  WebkitBackdropFilter: "blur(20px) saturate(140%)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "1rem",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const { data: stats } = trpc.trials.stats.useQuery();
  const { data: trialList } = trpc.trials.list.useQuery();
  const { data: activities } = trpc.activity.list.useQuery({ limit: 6 });
  const utils = trpc.useUtils();

  const cancelTrial = trpc.trials.cancel.useMutation({
    onSuccess: (data) => {
      if (data.moneySaved && data.moneySaved > 0) {
        setShowConfetti(true);
        toast.success(`Cancelled! You saved £${data.moneySaved.toFixed(2)}`);
      } else {
        toast.success("Trial cancelled successfully");
      }
      utils.trials.list.invalidate();
      utils.trials.stats.invalidate();
      utils.savings.stats.invalidate();
      utils.activity.list.invalidate();
    },
  });

  const activeTrials = trialList?.filter(
    (t) => t.status === "active" || t.status === "expiring_soon" || t.status === "ending_tomorrow"
  ) || [];

  const sortedTrials = [...activeTrials].sort(
    (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
  );

  const urgentTrials = sortedTrials.filter((t) => getDaysLeft(t.endDate) <= 2);

  const statCards = [
    { icon: CreditCard, iconColor: "#8b5cf6", glow: "rgba(139,92,246,0.15)", value: stats?.activeCount || 0, label: "Active Trials" },
    { icon: Clock, iconColor: "#ffb800", glow: "rgba(255,184,0,0.15)", value: stats?.expiringSoonCount || 0, label: "Expiring This Week" },
    { icon: PiggyBank, iconColor: "#00ff9d", glow: "rgba(0,255,157,0.15)", value: `£${(stats?.totalSaved || 0).toFixed(0)}`, label: "Total Money Saved" },
    { icon: ShieldCheck, iconColor: "#00f0ff", glow: "rgba(0,240,255,0.15)", value: stats?.autoCancelCount || 0, label: "Protected by Auto-Cancel" },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white/90">Dashboard</h1>
          <p className="text-sm text-white/30 mt-1">
            {urgentTrials.length > 0
              ? `You have ${urgentTrials.length} trial${urgentTrials.length > 1 ? "s" : ""} expiring soon`
              : "All your trials are being tracked"}
          </p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="nexus-btn-primary flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl"
        >
          <Plus className="w-4 h-4" />
          Add Trial
        </button>
      </div>

      {urgentTrials.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full p-4 rounded-xl relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,59,92,0.08) 0%, rgba(255,184,0,0.04) 100%)",
            border: "1px solid rgba(255,59,92,0.2)",
            boxShadow: "0 0 20px rgba(255,59,92,0.08)",
          }}
        >
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-[#ff3b5c]" style={{ filter: "drop-shadow(0 0 4px rgba(255,59,92,0.5))" }} />
              <span className="text-sm font-medium text-white/80">
                {urgentTrials[0].serviceName} trial ends{" "}
                {getDaysLeft(urgentTrials[0].endDate) <= 0 ? "today" : "tomorrow"} — cancel now to
                avoid £{parseFloat(urgentTrials[0].postTrialAmount.toString()).toFixed(2)} charge
              </span>
            </div>
            <button
              onClick={() => cancelTrial.mutate({ id: urgentTrials[0].id, method: "direct_link" })}
              className="px-3.5 py-1.5 text-white text-xs font-semibold rounded-lg transition-all hover:brightness-125"
              style={{
                background: "linear-gradient(135deg, rgba(255,59,92,0.8) 0%, rgba(255,0,160,0.6) 100%)",
                boxShadow: "0 0 15px rgba(255,59,92,0.3)",
              }}
            >
              Cancel Now
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="p-5 transition-all hover:brightness-110 group"
            style={{
              ...glassCard,
              boxShadow: `0 0 30px ${card.glow}`,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${card.iconColor}20 0%, ${card.iconColor}10 100%)`,
                  border: `1px solid ${card.iconColor}30`,
                }}
              >
                <card.icon className="w-5 h-5" style={{ color: card.iconColor }} />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-white/90" style={{ textShadow: `0 0 20px ${card.glow}` }}>
              {card.value}
            </p>
            <p className="text-xs text-white/30 mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white/80">Your Active Trials</h3>
          <button
            onClick={() => navigate("/trials")}
            className="flex items-center gap-1 text-sm hover:underline transition-colors"
            style={{ color: "#00f0ff" }}
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {sortedTrials.length === 0 ? (
          <div className="p-12 text-center" style={glassCard}>
            <Hexagon className="w-12 h-12 text-white/10 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white/30">No active trials</h3>
            <p className="text-sm text-white/20 mt-1 mb-4">Start a free trial — we&apos;ll track it for you</p>
            <button
              onClick={() => navigate("/email-scan")}
              className="nexus-btn-primary px-4 py-2 text-sm font-medium rounded-lg"
            >
              Connect Email
            </button>
          </div>
        ) : (
          <div style={glassCard} className="divide-y divide-white/[0.04]">
            {sortedTrials.slice(0, 5).map((trial, i) => {
              const daysLeft = getDaysLeft(trial.endDate);
              const totalDays = trial.trialLengthDays;
              const elapsed = totalDays - daysLeft;
              const progress = Math.max(0, Math.min(100, (elapsed / totalDays) * 100));

              return (
                <motion.div
                  key={trial.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors group"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ 
                      background: `linear-gradient(135deg, ${trial.serviceBrandColor || "#8b5cf6"}40 0%, ${trial.serviceBrandColor || "#8b5cf6"}20 100%)`,
                      border: `1px solid ${trial.serviceBrandColor || "#8b5cf6"}40`,
                      boxShadow: `0 0 10px ${trial.serviceBrandColor || "#8b5cf6"}20`,
                    }}
                  >
                    {trial.serviceName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white/80">{trial.serviceName}</p>
                    <p className="text-xs text-white/25">{trial.planName || "Standard"}</p>
                  </div>
                  <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #8b5cf6, #00ff9d)" }}
                    />
                  </div>
                  <span className={`text-sm font-mono font-medium ${getDaysColor(daysLeft)}`} style={getDaysGlow(daysLeft)}>
                    {daysLeft <= 0 ? "Ends today" : `${daysLeft}d left`}
                  </span>
                  <span className="text-xs text-white/25">
                    £{parseFloat(trial.postTrialAmount.toString()).toFixed(2)}/{trial.postTrialPeriod.slice(0, 3)}
                  </span>
                  <button
                    onClick={() => cancelTrial.mutate({ id: trial.id, method: "direct_link" })}
                    className="text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                    style={{ color: "#ff3b5c" }}
                  >
                    Cancel
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {activities && activities.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white/80 mb-4">Recent Activity</h3>
          <div style={glassCard} className="divide-y divide-white/[0.04]">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.actionType] || CheckCircle;
              const color = activityColors[activity.actionType] || "#8b5cf6";
              return (
                <div key={activity.id} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15`, border: `1px solid ${color}25` }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <p className="text-sm text-white/70 flex-1">{activity.details || activity.actionType}</p>
                  <span className="text-xs text-white/20">{format(new Date(activity.createdAt), "MMM d")}</span>
                  {activity.actionType === "trial_cancelled" && (
                    <span 
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ color: "#00ff9d", background: "rgba(0,255,157,0.1)" }}
                    >
                      +£{JSON.parse(activity.metadata || "{}").amountSaved?.toFixed(2) || "0.00"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AddTrialModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}
