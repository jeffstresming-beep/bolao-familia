"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";
import { LogIn, Trophy } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const sb = supabaseBrowser();
    const { error } = await sb.auth.signInWithPassword({ email, password: pwd });
    setLoading(false);
    if (error) return setErr(error.message);
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <form onSubmit={onSubmit} className="card-p w-full max-w-sm space-y-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-brand-green to-brand-yellow grid place-items-center mb-2">
            <Trophy className="w-6 h-6 text-black" />
          </div>
          <h1 className="text-xl font-black">Painel do Jefferson</h1>
          <p className="text-xs text-muted">Somente o administrador acessa este painel.</p>
        </div>
        <label className="block">
          <span className="text-xs text-muted">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mt-1 bg-bg-soft border border-bg-border rounded-lg px-3 py-2 outline-none focus:border-brand-green"
          />
        </label>
        <label className="block">
          <span className="text-xs text-muted">Senha</span>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            required
            className="w-full mt-1 bg-bg-soft border border-bg-border rounded-lg px-3 py-2 outline-none focus:border-brand-green"
          />
        </label>
        {err && <p className="text-red-400 text-sm">{err}</p>}
        <button
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 bg-brand-green hover:bg-brand-green-dark transition text-black font-semibold py-2.5 rounded-lg disabled:opacity-60"
        >
          <LogIn className="w-4 h-4" /> {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
