import { getGestor, podeEscrever } from "@/lib/db";
import RelatosLista from "@/components/RelatosLista";
import { Aviso } from "@/components/ui";
export const metadata = { title: "Relatos de campo" };
export default async function Page() {
  const g = await getGestor();
  const escrita = podeEscrever() && g.origem === "supabase"; // nunca editar dados de exemplo
  return <div className="space-y-4"><div><h1 className="text-2xl font-bold">Relatos de campo</h1><p className="mt-1 max-w-[70ch] text-sm text-forest/70">Relatos anônimos de policiais, fiscais e cidadãos sobre iluminação, infraestrutura e uso do espaço. Eles orientam a zeladoria e não entram no Índice de Atenção.</p></div>
    {g.origem === "exemplo" && <Aviso>O banco não respondeu agora. A lista mostra relatos de exemplo e a edição está desligada. Recarregue a página em instantes.</Aviso>}
    {g.origem === "supabase" && g.relatos.some((r) => r.demonstrativo) && <Aviso>Relatos marcados como “de exemplo” foram criados para a apresentação e não vêm de operação real.</Aviso>}
    <RelatosLista relatos={g.relatos} escrita={escrita} /></div>;
}
