import Link from "next/link";
import GestorNav from "@/components/GestorNav";
import { getPublico, modoSupabase, podeEscrever } from "@/lib/db";
import { sair } from "../actions";
import { token } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function GestorLayout({ children }: { children: React.ReactNode }) {
  const { meta, origem } = await getPublico();
  const protegido = Boolean(await token());
  const fmt = (s: string) => new Date(s + "T12:00:00").toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" });
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-forest p-4 text-white md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0">
        <Link href="/" className="block"><div className="font-bold tracking-wide">BÚSSOLA URBANA</div><div className="text-[11px] text-white/60">Inteligência Preventiva • Sorocaba/SP</div></Link>
        <div className="mt-5 hidden text-[10px] font-semibold uppercase tracking-widest text-white/40 md:block">Navegação municipal</div>
        <GestorNav />
        <div className="mt-6 hidden text-[11px] text-white/50 md:block">
          <div>● Dados: {origem}</div>{!podeEscrever() && <div className="mt-1 text-amber-300">Modo demonstração (somente leitura)</div>}
          {protegido && <form action={sair}><button className="mt-3 underline">Sair</button></form>}
        </div>
      </aside>
      <div className="min-w-0 flex-1 p-4 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full bg-mint-300 px-3 py-1 text-xs font-bold text-forest">● DADOS HISTÓRICOS SSP-SP · {fmt(meta.periodo_inicio)} a {fmt(meta.periodo_fim)}</span>
          <div className="text-right text-sm"><div className="font-semibold">Gestão Pública Municipal</div><div className="text-xs text-forest/60">Sec. de Segurança Urbana · {modoSupabase() ? "Supabase" : "demonstração"}</div></div>
        </div>
        {children}
      </div>
    </div>
  );
}
