import type { Area, Oc } from "@/lib/types";
import { nomeBairro, prioridade, COR } from "@/lib/rules";

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const NATUREZA = { furto: "Furto", roubo: "Roubo", trafico: "Tráfico" } as const;
const ITENS = 54;

/** Letreiro estilo telejornal com ocorrências reais (em ordem cronológica) dentro das áreas de atenção. Só CSS, sem JS. */
export default function Letreiro({ ocorrencias, areas, ano }: { ocorrencias: Oc[]; areas: Area[]; ano: string }) {
  const porId = new Map(areas.map((a) => [a.id, a]));
  const dentro = ocorrencias.filter((o) => o.area_id != null && porId.has(o.area_id) && o.periodo !== "Em hora incerta").sort((a, b) => a.mes - b.mes);
  const passo = Math.max(1, Math.floor(dentro.length / ITENS));
  const itens = dentro.filter((_, i) => i % passo === 0).slice(0, ITENS).map((o) => {
    const a = porId.get(o.area_id!)!;
    return { natureza: NATUREZA[o.natureza], bairro: nomeBairro(a.bairro), periodo: o.periodo.toLowerCase(), mes: `${MESES[o.mes - 1]} de ${ano}`, cor: COR[prioridade(a.indice)] };
  });
  const faixa = (oculto: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={oculto || undefined}>
      {itens.map((it, i) => (
        <li key={i} className="flex items-center gap-2.5 whitespace-nowrap px-6">
          <i className="h-2 w-2 shrink-0 rounded-full" style={{ background: it.cor }} />
          <span><b className="font-semibold text-mint">{it.natureza}</b> em {it.bairro}, {it.periodo}</span>
          <span className="text-mint/45">{it.mes}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="bu-letreiro relative flex items-stretch border-t border-mint/15 bg-forest-800 text-sm text-mint/80">
      <div className="z-10 flex shrink-0 items-center gap-2 bg-mint px-4 py-3 font-display font-bold text-forest">
        <i className="h-2 w-2 rounded-full bg-[#b91c1c]" />
        Registros SSP-SP
      </div>
      <div className="relative flex-1 overflow-hidden" role="region" aria-label="Ocorrências registradas nas áreas de atenção, em ordem cronológica">
        <div className="bu-letreiro-trilho flex w-max py-3" style={{ animationDuration: `${itens.length * 3.2}s` }}>
          {faixa(false)}
          {faixa(true)}
        </div>
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-forest-800 to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-forest-800 to-transparent" />
      </div>
    </div>
  );
}
