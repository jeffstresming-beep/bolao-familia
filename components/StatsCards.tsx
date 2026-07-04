"use client";
import { Trophy, Users, Wallet, TrendingUp } from "lucide-react";
import type { Bolao, Participante } from "@/lib/types";
import { estatisticas, formatBRL } from "@/lib/bolao-logic";

export function StatsCards({ b, ps }: { b: Bolao; ps: Participante[] }) {
  const s = estatisticas(b, ps);
  const items = [
    { icon: Wallet, label: "Prêmio acumulado", value: formatBRL(s.totalArrecadado), accent: "text-brand-green" },
    { icon: Users, label: "Participantes", value: s.totalParticipantes.toString(), accent: "text-brand-yellow" },
    { icon: Trophy, label: "Aposta individual", value: formatBRL(Number(b.valor_aposta)), accent: "text-white" },
    { icon: TrendingUp, label: "Placar mais palpitado", value: s.placarMaisEscolhido, accent: "text-white" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((it) => (
        <div key={it.label} className="card-p">
          <it.icon className={`w-4 h-4 ${it.accent}`} />
          <div className="mt-2 text-xs text-muted">{it.label}</div>
          <div className={`text-lg sm:text-xl font-bold ${it.accent}`}>{it.value}</div>
        </div>
      ))}
    </div>
  );
}

export function VoteDistribution({ b, ps }: { b: Bolao; ps: Participante[] }) {
  const s = estatisticas(b, ps);
  const total = Math.max(ps.length, 1);
  const bar = (n: number) => `${(n / total) * 100}%`;
  return (
    <div className="card-p">
      <h3 className="font-semibold mb-3 text-sm">Distribuição dos palpites</h3>
      <Row label={`Vitória ${b.time_casa}`} n={s.casa} width={bar(s.casa)} color="bg-brand-green" />
      <Row label="Empate" n={s.empate} width={bar(s.empate)} color="bg-brand-yellow" />
      <Row label={`Vitória ${b.time_fora}`} n={s.fora} width={bar(s.fora)} color="bg-white" />
    </div>
  );
}
function Row({ label, n, width, color }: { label: string; n: number; width: string; color: string }) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted">{label}</span>
        <span className="font-mono">{n}</span>
      </div>
      <div className="h-1.5 bg-bg-border rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-[width] duration-500`} style={{ width }} />
      </div>
    </div>
  );
}
