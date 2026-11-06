import Link from "next/link";
import GestorNav from "@/components/GestorNav";
import { getPublico, podeEscrever } from "@/lib/db";
import { sair } from "../actions";
import { token } from "@/lib/auth";
export const dynamic = "force-dynamic";
export default async function GestorLayout({ children }: { children: React.ReactNode }) {
  const { meta, origem } = await getPublico();
  const protegido = Boolean(await token());
  const fmt = (s: string) => new Date(s + "T12:00:00").toLocaleDateString("pt-BR", { month: "short", year: "numeric" }).replace(". de ", "/").replace(" de ", "/");
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-forest p-4 text-white md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Bússola Urbana, voltar à página inicial">
          <svg aria-hidden="true" viewBox="0 0 32 32" className="h-8 w-8 shrink-0"><circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M22.5 9.5 17.6 17.6 9.5 22.5 14.4 14.4Z" fill="#eefbf3" /><path d="M22.5 9.5 17.6 17.6 14.4 14.4Z" fill="#b91c1c" /></svg>
          <span><span className="block font-display text-lg font-bold leading-none">Bússola Urbana</span><span className="mt-1 block text-xs text-white/70">Acesso do gestor</span></span>
        </Link>
        <GestorNav />
        <div className="rotulo mt-6 hidden text-[11px] text-white/50 md:block">
          <div>{origem === "supabase" ? "Dados lidos do banco do projeto" : "Dados do arquivo local"}</div>{!podeEscrever() && <div className="mt-1 text-amber-300">Modo demonstração, somente leitura</div>}
          {protegido && <form action={sair}><button className="mt-3 underline">Sair</button></form>}
        </div>
      </aside>
      <main id="conteudo" className="min-w-0 flex-1 p-4 md:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-forest/25 pb-3">
          <span className="rotulo text-forest/70">SSP-SP · {fmt(meta.periodo_inicio)} a {fmt(meta.periodo_fim)}</span>
          <span className="rotulo text-forest/70">Protótipo UPX I - Facens</span>
        </div>
        {children}
      </main>
    </div>
  );
}
