import type { Bolao, Participante, Vencedor } from "./types";

/** Distância "Manhattan" entre palpite e placar corrente. Menor = mais próximo. */
export function distancia(p: Participante, b: Bolao) {
  return (
    Math.abs(p.palpite_casa - b.placar_casa) +
    Math.abs(p.palpite_fora - b.placar_fora)
  );
}

/** Acertou exatamente o placar? */
export function acertou(p: Participante, b: Bolao) {
  return p.palpite_casa === b.placar_casa && p.palpite_fora === b.placar_fora;
}

/** Prêmio total = valor da aposta × quem pagou (ou todos, se ainda não iniciou cobrança). */
export function calcularPremioTotal(b: Bolao, ps: Participante[]) {
  const pagos = ps.filter((p) => p.pago).length;
  const base = pagos > 0 ? pagos : ps.length;
  return base * Number(b.valor_aposta);
}

/** Ordena o ranking. Empates preservam ordem estável. */
export function rankear(ps: Participante[], b: Bolao) {
  return [...ps].sort((a, b2) => {
    const da = distancia(a, b);
    const db = distancia(b2, b);
    if (da !== db) return da - db;
    return a.nome.localeCompare(b2.nome, "pt-BR");
  });
}

/** Situação legível de cada participante em relação ao placar atual. */
export function situacao(p: Participante, b: Bolao): {
  label: string;
  cor: "verde" | "amarelo" | "vermelho";
} {
  if (acertou(p, b)) return { label: "Acertando", cor: "verde" };
  if (b.status === "ft") return { label: "Não venceu", cor: "vermelho" };
  const d = distancia(p, b);
  if (d <= 1) return { label: "Muito perto", cor: "amarelo" };
  if (d <= 3) return { label: "Perto", cor: "amarelo" };
  return { label: "Distante", cor: "vermelho" };
}

/** Ao término (FT), retorna os vencedores exatos e divide o prêmio igualmente. */
export function definirVencedores(b: Bolao, ps: Participante[]): Vencedor[] {
  if (b.status !== "ft") return [];
  const premio = calcularPremioTotal(b, ps);
  const exatos = ps.filter((p) => acertou(p, b));

  // Se ninguém acertou exato, ganha quem chegou mais perto.
  const vencedores = exatos.length > 0 ? exatos : (() => {
    const ranked = rankear(ps, b);
    if (ranked.length === 0) return [];
    const minD = distancia(ranked[0], b);
    return ranked.filter((p) => distancia(p, b) === minD);
  })();

  if (vencedores.length === 0) return [];
  const cota = Math.floor((premio * 100) / vencedores.length) / 100; // 2 casas
  return vencedores.map((v) => ({
    id: v.id,
    nome: v.nome,
    palpite: `${v.palpite_casa}x${v.palpite_fora}`,
    valor: cota,
  }));
}

/** Estatísticas para a tela pública. */
export function estatisticas(b: Bolao, ps: Participante[]) {
  const casa = ps.filter((p) => p.palpite_casa > p.palpite_fora).length;
  const empate = ps.filter((p) => p.palpite_casa === p.palpite_fora).length;
  const fora = ps.filter((p) => p.palpite_casa < p.palpite_fora).length;

  const contagem = new Map<string, number>();
  ps.forEach((p) => {
    const k = `${p.palpite_casa}x${p.palpite_fora}`;
    contagem.set(k, (contagem.get(k) ?? 0) + 1);
  });
  const placarMaisEscolhido =
    [...contagem.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return {
    casa,
    empate,
    fora,
    placarMaisEscolhido,
    totalArrecadado: calcularPremioTotal(b, ps),
    totalParticipantes: ps.length,
  };
}

export function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
