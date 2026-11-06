import { getGestor, getPublico, podeEscrever } from "@/lib/db";
import Forms from "@/components/IntervencoesForms";
import { Aviso, data } from "@/components/ui";
import { Situacao } from "@/components/SalvarOrdem";
import Link from "next/link";
export const metadata = { title: "Intervenções" };
import { nomeBairro } from "@/lib/rules";
export default async function Page({ searchParams }: { searchParams: { area?: string } }) {
  const [p, g] = await Promise.all([getPublico(), getGestor()]);
  const esc = podeEscrever() && g.origem === "supabase"; // nunca editar dados de exemplo
  return <div className="space-y-4"><h1 className="text-3xl font-semibold leading-[1.05] tracking-[-0.015em] md:text-4xl">Intervenções</h1><p className="text-sm text-forest/70">Vistorias em campo e ordens de zeladoria ligadas às áreas de atenção.</p>
    {g.origem === "exemplo" && <Aviso>O banco não respondeu agora. A página mostra dados de exemplo e a edição está desligada. Recarregue em instantes.</Aviso>}
    {!podeEscrever() && <Aviso>Modo demonstração: configure o Supabase para registrar vistorias e ordens.</Aviso>}
    {esc && <Forms areas={p.areas} vistorias={g.vistorias} areaInicial={Number(searchParams.area) || undefined} />}
    <section className="card p-4"><h2 className="text-xl font-semibold leading-tight">Vistorias</h2><ul className="mt-2 divide-y divide-forest/10 text-sm">{g.vistorias.map((v) => { const a = p.areas.find((x) => x.id === v.area_id); return <li key={v.id} className="py-2.5"><b>{v.problema}</b><div className="text-xs text-forest/70">{a && <><Link href={`/gestor/zonas/${a.id}`} className="font-semibold text-forest underline decoration-forest/30 underline-offset-4">{nomeBairro(a.bairro)}</Link> · </>}{v.fiscal} · {data(v.criado_em)}</div>{v.observacoes && <div className="mt-1 text-xs">{v.observacoes}</div>}</li>; })}{g.vistorias.length === 0 && <li className="py-2 text-forest/70">Nenhuma vistoria.</li>}</ul></section>
    <section className="card p-4"><h2 className="text-xl font-semibold leading-tight">Ordens de zeladoria</h2><ul className="mt-2 divide-y divide-forest/10 text-sm">{g.ordens.map((o) => { const v = g.vistorias.find((x) => x.id === o.vistoria_id); const a = v && p.areas.find((x) => x.id === v.area_id); return <li key={o.id} className="flex flex-wrap items-start justify-between gap-2 py-2.5"><div><b>{o.tipo_servico}</b><div className="text-xs text-forest/70">{a && <><Link href={`/gestor/zonas/${a.id}`} className="font-semibold text-forest underline decoration-forest/30 underline-offset-4">{nomeBairro(a.bairro)}</Link> · </>}{o.secretaria} · {data(o.criado_em)}</div></div>
      {esc ? <Situacao tipo="ordem" id={o.id} atual={o.status} opcoes={["Pendente", "Em andamento", "Concluída"]} rotulo={`Situação da ordem ${o.tipo_servico}`} /> : <span className="rounded-md border border-forest/25 px-2 py-1 text-xs font-semibold">{o.status}</span>}</li>; })}{g.ordens.length === 0 && <li className="py-2 text-forest/70">Nenhuma ordem.</li>}</ul></section></div>;
}
