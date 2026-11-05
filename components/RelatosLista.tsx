"use client";
import { useMemo, useState } from "react";
import type { Relato } from "@/lib/types";
import { ETAPAS, CATEGORIAS, nomeBairro } from "@/lib/rules";
import { data } from "./ui";
import { atualizarRelato } from "@/app/actions";
const SEV = { Alta: "bg-orange-100 text-orange-800", Média: "bg-amber-100 text-amber-800", Baixa: "bg-emerald-50 text-emerald-800" };
export default function RelatosLista({ relatos, escrita }: { relatos: Relato[]; escrita: boolean }) {
  const [q, setQ] = useState(""), [tipo, setTipo] = useState(""), [sev, setSev] = useState("");
  const L = useMemo(() => relatos.filter((r) => (!tipo || r.categoria === tipo) && (!sev || r.severidade === sev) && (!q || `${r.categoria} ${r.rua ?? ""} ${r.bairro ?? ""} ${r.descricao ?? ""} ${r.protocolo}`.toLowerCase().includes(q.toLowerCase()))), [relatos, q, tipo, sev]);
  return <div className="space-y-4">
    <div className="grid gap-2 sm:grid-cols-[1fr_200px_160px]"><input className="inp" placeholder="Buscar local, descrição ou protocolo…" value={q} onChange={(e) => setQ(e.target.value)} />
      <select className="inp" value={tipo} onChange={(e) => setTipo(e.target.value)}><option value="">Todos os tipos</option>{CATEGORIAS.map((c) => <option key={c.nome}>{c.nome}</option>)}</select>
      <select className="inp" value={sev} onChange={(e) => setSev(e.target.value)}><option value="">Severidade</option><option>Alta</option><option>Média</option><option>Baixa</option></select></div>
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{L.map((r) => <article key={r.protocolo} className="card p-4">
      <div className="flex items-center justify-between"><span className="font-semibold">● {r.categoria}</span><span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${SEV[r.severidade]}`}>{r.severidade}</span></div>
      <div className="mt-2 text-xs text-forest/60">{r.protocolo}{r.demonstrativo ? " · demonstrativo" : ""} · {[r.rua, r.bairro && nomeBairro(r.bairro)].filter(Boolean).join(", ") || `${r.lat.toFixed(4)}, ${r.lon.toFixed(4)}`}</div>
      <p className="mt-2 text-sm">{r.descricao ?? "Sem descrição."}</p>
      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-2 text-xs"><span className="text-forest/60">{data(r.criado_em)}</span>
        {escrita ? <form action={atualizarRelato} className="flex gap-1"><input type="hidden" name="id" value={r.id} /><select name="status" defaultValue={r.status} className="rounded-md bg-mint px-1 py-1 font-semibold">{ETAPAS.map((e) => <option key={e}>{e}</option>)}</select><button className="rounded-md bg-forest px-2 text-white">OK</button></form>
          : <span className="rounded-md bg-mint px-2 py-1 font-semibold">{r.status}</span>}</div></article>)}
      {L.length === 0 && <p className="text-sm text-forest/60">Nenhum relato com esses filtros.</p>}</div></div>;
}
