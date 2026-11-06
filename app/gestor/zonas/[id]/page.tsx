import Link from "next/link";
import { notFound } from "next/navigation";
import { getGestor, getPublico, podeEscrever } from "@/lib/db";
import { Situacao } from "@/components/SalvarOrdem";
import { Badge, Barra, data } from "@/components/ui";
import { FAIXA, WORKFLOW, encaminhamentos, nomeBairro, prioridade, recomendacao, rotuloPeriodo } from "@/lib/rules";
import MapaZona from "@/components/MapaZona";
export default async function Zona({ params }: { params: { id: string } }) {
  const [p, g] = await Promise.all([getPublico(), getGestor()]);
  const a = p.areas.find((x) => x.id === Number(params.id));
  if (!a) notFound();
  const pts = p.ocorrencias.filter((o) => o.area_id === a.id);
  const porPeriodo = ["De madrugada", "Pela manhã", "A tarde", "A noite", "Em hora incerta"].map((k) => [k, pts.filter((o) => o.periodo === k).length] as const);
  const relatos = g.relatos.filter((r) => r.area_id === a.id);
  const vist = g.vistorias.filter((v) => v.area_id === a.id);
  const ordens = g.ordens.filter((o) => vist.some((v) => v.id === o.vistoria_id));
  const hist = g.historico.filter((h) => h.area_id === a.id);
  const enc = encaminhamentos(a);
  const esc = podeEscrever() && g.origem === "supabase";
  const wf = WORKFLOW.indexOf((a.status_workflow ?? "Aguardando triagem") as (typeof WORKFLOW)[number]);
  return <div className="space-y-4">
    <Link href="/gestor/zonas" className="text-sm font-semibold text-forest/80 hover:underline">← Áreas de atenção</Link>
    <div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-semibold leading-[1.05] tracking-[-0.015em] md:text-4xl">{nomeBairro(a.bairro)}</h1><Badge p={prioridade(a.indice)} /></div>
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <section className="card p-4"><MapaZona area={a} pontos={pts} relatos={relatos} /></section>
        <section className="card p-4"><h2 className="text-xl font-semibold leading-tight">Fluxo de trabalho</h2>
          <ol className="mt-3 grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4">{WORKFLOW.map((w, i) => <li key={w} aria-current={i === wf ? "step" : undefined} className={`border-t-4 pt-2 ${i <= wf ? "border-forest text-forest" : "border-forest/15 text-forest/45"}`}>
            <span className="font-display text-lg font-bold leading-none">{i < wf || (i === wf && i === WORKFLOW.length - 1) ? "✓" : i + 1}</span>
            <span className={`rotulo mt-1 block text-[11px] ${i === wf ? "" : "font-medium"}`}>{w}</span>{i === wf && i < WORKFLOW.length - 1 && <span className="text-xs">Etapa atual</span>}</li>)}</ol>
          <p className="mt-3 text-xs text-forest/70">Avança sozinho: registrar uma vistoria, emitir uma ordem, concluir todas as ordens. Os relatos de campo da área acompanham cada passo.</p></section>
        <section className="card p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-semibold leading-tight">Vistorias e ordens de zeladoria</h2>
            {esc && <Link href={`/gestor/intervencoes?area=${a.id}#nova-vistoria`} className="btn-o px-3 py-1.5 text-xs">Registrar vistoria nesta área</Link>}</div>
          {vist.length === 0 ? <p className="mt-2 text-sm text-forest/70">Nenhuma vistoria ainda.</p> :
            <ul className="mt-2 divide-y divide-forest/10 text-sm">{vist.map((v) => <li key={v.id} className="py-3"><div className="font-semibold">{v.problema}</div><div className="text-xs text-forest/70">{v.fiscal} · {data(v.criado_em)}</div>{v.observacoes && <p className="mt-1">{v.observacoes}</p>}
              {ordens.filter((o) => o.vistoria_id === v.id).map((o) => <div key={o.id} className="mt-2 flex flex-wrap items-start justify-between gap-2 border-l-2 border-forest/25 pl-3 text-xs"><div><span className="rotulo text-[11px] text-forest/60">Ordem</span><div><b>{o.tipo_servico}</b> · {o.secretaria}</div></div>
                {esc ? <Situacao tipo="ordem" id={o.id} atual={o.status} opcoes={["Pendente", "Em andamento", "Concluída"]} rotulo={`Situação da ordem ${o.tipo_servico}`} /> : <b>{o.status}</b>}</div>)}
              {esc && <Link href={`/gestor/intervencoes?area=${a.id}`} className="mt-2 inline-block text-xs font-semibold underline decoration-forest/30 underline-offset-4">Emitir ordem para esta vistoria</Link>}</li>)}</ul>}</section>
        {hist.length > 0 && <section className="card p-4"><h2 className="text-xl font-semibold leading-tight">Histórico de prioridade</h2><ul className="mt-2 space-y-1 text-sm">{hist.map((h) => <li key={h.id}>{data(h.criado_em)}: índice {h.score} ({h.prioridade}). {h.motivo}</li>)}</ul></section>}
      </div>
      <div className="space-y-4">
        <section className="card space-y-3 p-4 text-sm"><h2 className="rotulo font-sans text-forest/70">Índice de Atenção</h2><div className="font-display text-7xl font-bold leading-[0.85] tracking-[-0.03em]">{a.indice}<span className="ml-1 text-2xl font-semibold text-forest/50">/100</span></div>
          <div><div className="mb-1 flex justify-between text-xs"><span>Volume (percentil)</span><b>{a.score_volume}/50</b></div><Barra valor={a.score_volume} max={50} /></div>
          <div><div className="mb-1 flex justify-between text-xs"><span>Concentração no período de pico</span><b>{a.score_temporal}/50</b></div><Barra valor={a.score_temporal} max={50} /></div>
          <p className="text-xs text-forest/70">Índice = média ponderada 50/50 dos percentis. Calculado apenas com dado oficial (SSP-SP). Relato de campo não entra no cálculo.</p></section>
        <section className="card space-y-1 p-4 text-sm"><h2 className="text-xl font-semibold leading-tight">Composição</h2>
          <div>{a.n} ocorrências · Furto {a.furto} · Roubo {a.roubo} · Tráfico {a.trafico}</div>
          <div>Pico: {rotuloPeriodo(a.periodo_pico)} ({FAIXA[a.periodo_pico] ?? "—"}), {a.concentracao_pico}% dos casos com horário</div>
          <div>Ambiente predominante: {a.ambiente_top ?? "—"} · Envolvem veículo: {a.pct_veiculo}%</div>
          <div className="pt-2 text-xs font-semibold text-forest/80">Por período do dia</div>
          {porPeriodo.map(([k, n]) => <div key={k} className="flex items-center gap-2 text-xs"><span className="w-28">{rotuloPeriodo(k)}</span><div className="h-1.5 flex-1 rounded-full bg-black/10"><div className="h-full rounded-full bg-forest-600" style={{ width: `${pts.length ? (n / pts.length) * 100 : 0}%` }} /></div><span className="w-8 text-right">{n}</span></div>)}</section>
        <section className="card space-y-2 p-4 text-sm"><h2 className="text-xl font-semibold leading-tight">Recomendação (regra transparente)</h2><p>{recomendacao(a)}</p>
          {enc.length > 0 && <><div className="text-xs font-semibold text-forest/80">Encaminhamento sugerido</div><ul className="list-disc pl-5">{enc.map((e) => <li key={e}>{e}</li>)}</ul></>}
          <p className="text-xs text-forest/70">Apoio à decisão: não prevê crime e não substitui análise operacional.</p></section>
        <section className="card p-4 text-sm"><h2 className="text-xl font-semibold leading-tight">Relatos de campo na região ({relatos.length})</h2>
          {relatos.length === 0 ? <p className="mt-2 text-xs text-forest/70">Nenhum relato dentro desta área.</p> : <ul className="mt-2 space-y-1">{relatos.slice(0, 6).map((r) => <li key={r.protocolo} className="text-xs"><b>{r.categoria}</b> · {r.status} <span className="text-forest/70">({r.protocolo})</span></li>)}</ul>}
          {relatos.length > 0 && <Link href={`/gestor/relatos?area=${a.id}`} className="mt-2 inline-block text-xs font-semibold underline decoration-forest/30 underline-offset-4">Ver {relatos.length === 1 ? "o relato" : `os ${relatos.length} relatos`} na lista</Link>}</section>
      </div>
    </div></div>;
}
