-- =====================================================
-- Bolão da Família — Schema Supabase (Postgres)
-- Rode este arquivo inteiro no SQL Editor do Supabase.
-- =====================================================

-- ---------- Extensões ----------
create extension if not exists "pgcrypto";

-- =====================================================
-- 1) BOLÕES
-- =====================================================
create table if not exists public.bolao (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null default 'Bolão da Família',
  time_casa     text not null,
  time_fora     text not null,
  flag_casa     text,                        -- emoji ou url
  flag_fora     text,
  data_partida  timestamptz not null,
  valor_aposta  numeric(10,2) not null default 10.00,
  fixture_id    bigint,                       -- id da partida na API-Football
  status        text not null default 'pre'   -- pre | live | ht | ft | cancelado
                check (status in ('pre','live','ht','ft','cancelado')),
  placar_casa   int not null default 0,
  placar_fora   int not null default 0,
  minuto        int,                          -- minuto corrente da partida
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index if not exists idx_bolao_ativo on public.bolao(ativo);

-- =====================================================
-- 2) PARTICIPANTES
-- =====================================================
create table if not exists public.participante (
  id            uuid primary key default gen_random_uuid(),
  bolao_id      uuid not null references public.bolao(id) on delete cascade,
  nome          text not null,
  palpite_casa  int not null,
  palpite_fora  int not null,
  pago          boolean not null default false,
  criado_em     timestamptz not null default now(),
  unique (bolao_id, nome)
);
create index if not exists idx_part_bolao on public.participante(bolao_id);

-- =====================================================
-- 3) HISTÓRICO DE RESULTADOS (para dashboard admin)
-- =====================================================
create table if not exists public.resultado (
  id            uuid primary key default gen_random_uuid(),
  bolao_id      uuid not null references public.bolao(id) on delete cascade,
  placar_casa   int not null,
  placar_fora   int not null,
  vencedores    jsonb not null default '[]'::jsonb, -- [{id,nome,palpite,valor}]
  premio_total  numeric(10,2) not null default 0,
  encerrado_em  timestamptz not null default now()
);

-- =====================================================
-- 4) TRIGGER: atualizado_em
-- =====================================================
create or replace function public.touch_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end $$;

drop trigger if exists trg_bolao_touch on public.bolao;
create trigger trg_bolao_touch
before update on public.bolao
for each row execute function public.touch_atualizado_em();

-- =====================================================
-- 5) REALTIME
-- =====================================================
alter publication supabase_realtime add table public.bolao;
alter publication supabase_realtime add table public.participante;

-- =====================================================
-- 6) RLS — participantes veem tudo (leitura), só admin escreve
-- =====================================================
alter table public.bolao         enable row level security;
alter table public.participante  enable row level security;
alter table public.resultado     enable row level security;

-- Leitura pública (link do bolão é público)
drop policy if exists "bolao_read_public"        on public.bolao;
drop policy if exists "participante_read_public" on public.participante;
drop policy if exists "resultado_read_public"    on public.resultado;

create policy "bolao_read_public"        on public.bolao        for select using (true);
create policy "participante_read_public" on public.participante for select using (true);
create policy "resultado_read_public"    on public.resultado    for select using (true);

-- Escrita apenas para usuários autenticados (Jefferson admin)
drop policy if exists "bolao_write_admin"        on public.bolao;
drop policy if exists "participante_write_admin" on public.participante;
drop policy if exists "resultado_write_admin"    on public.resultado;

create policy "bolao_write_admin"        on public.bolao
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "participante_write_admin" on public.participante
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "resultado_write_admin"    on public.resultado
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- =====================================================
-- 7) SEED (opcional): 1 bolão de exemplo
-- =====================================================
-- insert into public.bolao (nome, time_casa, time_fora, flag_casa, flag_fora, data_partida, valor_aposta)
-- values ('Bolão da Família', 'Brasil', 'Noruega', '🇧🇷', '🇳🇴', now() + interval '2 days', 10.00);
