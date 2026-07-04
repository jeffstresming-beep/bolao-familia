"use client";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Target } from "lucide-react";
import type { Bolao, Participante } from "@/lib/types";
import { rankear, situacao, acertou, distancia } from "@/lib/bolao-logic";
import { cn } from "@/lib/cn";

export function RankingTable({ b, ps }: { b: Bolao; ps: Participante[] }) {
  const ranked = rankear(ps, b);
  return (
    <div className="card overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-bg-border flex items-center gap-2">
        <Target className="w-4 h-4 text-brand-green" />
        <h2 className="font-semibold">Classificação em tempo real</h2>
        <span className="ml-auto text-xs text-muted">{ps.length} participantes</span>
      </div>
      <div className="divide-y divide-bg-border">
        <AnimatePresence initial={false}>
          {ranked.map((p, i) => {
            const s = situacao(p, b);
            const ok = acertou(p, b);
            const d = distancia(p, b);
            return (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className={cn(
                  "flex items-center gap-3 px-4 sm:px-6 py-3",
                  ok && "bg-brand-green/10"
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-lg grid place-items-center text-xs font-bold shrink-0",
                    i === 0 ? "bg-brand-yellow text-black" : "bg-bg-soft text-muted"
                  )}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{p.nome}</div>
                  <div className="text-xs text-muted">
                    Palpite: <span className="text-white/90 font-mono">{p.palpite_casa}x{p.palpite_fora}</span>
                    <span className="ml-2">Δ {d}</span>
                  </div>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md",
                    s.cor === "verde" && "bg-brand-green/15 text-brand-green",
                    s.cor === "amarelo" && "bg-brand-yellow/15 text-brand-yellow",
                    s.cor === "vermelho" && "bg-red-500/10 text-red-400"
                  )}
                >
                  {s.cor === "verde" ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  {s.label}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {ranked.length === 0 && (
          <div className="px-6 py-10 text-center text-muted text-sm">
            Ainda não há participantes.
          </div>
        )}
      </div>
    </div>
  );
}
