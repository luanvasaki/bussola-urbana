"use client";
import { useEffect, useRef, useState } from "react";

export type Alvo = { x: number; y: number; nome: string; indice: number };
type Props = { W: number; H: number; cx: number; cy: number; alvos: Alvo[]; pulsos: [number, number, number][]; ano: string };

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const MS_POR_MES = 3200;
const PULSOS_POR_SEG = 26;
const VIDA = 1700;
const TROCA_ALVO = 4800;

/** Camada animada do mapa da página de entrada: replay das ocorrências mês a mês e agulha que percorre as áreas de alta prioridade. */
export default function MapaVivo({ W, H, cx, cy, alvos, pulsos, ano }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [mes, setMes] = useState<number | null>(null);
  const [i, setI] = useState(0);
  const [giro, setGiro] = useState<number | null>(null); // ângulo acumulado, evita a agulha dar a volta pelo lado errado
  const [quieto, setQuieto] = useState(false);

  const angulo = (a: Alvo) => (Math.atan2(a.y - cy, a.x - cx) * 180) / Math.PI;

  // Agulha: gira na entrada e depois percorre os alvos.
  useEffect(() => {
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setQuieto(reduz);
    const a0 = angulo(alvos[0]);
    if (reduz) { setGiro(a0); return; }
    setGiro(a0 - 250);
    const t0 = setTimeout(() => setGiro(a0), 60);
    let atual = 0;
    const id = setInterval(() => {
      atual = (atual + 1) % alvos.length;
      setI(atual);
      setGiro((g) => { const prev = g ?? a0; let d = (angulo(alvos[atual]) - prev) % 360; if (d > 180) d -= 360; if (d < -180) d += 360; return prev + d; });
    }, TROCA_ALVO);
    return () => { clearTimeout(t0); clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Replay das ocorrências no canvas.
  useEffect(() => {
    const cv = canvas.current;
    if (!cv || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d")!;
    const meses = [...new Set(pulsos.map((p) => p[2]))].sort((a, b) => a - b);
    const porMes = new Map(meses.map((m) => [m, pulsos.filter((p) => p[2] === m)]));
    const vivos: { x: number; y: number; t: number }[] = [];
    let raf = 0, inicio = performance.now(), ultimo = inicio, mesAtual = -1;
    let tr: [number, number, number] = [1, 0, 0]; // escala e deslocamento, iguais ao preserveAspectRatio "xMidYMid meet" do SVG

    const ajusta = () => {
      const r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
      const sc = Math.min(r.width / W, r.height / H);
      tr = [sc * dpr, ((r.width - W * sc) / 2) * dpr, ((r.height - H * sc) / 2) * dpr];
    };
    ajusta();
    const ro = new ResizeObserver(ajusta); ro.observe(cv);

    const passo = (agora: number) => {
      const idx = Math.floor((agora - inicio) / MS_POR_MES) % meses.length;
      const m = meses[idx];
      if (m !== mesAtual) { mesAtual = m; setMes(m); }
      const lista = porMes.get(m)!;
      const novos = Math.min(12, Math.floor(((agora - ultimo) / 1000) * PULSOS_POR_SEG * 1.0001 + Math.random()));
      if (novos > 0) { ultimo = agora; for (let k = 0; k < novos; k++) { const p = lista[(Math.random() * lista.length) | 0]; vivos.push({ x: p[0], y: p[1], t: agora }); } }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.setTransform(tr[0], 0, 0, tr[0], tr[1], tr[2]);
      for (let k = vivos.length - 1; k >= 0; k--) {
        const v = vivos[k], f = (agora - v.t) / VIDA;
        if (f >= 1) { vivos.splice(k, 1); continue; }
        const e = 1 - Math.pow(1 - f, 3);
        ctx.beginPath(); ctx.arc(v.x, v.y, 3 + e * 20, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(238,251,243,${0.75 * (1 - f)})`; ctx.lineWidth = 1.6; ctx.stroke();
        if (f < 0.35) { ctx.beginPath(); ctx.arc(v.x, v.y, 3.2, 0, Math.PI * 2); ctx.fillStyle = `rgba(238,251,243,${1 - f / 0.35})`; ctx.fill(); }
      }
      raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [pulsos, W, H]);

  const alvo = alvos[i];
  // Posição do rótulo calculada para nunca sair do mapa: lado com espaço livre e, perto do topo, abaixo do alvo.
  const largura = Math.max(alvo.nome.length * 19, 310);
  const cabeEsq = alvo.x - 32 - largura > 0, cabeDir = alvo.x + 32 + largura < W;
  const esq = cabeEsq && (alvo.x < cx || !cabeDir);
  const acima = alvo.y - 96 > 0;
  const tx = alvo.x + (esq ? -32 : 32), ty1 = acima ? alvo.y - 64 : alvo.y + 52, ty2 = acima ? alvo.y - 32 : alvo.y + 84;
  return (
    <>
      <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5] h-full w-full" />
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" overflow="visible" className="pointer-events-none absolute inset-0 z-[5] h-full w-full">
        <g key={`l${i}`} className="bu-surge" style={{ animationDelay: quieto ? "0s" : i === 0 ? "2.4s" : "1.3s" }}>
          <line x1={cx} y1={cy} x2={alvo.x} y2={alvo.y} stroke="#eefbf3" strokeOpacity="0.55" strokeWidth="1.6" strokeDasharray="5 6" />
          <circle cx={alvo.x} cy={alvo.y} r="20" fill="none" stroke="#eefbf3" strokeWidth="2.5" />
          <g textAnchor={esq ? "end" : "start"} paintOrder="stroke" stroke="#0d2b20" strokeWidth="8" strokeLinejoin="round">
            <text x={tx} y={ty1} fill="#eefbf3" fontSize="34" fontWeight="600" fontFamily="var(--f-display), Georgia, serif">{alvo.nome}</text>
            <text x={tx} y={ty2} fill="#a7e8c4" fontSize="23">Índice de Atenção {alvo.indice} de 100</text>
          </g>
        </g>
        {giro !== null && (
          <g className="bu-agulha" style={{ transformOrigin: `${cx}px ${cy}px`, transform: `rotate(${giro}deg)`, transition: quieto ? "none" : i === 0 && giro === angulo(alvos[0]) ? "transform 2.3s cubic-bezier(.18,.9,.25,1.05)" : "transform 1.4s cubic-bezier(.3,1.45,.5,1)" }}>
            <g className="bu-tremor" style={{ transformOrigin: `${cx}px ${cy}px` }}>
              <path d={`M ${cx + 92} ${cy} L ${cx} ${cy - 11} L ${cx - 64} ${cy} L ${cx} ${cy + 11} Z`} fill="#eefbf3" />
              <path d={`M ${cx + 92} ${cy} L ${cx} ${cy - 11} L ${cx} ${cy + 11} Z`} fill="#b91c1c" />
              <circle cx={cx} cy={cy} r="8" fill="#0d2b20" stroke="#eefbf3" strokeWidth="3" />
            </g>
          </g>
        )}
      </svg>
      {mes !== null && (
        <p className="pointer-events-none absolute bottom-4 right-6 z-[5] text-xs text-mint/70 sm:text-sm lg:bottom-auto lg:right-10 lg:top-4">
          Reproduzindo os registros de <span className="font-semibold text-mint">{MESES[mes - 1]} de {ano}</span>
        </p>
      )}
    </>
  );
}
