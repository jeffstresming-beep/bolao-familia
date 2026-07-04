"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";
import type { Bolao, Participante } from "@/lib/types";
import { formatBRL, calcularPremioTotal } from "@/lib/bolao-logic";
import { LogOut, Plus, Trash2, Edit3, Check, X, RefreshCw, Power } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const sb = supabaseBrowser();
  const [bolao, setBolao] = useState<Bolao | null>(null);
  const [ps, setPs] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [novo, setNovo] = useState({ nome: "", palpite_casa: 0, palpite_fora: 0 });

  useEffect(() => {
    (async () => {
      const { data: user } = await sb.auth.getUser();
      if (!user.user) return router.replace("/admin/login");
      await load();
    })();
  }, []);

  async function load() {
    setLoading(true);
    const { data: b } = await sb
      .from("bolao").select("*").eq("ativo", true)
      .order("criado_em", { ascending: false }).limit(1).maybeSingle();
    setBolao(b as Bolao | null);
    if (b) {
      const { data } = await sb.from("participante").select("*")
        .eq("bolao_id", (b as Bolao).id).order("criado_em");
      setPs((data ?? []) as Participante[]);
    }
    setLoading(false);
  }

  async function logout() {
    await sb.auth.signOut();
    router.replace("/admin/login");
  }

  async function criarBolao() {
    setSaving(true);
    const { data } = await sb.from("bolao").insert({
      nome: "Bolão da Família",
      time_casa: "Brasil", time_fora: "Noruega",
      flag_casa: "🇧🇷", flag_fora: "🇳🇴",
      data_partida: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      valor_aposta: 10,
    }).select().single();
    setBolao(data as Bolao);
    setSaving(false);
  }

  async function updBolao(patch: Partial<Bolao>) {
    if (!bolao) return;
    const { data } = await sb.from("bolao").update(patch).eq("id", bolao.id).select().single();
    setBolao(data as Bolao);
  }

  async function addParticipante(e: React.FormEvent) {
    e.preventDefault();
    if (!bolao || !novo.nome.trim()) return;
    await sb.from("participante").insert({ ...novo, bolao_id: bolao.id });
    setNovo({ nome: "", palpite_casa: 0, palpite_fora: 0 });
    await load();
  }

  async function updParticipante(id: string, patch: Partial<Participante>) {
    await sb.from("participante").update(patch).eq("id", id);
    await load();
  }

  async function delParticipante(id: string) {
    if (!confirm("Remover participante?")) return;
    await sb.from("participante").delete().eq("id", id);
    await load();
  }

  async function encerrar() {
    if (!confirm("Marcar bolão como encerrado (FT)?")) return;
    await updBolao({ status: "ft" });
  }

  async function reiniciar() {
    if (!bolao) return;
    if (!confirm("Reiniciar: zera placar, status pre-jogo. Continua?")) return;
    await updBolao({ status: "pre", placar_casa: 0, placar_fora: 0, minuto: null });
  }

  if (loading) return <div className="p-8 text-muted">Carregando…</div>;

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <header className="flex items-center gap-3">
        <h1 className="text-xl font-black">Painel Administrativo</h1>
        <button onClick={load} className="ml-auto p-2 rounded-lg bg-bg-soft hover:bg-bg-border" title="Recarregar">
          <RefreshCw className="w-4 h-4" />
        </button>
        <button onClick={logout} className="p-2 rounded-lg bg-bg-soft hover:bg-bg-border" title="Sair">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {!bolao ? (
        <div className="card-p text-center">
          <p className="text-muted mb-4">Nenhum bolão ativo.</p>
          <button
            onClick={criarBolao}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-brand-green text-black font-semibold px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" /> Criar bolão
          </button>
        </div>
      ) : (
        <>
          <BolaoEditor b={bolao} onChange={updBolao} />
          <div className="grid sm:grid-cols-3 gap-3">
            <Kpi label="Participantes" value={ps.length.toString()} />
            <Kpi label="Pagos" value={ps.filter(p => p.pago).length.toString()} />
            <Kpi label="Prêmio" value={formatBRL(calcularPremioTotal(bolao, ps))} accent />
          </div>

          <div className="card">
            <div className="p-4 border-b border-bg-border font-semibold">Participantes</div>
            <form onSubmit={addParticipante} className="p-4 grid grid-cols-1 sm:grid-cols-[1fr_80px_80px_auto] gap-2 border-b border-bg-border">
              <input placeholder="Nome" value={novo.nome} onChange={e => setNovo({ ...novo, nome: e.target.value })} className="bg-bg-soft border border-bg-border rounded-lg px-3 py-2 outline-none focus:border-brand-green" />
              <input type="number" min={0} value={novo.palpite_casa} onChange={e => setNovo({ ...novo, palpite_casa: Number(e.target.value) })} className="bg-bg-soft border border-bg-border rounded-lg px-3 py-2 text-center" />
              <input type="number" min={0} value={novo.palpite_fora} onChange={e => setNovo({ ...novo, palpite_fora: Number(e.target.value) })} className="bg-bg-soft border border-bg-border rounded-lg px-3 py-2 text-center" />
              <button className="bg-brand-green text-black font-semibold px-4 py-2 rounded-lg inline-flex items-center gap-1 justify-center">
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </form>
            <div className="divide-y divide-bg-border">
              {ps.map(p => <ParticipanteRow key={p.id} p={p} onSave={updParticipante} onDelete={delParticipante} />)}
              {ps.length === 0 && <div className="p-6 text-muted text-sm text-center">Sem participantes ainda.</div>}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button onClick={encerrar} className="bg-bg-soft hover:bg-bg-border px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2">
              <Power className="w-4 h-4" /> Encerrar bolão
            </button>
            <button onClick={reiniciar} className="bg-bg-soft hover:bg-bg-border px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Reiniciar bolão
            </button>
          </div>
        </>
      )}
    </main>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card-p">
      <div className="text-xs text-muted">{label}</div>
      <div className={`text-2xl font-black ${accent ? "text-brand-green" : ""}`}>{value}</div>
    </div>
  );
}

