"use client";
import { useEffect, useRef } from "react";

// Escala do calor: verde-claro e transparente onde há poucas ocorrências, verde forte e escuro nas maiores concentrações
const ESCALA: [number, string][] = [
  [0, "rgba(223,245,232,0)"],
  [0.08, "rgba(223,245,232,0.32)"],
  [0.25, "rgba(187,240,208,0.5)"],
  [0.45, "rgba(110,224,150,0.7)"],
  [0.7, "rgba(34,170,85,0.88)"],
  [1, "rgba(18,120,58,1)"],
];
const RAIO = 13; // em unidades do mapa (≈ 230 m)

/** Mapa de calor das ocorrências na página inicial. `pts` = [x0, y0, x1, y1, …] nas coordenadas do SVG (viewBox W×H). */
export default function CalorVerde({ W, H, pts }: { W: number; H: number; pts: number[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    // Paleta de 256 cores a partir da escala
    const pal = document.createElement("canvas"); pal.width = 256; pal.height = 1;
    const pc = pal.getContext("2d")!, g = pc.createLinearGradient(0, 0, 256, 0);
    ESCALA.forEach(([o, c]) => g.addColorStop(o, c)); pc.fillStyle = g; pc.fillRect(0, 0, 256, 1);
    const cores = pc.getImageData(0, 0, 256, 1).data;

    const desenha = () => {
      const r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (!r.width || !r.height) return;
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
      // mesmo enquadramento do SVG (preserveAspectRatio "xMidYMid meet")
      const sc = Math.min(r.width / W, r.height / H) * dpr, ox = ((r.width * dpr) - W * sc) / 2, oy = ((r.height * dpr) - H * sc) / 2;
      const ctx = cv.getContext("2d", { willReadFrequently: true })!;
      ctx.clearRect(0, 0, cv.width, cv.height);
      // 1) densidade: cada ocorrência soma um pouco de opacidade com borda suave
      const raio = RAIO * sc;
      const mancha = document.createElement("canvas"); mancha.width = mancha.height = Math.ceil(raio * 2);
      const mc = mancha.getContext("2d")!, rg = mc.createRadialGradient(raio, raio, 0, raio, raio, raio);
      rg.addColorStop(0, "rgba(0,0,0,1)"); rg.addColorStop(1, "rgba(0,0,0,0)"); mc.fillStyle = rg; mc.fillRect(0, 0, raio * 2, raio * 2);
      ctx.globalAlpha = 0.09;
      for (let i = 0; i < pts.length; i += 2) ctx.drawImage(mancha, ox + pts[i] * sc - raio, oy + pts[i + 1] * sc - raio);
      ctx.globalAlpha = 1;
      // 2) colore pela paleta conforme a densidade acumulada
      const img = ctx.getImageData(0, 0, cv.width, cv.height), d = img.data;
      for (let p = 0; p < d.length; p += 4) {
        const a = d[p + 3]; if (!a) continue;
        const k = a * 4; d[p] = cores[k]; d[p + 1] = cores[k + 1]; d[p + 2] = cores[k + 2]; d[p + 3] = cores[k + 3];
      }
      ctx.putImageData(img, 0, 0);
    };
    desenha();
    let t: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(desenha, 150); });
    ro.observe(cv);
    return () => { ro.disconnect(); clearTimeout(t); };
  }, [W, H, pts]);
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
