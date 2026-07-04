/**
 * Wrapper mínimo para API-Football (api-sports.io).
 * Docs: https://www.api-football.com/documentation-v3
 */

import type { StatusPartida } from "./types";

const HOST = process.env.API_FOOTBALL_HOST ?? "v3.football.api-sports.io";
const KEY = process.env.API_FOOTBALL_KEY!;

interface FixtureResponse {
  response: Array<{
    fixture: { id: number; status: { short: string; elapsed: number | null } };
    goals: { home: number | null; away: number | null };
  }>;
}

/** Mapeia o status da API-Football para nosso enum interno. */
export function mapStatus(s: string): StatusPartida {
  if (["1H", "2H", "ET", "P", "LIVE"].includes(s)) return "live";
  if (s === "HT") return "ht";
  if (["FT", "AET", "PEN"].includes(s)) return "ft";
  if (["CANC", "ABD", "AWD", "WO"].includes(s)) return "cancelado";
  return "pre";
}

export interface PartidaLive {
  status: StatusPartida;
  minuto: number | null;
  casa: number;
  fora: number;
}

export async function buscarPartida(fixtureId: number): Promise<PartidaLive | null> {
  const res = await fetch(`https://${HOST}/fixtures?id=${fixtureId}`, {
    headers: { "x-apisports-key": KEY },
    // Vercel cron chama este endpoint; evitamos cache.
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API-Football HTTP ${res.status}`);
  const data = (await res.json()) as FixtureResponse;
  const f = data.response?.[0];
  if (!f) return null;
  return {
    status: mapStatus(f.fixture.status.short),
    minuto: f.fixture.status.elapsed,
    casa: f.goals.home ?? 0,
    fora: f.goals.away ?? 0,
  };
}
