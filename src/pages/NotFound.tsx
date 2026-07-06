import { Link } from "react-router";
import { Hexagon } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-screen w-screen items-center justify-center" style={{ background: "#030308" }}>
      <div className="nexus-mesh-bg" />
      <div className="relative z-10 text-center">
        <Hexagon className="w-16 h-16 text-white/10 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white/80 mb-2">404</h1>
        <p className="text-sm text-white/30 mb-6">Page not found</p>
        <Link to="/" className="nexus-btn-primary px-6 py-2.5 text-sm font-medium rounded-xl inline-block">
          Go Home
        </Link>
      </div>
    </div>
  );
}
