import { NavLink } from "react-router";
import {
  LayoutDashboard,
  CreditCard,
  Mail,
  ShieldCheck,
  PiggyBank,
  Settings,
  Hexagon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/trials", icon: CreditCard, label: "My Trials" },
  { to: "/email-scan", icon: Mail, label: "Email Scan" },
  { to: "/auto-cancel", icon: ShieldCheck, label: "Auto-Cancel" },
  { to: "/money-saved", icon: PiggyBank, label: "Money Saved" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuth();

  return (
    <aside
      className={`relative z-20 flex flex-col transition-all duration-300 ${collapsed ? "w-[72px]" : "w-[260px]"}`}
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        backdropFilter: "blur(40px) saturate(160%)",
        WebkitBackdropFilter: "blur(40px) saturate(160%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div 
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(0,240,255,0.3) 30%, rgba(139,92,246,0.3) 70%, transparent 100%)" }}
      />
      <div className="flex items-center justify-between h-16 px-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(0,240,255,0.2) 100%)",
              border: "1px solid rgba(139,92,246,0.3)",
            }}
          >
            <Hexagon className="w-5 h-5 text-white" strokeWidth={1.5} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00f0ff]" style={{ boxShadow: "0 0 6px #00f0ff" }} />
          </div>
          {!collapsed && <span className="text-lg font-bold tracking-tight nexus-gradient-text">TrialGuard</span>}
        </div>
        <button onClick={onToggle} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5">
          {collapsed ? <ChevronRight className="w-4 h-4 text-white/30" /> : <ChevronLeft className="w-4 h-4 text-white/30" />}
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-1 mt-2">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === "/"}
            className={({ isActive }) => `flex items-center gap-3 h-11 px-3 rounded-xl transition-all duration-200 group relative ${isActive ? "text-white" : "text-white/40 hover:text-white/80"}`}
            style={({ isActive }) => ({
              background: isActive ? "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(0,240,255,0.08) 100%)" : "transparent",
              border: isActive ? "1px solid rgba(139,92,246,0.25)" : "1px solid transparent",
              boxShadow: isActive ? "0 0 20px rgba(139,92,246,0.1), inset 0 1px 0 rgba(255,255,255,0.05)" : "none",
            })}
          >
            {({ isActive }) => (<>
              {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full" style={{ background: "linear-gradient(180deg, #00f0ff, #8b5cf6)" }} />}
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-[#00f0ff]" : ""}`} strokeWidth={isActive ? 2 : 1.5} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </>)}
          </NavLink>
        ))}
      </nav>
      {!collapsed && (
        <div className="p-4">
          <div className="rounded-xl p-3 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(0,240,255,0.04) 100%)", border: "1px solid rgba(139,92,246,0.15)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/40">Free Plan</span>
              <span className="text-xs font-medium nexus-gradient-text">3/5 trials</span>
            </div>
            <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="h-full rounded-full" style={{ width: "60%", background: "linear-gradient(90deg, #8b5cf6, #00f0ff)" }} />
            </div>
            <button className="mt-3 w-full py-1.5 text-xs font-medium rounded-lg transition-all hover:brightness-125" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(0,240,255,0.15) 100%)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd" }}>
              Upgrade to Pro
            </button>
          </div>
        </div>
      )}
      {user && !collapsed && (
        <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(0,240,255,0.15) 100%)", border: "1px solid rgba(139,92,246,0.3)" }}>
              <span className="text-sm font-semibold text-[#c4b5fd]">{user.name?.charAt(0).toUpperCase() || "U"}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white/80 truncate">{user.name || "User"}</p>
              <p className="text-xs text-white/30 truncate">{user.email || ""}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
