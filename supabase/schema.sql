-- Bússola Urbana — esquema Supabase/PostgreSQL + PostGIS. Rode inteiro no SQL Editor.
-- Evolui o esquema do repositório (PostgreSQL.sql): relato do cidadão segue anônimo, o score vem só de dado oficial.
create extension if not exists postgis;

create table if not exists dataset_meta (
  id int primary key default 1 check (id = 1),
  periodo_inicio date not null, periodo_fim date not null,
  n_total int not null, n_em_areas int not null, n_areas int not null,
  fonte text not null, gerado date not null
);

create table if not exists areas (
  id int primary key,
  bairro text not null,
  n int not null,
  natureza_top text, ambiente_top text, pct_veiculo numeric default 0,
  periodo_pico text not null,
  concentracao_pico numeric not null, pct_hora_incerta numeric not null,
  lat double precision not null, lon double precision not null, raio_km numeric not null,
  furto int not null default 0, roubo int not null default 0, trafico int not null default 0,
  score_volume int not null, score_temporal int not null, indice int not null,
  status_workflow text not null default 'Aguardando triagem'
    check (status_workflow in ('Aguardando triagem','Em vistoria','Ordem emitida','Concluída')),
  geom geography(Point,4326)
);

create table if not exists ocorrencias (
  id bigint generated always as identity primary key,
  area_id int references areas(id) on delete set null,
  lat double precision not null, lon double precision not null,
  natureza text not null check (natureza in ('furto','roubo','trafico')),
  periodo text not null, mes int not null,
  geom geography(Point,4326)
);
create index if not exists ocorrencias_area_idx on ocorrencias(area_id);
create index if not exists ocorrencias_geom_idx on ocorrencias using gist(geom);

create sequence if not exists protocolo_seq start 1000;
create table if not exists relatos (
  id bigint generated always as identity primary key,
  protocolo text unique not null default ('BU-' || extract(year from now())::int || '-' || lpad(nextval('protocolo_seq')::text, 6, '0')),
  categoria text not null, eixo text not null, severidade text not null check (severidade in ('Alta','Média','Baixa')),
  descricao text, lat double precision not null, lon double precision not null, bairro text,
  area_id int references areas(id) on delete set null,
  status text not null default 'Relato recebido'
    check (status in ('Relato recebido','Em análise municipal','Encaminhado ao órgão responsável','Concluído')),
  demonstrativo boolean not null default false,
  criado_em timestamptz not null default now(),
  geom geography(Point,4326)
);
-- sem nome, CPF, telefone ou e-mail: o protocolo é o único vínculo.

create table if not exists vistorias (
  id bigint generated always as identity primary key,
  area_id int not null references areas(id) on delete cascade,
  fiscal text not null, problema text not null, observacoes text,
  criado_em timestamptz not null default now()
);
create table if not exists ordens_zeladoria (
  id bigint generated always as identity primary key,
  vistoria_id bigint not null references vistorias(id) on delete cascade,
  tipo_servico text not null, secretaria text not null,
  status text not null default 'Pendente' check (status in ('Pendente','Em andamento','Concluída')),
  concluida_em timestamptz, criado_em timestamptz not null default now()
);
create table if not exists historico_prioridades (
  id bigint generated always as identity primary key,
  area_id int not null references areas(id) on delete cascade,
  score int not null, prioridade text not null, motivo text,
  criado_em timestamptz not null default now()
);

-- PostGIS: preenche geom e vincula o relato à área de atenção mais próxima (até o raio da área, mín. 250 m)
create or replace function set_geom() returns trigger language plpgsql as $$
begin new.geom := st_setsrid(st_makepoint(new.lon, new.lat), 4326)::geography; return new; end $$;
create or replace function relato_antes() returns trigger language plpgsql as $$
begin
  new.geom := st_setsrid(st_makepoint(new.lon, new.lat), 4326)::geography;
  if new.area_id is null then
    select a.id into new.area_id from areas a
    where st_dwithin(a.geom, new.geom, greatest(a.raio_km * 1000, 250))
    order by st_distance(a.geom, new.geom) limit 1;
  end if;
  return new;
end $$;

drop trigger if exists t_areas_geom on areas;
create trigger t_areas_geom before insert or update of lat, lon on areas for each row execute function set_geom();
drop trigger if exists t_oc_geom on ocorrencias;
create trigger t_oc_geom before insert on ocorrencias for each row execute function set_geom();
drop trigger if exists t_relato on relatos;
create trigger t_relato before insert on relatos for each row execute function relato_antes();

-- RLS: o público lê só dado oficial agregado. Relatos, vistorias e ordens são lidos/escritos
-- pelo servidor do app (service role), nunca direto do navegador.
alter table dataset_meta enable row level security;
alter table areas enable row level security;
alter table ocorrencias enable row level security;
alter table relatos enable row level security;
alter table vistorias enable row level security;
alter table ordens_zeladoria enable row level security;
alter table historico_prioridades enable row level security;
drop policy if exists "leitura publica meta" on dataset_meta;
drop policy if exists "leitura publica areas" on areas;
drop policy if exists "leitura publica ocorrencias" on ocorrencias;
create policy "leitura publica meta" on dataset_meta for select using (true);
create policy "leitura publica areas" on areas for select using (true);
create policy "leitura publica ocorrencias" on ocorrencias for select using (true);

-- Endurecimento (avisos do Supabase Advisors)
alter function public.set_geom() set search_path = public;
alter function public.relato_antes() set search_path = public;
