"use client";
import { useEffect, useRef, type RefObject } from "react";

/**
 * "Do boletim de ocorrência à ordem de serviço": cada etapa tem um desenho feito a lápis.
 * Quando a seção entra na tela, o lápis desenha etapa por etapa, seguindo as setas, e o texto de cada etapa aparece junto.
 * Sem JS ou com "reduzir movimento", tudo já aparece pronto.
 */
type Etapa = { t: string; d: string; extra?: string };

export const TINTA = "#0d2b20", VERMELHO = "#b91c1c", LARANJA = "#d97706", MENTA = "#1f6b4e";
export const traco = { "data-traco": "", fill: "none", stroke: TINTA, strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

// Pontos do desenho do DBSCAN: um aglomerado e alguns casos isolados
const GRUPO = [[118, 78], [104, 70], [130, 66], [110, 92], [134, 90], [98, 84], [124, 104], [142, 76], [112, 58], [146, 100], [92, 98], [150, 62], [86, 72], [128, 116]];
const ISOLADOS = [[30, 30], [212, 34], [28, 124], [214, 128]];
const NUCLEO = GRUPO[0];

export function Lapis() {
  // ponta em (0,0); o grupo inteiro é movido para a ponta do traço
  return <g data-lapis="" style={{ opacity: 0 }} aria-hidden="true">
    <g transform="rotate(35)">
      <path d="M0 0 L-4.5 -10 L4.5 -10 Z" fill="#f3dfb5" stroke={TINTA} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M0 0 L-1.6 -3.6 L1.6 -3.6 Z" fill={TINTA} />
      <rect x="-4.5" y="-38" width="9" height="28" fill="#f2c94c" stroke={TINTA} strokeWidth="1.2" />
      <rect x="-4.5" y="-43" width="9" height="5" fill="#9ca3af" stroke={TINTA} strokeWidth="1.2" />
      <rect x="-4.5" y="-50" width="9" height="7" rx="2" fill="#f19a9a" stroke={TINTA} strokeWidth="1.2" />
    </g>
  </g>;
}

export function Nota({ x, y, children, cor = TINTA, anchor = "middle", tam = 11 }: { x: number; y: number; children: React.ReactNode; cor?: string; anchor?: "start" | "middle" | "end"; tam?: number }) {
  return <text data-surge="" x={x} y={y} fill={cor} fontSize={tam} fontWeight="600" textAnchor={anchor} fontStyle="italic" style={{ fontFamily: "var(--f-display), Georgia, serif" }}>{children}</text>;
}

const DESENHOS = [
  // 1. Boletim de ocorrência da SSP-SP vira um ponto no mapa
  <>
    <path {...traco} d="M52 18 L138 18 L160 40 L160 136 L52 136 Z" />
    <path {...traco} d="M138 18 L138 40 L160 40" />
    <path {...traco} d="M66 36 H116" strokeWidth="3" />
    <path {...traco} d="M66 56 H146" /><path {...traco} d="M66 70 H140" /><path {...traco} d="M66 84 H144" /><path {...traco} d="M66 98 H110" />
    <path {...traco} stroke={VERMELHO} d="M140 116 a12 12 0 1 1 -24 0 a12 12 0 1 1 24 0" />
    <Nota x={128} y={120} cor={VERMELHO}>SSP</Nota>
    <path {...traco} stroke={MENTA} d="M200 62 c-10 0 -17 7 -17 16 c0 13 17 28 17 28 c0 0 17 -15 17 -28 c0 -9 -7 -16 -17 -16 Z" />
    <path {...traco} stroke={MENTA} d="M205 78 a5 5 0 1 1 -10 0 a5 5 0 1 1 10 0" />
    <Nota x={200} y={128} cor={MENTA}>lat, lon</Nota>
  </>,
  // 2. DBSCAN: pontos, raio de 250 m em volta de um caso, vizinhos ligados, grupo formado
  <>
    {[...GRUPO, ...ISOLADOS].map(([x, y], i) => <circle key={i} data-surge="" cx={x} cy={y} r="3.4" fill={TINTA} />)}
    <path {...traco} stroke={MENTA} d={`M${NUCLEO[0] + 30} ${NUCLEO[1]} a30 30 0 1 1 -60 0 a30 30 0 1 1 60 0`} />
    <path {...traco} stroke={MENTA} strokeWidth="1.6" d={`M${NUCLEO[0]} ${NUCLEO[1]} L${NUCLEO[0] + 30} ${NUCLEO[1]}`} />
    <Nota x={NUCLEO[0] + 46} y={NUCLEO[1] - 30} cor={MENTA}>250 m</Nota>
    {GRUPO.slice(1).filter(([x, y]) => Math.hypot(x - NUCLEO[0], y - NUCLEO[1]) < 30).map(([x, y], i) =>
      <path key={i} {...traco} strokeWidth="1.3" d={`M${NUCLEO[0]} ${NUCLEO[1]} L${x} ${y}`} />)}
    <path {...traco} stroke={VERMELHO} d="M74 64 C80 38 150 36 162 58 C176 84 160 128 126 128 C92 130 70 112 74 64 Z" />
    <Nota x={190} y={92} cor={VERMELHO} anchor="start">grupo</Nota>
    <Nota x={30} y={18}>isolado</Nota>
  </>,
  // 3. Índice de Atenção: metade volume, metade horário
  <>
    <path {...traco} stroke={MENTA} strokeWidth="5" d="M50 112 A70 70 0 0 1 120 42" />
    <path {...traco} stroke={LARANJA} strokeWidth="5" d="M120 42 A70 70 0 0 1 190 112" />
    <Nota x={22} y={46} cor={MENTA} anchor="start">volume</Nota>
    <Nota x={218} y={46} cor={LARANJA} anchor="end">horário</Nota>
    <path {...traco} d="M50 120 V112 M190 120 V112 M120 34 V42" />
    <Nota x={50} y={134}>0</Nota><Nota x={190} y={134}>100</Nota>
    <path {...traco} stroke={VERMELHO} strokeWidth="3" d="M120 112 L172 99" />
    <circle data-surge="" cx="120" cy="112" r="5" fill={TINTA} />
    <text data-surge="" x="120" y="96" textAnchor="middle" fill={VERMELHO} fontSize="26" fontWeight="700" style={{ fontFamily: "var(--f-display), Georgia, serif" }}>92</text>
  </>,
  // 4. Ordem de serviço: prancheta com itens marcados e um cone de obra
  <>
    <path {...traco} d="M60 30 H146 V138 H60 Z" />
    <path {...traco} d="M86 22 H120 V38 H86 Z" />
    {[58, 84, 110].map((y) => <g key={y}>
      <path {...traco} d={`M72 ${y} h13 v13 h-13 z`} />
      <path {...traco} stroke={MENTA} strokeWidth="2.6" d={`M74 ${y + 6} l4 5 l9 -12`} />
      <path {...traco} d={`M94 ${y + 7} H134`} />
    </g>)}
    <path {...traco} stroke={LARANJA} d="M178 132 L192 82 L206 132 Z" />
    <path {...traco} stroke={LARANJA} d="M184 112 H200 M181 122 H203" />
    <path {...traco} stroke={LARANJA} d="M170 132 H214" />
  </>,
];

function Seta() {
  return <svg viewBox="0 0 64 32" className="h-8 w-16 rotate-90 lg:rotate-0" aria-hidden="true">
    <path {...traco} strokeWidth="2" d="M4 18 C18 10 34 24 54 15" />
    <path {...traco} strokeWidth="2" d="M45 8 L55 15 L46 23" />
  </svg>;
}

/** Anima o lápis: desenha os traços e faz surgir os pontos de cada [data-passo], um depois do outro, quando o bloco entra na tela. */
export function useLapis(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tracos = [...el.querySelectorAll<SVGGeometryElement>("[data-traco]")];
    tracos.forEach((t) => { const l = t.getTotalLength(); t.style.strokeDasharray = `${l} ${l}`; t.style.strokeDashoffset = `${l}`; });
    el.querySelectorAll<SVGElement>("[data-surge]").forEach((s) => { s.style.opacity = "0"; });
    el.dataset.anim = "1";
    let parado = false;
    const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const quadro = () => new Promise<number>((r) => requestAnimationFrame(r));
    const poeLapis = (l: SVGGElement | null, x: number, y: number) => { if (l) { l.style.opacity = "1"; l.setAttribute("transform", `translate(${x} ${y})`); } };

    async function desenha() {
      for (const passo of el!.querySelectorAll<HTMLElement>("[data-passo]")) {
        if (parado) return;
        passo.dataset.on = "1";
        const lapis = passo.querySelector<SVGGElement>("[data-lapis]");
        for (const item of passo.querySelectorAll<SVGGraphicsElement>("[data-traco],[data-surge]")) {
          if (parado) return;
          if (item.hasAttribute("data-surge")) {
            const b = item.getBBox(); poeLapis(lapis, b.x + b.width / 2, b.y + b.height / 2);
            item.style.transition = "opacity .25s"; item.style.opacity = "1";
            await espera(70);
            continue;
          }
          const g = item as SVGGeometryElement, l = g.getTotalLength(), dur = Math.min(700, Math.max(140, l * 2.2));
          const t0 = await quadro();
          for (let t = t0; ; t = await quadro()) {
            if (parado) return;
            const p = Math.min(1, (t - t0) / dur), e = 1 - (1 - p) * (1 - p);
            g.style.strokeDashoffset = `${l * (1 - e)}`;
            const pt = g.getPointAtLength(l * e); poeLapis(lapis, pt.x, pt.y);
            if (p >= 1) break;
          }
        }
        if (lapis) { lapis.style.transition = "opacity .3s"; lapis.style.opacity = "0"; }
        await espera(120);
      }
    }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); desenha(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => { parado = true; io.disconnect(); };
  }, []);
}

export default function ComoFunciona({ etapas }: { etapas: Etapa[] }) {
  const raiz = useRef<HTMLOListElement>(null);
  useLapis(raiz);

  return (
    <ol ref={raiz} className="bu-como mt-14 flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:gap-2">
      {etapas.map((e, i) => (
        <li key={e.t} className="contents">
          {i > 0 && <div data-passo="" className="shrink-0 lg:mt-24" aria-hidden="true"><Seta /></div>}
          <div data-passo="" className="w-full max-w-sm lg:max-w-none lg:flex-1">
            <svg viewBox="0 0 240 150" className="w-full rounded-md border-[1.5px] border-forest/15 bg-white/60" aria-hidden="true">
              {DESENHOS[i]}
              <Lapis />
            </svg>
            <div data-texto="" className="mt-5">
              <p className="rotulo text-forest/70">Etapa {i + 1}</p>
              <h3 className="mt-1 font-display text-xl font-bold">{e.t}</h3>
              <p className="mt-2 leading-relaxed text-forest/75">{e.d}</p>
              {e.extra && <p className="mt-3 border-l-2 border-forest/40 pl-3 text-sm leading-relaxed text-forest/75">{e.extra}</p>}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
