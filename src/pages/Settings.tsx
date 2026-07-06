import { useState } from "react";
import {
  User,
  Bell,
  Link,
  CreditCard,
  Palette,
  HelpCircle,
  LogOut,
  Trash2,
  Mail,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const settingsTabs = [
  { key: "account", icon: User, label: "Account" },
  { key: "notifications", icon: Bell, label: "Notifications" },
  { key: "connected", icon: Link, label: "Connected Accounts" },
  { key: "billing", icon: CreditCard, label: "Billing" },
  { key: "preferences", icon: Palette, label: "Preferences" },
  { key: "help", icon: HelpCircle, label: "Help & Support" },
];

const glassCard = {
  background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
  backdropFilter: "blur(20px) saturate(140%)",
  WebkitBackdropFilter: "blur(20px) saturate(140%)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "1rem",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "0.625rem",
  color: "#e8e8f0",
};

export default function Settings() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [currency, setCurrency] = useState("GBP");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [theme, setTheme] = useState("dark");

  const currencies = ["GBP (£)", "USD ($)", "EUR (€)", "AUD ($)"];
  const dateFormats = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
  const themes = ["Always Dark", "Light", "System"];

  const toggleItems = [
    { label: "Email reminders for expiring trials", desc: "Get notified before trials end", defaultOn: true },
    { label: "Push notifications", desc: "Browser push notifications", defaultOn: true },
    { label: "Auto-cancel approval requests", desc: "Ask before auto-cancelling", defaultOn: true },
    { label: "Weekly savings summary", desc: "Weekly digest of your savings", defaultOn: true },
    { label: "Price increase alerts", desc: "When services raise prices", defaultOn: false },
    { label: "New feature announcements", desc: "Learn about new features", defaultOn: true },
  ];

  return (
    <div className="max-w-[1000px] mx-auto">
      <h1 className="text-3xl font-bold text-white/90 mb-6">Settings</h1>

      <div className="flex gap-6">
        <div className="w-60 flex-shrink-0 space-y-1">
          {settingsTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
              style={activeTab === tab.key ? {
                background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(0,240,255,0.08) 100%)",
                border: "1px solid rgba(139,92,246,0.2)",
                color: "#e8e8f0",
                fontWeight: 500,
                boxShadow: "0 0 12px rgba(139,92,246,0.08)",
              } : { color: "rgba(255,255,255,0.35)" }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
          <button
            onClick={() => { logout(); toast.success("Logged out successfully"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all mt-4 hover:bg-[rgba(255,59,92,0.06)]"
            style={{ color: "#ff3b5c" }}
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>

        <div className="flex-1 p-6" style={glassCard}>
          {activeTab === "account" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white/80">Account Settings</h2>
              <div>
                <label className="block text-sm font-medium text-white/40 mb-3">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold"
                    style={{
                      background: "linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(0,240,255,0.1) 100%)",
                      border: "1px solid rgba(139,92,246,0.3)",
                      color: "#c4b5fd",
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <button 
                    className="px-4 py-2 text-sm rounded-lg transition-all hover:brightness-125"
                    style={{ ...inputStyle, color: "rgba(255,255,255,0.5)" }}
                  >
                    Change Photo
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/40 mb-1.5">Display Name</label>
                <input
                  defaultValue={user?.name || ""}
                  className="w-full h-10 px-3.5 text-sm outline-none focus:border-[rgba(139,92,246,0.4)] transition-all"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/40 mb-1.5">Email</label>
                <input
                  defaultValue={user?.email || ""}
                  readOnly
                  className="w-full h-10 px-3.5 text-sm cursor-not-allowed"
                  style={{ ...inputStyle, color: "rgba(255,255,255,0.2)" }}
                />
                <p className="text-xs text-white/15 mt-1">Managed by OAuth provider</p>
              </div>
              <div className="pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <h3 className="text-sm font-medium mb-3" style={{ color: "#ff3b5c" }}>Danger Zone</h3>
                <button
                  onClick={() => { if (confirm("Are you sure? This will delete all your data.")) toast.success("Account deletion request sent"); }}
                  className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-all hover:brightness-125"
                  style={{ color: "#ff3b5c", border: "1px solid rgba(255,59,92,0.3)", background: "rgba(255,59,92,0.06)" }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white/80 mb-4">Notification Settings</h2>
              {toggleItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div>
                    <p className="text-sm text-white/70">{item.label}</p>
                    <p className="text-xs text-white/25">{item.desc}</p>
                  </div>
                  <button className={`w-9 h-5 rounded-full transition-colors relative ${item.defaultOn ? "bg-[#8b5cf6]" : "bg-white/10"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${item.defaultOn ? "translate-x-4" : "translate-x-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "connected" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white/80">Connected Accounts</h2>
              <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(255,59,92,0.1)", border: "1px solid rgba(255,59,92,0.2)" }}
                    >
                      <Mail className="w-5 h-5 text-[#ff3b5c]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/80">Gmail</p>
                      <p className="text-xs text-white/25">user@gmail.com</p>
                    </div>
                  </div>
                  <button className="text-xs text-[#ff3b5c] hover:underline">Disconnect</button>
                </div>
              </div>
              <button 
                className="w-full flex items-center justify-center gap-2 py-3 text-sm rounded-xl transition-all hover:brightness-125"
                style={{ border: "2px dashed rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.25)" }}
              >
                <Link className="w-4 h-4" />
                Connect Another Account
              </button>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white/80">Billing</h2>
              <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">Current Plan</p>
                    <span 
                      className="inline-block mt-1 px-2.5 py-0.5 text-xs rounded-full font-medium"
                      style={{ background: "rgba(139,92,246,0.1)", color: "#c4b5fd", border: "1px solid rgba(139,92,246,0.2)" }}
                    >
                      Free
                    </span>
                  </div>
                  <button className="nexus-btn-primary px-4 py-2 text-sm font-medium rounded-lg">
                    Upgrade to Pro
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm text-white/30">Free plan includes:</p>
                <ul className="mt-2 space-y-2">
                  {["Track up to 5 trials", "Manual trial entry", "Email reminders", "Basic analytics"].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-white/60">
                      <Shield className="w-4 h-4 text-[#00ff9d]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white/80">Preferences</h2>
              <div>
                <label className="block text-sm font-medium text-white/40 mb-2">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-10 px-3 text-sm outline-none focus:border-[rgba(139,92,246,0.4)] transition-all"
                  style={inputStyle}
                >
                  {currencies.map((c) => (
                    <option key={c} value={c.split(" ")[0]} style={{ background: "#0a0a14" }}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/40 mb-2">Date Format</label>
                <div className="flex gap-2">
                  {dateFormats.map((f) => (
                    <button
                      key={f}
                      onClick={() => setDateFormat(f)}
                      className="px-4 py-2 text-sm rounded-lg border transition-all"
                      style={dateFormat === f ? {
                        borderColor: "rgba(139,92,246,0.4)",
                        color: "#c4b5fd",
                        background: "rgba(139,92,246,0.08)",
                      } : { borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/40 mb-2">Theme</label>
                <div className="flex gap-2">
                  {themes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t.toLowerCase().replace(" ", "_"))}
                      className="px-4 py-2 text-sm rounded-lg border transition-all"
                      style={theme === t.toLowerCase().replace(" ", "_") ? {
                        borderColor: "rgba(139,92,246,0.4)",
                        color: "#c4b5fd",
                        background: "rgba(139,92,246,0.08)",
                      } : { borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "help" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white/80">Help & Support</h2>
              <div className="space-y-3">
                {[
                  { q: "How does TrialGuard work?", a: "TrialGuard tracks your free trials and reminds you before they end. You can connect your email for automatic detection or add trials manually." },
                  { q: "Is my email data secure?", a: "Absolutely. We only scan for subscription-related keywords and never store the content of your emails. All processing is done securely." },
                  { q: "Can you actually cancel trials for me?", a: "We provide direct cancel links and step-by-step guides. For supported services, we can open the cancel page directly. Full automation is coming soon." },
                  { q: "What happens if I miss a cancellation?", a: "We send multiple reminders (7 days, 1 day, and day-of). If auto-cancel is enabled, we'll attempt to cancel on your behalf." },
                ].map((faq) => (
                  <div key={faq.q} className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-sm font-medium text-white/70 mb-1">{faq.q}</p>
                    <p className="text-sm text-white/30">{faq.a}</p>
                  </div>
                ))}
              </div>
              <div className="pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-sm text-white/30">Still need help?</p>
                <button className="nexus-btn-primary mt-2 px-4 py-2 text-sm rounded-lg">
                  Contact Support
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
