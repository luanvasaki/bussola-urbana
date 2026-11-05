import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Area, Oc, Meta, Relato, Vistoria, Ordem, Historico } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const modoSupabase = () => Boolean(url && (service || anon));
export const podeEscrever = () => Boolean(url && service);

// O Next 14 guarda as respostas de fetch em cache sem prazo. Relatos, vistorias, ordens e status mudam a todo
// momento, então o cliente com service role lê sempre na hora; o dado oficial (áreas e ocorrências) pode esperar 1 hora.
const semCache: typeof fetch = (i, init) => fetch(i, { ...init, cache: "no-store" });
const umaHora: typeof fetch = (i, init) => fetch(i, { ...init, next: { revalidate: 3600, tags: ["publico"] } }); // ações que mudam áreas chamam revalidateTag("publico")

/** Cliente com service role: só roda no servidor (Server Components / Server Actions). */
export function admin(): SupabaseClient | null {
  return url && service ? createClient(url, service, { auth: { persistSession: false }, global: { fetch: semCache } }) : null;
}
function publico(): SupabaseClient | null {
  const key = anon ?? service;
  return url && key ? createClient(url, key, { auth: { persistSession: false }, global: { fetch: umaHora } }) : null;
}
const local = <T,>(f: string): T => JSON.parse(readFileSync(path.join(process.cwd(), "data", `${f}.json`), "utf8"));

export type Publico = { areas: Area[]; ocorrencias: Oc[]; meta: Meta; origem: "supabase" | "arquivo local" };

export async function getPublico(): Promise<Publico> {
  const sb = publico();
  if (sb) {
    try {
      const [a, m] = await Promise.all([sb.from("areas").select("*").order("indice", { ascending: false }).order("n", { ascending: false }), sb.from("dataset_meta").select("*").eq("id", 1).single()]);
      if (a.error || m.error) throw new Error((a.error ?? m.error)!.message);
      const oc: Oc[] = [];
      for (let from = 0; ; from += 1000) {
        const r = await sb.from("ocorrencias").select("lat,lon,area_id,natureza,periodo,mes").order("id").range(from, from + 999);
        if (r.error) throw new Error(r.error.message);
        oc.push(...(r.data as Oc[]));
        if (r.data.length < 1000) break;
      }
      if (a.data.length) return { areas: a.data as Area[], ocorrencias: oc, meta: m.data as Meta, origem: "supabase" };
    } catch (e) { console.error("Supabase indisponível, usando arquivo local:", e); }
  }
  return { areas: local<Area[]>("areas"), ocorrencias: local<Oc[]>("ocorrencias"), meta: local<Meta>("meta"), origem: "arquivo local" };
}

export type Gestor = { relatos: Relato[]; vistorias: Vistoria[]; ordens: Ordem[]; historico: Historico[] };
export async function getGestor(): Promise<Gestor> {
  const sb = admin();
  if (sb) {
    const [r, v, o, h] = await Promise.all([
      sb.from("relatos").select("*").order("criado_em", { ascending: false }),
      sb.from("vistorias").select("*").order("criado_em", { ascending: false }),
      sb.from("ordens_zeladoria").select("*").order("criado_em", { ascending: false }),
      sb.from("historico_prioridades").select("*").order("criado_em", { ascending: false }),
    ]);
    if (!r.error && !v.error && !o.error) return { relatos: r.data as Relato[], vistorias: v.data as Vistoria[], ordens: o.data as Ordem[], historico: (h.data ?? []) as Historico[] };
    console.error("Erro lendo dados do gestor:", r.error ?? v.error ?? o.error);
  }
  const d = local<{ relatos: Relato[]; vistorias: Omit<Vistoria, "id">[]; ordens: (Omit<Ordem, "id" | "vistoria_id" | "criado_em"> & { vistoria_idx: number; secretaria: string })[] }>("demo");
  return {
    relatos: d.relatos.map((x, i) => ({ ...x, id: i + 1 })),
    vistorias: d.vistorias.map((x, i) => ({ ...x, id: i + 1 })),
    ordens: d.ordens.map((x, i) => ({ id: i + 1, vistoria_id: x.vistoria_idx + 1, tipo_servico: x.tipo_servico, secretaria: x.secretaria, status: x.status, criado_em: "2026-09-20T13:00:00Z" })),
    historico: [],
  };
}

export async function getRelatoPorProtocolo(protocolo: string): Promise<Relato | null> {
  const sb = admin();
  if (sb) {
    const r = await sb.from("relatos").select("protocolo,categoria,eixo,severidade,lat,lon,rua,bairro,status,criado_em,descricao").eq("protocolo", protocolo.trim().toUpperCase()).maybeSingle();
    return (r.data as Relato) ?? null;
  }
  return (await getGestor()).relatos.find((x) => x.protocolo === protocolo.trim().toUpperCase()) ?? null;
}
