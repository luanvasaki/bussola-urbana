import { getGestor, getPublico, podeEscrever } from "@/lib/db";
import Forms from "@/components/IntervencoesForms";
import { Aviso, data } from "@/components/ui";
import { SalvarOrdem } from "@/components/SalvarOrdem";
export const metadata = { title: "Intervenções" };
import { atualizarOrdem } from "@/app/actions";
import { nomeBairro } from "@/lib/rules";
export default async function Page() {
  const [p, g] = await Promise.all([getPublico(), getGestor()]);
  const esc = podeEscrever() && g.origem === "supabase"; // nunca editar dados de exemplo
  return <div className="space-y-4"><h1 className="text-2xl font-bold">Intervenções</h1><p className="text-sm text-forest/70">Vistorias em campo e ordens de zeladoria ligadas às áreas de atenção.</p>
    {g.origem === "exemplo" && <Aviso>O banco não respondeu agora. A página mostra dados de exemplo e a edição está desligada. Recarregue em instantes.</Aviso>}
    {!podeEscrever() && <Aviso>Modo demonstração: configure o Supabase para registrar vistorias e ordens.</Aviso>}
    {esc && <Forms areas={p.areas} vistorias={g.vistorias} />}
    <section className="card p-4"><h2 className="font-bold">Vistorias</h2><ul className="mt-2 divide-y divide-black/5 text-sm">{g.vistorias.map((v) => { const a = p.areas.find((x) => x.id === v.area_id); return <li key={v.id} className="py-2"><b>{v.problema}</b> <span className="text-forest/70">: {a ? nomeBairro(a.bairro) : ""}, {v.fiscal}, {data(v.criado_em)}</span>{v.observacoes && <div className="text-xs">{v.observacoes}</div>}</li>; })}{g.vistorias.length === 0 && <li className="py-2 text-forest/70">Nenhuma vistoria.</li>}</ul></section>
    <section className="card p-4"><h2 className="font-bold">Ordens de zeladoria</h2><ul className="mt-2 divide-y divide-black/5 text-sm">{g.ordens.map((o) => <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-2"><span><b>{o.tipo_servico}</b> <span className="text-forest/70">: {o.secretaria}, vistoria {o.vistoria_id}</span></span>
      {esc ? <form key={`${o.id}-${o.status}`} action={atualizarOrdem} className="flex gap-1"><input type="hidden" name="id" value={o.id} /><select name="status" aria-label={`Status da ordem ${o.tipo_servico}`} defaultValue={o.status} className="rounded-md bg-mint px-1 py-1 text-xs font-semibold"><option>Pendente</option><option>Em andamento</option><option>Concluída</option></select><SalvarOrdem /></form> : <span className="rounded-md bg-mint px-2 py-1 text-xs font-semibold">{o.status}</span>}</li>)}{g.ordens.length === 0 && <li className="py-2 text-forest/70">Nenhuma ordem.</li>}</ul></section></div>;
}
