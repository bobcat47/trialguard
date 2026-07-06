import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, RefreshCw, X, Check, Shield } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

interface DetectedTrial {
  id: number;
  serviceName: string;
  planName: string;
  startDate: string;
  endDate: string;
  confidence: number;
  source: string;
}

const MOCK_DETECTED: DetectedTrial[] = [
  { id: 1, serviceName: "Netflix", planName: "Premium HD", startDate: "2024-01-15", endDate: "2024-02-14", confidence: 98, source: "Gmail" },
  { id: 2, serviceName: "Spotify", planName: "Premium", startDate: "2024-01-10", endDate: "2024-02-10", confidence: 95, source: "Gmail" },
  { id: 3, serviceName: "Adobe Creative Cloud", planName: "All Apps", startDate: "2024-01-20", endDate: "2024-02-03", confidence: 87, source: "Gmail" },
];

const glassCard = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
  backdropFilter: "blur(20px) saturate(140%)",
  WebkitBackdropFilter: "blur(20px) saturate(140%)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "1rem",
};

export default function EmailScan() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [connected, setConnected] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLog, setScanLog] = useState<string[]>([]);
  const [detectedTrials, setDetectedTrials] = useState<DetectedTrial[]>([]);
  const [approvedIds, setApprovedIds] = useState<Set<number>>(new Set());
  const [ignoredIds, setIgnoredIds] = useState<Set<number>>(new Set());

  const seedServices = trpc.services.seed.useMutation();
  const createTrial = trpc.trials.create.useMutation({
    onSuccess: () => toast.success("Trial added to your tracker!"),
  });

  const handleConnect = () => {
    setConnected(true);
    seedServices.mutate();
    toast.success("Gmail connected successfully!");
  };

  const handleScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    setScanProgress(0);
    setScanLog([]);
    setDetectedTrials([]);

    const logs = [
      "Scanning inbox for trial confirmations...",
      "Checking promotions folder...",
      "Found: Netflix 30-day trial confirmation",
      "Found: Spotify Premium trial signup",
      "Scanning for receipt emails...",
      "Found: Adobe Creative Cloud 14-day trial",
      "Scanning sent items for cancellations...",
      "Analysing 1,247 emails...",
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setScanLog((prev) => [...prev, logs[i]]);
        setScanProgress(Math.round(((i + 1) / logs.length) * 100));
        i++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
        setScanComplete(true);
        setDetectedTrials(MOCK_DETECTED);
        toast.success("Scan complete! Found 3 trials in your inbox.");
      }
    }, 600);
  };

  const handleApprove = (trial: DetectedTrial) => {
    const start = new Date(trial.startDate);
    const end = new Date(trial.endDate);
    const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    createTrial.mutate({ serviceName: trial.serviceName, planName: trial.planName, startDate: start, endDate: end, trialLengthDays: days });
    setApprovedIds((prev) => new Set(prev).add(trial.id));
  };

  const handleIgnore = (id: number) => setIgnoredIds((prev) => new Set(prev).add(id));
  const visibleDetected = detectedTrials.filter((t) => !approvedIds.has(t.id) && !ignoredIds.has(t.id));

  return (
    <div className="max-w-[900px] mx-auto space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white/90">Email Scan</h1>
          <p className="text-sm text-white/30 mt-1">Automatically find trials in your inbox</p>
        </div>
        {connected && (
          <button onClick={handleScan} disabled={isScanning} className="nexus-btn-primary flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
            {isScanning ? "Scanning..." : "Scan Now"}
          </button>
        )}
      </div>

      {!connected ? (
        <div className="p-12 text-center" style={glassCard}>
          <Mail className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white/80 mb-2">Connect Your Email</h2>
          <p className="text-sm text-white/30 max-w-md mx-auto mb-6">
            We&apos;ll scan for free trial signups, receipts, and billing alerts. We never read your
            personal emails — only scan for subscription-related messages.
          </p>
          <button onClick={handleConnect} className="nexus-btn-primary px-6 py-2.5 text-sm font-semibold rounded-xl">
            Connect Gmail
          </button>
          <p className="flex items-center justify-center gap-1.5 mt-4 text-xs text-white/20">
            <Shield className="w-3.5 h-3.5" />
            Your emails are processed securely. We never store email content.
          </p>
        </div>
      ) : (
        <>
          <div className="p-5" style={glassCard}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(255,59,92,0.1)", border: "1px solid rgba(255,59,92,0.2)" }}
                >
                  <Mail className="w-5 h-5 text-[#ff3b5c]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/80">user@gmail.com</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-[#00ff9d]">
                      <span className="w-1.5 h-1.5 bg-[#00ff9d] rounded-full" style={{ boxShadow: "0 0 4px #00ff9d" }} />
                      Connected
                    </span>
                    <span className="text-xs text-white/20">Last scanned: 2 hours ago</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleScan} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <RefreshCw className="w-4 h-4 text-white/30" />
                </button>
                <button className="px-3 py-1.5 text-xs text-[#ff3b5c] hover:bg-[rgba(255,59,92,0.08)] rounded-md transition-colors">
                  Disconnect
                </button>
              </div>
            </div>
          </div>

          <div className="p-5" style={glassCard}>
            <h3 className="text-base font-semibold text-white/80 mb-4">Auto-Detection Settings</h3>
            <div className="space-y-4">
              {[
                { label: "Scan for trial emails", desc: "Automatically detect free trial confirmations", defaultOn: true },
                { label: "Scan for receipt emails", desc: "Find subscription receipts", defaultOn: true },
                { label: "Scan for price increase emails", desc: "Alert when services raise prices", defaultOn: false },
                { label: "Notify on new trial detection", desc: "Send a notification when we find a new trial", defaultOn: true },
                { label: "Auto-add detected trials", desc: "Add detected trials without approval", defaultOn: false },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">{setting.label}</p>
                    <p className="text-xs text-white/25">{setting.desc}</p>
                  </div>
                  <button className={`w-9 h-5 rounded-full transition-colors relative ${setting.defaultOn ? "bg-[#8b5cf6]" : "bg-white/10"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${setting.defaultOn ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-5 overflow-hidden" style={glassCard}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-white/30">Scanning your emails for trial signups...</p>
                  <span className="text-sm font-mono" style={{ color: "#00f0ff" }}>{scanProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #8b5cf6, #00f0ff)" }}
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="mt-4 p-3 rounded-lg font-mono text-xs max-h-36 overflow-y-auto space-y-1 scrollbar-thin" style={{ background: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.35)" }}>
                  {scanLog.map((log, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
                      <span className="text-white/15">&gt;</span>
                      <span style={{ color: log.includes("Found:") ? "#00ff9d" : undefined }}>{log}</span>
                    </motion.div>
                  ))}
                  {isScanning && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} style={{ color: "#00f0ff" }}>_</motion.span>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {scanComplete && visibleDetected.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-white/80">Detected Trials</h3>
                <span className="px-2 py-0.5 text-xs rounded-full font-medium" style={{ background: "rgba(139,92,246,0.12)", color: "#c4b5fd" }}>
                  {visibleDetected.length} pending
                </span>
              </div>
              <div className="space-y-3">
                {visibleDetected.map((trial) => (
                  <motion.div
                    key={trial.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4" style={glassCard}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(0,240,255,0.15) 100%)", border: "1px solid rgba(139,92,246,0.3)" }}
                        >
                          {trial.serviceName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white/80">{trial.serviceName}</p>
                          <p className="text-xs text-white/25">{trial.planName}</p>
                          <p className="text-xs text-white/15 mt-0.5">
                            {new Date(trial.startDate).toLocaleDateString("en-GB")} — {new Date(trial.endDate).toLocaleDateString("en-GB")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span 
                          className="px-2 py-0.5 text-xs rounded-full font-medium"
                          style={{
                            background: trial.confidence >= 90 ? "rgba(0,255,157,0.1)" : trial.confidence >= 70 ? "rgba(255,184,0,0.1)" : "rgba(255,59,92,0.1)",
                            color: trial.confidence >= 90 ? "#00ff9d" : trial.confidence >= 70 ? "#ffb800" : "#ff3b5c",
                          }}
                        >
                          {trial.confidence}% confident
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }}>
                          From: {trial.source}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={() => handleApprove(trial)} disabled={createTrial.isPending} className="nexus-btn-primary flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg disabled:opacity-50">
                        <Check className="w-3.5 h-3.5" />
                        Add to Tracker
                      </button>
                      <button onClick={() => handleIgnore(trial.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors hover:bg-white/5" style={{ color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <X className="w-3.5 h-3.5" />
                        Ignore
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
