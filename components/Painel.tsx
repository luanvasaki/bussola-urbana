"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { Area, Oc, Relato } from "@/lib/types";
import { COR, PERIODO_CURTO, nomeBairro, prioridade } from "@/lib/rules";
import { Kpi } from "./ui";
export type Agora = { novos: number; ordensAbertas: number; emAndamento: number; ultimo: { protocolo: string; categoria: string; criado_em: string } | null };
const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => <div className="h-[460px] animate-pulse rounded-md bg-forest/[.06]" /> });
const EIXOS = ["Todos", "Iluminação", "Uso do espaço", "Infraestrutura"] as const;

export default function Painel({ areas, pontos, relatos, n_total, agora }: { areas: Area[]; pontos: Oc[]; relatos: Relato[]; n_total: number; agora: Agora }) {
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
        <div><h1 className="text-3xl font-semibold leading-[1.05] tracking-[-0.015em] md:text-4xl">Painel de áreas de atenção</h1><p className="mt-1 max-w-[62ch] text-sm text-forest/70">Onde as ocorrências da SSP-SP se concentram em Sorocaba, com o índice de cada área e os relatos de quem está em campo.</p></div>
        <Link href="/gestor/analise" className="btn">Metodologia e limites</Link>
      </div>
      {/* O que pede ação agora: cada número leva à lista já filtrada */}
      <nav aria-label="O que pede ação agora" className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-y-[1.5px] border-forest/25 py-3 text-sm">
        <span className="rotulo text-forest/70">Agora</span>
        <Link href={`/gestor/relatos?status=${encodeURIComponent("Relato recebido")}`} className="hover:underline"><b className="font-display text-xl tabular-nums">{agora.novos}</b> {agora.novos === 1 ? "relato novo aguardando triagem" : "relatos novos aguardando triagem"}</Link>
        <Link href="/gestor/intervencoes" className="hover:underline"><b className="font-display text-xl tabular-nums">{agora.ordensAbertas}</b> {agora.ordensAbertas === 1 ? "ordem em aberto" : "ordens em aberto"}</Link>
        <Link href="/gestor/zonas" className="hover:underline"><b className="font-display text-xl tabular-nums">{agora.emAndamento}</b> {agora.emAndamento === 1 ? "área em vistoria ou com ordem" : "áreas em vistoria ou com ordem"}</Link>
        {agora.ultimo && <Link href={`/gestor/relatos?q=${encodeURIComponent(agora.ultimo.protocolo)}`} className="text-forest/70 hover:underline">Último relato: {agora.ultimo.categoria}, {new Date(agora.ultimo.criado_em).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })}</Link>}
      </nav>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi rotulo="Ocorrências analisadas" valor={n_total.toLocaleString("pt-BR")} sub="Dados reais da SSP-SP" />
        <Kpi rotulo="Áreas de atenção" valor={areas.length} sub="Agrupadas com DBSCAN" />
        <Kpi destaque rotulo="Alta prioridade" valor={alta.length} sub="Índice ≥ 70: avaliar reforço" />
        <Kpi rotulo="Maior índice de atenção" valor={<>{max?.indice}<span className="font-display text-xl font-semibold text-forest/40">/100</span></>} sub={max ? nomeBairro(max.bairro) : "—"} />
      </div>
      <div className="grid items-start gap-4 xl:grid-cols-[1fr_380px]">
        <section className="card p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div><h2 className="text-xl font-semibold leading-tight">Mapa de calor de Sorocaba</h2><p className="text-xs text-forest/70">O calor mostra as ocorrências oficiais. Aproxime o mapa para ver cada registro e passe o mouse sobre um ponto para ver o tipo e o horário. Os quadrados escuros são relatos de campo.</p></div>
            <button type="button" aria-pressed={heat} onClick={() => setHeat(!heat)} className="btn-o px-2.5 py-1 text-xs">Calor: {heat ? "ligado" : "desligado"}</button>
          </div>
          <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1" role="group" aria-label="Filtrar relatos no mapa">
            {EIXOS.map((e) => <button key={e} type="button" aria-pressed={eixo === e} onClick={() => setEixo(e)} className={`rotulo border-b-2 py-1 ${eixo === e ? "border-forest text-forest" : "border-transparent text-forest/55 hover:text-forest"}`}>{e === "Todos" ? "Todos os relatos" : e}</button>)}
          </div>
          <MapView className="h-[460px]" areas={areas} pontos={pontos} relatos={rel} heat={heat} selectedId={sel} onSelect={setSel} />
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-red-700" /><b>Alta</b> (≥ 70)</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-600" /><b>Média</b> (45–69)</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-700" /><b>Baixa</b> (&lt; 45)</span><span><i className="mr-1 inline-block h-2 w-2 bg-forest" />Relato de campo</span><span className="text-forest/70">{areas.length} áreas no mapa</span></div>
        </section>
        <section className="card p-4">
          <div className="flex items-baseline justify-between"><div><h2 className="text-xl font-semibold leading-tight">Áreas prioritárias</h2><p className="text-xs text-forest/70">As {top.length} com maior Índice de Atenção</p></div></div>
          <ol className="mt-2">{top.map((a, i) => { const pr = prioridade(a.indice); return (
            <li key={a.id} className="border-t border-forest/15 first:border-t-0"><button type="button" aria-pressed={sel === a.id} onClick={() => setSel(a.id)} className={`flex w-full items-center gap-3 py-3 text-left ${sel === a.id ? "border-l-4 border-forest pl-3" : "hover:bg-mint-100/60"}`}>
              <span className="w-6 shrink-0 font-display text-2xl font-bold text-forest/35">{i + 1}</span>
              <span className="min-w-0 flex-1"><span className="block font-semibold">{nomeBairro(a.bairro)}</span><span className="block text-xs text-forest/70">Pico {(PERIODO_CURTO[a.periodo_pico] ?? a.periodo_pico).toLowerCase()} · {a.n.toLocaleString("pt-BR")} ocorrências</span></span>
              <span className="text-right"><span className="block font-display text-3xl font-bold leading-none tabular-nums" style={{ color: pr === "Média" ? "#92400e" : COR[pr] }}>{a.indice}</span><span className="rotulo text-[10px] text-forest/60">{pr}</span></span></button>
              {sel === a.id && <Link href={`/gestor/zonas/${a.id}`} className="btn mb-3 w-full">Abrir {nomeBairro(a.bairro)}</Link>}</li>); })}</ol>
          <Link href="/gestor/zonas" className="btn-o mt-3 w-full">Ver todas as {areas.length} áreas</Link>
        </section>
      </div>
    </div>
  );
}
