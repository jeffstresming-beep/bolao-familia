"use client";
import { motion } from "framer-motion";
import { Radio } from "lucide-react";
import type { Bolao } from "@/lib/types";
import { cn } from "@/lib/cn";

const STATUS_LABEL: Record<Bolao["status"], string> = {
  pre: "Pré-jogo",
  live: "Ao vivo",
  ht: "Intervalo",
  ft: "Encerrado",
  cancelado: "Cancelado",
};

export function ScoreBoard({ b }: { b: Bolao }) {
  const isLive = b.status === "live";
  const progresso =
    b.status === "ft" ? 100 : b.status === "ht" ? 50 : Math.min((b.minuto ?? 0) / 90 * 100, 100);

  return (
    <div className="card-p">
      <div className="flex items-center justify-between mb-4">
        <span
          className={cn(
            "inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full border",
            isLive
              ? "bg-brand-green/10 text-brand-green border-brand-green/30"
              : "bg-bg-soft text-muted border-bg-border"
          )}
        >
          {isLive && <Radio className="w-3 h-3 animate-pulse" />}
          {STATUS_LABEL[b.status]}
          {isLive && b.minuto !== null && <span>· {b.minuto}&apos;</span>}
        </span>
        <span className="text-xs text-muted">
          {new Date(b.data_partida).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        <div className="text-center">
          <div className="text-4xl sm:text-5xl mb-1">{b.flag_casa ?? "🏳️"}</div>
          <div className="font-semibold text-sm sm:text-base">{b.time_casa}</div>
        </div>

        <div className="text-center">
          <motion.div
            key={`${b.placar_casa}-${b.placar_fora}`}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-4xl sm:text-6xl font-black tracking-tight"
          >
            {b.placar_casa}
            <span className="text-muted mx-2 font-light">x</span>
            {b.placar_fora}
          </motion.div>
        </div>

        <div className="text-center">
          <div className="text-4xl sm:text-5xl mb-1">{b.flag_fora ?? "🏳️"}</div>
          <div className="font-semibold text-sm sm:text-base">{b.time_fora}</div>
        </div>
      </div>

      {b.status !== "pre" && b.status !== "cancelado" && (
        <div className="mt-6">
          <div className="h-1.5 bg-bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-green to-brand-yellow"
              initial={{ width: 0 }}
              animate={{ width: `${progresso}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted">
            <span>0&apos;</span><span>45&apos;</span><span>90&apos;</span>
          </div>
        </div>
      )}
    </div>
  );
}
