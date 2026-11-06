import Link from "next/link";
import { redirect } from "next/navigation";
import { getRelatoPorProtocolo } from "@/lib/db";
import { nomeBairro } from "@/lib/rules";
import { ProtocoloAcoes } from "@/components/Protocolo";
export const dynamic = "force-dynamic";
export const metadata = { title: "Relato enviado" };
export default async function Page({ params }: { params: { codigo: string } }) {
  const r = await getRelatoPorProtocolo(params.codigo);
  if (!r) redirect(`/cidadao/acompanhar?codigo=${encodeURIComponent(params.codigo)}`);
  const local = [r.rua, r.bairro && nomeBairro(r.bairro)].filter(Boolean).join(", ");
  return <div className="space-y-5">
    <div><p className="rotulo text-forest/70">Protocolo gerado</p>
      <h1 className="mt-1 text-3xl font-semibold leading-[1.05] tracking-[-0.015em]">Relato enviado</h1>
      <p className="mt-2 text-sm text-forest/80">Obrigado. Seu relato é anônimo e ajuda os órgãos públicos a decidir onde vistoriar e consertar.</p></div>
    <div className="card p-5"><div className="rotulo text-forest/70">Número do protocolo</div><div className="mt-1 whitespace-nowrap font-display text-[1.85rem] font-bold leading-none tracking-[-0.02em] tabular-nums">{r.protocolo}</div><ProtocoloAcoes protocolo={r.protocolo} /></div>
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
      <dt className="rotulo pt-0.5 text-forest/60">Tipo</dt><dd>{r.categoria}</dd>
      {local && <><dt className="rotulo pt-0.5 text-forest/60">Local</dt><dd>{local}</dd></>}
      <dt className="rotulo pt-0.5 text-forest/60">Situação</dt><dd>{r.status === "Relato recebido" ? "Recebido, aguardando análise municipal" : r.status}</dd>
    </dl>
    <Link href={`/cidadao/acompanhar?codigo=${encodeURIComponent(r.protocolo)}`} className="btn w-full py-4">Acompanhar relato</Link>
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
      <Link href="/cidadao/relatar" className="underline decoration-forest/30 underline-offset-4">Enviar outro relato</Link>
      <Link href="/cidadao" className="underline decoration-forest/30 underline-offset-4">Voltar ao mapa</Link>
      <Link href={`/gestor/relatos?q=${encodeURIComponent(r.protocolo)}`} className="underline decoration-forest/30 underline-offset-4">Ver como a prefeitura recebe este relato</Link>
    </div></div>;
}
