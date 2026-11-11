"use client";
import { useEffect, type RefObject } from "react";

/** Peças comuns dos desenhos a lápis da página inicial. */
export const TINTA = "#0d2b20", VERMELHO = "#b91c1c", LARANJA = "#d97706", MENTA = "#1f6b4e";
export const traco = { "data-traco": "", fill: "none", stroke: TINTA, strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

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

type NotaProps = { x: number; y: number; children: React.ReactNode; cor?: string; anchor?: "start" | "middle" | "end"; tam?: number; reto?: boolean };
export function Nota({ x, y, children, cor = TINTA, anchor = "middle", tam = 11, reto = false }: NotaProps) {
  return <text data-surge="" x={x} y={y} fill={cor} fontSize={tam} fontWeight="600" textAnchor={anchor} fontStyle={reto ? "normal" : "italic"}
    style={{ fontFamily: reto ? "inherit" : "var(--f-display), Georgia, serif" }}>{children}</text>;
}

/**
 * Anima o lápis: cada [data-passo] é desenhado quando ele mesmo chega a uns 3/4 da altura da tela, numa fila (um de cada vez, na ordem da página).
 * O texto de cada passo só aparece quando o lápis começa aquele desenho; passo que já saiu (ou quase saiu) por cima aparece pronto, sem esperar.
 * Sem JS ou com "reduzir movimento", tudo já aparece pronto.
 */
export function useLapis(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const passos = [...el.querySelectorAll<HTMLElement>("[data-passo]")];
    el.querySelectorAll<SVGGeometryElement>("[data-traco]").forEach((t) => { const l = t.getTotalLength(); t.style.strokeDasharray = `${l} ${l}`; t.style.strokeDashoffset = `${l}`; });
    el.querySelectorAll<SVGElement>("[data-surge]").forEach((s) => { s.style.opacity = "0"; });
    el.dataset.anim = "1";
    let parado = false, rodando = false;
    const fila: HTMLElement[] = [], vistos = new Set<HTMLElement>();
    const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const quadro = () => new Promise<number>((r) => requestAnimationFrame(r));
    const poeLapis = (l: SVGGElement | null, x: number, y: number) => { if (l) { l.style.opacity = "1"; l.setAttribute("transform", `translate(${x} ${y})`); } };
    const pronto = (passo: HTMLElement) => {
      passo.dataset.on = "1";
      passo.querySelectorAll<SVGElement>("[data-traco]").forEach((t) => { t.style.strokeDashoffset = "0"; });
      passo.querySelectorAll<SVGElement>("[data-surge]").forEach((s) => { s.style.opacity = "1"; });
      const l = passo.querySelector<SVGElement>("[data-lapis]"); if (l) l.style.opacity = "0";
    };
    const passou = (passo: HTMLElement) => passo.getBoundingClientRect().bottom < innerHeight * 0.15;

    async function desenha(passo: HTMLElement) {
      const lapis = passo.querySelector<SVGGElement>("[data-lapis]");
      if (passou(passo)) return pronto(passo);
      passo.dataset.on = "1"; // o texto aparece junto com o começo do desenho
      for (const item of passo.querySelectorAll<SVGGraphicsElement>("[data-traco],[data-surge]")) {
        if (parado) return;
        if (passou(passo)) return pronto(passo);
        if (item.hasAttribute("data-surge")) {
          const b = item.getBBox(); poeLapis(lapis, b.x + b.width / 2, b.y + b.height / 2);
          item.style.transition = "opacity .25s"; item.style.opacity = "1";
          await espera(item.hasAttribute("data-rapido") ? 15 : 45);
          continue;
        }
        const g = item as SVGGeometryElement, l = g.getTotalLength(), dur = Math.min(550, Math.max(120, l * 1.6));
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
      await espera(250); // pausa para o olhar acompanhar até o próximo desenho
    }
    async function roda() {
      if (rodando) return;
      rodando = true;
      while (fila.length && !parado) await desenha(fila.shift()!);
      rodando = false;
    }
    const entra = (passo: HTMLElement) => {
      if (vistos.has(passo)) return;
      // mantém a ordem: os passos anteriores entram antes (ou aparecem prontos, se já passaram)
      for (const p of passos.slice(0, passos.indexOf(passo) + 1)) {
        if (vistos.has(p)) continue;
        vistos.add(p); io.unobserve(p);
        if (passou(p)) pronto(p); else fila.push(p);
      }
      roda();
    };
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting || e.boundingClientRect.bottom < 0) entra(e.target as HTMLElement);
    }), { threshold: 0, rootMargin: "0px 0px -25% 0px" });
    passos.forEach((p) => io.observe(p));
    return () => { parado = true; io.disconnect(); };
  }, []);
}
