import Link from "next/link";
import { getRelatoPorProtocolo } from "@/lib/db";
import { ETAPAS, ETAPA_DESC } from "@/lib/rules";
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams: { codigo?: string } }) {
  const codigo = searchParams.codigo?.trim();
  const r = codigo ? await getRelatoPorProtocolo(codigo) : null;
  const atual = r ? ETAPAS.indexOf(r.status as (typeof ETAPAS)[number]) : -1;
  return <div className="space-y-4"><h1 className="text-2xl font-bold">Acompanhar relato</h1>
    <form className="flex gap-2"><label htmlFor="codigo" className="sr-only">Número do protocolo</label><input id="codigo" name="codigo" defaultValue={codigo} placeholder="BU-2026-000142" autoCapitalize="characters" autoComplete="off" className="inp" /><button className="btn">Buscar</button></form>
    {codigo && !r && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">Protocolo não encontrado. Confira o número e tente de novo.</p>}
    {r && <><div className="card border border-mint-300 p-4"><div className="text-xs text-forest/70">Número do protocolo</div><div className="text-2xl font-bold">{r.protocolo}</div><div className="text-xs text-forest/70">{r.categoria}{r.rua || r.bairro ? `, ${[r.rua, r.bairro].filter(Boolean).join(", ")}` : ""}. Relato anônimo: o protocolo é o único vínculo, sem dados pessoais.</div></div>
      <ol className="card space-y-4 p-4">{ETAPAS.map((e, i) => <li key={e} className="flex gap-3"><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] ${i < atual ? "bg-forest text-white" : i === atual ? "border-2 border-forest bg-mint-300" : "border-2 border-black/15"}`}>{i < atual ? "✓" : ""}</span><div><div className={i <= atual ? "font-bold" : "text-forest/70"}>{e}</div><div className="text-xs text-forest/70">{i === atual && i !== 0 ? "Etapa atual" : ETAPA_DESC[i]}</div></div></li>)}</ol></>}
    <Link href="/cidadao" className="btn w-full py-3">Voltar ao mapa</Link></div>;
}
