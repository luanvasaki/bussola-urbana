"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const ITENS = [["/gestor", "Painel"], ["/gestor/relatos", "Relatos de campo"], ["/gestor/intervencoes", "Intervenções"], ["/gestor/zonas", "Áreas de atenção"], ["/gestor/analise", "Análise e método"]] as const;
export default function GestorNav() {
  const p = usePathname();
  return <nav aria-label="Seções do gestor" className="mt-4 flex gap-1 overflow-x-auto md:mt-6 md:flex-col">{ITENS.map(([h, t]) => {
    const on = h === "/gestor" ? p === h : p.startsWith(h);
    return <Link key={h} href={h} aria-current={on ? "page" : undefined} className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm md:border-b-0 md:border-l-2 ${on ? "border-mint font-semibold text-mint" : "border-transparent text-mint/70 hover:text-mint"}`}>{t}</Link>;
  })}</nav>;
}
