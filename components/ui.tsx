import { COR, prioridade } from "@/lib/rules";
export function Badge({ p }: { p: "Alta" | "Média" | "Baixa" }) {
  const c = { Alta: "bg-red-50 text-red-800", Média: "bg-amber-100 text-amber-800", Baixa: "bg-emerald-50 text-emerald-800" }[p];
  return <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold ${c}`}><i className="h-1.5 w-1.5 rounded-full" style={{ background: COR[p] }} />{p === "Baixa" ? "Baixa" : `${p} prioridade`}</span>;
}
export function Barra({ valor, max = 100 }: { valor: number; max?: number }) {
  return <div className="h-1.5 w-full rounded-full bg-black/10"><div className="h-full rounded-full" style={{ width: `${(valor / max) * 100}%`, background: COR[prioridade(valor * (100 / max))] }} /></div>;
}
export function Kpi({ rotulo, valor, sub, destaque }: { rotulo: string; valor: React.ReactNode; sub: React.ReactNode; destaque?: boolean }) {
  return <div className={`card p-4 ${destaque ? "border-l-4 border-red-700" : ""}`}><div className="text-sm font-semibold text-forest/80">{rotulo}</div><div className="mt-1.5 font-display text-3xl font-bold">{valor}</div><div className="mt-1 text-xs text-forest/70">{sub}</div></div>;
}
export const data = (s: string) => new Date(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Sao_Paulo" });
export function Aviso({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-200">{children}</p>;
}
