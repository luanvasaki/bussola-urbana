"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const ITENS = [["/gestor", "Painel"], ["/gestor/relatos", "Relatos de campo"], ["/gestor/intervencoes", "Intervenções"], ["/gestor/zonas", "Áreas de atenção"], ["/gestor/analise", "Análise e método"]] as const;
export default function GestorNav() {
  const p = usePathname();
  return <nav aria-label="Seções do gestor" className="mt-4 flex gap-1 overflow-x-auto md:mt-6 md:flex-col">{ITENS.map(([h, t]) => {
    const on = h === "/gestor" ? p === h : p.startsWith(h);
    return <Link key={h} href={h} aria-current={on ? "page" : undefined} className={`whitespace-nowrap rounded-xl px-3 py-2.5 text-sm ${on ? "bg-forest-600 font-semibold text-white" : "text-white/80 hover:bg-white/10"}`}>{t}</Link>;
  })}</nav>;
}
