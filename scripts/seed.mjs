// Carrega data/*.json no Supabase (idempotente). Uso: npm run seed
// Precisa de NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (em .env.local). Rode antes supabase/schema.sql.
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";

if (existsSync(".env.local")) for (const l of readFileSync(".env.local", "utf8").split("\n")) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local"); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });
const j = f => JSON.parse(readFileSync(`data/${f}.json`, "utf8"));
const ok = (r, ctx) => { if (r.error) { console.error(ctx + ": " + r.error.message); process.exit(1); } return r.data; };

const areas = j("areas"), oc = j("ocorrencias"), meta = j("meta"), demo = j("demo");

ok(await sb.from("ocorrencias").delete().gte("id", 0), "limpar ocorrencias");
ok(await sb.from("areas").upsert(areas), "areas");            // upsert: preserva status_workflow
const ids = new Set(areas.map(a => a.id));
for (let i = 0; i < oc.length; i += 1000) ok(await sb.from("ocorrencias").insert(oc.slice(i, i + 1000)), "ocorrencias");
ok(await sb.from("dataset_meta").upsert({ id: 1, ...meta }), "meta");

const { count } = await sb.from("relatos").select("*", { count: "exact", head: true }).eq("demonstrativo", true);
if (!count) {   // dados demonstrativos (relatos/vistorias/ordens) só na primeira carga
  ok(await sb.from("relatos").insert(demo.relatos.map(({ protocolo, ...r }) => ({ ...r, protocolo }))), "relatos demo");
  const vs = ok(await sb.from("vistorias").insert(demo.vistorias).select("id"), "vistorias demo");
  ok(await sb.from("ordens_zeladoria").insert(demo.ordens.map(({ vistoria_idx, ...o }) => ({ ...o, vistoria_id: vs[vistoria_idx].id }))), "ordens demo");
  ok(await sb.from("areas").update({ status_workflow: "Ordem emitida" }).eq("id", 1), "wf");
  ok(await sb.from("areas").update({ status_workflow: "Em vistoria" }).eq("id", 3), "wf");
}
const hist = await sb.from("historico_prioridades").select("id", { head: true, count: "exact" });
if (!hist.count) ok(await sb.from("historico_prioridades").insert(areas.map(a => ({ area_id: a.id, score: a.indice, prioridade: a.indice >= 70 ? "Alta" : a.indice >= 45 ? "Média" : "Baixa", motivo: "Carga inicial SSP-SP" }))), "historico");
console.log(`OK: ${areas.length} áreas, ${oc.length} ocorrências, demonstrativo ${count ? "já existia" : "criado"}`);
