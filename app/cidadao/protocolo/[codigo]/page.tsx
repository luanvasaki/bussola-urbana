import Link from "next/link";
import { redirect } from "next/navigation";
import { getRelatoPorProtocolo } from "@/lib/db";
export const dynamic = "force-dynamic";
export const metadata = { title: "Relato enviado" };
export default async function Page({ params }: { params: { codigo: string } }) {
  const r = await getRelatoPorProtocolo(params.codigo);
  if (!r) redirect(`/cidadao/acompanhar?codigo=${encodeURIComponent(params.codigo)}`);
  return <div className="space-y-4 text-center">
    <div className="mx-auto mt-4 grid h-20 w-20 place-items-center rounded-full bg-mint-300"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="#0d2b20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg></div>
    <h1 className="text-2xl font-bold">Relato enviado</h1>
    <p className="text-sm text-forest/80">Obrigado! Seu relato é anônimo e ajuda os órgãos públicos a decidir onde vistoriar e consertar. Guarde o número do protocolo para acompanhar o andamento.</p>
    <div className="card border border-mint-300 p-4 text-left"><div className="text-xs text-forest/70">Número do protocolo</div><div className="text-2xl font-bold">{params.codigo}</div><div className="text-xs text-forest/70">Com ele você acompanha o relato sem se identificar.</div></div>
    <div className="card p-4 text-left text-sm"><div>Tipo: {r.categoria}</div>{(r.rua || r.bairro) && <div>Local: {[r.rua, r.bairro].filter(Boolean).join(", ")}</div>}<div>Situação: {r.status === "Relato recebido" ? "recebido, aguardando análise municipal" : r.status.toLowerCase()}</div></div>
    <Link href={`/cidadao/acompanhar?codigo=${encodeURIComponent(r.protocolo)}`} className="btn w-full py-4">Acompanhar relato</Link><Link href="/cidadao" className="btn-o w-full py-4">Voltar ao mapa</Link><Link href="/cidadao/relatar" className="btn-o w-full py-4">Enviar outro relato</Link></div>;
}
