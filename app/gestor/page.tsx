import Painel from "@/components/Painel";
import AutoAtualiza from "@/components/AutoAtualiza";
import { getGestor, getPublico } from "@/lib/db";
export default async function Page() {
  const [p, g] = await Promise.all([getPublico(), getGestor()]);
  const ultimo = g.relatos[0];
  const agora = {
    novos: g.relatos.filter((r) => r.status === "Relato recebido").length,
    ordensAbertas: g.ordens.filter((o) => o.status !== "Concluída").length,
    emAndamento: p.areas.filter((a) => a.status_workflow === "Em vistoria" || a.status_workflow === "Ordem emitida").length,
    ultimo: ultimo ? { protocolo: ultimo.protocolo, categoria: ultimo.categoria, criado_em: ultimo.criado_em } : null,
  };
  return <><AutoAtualiza /><Painel areas={p.areas} pontos={p.ocorrencias} relatos={g.relatos} n_total={p.meta.n_total} agora={agora} /></>;
}
