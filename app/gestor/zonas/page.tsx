import Link from "next/link";
import { getPublico } from "@/lib/db";
import { Badge, TOM } from "@/components/ui";
import { FAIXA, nomeBairro, prioridade, rotuloPeriodo } from "@/lib/rules";
export default async function Zonas() {
  const { areas } = await getPublico();
  return <div className="space-y-4"><h1 className="text-3xl font-semibold leading-[1.05] tracking-[-0.015em] md:text-4xl">Áreas de atenção</h1>
    <p className="text-sm text-forest/70">Todas as áreas identificadas, ordenadas pelo Índice de Atenção. Toque no nome para ver o detalhe.</p>
    <div className="card overflow-x-auto"><table className="w-full text-sm"><thead className="rotulo border-b-[1.5px] border-forest/25 text-left text-forest/70"><tr>
      {["#", "Área (bairro predominante)", "Índice", "Prioridade", "Ocorrências", "Período de pico", "Fluxo"].map((h) => <th key={h} className={`px-3 py-2.5 font-semibold ${h === "Índice" || h === "Ocorrências" ? "text-right" : ""}`}>{h}</th>)}</tr></thead>
      <tbody>{areas.map((a) => <tr key={a.id} className="border-t border-forest/10 hover:bg-mint-100/60">
        <td className="px-3 py-2.5 tabular-nums text-forest/45">{a.id}</td><td className="px-3 py-2.5 font-semibold"><Link href={`/gestor/zonas/${a.id}`} className="underline-offset-2 hover:underline">{nomeBairro(a.bairro)}</Link></td>
        <td className="px-3 py-2 text-right font-display text-xl font-bold tabular-nums" style={{ color: TOM[prioridade(a.indice)] }}>{a.indice}</td><td className="px-3 py-2.5"><Badge p={prioridade(a.indice)} curto /></td><td className="px-3 py-2.5 text-right tabular-nums">{a.n.toLocaleString("pt-BR")}</td>
        <td className="px-3 py-2.5">{rotuloPeriodo(a.periodo_pico)} <span className="text-forest/70">({FAIXA[a.periodo_pico] ?? "—"})</span></td><td className="rotulo px-3 py-2.5 text-[11px] text-forest/70">{a.status_workflow ?? "Aguardando triagem"}</td></tr>)}</tbody></table></div></div>;
}
