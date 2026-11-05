"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { Area, Oc, Relato } from "@/lib/types";
import { PERIODO_CURTO, nomeBairro, prioridade } from "@/lib/rules";
import { Badge, Barra, Kpi } from "./ui";
const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => <div className="h-[460px] animate-pulse rounded-md bg-mint-100" /> });
const EIXOS = ["Todos", "Iluminação", "Uso do espaço", "Infraestrutura"] as const;

export default function Painel({ areas, pontos, relatos, n_total }: { areas: Area[]; pontos: Oc[]; relatos: Relato[]; n_total: number }) {
  const [sel, setSel] = useState<number | null>(null);
  const [eixo, setEixo] = useState<(typeof EIXOS)[number]>("Todos");
  const [heat, setHeat] = useState(true);
  const top = areas.slice(0, 6);
  const alta = areas.filter((a) => a.indice >= 70);
  const rel = useMemo(() => relatos.filter((r) => eixo === "Todos" || r.eixo === eixo), [relatos, eixo]);
  const max = areas[0];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-bold md:text-3xl">Painel de áreas de atenção</h1><p className="mt-1 max-w-[62ch] text-sm text-forest/70">Onde as ocorrências da SSP-SP se concentram em Sorocaba, com o índice de cada área e os relatos de quem está em campo.</p></div>
        <Link href="/gestor/analise" className="btn">Metodologia e limites</Link>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi rotulo="Ocorrências analisadas" valor={n_total.toLocaleString("pt-BR")} sub="Dados reais da SSP-SP" />
        <Kpi rotulo="Áreas de atenção" valor={areas.length} sub="Agrupadas com DBSCAN" />
        <Kpi destaque rotulo="Alta prioridade" valor={alta.length} sub="Índice ≥ 70: avaliar reforço" />
        <Kpi rotulo="Maior índice de atenção" valor={<>{max?.indice}<span className="text-sm font-normal text-forest/60"> / 100</span></>} sub={max ? nomeBairro(max.bairro) : "—"} />
      </div>
      <div className="grid items-start gap-4 xl:grid-cols-[1fr_380px]">
        <section className="card p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div><h2 className="text-lg font-bold">Mapa de calor de Sorocaba</h2><p className="text-xs text-forest/70">O calor mostra as ocorrências oficiais. Os quadrados azuis são relatos de campo.</p></div>
            <div className="flex flex-wrap gap-1 rounded-md bg-mint p-1 text-xs" role="group" aria-label="Filtrar relatos no mapa">
              {EIXOS.map((e) => <button key={e} type="button" aria-pressed={eixo === e} onClick={() => setEixo(e)} className={`rounded-lg px-3 py-1.5 font-semibold ${eixo === e ? "bg-forest text-white" : "text-forest/70"}`}>{e}</button>)}
              <button type="button" aria-pressed={heat} onClick={() => setHeat(!heat)} className={`rounded-lg px-3 py-1.5 font-semibold ${heat ? "bg-forest-600 text-white" : "text-forest/70"}`}>Mapa de calor</button>
            </div>
          </div>
          <MapView className="h-[460px]" areas={areas} pontos={pontos} relatos={rel} heat={heat} selectedId={sel} onSelect={setSel} />
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-red-700" /><b>Alta</b> (≥ 70)</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-600" /><b>Média</b> (45–69)</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-700" /><b>Baixa</b> (&lt; 45)</span><span className="text-forest/70">{areas.length} áreas no mapa</span></div>
        </section>
        <section className="card p-4">
          <div className="flex items-baseline justify-between"><div><h2 className="text-lg font-bold">Áreas prioritárias</h2><p className="text-xs text-forest/70">As {top.length} com maior Índice de Atenção</p></div></div>
          <ol className="mt-3 space-y-3">{top.map((a, i) => (
            <li key={a.id}><button type="button" aria-pressed={sel === a.id} onClick={() => setSel(a.id)} className={`w-full rounded-md p-3 text-left ring-1 ring-black/5 ${sel === a.id ? "bg-mint-100" : "bg-mint/60 hover:bg-mint-100"}`}>
              <div className="flex items-start justify-between gap-2"><span className="font-semibold"><span className="mr-2 inline-grid h-5 w-5 place-items-center rounded-full bg-forest text-[11px] text-white">{i + 1}</span>{nomeBairro(a.bairro)}</span><Badge p={prioridade(a.indice)} /></div>
              <div className="mt-2 flex justify-between text-xs text-forest/70"><span>Pico: {PERIODO_CURTO[a.periodo_pico] ?? a.periodo_pico}</span><span>{a.n} ocorrências</span></div>
              <div className="mt-1.5 flex items-center gap-2"><Barra valor={a.indice} /><b className="text-xs">{a.indice}</b></div></button></li>))}</ol>
          {sel && <Link href={`/gestor/zonas/${sel}`} className="btn mt-3 w-full">Abrir a área selecionada</Link>}
          <Link href="/gestor/zonas" className="mt-3 flex items-center justify-center rounded-md bg-mint px-3 py-3 text-sm font-semibold hover:bg-mint-100">Ver todas as {areas.length} áreas</Link>
        </section>
      </div>
    </div>
  );
}
