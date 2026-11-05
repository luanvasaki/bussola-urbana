import { getGestor, podeEscrever } from "@/lib/db";
import RelatosLista from "@/components/RelatosLista";
import { Aviso } from "@/components/ui";
export default async function Page() {
  const g = await getGestor();
  return <div className="space-y-4"><div><div className="text-[11px] font-bold uppercase tracking-widest text-forest-600">Registro urbano</div><h1 className="text-2xl font-bold">Ocorrências</h1><p className="text-sm text-forest/70">Relatos anônimos feitos em campo (policiais, fiscais ou cidadãos) sobre iluminação, infraestrutura e uso do espaço. Não entram no Índice de Atenção.</p></div>
    {g.relatos.some((r) => r.demonstrativo) && <Aviso>Relatos marcados como “demonstrativo” são exemplos para a apresentação; não vêm de operação real.</Aviso>}
    <RelatosLista relatos={g.relatos} escrita={podeEscrever()} /></div>;
}
