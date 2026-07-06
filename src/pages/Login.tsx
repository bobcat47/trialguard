import { Hexagon } from "lucide-react";

export default function Login() {
  return (
    <div className="flex h-screen w-screen items-center justify-center" style={{ background: "#030308" }}>
      <div className="nexus-mesh-bg" />
      <div className="relative z-10 p-8 rounded-2xl max-w-sm w-full mx-4" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)", backdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.3) 0%, rgba(0,240,255,0.2) 100%)", border: "1px solid rgba(139,92,246,0.3)" }}>
            <Hexagon className="w-7 h-7 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold nexus-gradient-text">TrialGuard</h1>
          <p className="text-sm text-white/30 text-center">Sign in to manage your free trials and avoid unwanted charges.</p>
          <button className="nexus-btn-primary w-full py-2.5 text-sm font-semibold rounded-xl mt-2">
            Sign In with OAuth
          </button>
        </div>
      </div>
    </div>
  );
}
