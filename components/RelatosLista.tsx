"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Relato } from "@/lib/types";
import { ETAPAS, CATEGORIAS, nomeBairro } from "@/lib/rules";
import { data } from "./ui";
import { Situacao } from "./SalvarOrdem";
export type AreaResumo = { id: number; nome: string; indice: number };

export default function RelatosLista({ relatos, escrita, areas, inicial }: { relatos: Relato[]; escrita: boolean; areas: AreaResumo[]; inicial: { q?: string; status?: string; area?: string } }) {
  const [q, setQ] = useState(inicial.q ?? ""), [tipo, setTipo] = useState(""), [sev, setSev] = useState("");
  const [status, setStatus] = useState(inicial.status ?? ""), [area, setArea] = useState(inicial.area ?? "");
  const porId = useMemo(() => new Map(areas.map((a) => [a.id, a])), [areas]);
  const comRelato = useMemo(() => areas.filter((a) => relatos.some((r) => r.area_id === a.id)), [areas, relatos]);
  const L = useMemo(() => relatos.filter((r) => (!tipo || r.categoria === tipo) && (!sev || r.severidade === sev) && (!status || r.status === status) && (!area || String(r.area_id) === area)
    && (!q || `${r.categoria} ${r.rua ?? ""} ${r.bairro ?? ""} ${r.descricao ?? ""} ${r.protocolo}`.toLowerCase().includes(q.toLowerCase()))), [relatos, q, tipo, sev, status, area]);
  const contagem = (e: string) => relatos.filter((r) => r.status === e).length;
  const destaque = (inicial.q ?? "").toUpperCase();
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por situação">
      {["", ...ETAPAS].map((e) => <button key={e || "todas"} type="button" aria-pressed={status === e} onClick={() => setStatus(e)}
        className={`rounded-md border-[1.5px] px-2.5 py-1.5 text-xs font-semibold ${status === e ? "border-forest bg-forest text-white" : "border-forest/25 text-forest hover:border-forest/60"}`}>
        {e || "Todas as situações"} <span className="tabular-nums opacity-70">{e ? contagem(e) : relatos.length}</span></button>)}
    </div>
    <div className="grid gap-2 sm:grid-cols-[1fr_200px_180px_220px]">
      <input className="inp" aria-label="Buscar relatos" placeholder="Buscar rua, bairro, descrição ou protocolo" value={q} onChange={(e) => setQ(e.target.value)} />
      <select className="inp" aria-label="Filtrar por tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}><option value="">Todos os tipos</option>{CATEGORIAS.map((c) => <option key={c.nome}>{c.nome}</option>)}</select>
      <select className="inp" aria-label="Filtrar por severidade" value={sev} onChange={(e) => setSev(e.target.value)}><option value="">Todas as severidades</option><option>Alta</option><option>Média</option><option>Baixa</option></select>
      <select className="inp" aria-label="Filtrar por área de atenção" value={area} onChange={(e) => setArea(e.target.value)}><option value="">Todas as áreas</option>{comRelato.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}</select></div>
    <p className="text-xs text-forest/70" aria-live="polite">{L.length} de {relatos.length} relatos</p>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{L.map((r) => { const a = r.area_id ? porId.get(r.area_id) : undefined; return <article key={r.protocolo} className={`card p-4 ${destaque && r.protocolo === destaque ? "border-forest ring-2 ring-forest" : ""}`}>
      <div className="flex items-start justify-between gap-2"><h2 className="font-sans text-base font-semibold">{r.categoria}</h2><span className="rotulo shrink-0 text-[11px] text-forest/70">Severidade {r.severidade.toLowerCase()}</span></div>
      <div className="mt-1 text-sm text-forest/80">{[r.rua, r.bairro && nomeBairro(r.bairro)].filter(Boolean).join(", ") || `${r.lat.toFixed(4)}, ${r.lon.toFixed(4)}`}</div>
      <div className="mt-0.5 text-xs text-forest/70">{r.protocolo}{r.demonstrativo ? ", de exemplo" : ""}</div>
      <p className="mt-2 text-sm">{r.descricao ?? "Sem descrição."}</p>
      <p className="mt-2 text-xs">{a ? <Link href={`/gestor/zonas/${a.id}`} className="font-semibold underline decoration-forest/30 underline-offset-4 hover:decoration-forest">Área de atenção: {a.nome}, índice {a.indice}</Link> : <span className="text-forest/70">Fora das áreas de atenção</span>}</p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-forest/10 pt-2 text-xs"><span className="text-forest/70">{data(r.criado_em)}</span>
        {escrita ? <Situacao tipo="relato" id={r.id ?? 0} atual={r.status} opcoes={ETAPAS} rotulo={`Situação do relato ${r.protocolo}`} />
          : <span className="rounded-md border border-forest/25 px-2 py-1 font-semibold">{r.status}</span>}</div></article>; })}
      {L.length === 0 && <p className="text-sm text-forest/70">Nenhum relato com esses filtros.</p>}</div></div>;
}
