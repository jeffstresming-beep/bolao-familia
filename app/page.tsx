"use client";
import { Trophy } from "lucide-react";
import { useBolaoRealtime } from "@/lib/useBolaoRealtime";
import { ScoreBoard } from "@/components/ScoreBoard";
import { RankingTable } from "@/components/RankingTable";
import { StatsCards, VoteDistribution } from "@/components/StatsCards";
import { ShareBar } from "@/components/ShareBar";
import { WinnersScreen } from "@/components/WinnersScreen";
import { useEffect, useState } from "react";

export default function Home() {
  const { bolao, participantes, loading } = useBolaoRealtime();
  const [url, setUrl] = useState("");
  useEffect(() => { setUrl(window.location.href); }, []);

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center">
        <div className="animate-pulse text-muted text-sm">Carregando bolão…</div>
      </main>
    );
  }

  if (!bolao) {
    return (
      <main className="min-h-screen grid place-items-center px-6">
        <div className="card-p text-center max-w-md">
          <Trophy className="w-10 h-10 mx-auto text-brand-yellow mb-3" />
          <h1 className="text-xl font-bold mb-2">Nenhum bolão ativo</h1>
          <p className="text-muted text-sm">
            Aguarde o Jefferson criar o próximo bolão no painel administrativo.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <header className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-green to-brand-yellow grid place-items-center">
          <Trophy className="w-5 h-5 text-black" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-black leading-tight">{bolao.nome}</h1>
          <p className="text-xs text-muted">Placar e ranking ao vivo</p>
        </div>
      </header>

      <ScoreBoard b={bolao} />

      {bolao.status === "ft" && <WinnersScreen b={bolao} ps={participantes} />}

      <StatsCards b={bolao} ps={participantes} />

      <div className="grid md:grid-cols-2 gap-4">
        <RankingTable b={bolao} ps={participantes} />
        <div className="space-y-4">
          <VoteDistribution b={bolao} ps={participantes} />
          {url && <ShareBar url={url} titulo={`${bolao.nome} — ${bolao.time_casa} x ${bolao.time_fora}`} />}
        </div>
      </div>

      <footer className="pt-4 text-center text-xs text-muted">
        Feito com 💚 · Bolão da Família
      </footer>
    </main>
  );
}
