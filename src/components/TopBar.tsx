import { Search, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface TopBarProps {
  onSearchClick: () => void;
}

export default function TopBar({ onSearchClick }: TopBarProps) {
  const { user } = useAuth();

  return (
    <header 
      className="relative z-50 flex items-center justify-between h-16 px-6"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
        backdropFilter: "blur(40px) saturate(160%)",
        WebkitBackdropFilter: "blur(40px) saturate(160%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div 
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(0,240,255,0.2) 20%, rgba(139,92,246,0.2) 50%, rgba(0,240,255,0.2) 80%, transparent 100%)" }}
      />
      <div className="flex items-center gap-3">
        <span className="text-xs text-white/20 hidden lg:block">Nexus System // TrialGuard</span>
      </div>
      <button onClick={onSearchClick} className="flex items-center gap-2 w-80 h-9 px-3 rounded-xl text-sm transition-all hover:brightness-125" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.25)" }}>
        <Search className="w-4 h-4" />
        <span>Search trials or services...</span>
        <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>⌘K</kbd>
      </button>
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <Bell className="w-4 h-4 text-white/40" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "#ff3b5c", boxShadow: "0 0 6px rgba(255,59,92,0.6)" }} />
        </button>
        {user && (
          <div className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all hover:brightness-125" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(0,240,255,0.2) 100%)", border: "1px solid rgba(139,92,246,0.3)" }}>
            <span className="text-sm font-semibold text-[#c4b5fd]">{user.name?.charAt(0).toUpperCase() || "U"}</span>
          </div>
        )}
      </div>
    </header>
  );
}
