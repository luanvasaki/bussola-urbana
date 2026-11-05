"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const ITENS = [["/gestor", "Dashboard"], ["/gestor/relatos", "Ocorrências"], ["/gestor/intervencoes", "Intervenções"], ["/gestor/zonas", "Zonas Vulneráveis"], ["/gestor/analise", "Análise"]] as const;
export default function GestorNav() {
  const p = usePathname();
  return <nav className="mt-2 flex gap-1 overflow-x-auto md:flex-col">{ITENS.map(([h, t]) => {
    const on = h === "/gestor" ? p === h : p.startsWith(h);
    return <Link key={h} href={h} className={`whitespace-nowrap rounded-xl px-3 py-2.5 text-sm ${on ? "bg-forest-600 font-semibold text-white" : "text-white/75 hover:bg-white/10"}`}>{t}</Link>;
  })}</nav>;
}
