import Link from "next/link";
import { redirect } from "next/navigation";
import { getRelatoPorProtocolo } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: { codigo: string } }) {
  const r = await getRelatoPorProtocolo(params.codigo);
  if (!r) redirect(`/cidadao/acompanhar?codigo=${encodeURIComponent(params.codigo)}`);
  return <div className="space-y-4 text-center"><div className="mx-auto mt-4 grid h-20 w-20 place-items-center rounded-full bg-mint-300 text-4xl">✓</div>
    <h1 className="text-2xl font-bold">Relato enviado</h1><p className="text-sm text-forest/80">Obrigado! Seu relato é anônimo e ajuda a direcionar rondas preventivas e serviços urbanos na região. Guarde o número do protocolo para acompanhar o andamento.</p>
    <div className="card border border-mint-300 p-4 text-left"><div className="text-xs text-forest/60">Número do protocolo</div><div className="text-2xl font-bold">{params.codigo}</div><div className="text-xs text-forest/60">Com ele você acompanha o relato sem se identificar.</div></div>
    <div className="card p-4 text-left text-sm"><div>Tipo: {r.categoria}</div><div>Status: {r.status === "Relato recebido" ? "recebido para análise municipal" : r.status.toLowerCase()}</div></div>
    <Link href={`/cidadao/acompanhar?codigo=${encodeURIComponent(r.protocolo)}`} className="btn w-full py-4">Acompanhar relato</Link><Link href="/cidadao" className="btn-o w-full py-4">Voltar ao Mapa</Link><Link href="/cidadao/relatar" className="btn-o w-full py-4">Enviar outro relato</Link></div>;
}
