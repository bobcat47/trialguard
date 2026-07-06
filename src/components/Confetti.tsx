import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#22C55E", "#8B5CF6"];

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
}

export default function Confetti({ active, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (active) {
      const newParticles: Particle[] = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        x: Math.random() * 400 - 200,
        y: Math.random() * -200 - 50,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 6 + 4,
        rotation: Math.random() * 720,
      }));
      setParticles(newParticles);
      const timer = setTimeout(() => { setParticles([]); onComplete?.(); }, 2500);
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] flex items-center justify-center">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
            animate={{ x: p.x, y: [p.y, p.y - 100, 300], opacity: [1, 1, 0], rotate: p.rotation, scale: [1, 1.2, 0.5] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute rounded-full"
            style={{ width: p.size, height: p.size, backgroundColor: p.color }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