function BolaoEditor({ b, onChange }: { b: Bolao; onChange: (p: Partial<Bolao>) => Promise<void> }) {
  const [form, setForm] = useState(b);
  useEffect(() => setForm(b), [b]);
  return (
    <div className="card-p">
      <h2 className="font-semibold mb-3">Configuração do bolão</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Nome"><input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} className="inp" /></Field>
        <Field label="Valor da aposta (R$)"><input type="number" step="0.01" value={form.valor_aposta} onChange={e => setForm({ ...form, valor_aposta: Number(e.target.value) })} className="inp" /></Field>
        <Field label="Time casa"><input value={form.time_casa} onChange={e => setForm({ ...form, time_casa: e.target.value })} className="inp" /></Field>
        <Field label="Time fora"><input value={form.time_fora} onChange={e => setForm({ ...form, time_fora: e.target.value })} className="inp" /></Field>
        <Field label="Flag casa (emoji)"><input value={form.flag_casa ?? ""} onChange={e => setForm({ ...form, flag_casa: e.target.value })} className="inp" /></Field>
        <Field label="Flag fora (emoji)"><input value={form.flag_fora ?? ""} onChange={e => setForm({ ...form, flag_fora: e.target.value })} className="inp" /></Field>
        <Field label="Data da partida"><input type="datetime-local" value={form.data_partida?.slice(0,16)} onChange={e => setForm({ ...form, data_partida: new Date(e.target.value).toISOString() })} className="inp" /></Field>
        <Field label="Fixture ID (API-Football)"><input type="number" value={form.fixture_id ?? ""} onChange={e => setForm({ ...form, fixture_id: e.target.value ? Number(e.target.value) : null })} className="inp" /></Field>
      </div>
      <button
        onClick={() => onChange({
          nome: form.nome, valor_aposta: form.valor_aposta,
          time_casa: form.time_casa, time_fora: form.time_fora,
          flag_casa: form.flag_casa, flag_fora: form.flag_fora,
          data_partida: form.data_partida, fixture_id: form.fixture_id,
        })}
        className="mt-4 bg-brand-green text-black font-semibold px-4 py-2 rounded-lg"
      >Salvar alterações</button>
      <style jsx>{`.inp { width:100%; background:#121815; border:1px solid #1f2a24; border-radius:.5rem; padding:.5rem .75rem; outline:none; }`}</style>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-xs text-muted">{label}</span><div className="mt-1">{children}</div></label>;
}

function ParticipanteRow({ p, onSave, onDelete }: {
  p: Participante;
  onSave: (id: string, patch: Partial<Participante>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState(p);
  useEffect(() => setF(p), [p]);
  return (
    <div className="p-3 flex items-center gap-3">
      {edit ? (
        <>
          <input value={f.nome} onChange={e => setF({ ...f, nome: e.target.value })} className="flex-1 bg-bg-soft border border-bg-border rounded px-2 py-1" />
          <input type="number" min={0} value={f.palpite_casa} onChange={e => setF({ ...f, palpite_casa: Number(e.target.value) })} className="w-14 bg-bg-soft border border-bg-border rounded px-2 py-1 text-center" />
          <input type="number" min={0} value={f.palpite_fora} onChange={e => setF({ ...f, palpite_fora: Number(e.target.value) })} className="w-14 bg-bg-soft border border-bg-border rounded px-2 py-1 text-center" />
          <button onClick={async () => { await onSave(p.id, { nome: f.nome, palpite_casa: f.palpite_casa, palpite_fora: f.palpite_fora }); setEdit(false); }} className="p-1.5 rounded bg-brand-green text-black"><Check className="w-4 h-4" /></button>
          <button onClick={() => { setF(p); setEdit(false); }} className="p-1.5 rounded bg-bg-soft"><X className="w-4 h-4" /></button>
        </>
      ) : (
        <>
          <div className="flex-1">
            <div className="font-medium">{p.nome}</div>
            <div className="text-xs text-muted font-mono">{p.palpite_casa}x{p.palpite_fora}</div>
          </div>
          <label className="flex items-center gap-1 text-xs cursor-pointer">
            <input type="checkbox" checked={p.pago} onChange={e => onSave(p.id, { pago: e.target.checked })} />
            Pago
          </label>
          <button onClick={() => setEdit(true)} className="p-1.5 rounded bg-bg-soft hover:bg-bg-border"><Edit3 className="w-4 h-4" /></button>
          <button onClick={() => onDelete(p.id)} className="p-1.5 rounded bg-bg-soft hover:bg-red-500/20 text-red-400"><Trash2 className="w-4 h-4" /></button>
        </>
      )}
    </div>
  );
}
