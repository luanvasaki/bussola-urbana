import Link from "next/link";
import { getPublico } from "@/lib/db";
import { Badge } from "@/components/ui";
import { FAIXA, nomeBairro, prioridade } from "@/lib/rules";
export default async function Zonas() {
  const { areas } = await getPublico();
  return <div className="space-y-4"><h1 className="text-2xl font-bold">Zonas Vulneráveis</h1>
    <p className="text-sm text-forest/70">Todas as áreas de atenção identificadas, ordenadas por Índice de Atenção.</p>
    <div className="card overflow-x-auto"><table className="w-full text-sm"><thead className="bg-mint text-left text-[11px] uppercase tracking-wide text-forest/60"><tr>
      {["#", "Área (bairro predominante)", "Índice", "Prioridade", "Ocorrências", "Período de pico", "Fluxo"].map((h) => <th key={h} className="px-3 py-2.5">{h}</th>)}</tr></thead>
      <tbody>{areas.map((a) => <tr key={a.id} className="border-t border-black/5 hover:bg-mint/50">
        <td className="px-3 py-2.5">{a.id}</td><td className="px-3 py-2.5 font-semibold"><Link href={`/gestor/zonas/${a.id}`} className="underline-offset-2 hover:underline">{nomeBairro(a.bairro)}</Link></td>
        <td className="px-3 py-2.5 font-bold">{a.indice}</td><td className="px-3 py-2.5"><Badge p={prioridade(a.indice)} /></td><td className="px-3 py-2.5">{a.n}</td>
        <td className="px-3 py-2.5">{a.periodo_pico} <span className="text-forest/50">({FAIXA[a.periodo_pico] ?? "—"})</span></td><td className="px-3 py-2.5 text-xs">{a.status_workflow ?? "Aguardando triagem"}</td></tr>)}</tbody></table></div></div>;
}
