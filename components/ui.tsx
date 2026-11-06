import { COR, prioridade } from "@/lib/rules";
// Texto da prioridade na cor dela (Média em âmbar escuro, para ter contraste sobre o mint)
export const TOM = { Alta: "#b91c1c", Média: "#92400e", Baixa: "#1f6b4e" } as const;
export function Badge({ p, curto = false }: { p: "Alta" | "Média" | "Baixa"; curto?: boolean }) {
  return <span className="rotulo inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[11px]" style={{ color: TOM[p] }}><i className="h-2 w-2" style={{ background: COR[p] }} />{curto || p === "Baixa" ? p : `${p} prioridade`}</span>;
}
export function Barra({ valor, max = 100 }: { valor: number; max?: number }) {
  return <div className="h-2 w-full bg-forest/10"><div className="h-full" style={{ width: `${(valor / max) * 100}%`, background: COR[prioridade(valor * (100 / max))] }} /></div>;
}
export function Kpi({ rotulo, valor, sub, destaque }: { rotulo: string; valor: React.ReactNode; sub: React.ReactNode; destaque?: boolean }) {
  return <div className="card p-5"><div className="rotulo text-forest/70">{rotulo}</div><div className="mt-2 font-display text-[2.6rem] font-bold leading-none tracking-[-0.02em]" style={destaque ? { color: TOM.Alta } : undefined}>{valor}</div><div className="mt-1 text-xs text-forest/70">{sub}</div></div>;
}
export const data = (s: string) => new Date(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Sao_Paulo" });
export function Aviso({ children }: { children: React.ReactNode }) {
  return <p className="border-l-4 border-amber-600 py-1 pl-3 text-xs text-forest/85">{children}</p>;
}
