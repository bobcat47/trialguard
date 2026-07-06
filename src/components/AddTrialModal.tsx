import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

interface AddTrialModalProps {
  open: boolean;
  onClose: () => void;
}

const popularServices = ["Netflix", "Spotify", "Disney+", "YouTube Premium", "ChatGPT Plus", "Adobe", "Canva"];

export default function AddTrialModal({ open, onClose }: AddTrialModalProps) {
  const [serviceName, setServiceName] = useState("");
  const [planName, setPlanName] = useState("");
  const [duration, setDuration] = useState("7");
  const [period, setPeriod] = useState("days");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [cost, setCost] = useState("");
  const [currency] = useState("GBP");
  const [costPeriod, setCostPeriod] = useState("monthly");
  const [notes, setNotes] = useState("");

  const utils = trpc.useUtils();
  const createTrial = trpc.trials.create.useMutation({
    onSuccess: () => {
      utils.trials.list.invalidate();
      utils.trials.stats.invalidate();
      toast.success("Trial added — we'll track it for you!");
      resetForm();
      onClose();
    },
    onError: () => {
      toast.error("Failed to add trial. Please try again.");
    },
  });

  const resetForm = () => {
    setServiceName("");
    setPlanName("");
    setDuration("7");
    setPeriod("days");
    setStartDate(new Date().toISOString().split("T")[0]);
    setCost("");
    setNotes("");
  };

  const handleSubmit = () => {
    if (!serviceName) {
      toast.error("Please enter a service name");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(start);
    const dur = parseInt(duration) || 7;
    if (period === "days") end.setDate(end.getDate() + dur);
    else if (period === "weeks") end.setDate(end.getDate() + dur * 7);
    else if (period === "months") end.setMonth(end.getMonth() + dur);

    createTrial.mutate({
      serviceName,
      planName,
      startDate: start,
      endDate: end,
      trialLengthDays: dur,
      postTrialAmount: cost || "0",
      postTrialCurrency: currency,
      postTrialPeriod: costPeriod,
      notes,
    });
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "0.625rem",
    color: "#e8e8f0",
  };

  const inputFocus = "focus:border-[rgba(139,92,246,0.4)] focus:ring-2 focus:ring-[rgba(139,92,246,0.1)]";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[90] flex items-center justify-center"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-[520px] max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
              backdropFilter: "blur(40px) saturate(160%)",
              WebkitBackdropFilter: "blur(40px) saturate(160%)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Iridescent top border */}
            <div 
              className="absolute top-0 left-4 right-4 h-px"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(0,240,255,0.4), rgba(139,92,246,0.4), rgba(255,0,160,0.3), transparent)",
              }}
            />

            <div className="sticky top-0 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)", backdropFilter: "blur(20px)" }}>
              <h2 className="text-xl font-semibold text-white/90">Add New Trial</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors">
                <X className="w-5 h-5 text-white/40" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Info banner */}
              <div 
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{
                  background: "linear-gradient(135deg, rgba(0,240,255,0.06) 0%, rgba(139,92,246,0.04) 100%)",
                  border: "1px solid rgba(0,240,255,0.15)",
                }}
              >
                <Mail className="w-5 h-5 text-[#00f0ff] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-white/70">Connect your email to auto-detect trials</p>
                  <button className="mt-1 text-sm font-medium hover:underline" style={{ color: "#00f0ff" }}>Connect</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Service Name</label>
                <input
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g., Netflix, Spotify, Adobe..."
                  className={`w-full h-10 px-3.5 text-sm placeholder-white/20 outline-none transition-all ${inputFocus}`}
                  style={inputStyle}
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {popularServices.map((s) => (
                    <button
                      key={s}
                      onClick={() => setServiceName(s)}
                      className="px-2.5 py-1 text-xs rounded-md transition-all hover:brightness-125"
                      style={{
                        background: "rgba(139,92,246,0.1)",
                        border: "1px solid rgba(139,92,246,0.2)",
                        color: "#c4b5fd",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Plan / Subscription Tier</label>
                <input
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g., Premium, Pro, Family"
                  className={`w-full h-10 px-3.5 text-sm placeholder-white/20 outline-none transition-all ${inputFocus}`}
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Duration</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min={1}
                    max={365}
                    className={`w-full h-10 px-3.5 text-sm outline-none transition-all ${inputFocus}`}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Period</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className={`w-full h-10 px-3.5 text-sm outline-none transition-all ${inputFocus}`}
                    style={inputStyle}
                  >
                    <option value="days" style={{ background: "#0a0a14" }}>Days</option>
                    <option value="weeks" style={{ background: "#0a0a14" }}>Weeks</option>
                    <option value="months" style={{ background: "#0a0a14" }}>Months</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full h-10 px-3.5 text-sm outline-none transition-all ${inputFocus}`}
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Post-Trial Cost</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/30">£</span>
                    <input
                      type="number"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      placeholder="15.99"
                      step="0.01"
                      className={`w-full h-10 pl-8 pr-3.5 text-sm placeholder-white/20 outline-none transition-all ${inputFocus}`}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1.5">Period</label>
                  <select
                    value={costPeriod}
                    onChange={(e) => setCostPeriod(e.target.value)}
                    className={`w-full h-10 px-3.5 text-sm outline-none transition-all ${inputFocus}`}
                    style={inputStyle}
                  >
                    <option value="monthly" style={{ background: "#0a0a14" }}>Monthly</option>
                    <option value="yearly" style={{ background: "#0a0a14" }}>Yearly</option>
                    <option value="weekly" style={{ background: "#0a0a14" }}>Weekly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any details about this trial..."
                  rows={3}
                  className={`w-full px-3.5 py-2.5 text-sm placeholder-white/20 outline-none transition-all resize-none ${inputFocus}`}
                  style={inputStyle}
                />
              </div>
            </div>

            <div 
              className="sticky bottom-0 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl"
              style={{ 
                borderTop: "1px solid rgba(255,255,255,0.06)",
                background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.02) 100%)",
                backdropFilter: "blur(20px)",
              }}
            >
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-sm text-white/40 hover:text-white/80 rounded-xl transition-colors hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!serviceName || createTrial.isPending}
                className="nexus-btn-primary px-5 py-2.5 text-white text-sm font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {createTrial.isPending ? "Saving..." : "Save Trial"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
