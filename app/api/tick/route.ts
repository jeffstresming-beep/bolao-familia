import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { buscarPartida } from "@/lib/api-football";
import { definirVencedores, calcularPremioTotal } from "@/lib/bolao-logic";
import type { Bolao, Participante } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Endpoint chamado pelo Vercel Cron a cada minuto.
 * - Busca o placar da API-Football
 * - Atualiza a tabela `bolao`
 * - Ao FT, grava a linha em `resultado` com os vencedores
 *
 * Segurança: precisa vir com header `x-cron-secret` (definido em CRON_SECRET).
 * O Vercel Cron injeta o header `Authorization: Bearer <VERCEL_CRON_SECRET>`.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const custom = req.headers.get("x-cron-secret") ?? "";
  const expected = process.env.CRON_SECRET ?? "";
  const vercelCron = req.headers.get("x-vercel-cron"); // presente quando é o cron nativo

  if (!vercelCron && custom !== expected && !auth.includes(expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const sb = supabaseAdmin();
  const { data: b } = await sb
    .from("bolao")
    .select("*")
    .eq("ativo", true)
    .not("fixture_id", "is", null)
    .in("status", ["pre", "live", "ht"])
    .limit(1)
    .maybeSingle();

  if (!b) return NextResponse.json({ ok: true, skipped: "no active fixture" });

  const bolao = b as Bolao;
  const live = await buscarPartida(bolao.fixture_id!);
  if (!live) return NextResponse.json({ ok: true, skipped: "no fixture data" });

  await sb
    .from("bolao")
    .update({
      status: live.status,
      minuto: live.minuto,
      placar_casa: live.casa,
      placar_fora: live.fora,
    })
    .eq("id", bolao.id);

  // Ao encerrar, grava histórico com vencedores
  if (live.status === "ft") {
    const updated: Bolao = { ...bolao, ...live, placar_casa: live.casa, placar_fora: live.fora };
    const { data: ps } = await sb.from("participante").select("*").eq("bolao_id", bolao.id);
    const vencedores = definirVencedores(updated, (ps ?? []) as Participante[]);
    const premio = calcularPremioTotal(updated, (ps ?? []) as Participante[]);

    await sb.from("resultado").insert({
      bolao_id: bolao.id,
      placar_casa: live.casa,
      placar_fora: live.fora,
      vencedores,
      premio_total: premio,
    });
  }

  return NextResponse.json({ ok: true, live });
}
