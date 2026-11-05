import Link from "next/link";
import { notFound } from "next/navigation";
import { getGestor, getPublico } from "@/lib/db";
import { Badge, Barra, data } from "@/components/ui";
import { FAIXA, WORKFLOW, encaminhamentos, nomeBairro, prioridade, recomendacao } from "@/lib/rules";
import MapaZona from "@/components/MapaZona";
export default async function Zona({ params }: { params: { id: string } }) {
  const [p, g] = await Promise.all([getPublico(), getGestor()]);
  const a = p.areas.find((x) => x.id === Number(params.id));
  if (!a) notFound();
  const pts = p.ocorrencias.filter((o) => o.area_id === a.id);
  const porPeriodo = ["De madrugada", "Pela manhã", "A tarde", "A noite", "Em hora incerta"].map((k) => [k, pts.filter((o) => o.periodo === k).length] as const);
  const relatos = g.relatos.filter((r) => r.area_id === a.id || (r.bairro && r.bairro === a.bairro));
  const vist = g.vistorias.filter((v) => v.area_id === a.id);
  const ordens = g.ordens.filter((o) => vist.some((v) => v.id === o.vistoria_id));
  const hist = g.historico.filter((h) => h.area_id === a.id);
  const enc = encaminhamentos(a);
  const wf = WORKFLOW.indexOf((a.status_workflow ?? "Aguardando triagem") as (typeof WORKFLOW)[number]);
  return <div className="space-y-4">
    <Link href="/gestor/zonas" className="text-sm text-forest/70">← Zonas vulneráveis</Link>
    <div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-bold">{nomeBairro(a.bairro)}</h1><Badge p={prioridade(a.indice)} /><span className="rounded-md bg-forest px-2 py-1 text-sm font-bold text-white">Índice {a.indice}</span></div>
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <section className="card p-4"><MapaZona area={a} pontos={pts} relatos={relatos} /></section>
        <section className="card p-4"><h2 className="font-bold">Fluxo de trabalho</h2>
          <ol className="mt-3 grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">{WORKFLOW.map((w, i) => <li key={w} className={`rounded-xl px-2 py-2 font-semibold ${i <= wf ? "bg-forest text-white" : "bg-mint text-forest/60"}`}>{w}</li>)}</ol></section>
        <section className="card p-4"><h2 className="font-bold">Vistorias e ordens de zeladoria</h2>
          {vist.length === 0 ? <p className="mt-2 text-sm text-forest/60">Nenhuma vistoria ainda. <Link className="underline" href="/gestor/intervencoes">Registrar em Intervenções</Link>.</p> :
            <ul className="mt-2 space-y-3 text-sm">{vist.map((v) => <li key={v.id} className="rounded-xl bg-mint/60 p-3"><div className="font-semibold">{v.problema}</div><div className="text-xs text-forest/60">{v.fiscal} · {data(v.criado_em)}</div>{v.observacoes && <p className="mt-1">{v.observacoes}</p>}
              {ordens.filter((o) => o.vistoria_id === v.id).map((o) => <div key={o.id} className="mt-2 text-xs">Ordem: <b>{o.tipo_servico}</b> — {o.secretaria} — <b>{o.status}</b></div>)}</li>)}</ul>}</section>
        {hist.length > 0 && <section className="card p-4"><h2 className="font-bold">Histórico de prioridade</h2><ul className="mt-2 space-y-1 text-sm">{hist.map((h) => <li key={h.id}>{data(h.criado_em)} — score {h.score} ({h.prioridade}) · {h.motivo}</li>)}</ul></section>}
      </div>
      <div className="space-y-4">
        <section className="card space-y-3 p-4 text-sm"><h2 className="font-bold">Índice de Atenção</h2>
          <div><div className="mb-1 flex justify-between text-xs"><span>Volume (percentil)</span><b>{a.score_volume}/50</b></div><Barra valor={a.score_volume} max={50} /></div>
          <div><div className="mb-1 flex justify-between text-xs"><span>Concentração no período de pico</span><b>{a.score_temporal}/50</b></div><Barra valor={a.score_temporal} max={50} /></div>
          <p className="text-xs text-forest/60">Índice = média ponderada 50/50 dos percentis. Calculado apenas com dado oficial (SSP-SP). Relato de campo não entra no cálculo.</p></section>
        <section className="card space-y-1 p-4 text-sm"><h2 className="font-bold">Composição</h2>
          <div>{a.n} ocorrências · Furto {a.furto} · Roubo {a.roubo} · Tráfico {a.trafico}</div>
          <div>Pico: {a.periodo_pico} ({FAIXA[a.periodo_pico] ?? "—"}), {a.concentracao_pico}% dos casos com horário</div>
          <div>Ambiente predominante: {a.ambiente_top ?? "—"} · Envolvem veículo: {a.pct_veiculo}%</div>
          <div className="pt-2 text-xs font-semibold uppercase text-forest/60">Por período do dia</div>
          {porPeriodo.map(([k, n]) => <div key={k} className="flex items-center gap-2 text-xs"><span className="w-28">{k}</span><div className="h-1.5 flex-1 rounded-full bg-black/10"><div className="h-full rounded-full bg-forest-600" style={{ width: `${pts.length ? (n / pts.length) * 100 : 0}%` }} /></div><span className="w-8 text-right">{n}</span></div>)}</section>
        <section className="card space-y-2 p-4 text-sm"><h2 className="font-bold">Recomendação (regra transparente)</h2><p>{recomendacao(a)}</p>
          {enc.length > 0 && <><div className="text-xs font-semibold uppercase text-forest/60">Encaminhamento sugerido</div><ul className="list-disc pl-5">{enc.map((e) => <li key={e}>{e}</li>)}</ul></>}
          <p className="text-xs text-forest/60">Apoio à decisão: não prevê crime e não substitui análise operacional.</p></section>
        <section className="card p-4 text-sm"><h2 className="font-bold">Relatos de campo na região ({relatos.length})</h2>
          <ul className="mt-2 space-y-1">{relatos.slice(0, 6).map((r) => <li key={r.protocolo} className="text-xs"><b>{r.categoria}</b> · {r.status} <span className="text-forest/50">({r.protocolo})</span></li>)}</ul></section>
      </div>
    </div></div>;
}
