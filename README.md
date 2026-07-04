# 🏆 Bolão da Família

App web em tempo real para acompanhar bolões de futebol em família.
Placar puxado automaticamente da API-Football, ranking recalculado ao vivo,
tela de vencedores com confetes e painel administrativo protegido.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · Framer Motion · Supabase (Postgres + Realtime + Auth) · React Query · API-Football.

---

## 📁 Estrutura

```
bolao/
├── app/
│   ├── layout.tsx           # layout raiz + QueryProvider
│   ├── page.tsx             # tela pública (placar + ranking + vencedores)
│   ├── globals.css
│   ├── admin/
│   │   ├── page.tsx         # painel do Jefferson (CRUD completo)
│   │   └── login/page.tsx   # login via Supabase Auth
│   └── api/tick/route.ts    # cron: puxa placar da API-Football
├── components/
│   ├── QueryProvider.tsx
│   ├── ScoreBoard.tsx       # placar animado + barra de progresso
│   ├── RankingTable.tsx     # ranking em tempo real
│   ├── StatsCards.tsx       # KPIs e distribuição de palpites
│   ├── ShareBar.tsx         # WhatsApp + copiar link + QR Code
│   └── WinnersScreen.tsx    # tela final com confetes
├── lib/
│   ├── types.ts
│   ├── supabase.ts          # browser, server, admin clients
│   ├── api-football.ts      # wrapper da API-Football
│   ├── bolao-logic.ts       # ranking, prêmio, vencedores, stats
│   ├── useBolaoRealtime.ts  # hook realtime
│   └── cn.ts
├── supabase/schema.sql      # rode no SQL Editor do Supabase
├── vercel.json              # cron do /api/tick
├── .env.example
└── package.json
```

---

## 🚀 Instalação (local)

```bash
# 1. Clonar / extrair o zip
cd bolao

# 2. Instalar
npm install

# 3. Variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves reais.

# 4. Rodar
npm run dev
# Abre em http://localhost:3000
```

---

## 🔐 Configuração do Supabase (5 minutos)

1. Crie um projeto grátis em [supabase.com](https://supabase.com).
2. Vá em **SQL Editor** → cole o conteúdo de `supabase/schema.sql` → **Run**.
3. Em **Project Settings → API**, copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (mantenha em segredo!)
4. Em **Authentication → Users**, clique **Add user** → crie o usuário do Jefferson
   (e-mail + senha). Só ele deve existir aqui.
5. Em **Authentication → Providers → Email**, desabilite "Confirm email" para não
   precisar confirmar por e-mail (opcional).

---

## ⚽ Configuração da API-Football

1. Crie conta em [api-sports.io](https://dashboard.api-football.com/register).
2. Copie sua chave em **Account → API Key** → `API_FOOTBALL_KEY`.
3. Para achar o `fixture_id` de uma partida:
   ```
   https://v3.football.api-sports.io/fixtures?date=2026-07-05
   ```
   (chame com header `x-apisports-key: SUA_CHAVE`).
4. No painel admin, cole o `fixture_id` no bolão. O cron vai puxar o placar sozinho.

---

## ☁️ Deploy na Vercel

```bash
# 1. Suba o repositório para o GitHub
git init && git add . && git commit -m "init" && git branch -M main
git remote add origin https://github.com/SEU_USER/bolao-familia.git
git push -u origin main

# 2. Em vercel.com → New Project → importe o repo.
# 3. Em "Environment Variables", cole todas as variáveis de .env.local.
# 4. Deploy.
```

O `vercel.json` já registra o cron do `/api/tick` para rodar **a cada minuto**.
A Vercel injeta o header `x-vercel-cron` automaticamente — o endpoint valida
isso ou o seu `CRON_SECRET`.

> ⚠️ **Free tier Vercel:** Hobby permite cron mínimo de 1 minuto/dia.
> Para 30 segundos, use plano Pro **ou** um serviço externo (cron-job.org)
> chamando `https://seu-app.vercel.app/api/tick` com header `x-cron-secret`.

---

## 🔄 Como trocar o jogo (ex.: Brasil x Noruega → Palmeiras x Flamengo)

Tudo pelo **painel admin** (`/admin`):

1. Edite `Time casa`, `Time fora`, `Flag casa` (`🇧🇷` → `🟢` ou outro emoji),
   `Flag fora`, `Data da partida`.
2. No campo **Fixture ID**, cole o novo ID da API-Football.
3. Clique **Salvar alterações**.
4. Clique **Reiniciar bolão** para zerar placar e voltar ao status *pre*.
5. Ajuste palpites dos participantes.

Zero código, zero deploy.

---

## 🧠 Como funciona a lógica

- **`useBolaoRealtime`** assina mudanças na tabela `bolao` + `participante`.
  Qualquer UPDATE (feito pelo cron ou admin) chega no browser em ~200ms.
- **`bolao-logic.ts`** faz todo o cálculo *no cliente*: ranking por distância,
  prêmio = participantes pagos × aposta, vencedores exatos ou empate por proximidade.
- **`/api/tick`** é chamado pelo cron, busca o placar, faz `UPDATE bolao` — o
  Realtime propaga; a UI reordena o ranking com Framer Motion.
- Quando `status = 'ft'`, uma linha é inserida em `resultado` (histórico permanente)
  e a tela pública troca automaticamente para a versão com confetes.

---

## 🔒 Segurança

- **RLS ligada** nas 3 tabelas.
- Leitura pública (link do bolão é público de propósito).
- Escrita **apenas** para usuários autenticados (só o Jefferson existe).
- `service_role` **nunca** vai para o cliente — usada só no `/api/tick`.
- Cron protegido por `CRON_SECRET` ou header `x-vercel-cron`.

---

## 🧪 Testar sem API-Football

Enquanto configura a API real, você pode simular o placar direto no painel admin:
basta editar `placar_casa`, `placar_fora` e `status` no Supabase Table Editor. O
Realtime já vai propagar tudo.

---

## 📋 Roadmap sugerido (fora do MVP)

Coisas que a spec pede e ficaram como *hooks* prontos para você estender:

- [ ] Exportar participantes em CSV (basta `saveAs` no browser)
- [ ] Exportar resultado em PDF (`@react-pdf/renderer`)
- [ ] Histórico de bolões no admin (`SELECT * FROM resultado ORDER BY encerrado_em DESC`)
- [ ] Notificações push no gol (Web Push API)
- [ ] Suporte a múltiplos bolões simultâneos (o schema já permite)

---

Feito para o Jefferson 💚
