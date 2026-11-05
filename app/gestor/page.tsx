import Painel from "@/components/Painel";
import { getGestor, getPublico } from "@/lib/db";
export default async function Page() {
  const [p, g] = await Promise.all([getPublico(), getGestor()]);
  return <Painel areas={p.areas} pontos={p.ocorrencias} relatos={g.relatos} n_total={p.meta.n_total} />;
}
