import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Clock,
  ShieldCheck,
  ChevronRight,
  X,
} from "lucide-react";
import { trpc } from "@/providers/trpc";
import { differenceInDays } from "date-fns";
import { toast } from "sonner";

const statusConfig: Record<string, { bg: string; text: string; label: string; pulse?: boolean }> = {
  not_queued: { bg: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.3)", label: "Not Queued" },
  queued: { bg: "rgba(139,92,246,0.1)", text: "#c4b5fd", label: "Queued", pulse: true },
  pending_approval: { bg: "rgba(255,184,0,0.1)", text: "#ffb800", label: "Pending Approval" },
  processing: { bg: "rgba(139,92,246,0.1)", text: "#c4b5fd", label: "Processing", pulse: true },
  completed: { bg: "rgba(0,255,157,0.1)", text: "#00ff9d", label: "Completed" },
  failed: { bg: "rgba(255,59,92,0.1)", text: "#ff3b5c", label: "Failed" },
};

const glassCard = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
  backdropFilter: "blur(20px) saturate(140%)",
  WebkitBackdropFilter: "blur(20px) saturate(140%)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "1rem",
};

export default function AutoCancel() {
  const { data: trialList } = trpc.trials.list.useQuery();
  const utils = trpc.useUtils();

  const updateTrial = trpc.trials.update.useMutation({
    onSuccess: () => {
      utils.trials.list.invalidate();
      utils.trials.stats.invalidate();
      toast.success("Auto-cancel settings updated");
    },
  });

  const activeTrials = (trialList || []).filter((t) => t.status === "active" || t.status === "expiring_soon" || t.status === "ending_tomorrow");
  const queuedTrials = activeTrials.filter((t) => t.autoCancelEnabled);
  const nonQueuedTrials = activeTrials.filter((t) => !t.autoCancelEnabled);

  const [cancelTiming, setCancelTiming] = useState(24);
  const [requireApproval, setRequireApproval] = useState(true);

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white/90">Auto-Cancel</h1>
          <p className="text-sm text-white/30 mt-1">Set it and forget it — we&apos;ll cancel before you get charged</p>
        </div>
      </div>

      {/* How it works */}
      <div className="p-5" style={glassCard}>
        <div className="flex items-center justify-center gap-4">
          {[
            { icon: CreditCard, label: "Select Trial", desc: "Choose a trial to auto-cancel" },
            { icon: ChevronRight, isArrow: true },
            { icon: Clock, label: "Set Timing", desc: "Choose when to cancel" },
            { icon: ChevronRight, isArrow: true },
            { icon: ShieldCheck, label: "We Cancel For You", desc: "We handle it at the right time" },
          ].map((step, i) =>
            step.isArrow ? (
              <ChevronRight key={i} className="w-6 h-6 text-white/10" />
            ) : (
              <div key={i} className="flex flex-col items-center gap-2">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}
                >
                  <step.icon className="w-5 h-5" style={{ color: "#c4b5fd" }} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-white/70">{step.label}</p>
                  <p className="text-[10px] text-white/20">{step.desc}</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-white/80">Auto-Cancel Queue</h3>

          {queuedTrials.length === 0 ? (
            <div className="p-10 text-center" style={glassCard}>
              <ShieldCheck className="w-12 h-12 text-white/10 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white/30">No Auto-Cancels Set Up</h3>
              <p className="text-sm text-white/20 mt-1">Enable auto-cancel on your trials below</p>
            </div>
          ) : (
            <div style={glassCard} className="divide-y divide-white/[0.04]">
              {queuedTrials.map((trial) => {
                const cancelDate = new Date(trial.endDate);
                cancelDate.setHours(cancelDate.getHours() - trial.autoCancelTiming);
                const status = statusConfig[trial.autoCancelStatus] || statusConfig.queued;

                return (
                  <motion.div key={trial.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 px-4 py-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${trial.serviceBrandColor || "#8b5cf6"}40 0%, ${trial.serviceBrandColor || "#8b5cf6"}20 100%)`,
                        border: `1px solid ${trial.serviceBrandColor || "#8b5cf6"}30`,
                      }}
                    >
                      {trial.serviceName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/80">{trial.serviceName}</p>
                      <p className="text-xs text-white/25">Cancels on {cancelDate.toLocaleDateString("en-GB")} ({trial.autoCancelTiming}h before)</p>
                    </div>
                    <span 
                      className={`px-2 py-0.5 text-xs rounded-full ${status.pulse ? "nexus-pulse" : ""}`}
                      style={{ background: status.bg, color: status.text }}
                    >
                      {status.label}
                    </span>
                    <button onClick={() => updateTrial.mutate({ id: trial.id, autoCancelEnabled: false })} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                      <X className="w-4 h-4 text-white/20" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}

          {nonQueuedTrials.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-white/30 mb-3">Available Trials</h3>
              <div style={glassCard} className="divide-y divide-white/[0.04]">
                {nonQueuedTrials.map((trial) => {
                  const daysLeft = differenceInDays(new Date(trial.endDate), new Date());
                  return (
                    <div key={trial.id} className="flex items-center gap-4 px-4 py-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${trial.serviceBrandColor || "#8b5cf6"}40 0%, ${trial.serviceBrandColor || "#8b5cf6"}20 100%)`,
                          border: `1px solid ${trial.serviceBrandColor || "#8b5cf6"}30`,
                        }}
                      >
                        {trial.serviceName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white/80">{trial.serviceName}</p>
                        <p className="text-xs text-white/25">{daysLeft}d left</p>
                      </div>
                      <button
                        onClick={() => updateTrial.mutate({ id: trial.id, autoCancelEnabled: true, autoCancelTiming: cancelTiming })}
                        className="nexus-btn-primary flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Add to Queue
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Preferences panel */}
        <div className="p-5 h-fit" style={glassCard}>
          <h3 className="text-base font-semibold text-white/80 mb-4">Cancellation Preferences</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-white/60 mb-2">Default Timing</p>
              <div className="space-y-2">
                {[
                  { value: 24, label: "1 day before billing" },
                  { value: 12, label: "12 hours before" },
                  { value: 6, label: "6 hours before" },
                  { value: 1, label: "1 hour before" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setCancelTiming(opt.value)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all"
                    style={cancelTiming === opt.value ? {
                      background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(0,240,255,0.08) 100%)",
                      border: "1px solid rgba(139,92,246,0.25)",
                      color: "#e8e8f0",
                    } : { color: "rgba(255,255,255,0.35)" }}
                  >
                    <span 
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: cancelTiming === opt.value ? "#8b5cf6" : "rgba(255,255,255,0.15)" }}
                    >
                      {cancelTiming === opt.value && <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />}
                    </span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">Require Approval</p>
                  <p className="text-xs text-white/25">Ask me before cancelling</p>
                </div>
                <button 
                  onClick={() => setRequireApproval(!requireApproval)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${requireApproval ? "bg-[#8b5cf6]" : "bg-white/10"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${requireApproval ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>

            <div className="pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">Notify on Complete</p>
                  <p className="text-xs text-white/25">Get notified when auto-cancel finishes</p>
                </div>
                <button className="w-9 h-5 rounded-full bg-[#8b5cf6] relative">
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
