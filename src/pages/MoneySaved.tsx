import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PiggyBank,
  TrendingUp,
  CreditCard,
  Calendar,
  Share2,
  CheckCircle,
} from "lucide-react";
import { trpc } from "@/providers/trpc";

function AnimatedCounter({ value, prefix = "", duration = 1200 }: { value: number; prefix?: string; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(value * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  return <span>{prefix}{display.toFixed(2)}</span>;
}

const periodOptions = [
  { key: "month", label: "This Month" },
  { key: "year", label: "This Year" },
  { key: "all", label: "All Time" },
];

const glassCard = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
  backdropFilter: "blur(20px) saturate(140%)",
  WebkitBackdropFilter: "blur(20px) saturate(140%)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "1rem",
};

export default function MoneySaved() {
  const [period, setPeriod] = useState("all");
  const { data: stats } = trpc.savings.stats.useQuery();
  const { data: history } = trpc.savings.list.useQuery();
  const { data: monthlyData } = trpc.savings.byMonth.useQuery();

  const totalSaved = stats?.totalSaved || 0;
  const totalCount = stats?.totalCount || 0;
  const avgSaved = stats?.avgSaved || 0;
  const serviceBreakdown = stats?.serviceBreakdown || [];
  const maxAmount = serviceBreakdown.length > 0 ? serviceBreakdown[0].amount : 1;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white/90">Money Saved</h1>
          <p className="text-sm text-white/30 mt-1">Track every pound you&apos;ve avoided spending</p>
        </div>
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center p-1 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {periodOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setPeriod(opt.key)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                style={period === opt.key ? {
                  background: "linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(0,240,255,0.1) 100%)",
                  border: "1px solid rgba(139,92,246,0.25)",
                  color: "#e8e8f0",
                  boxShadow: "0 0 10px rgba(139,92,246,0.1)",
                } : { color: "rgba(255,255,255,0.25)" }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button 
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl transition-all hover:brightness-125"
            style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </div>

      {/* Hero savings counter */}
      <div className="p-10 text-center relative overflow-hidden" style={{ ...glassCard, boxShadow: "0 0 40px rgba(0,255,157,0.05)" }}>
        {/* Subtle iridescent ring */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,255,157,0.15) 0%, transparent 70%)",
          }}
        />
        <motion.p
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-5xl lg:text-6xl font-bold font-mono relative"
          style={{ color: "#00ff9d", textShadow: "0 0 30px rgba(0,255,157,0.4), 0 0 60px rgba(0,255,157,0.15)" }}
        >
          <AnimatedCounter value={totalSaved} prefix="£" />
        </motion.p>
        <h2 className="text-xl font-semibold text-white/80 mt-3 relative">Total Money Saved</h2>
        <p className="text-sm text-white/30 mt-1 relative">Across {totalCount} cancelled subscription{totalCount !== 1 ? "s" : ""}</p>
        {stats?.monthlySaved && stats.monthlySaved > 0 && (
          <span 
            className="inline-flex items-center gap-1 mt-3 px-3 py-1 text-sm rounded-full relative"
            style={{ background: "rgba(0,255,157,0.1)", color: "#00ff9d", border: "1px solid rgba(0,255,157,0.2)" }}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            +£{stats.monthlySaved.toFixed(2)} this month
          </span>
        )}

        <div className="grid grid-cols-3 gap-6 mt-8 max-w-lg mx-auto relative">
          {[
            { icon: CreditCard, value: totalCount, label: "Subscriptions Avoided" },
            { icon: Calendar, value: `£${avgSaved.toFixed(2)}`, label: "Avg. per Cancellation" },
            { icon: PiggyBank, value: `£${(avgSaved * 12).toFixed(2)}`, label: "Est. Yearly Savings" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}
              >
                <stat.icon className="w-5 h-5" style={{ color: "#c4b5fd" }} />
              </div>
              <p className="text-lg font-bold text-white/80">{stat.value}</p>
              <p className="text-xs text-white/25">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {serviceBreakdown.length > 0 && (
        <div className="p-6" style={glassCard}>
          <h3 className="text-base font-semibold text-white/80 mb-5">Savings by Service</h3>
          <div className="space-y-3">
            {serviceBreakdown.slice(0, 8).map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <span className="w-20 text-sm text-white/70 font-medium truncate">{service.name}</span>
                <div className="flex-1 h-6 rounded-md overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(service.amount / maxAmount) * 100}%` }}
                    transition={{ delay: i * 0.1 + 0.2, duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-md"
                    style={{ background: "linear-gradient(90deg, #8b5cf6, #00ff9d)" }}
                  />
                </div>
                <span className="w-16 text-sm font-mono font-semibold text-white/80 text-right">£{service.amount.toFixed(2)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {monthlyData && monthlyData.length > 0 && (
        <div className="p-6" style={glassCard}>
          <h3 className="text-base font-semibold text-white/80 mb-4">Savings Over Time</h3>
          <div className="flex items-end gap-1 h-40">
            {monthlyData.map((month, i) => {
              const maxMonth = Math.max(...monthlyData.map((m) => m.amount), 1);
              const height = (month.amount / maxMonth) * 100;
              return (
                <motion.div
                  key={month.month}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className="flex-1 rounded-t-md hover:brightness-125 transition-all relative group"
                  style={{ background: "linear-gradient(180deg, rgba(139,92,246,0.5) 0%, rgba(0,240,255,0.2) 100%)" }}
                >
                  <div 
                    className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 rounded-md px-2 py-1 text-xs whitespace-nowrap transition-opacity z-10"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}
                  >
                    {month.month}: £{month.amount.toFixed(2)}
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            {monthlyData.slice(0, 6).map((m) => (
              <span key={m.month} className="text-[10px] text-white/15">{m.month.slice(5)}</span>
            ))}
          </div>
        </div>
      )}

      {history && history.length > 0 && (
        <div className="p-6" style={glassCard}>
          <h3 className="text-base font-semibold text-white/80 mb-4">Recent Savings</h3>
          <div className="space-y-2">
            {history.slice(0, 10).map((record) => (
              <div key={record.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(0,255,157,0.08)", border: "1px solid rgba(0,255,157,0.15)" }}
                >
                  <CheckCircle className="w-4 h-4 text-[#00ff9d]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/70">Cancelled {record.serviceName}</p>
                  <p className="text-xs text-white/15">{new Date(record.savedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <span className="text-sm font-mono font-semibold" style={{ color: "#00ff9d" }}>
                  +£{parseFloat(record.amountSaved.toString()).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
