"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Trophy } from "lucide-react";
import type { Bolao, Participante } from "@/lib/types";
import { definirVencedores, formatBRL } from "@/lib/bolao-logic";

export function WinnersScreen({ b, ps }: { b: Bolao; ps: Participante[] }) {
  const vencedores = definirVencedores(b, ps);

  useEffect(() => {
    if (b.status !== "ft") return;
    const dur = 3000;
    const end = Date.now() + dur;
    const tick = () => {
      confetti({ particleCount: 4, spread: 60, origin: { x: Math.random(), y: 0 } });
      if (Date.now() < end) requestAnimationFrame(tick);
    };
    tick();
  }, [b.status]);

  if (b.status !== "ft") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-p bg-gradient-to-br from-brand-green/10 via-bg-card to-brand-yellow/10 border-brand-green/30"
    >
      <div className="text-center">
        <Trophy className="w-10 h-10 mx-auto text-brand-yellow mb-2" />
        <h2 className="text-2xl font-black">Resultado Final</h2>
        <div className="text-4xl font-black mt-3 mb-6">
          {b.time_casa} {b.placar_casa} <span className="text-muted">x</span> {b.placar_fora} {b.time_fora}
        </div>
        <div className="text-sm text-muted mb-4">
          {vencedores.length > 1 ? "🥇 Vencedores" : "🥇 Vencedor"}
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          {vencedores.map((v) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-between bg-bg-soft border border-brand-green/30 rounded-xl px-4 py-3"
            >
              <div className="text-left">
                <div className="font-bold">🏆 {v.nome}</div>
                <div className="text-xs text-muted font-mono">Palpite: {v.palpite}</div>
              </div>
              <div className="text-brand-green font-black text-lg">{formatBRL(v.valor)}</div>
            </motion.div>
          ))}
          {vencedores.length === 0 && (
            <div className="text-muted text-sm">Sem vencedores registrados.</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
