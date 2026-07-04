"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "./supabase";
import type { Bolao, Participante } from "./types";

/**
 * Assina o bolão ativo + participantes via Supabase Realtime.
 * Retorna o estado atualizado a cada mudança no banco.
 */
export function useBolaoRealtime() {
  const [bolao, setBolao] = useState<Bolao | null>(null);
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sb = supabaseBrowser();
    let mounted = true;

    async function load() {
      const { data: b } = await sb
        .from("bolao")
        .select("*")
        .eq("ativo", true)
        .order("criado_em", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!mounted) return;
      setBolao(b as Bolao | null);
      if (b) {
        const { data: ps } = await sb.from("participante").select("*").eq("bolao_id", b.id);
        if (mounted) setParticipantes((ps ?? []) as Participante[]);
      }
      setLoading(false);
    }
    load();

    const ch = sb
      .channel("bolao-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "bolao" }, (payload) => {
        const row = (payload.new ?? payload.old) as Bolao;
        if (row?.ativo) setBolao(row);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "participante" }, () => {
        load();
      })
      .subscribe();

    return () => {
      mounted = false;
      sb.removeChannel(ch);
    };
  }, []);

  return { bolao, participantes, loading };
}
