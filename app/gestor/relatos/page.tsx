import { getGestor, getPublico, podeEscrever } from "@/lib/db";
import RelatosLista from "@/components/RelatosLista";
import AutoAtualiza from "@/components/AutoAtualiza";
import { Aviso } from "@/components/ui";
import { nomeBairro } from "@/lib/rules";
export const metadata = { title: "Relatos de campo" };
export default async function Page({ searchParams }: { searchParams: { q?: string; status?: string; area?: string } }) {
  const [g, p] = await Promise.all([getGestor(), getPublico()]);
  const areas = p.areas.map((a) => ({ id: a.id, nome: nomeBairro(a.bairro), indice: a.indice }));
  const escrita = podeEscrever() && g.origem === "supabase"; // nunca editar dados de exemplo
  return <div className="space-y-4"><div><h1 className="text-3xl font-semibold leading-[1.05] tracking-[-0.015em] md:text-4xl">Relatos de campo</h1><p className="mt-1 max-w-[70ch] text-sm text-forest/70">Relatos anônimos de policiais, fiscais e cidadãos sobre iluminação, infraestrutura e uso do espaço. Eles orientam a zeladoria e não entram no Índice de Atenção.</p></div>
    {g.origem === "exemplo" && <Aviso>O banco não respondeu agora. A lista mostra relatos de exemplo e a edição está desligada. Recarregue a página em instantes.</Aviso>}
    {g.origem === "supabase" && g.relatos.some((r) => r.demonstrativo) && <Aviso>Relatos marcados como “de exemplo” foram criados para a apresentação e não vêm de operação real.</Aviso>}
    <AutoAtualiza /><RelatosLista relatos={g.relatos} escrita={escrita} areas={areas} inicial={searchParams} /></div>;
}
