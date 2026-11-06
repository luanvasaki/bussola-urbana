"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * As duas telas do app "sendo usadas": um cursor (gestor) e um dedo (campo) tocam nas funções e a tela troca.
 * Roda uma de cada vez: primeiro o gestor, depois o campo, e recomeça. Só anda com a seção visível.
 * As imagens são capturas reais do app (public/telas/demo). Com "reduzir movimento", fica a primeira tela parada.
 */
type Quadro = { src: string; alvo: [number, number] | null; rotulo: string };

const GESTOR: Quadro[] = [
  { src: "/telas/demo/gestor-1.jpg", alvo: [82.1, 75], rotulo: "Escolhe a área de maior índice" },
  { src: "/telas/demo/gestor-2.jpg", alvo: [82.1, 50], rotulo: "Abre o detalhe da área" },
  { src: "/telas/demo/gestor-3.jpg", alvo: [58.9, 50], rotulo: "Registra uma vistoria" },
  { src: "/telas/demo/gestor-4.jpg", alvo: null, rotulo: "Vistoria e ordem de serviço" },
];
const CAMPO: Quadro[] = [
  { src: "/telas/demo/campo-1.jpg", alvo: [26.5, 21.6], rotulo: "Escolhe o tipo de problema" },
  { src: "/telas/demo/campo-2.jpg", alvo: [38.8, 49.7], rotulo: "Informa o local" },
  { src: "/telas/demo/campo-3.jpg", alvo: null, rotulo: "O local aparece no mapa" },
  { src: "/telas/demo/campo-4.jpg", alvo: [50, 96], rotulo: "Envia sem login" },
  { src: "/telas/demo/campo-5.jpg", alvo: null, rotulo: "Recebe o protocolo" },
];
const FLUXOS = [GESTOR, CAMPO];

type Estado = { ativo: number; quadro: number; cursor: [number, number] | null; toque: number };

function Tela({ quadros, estado, ativo, toque, cel }: { quadros: Quadro[]; estado: Estado; ativo: boolean; toque: number; cel: boolean }) {
  const q = ativo ? estado.quadro : 0, c = ativo ? estado.cursor : null;
  return <div className={`relative transition-opacity duration-700 ${ativo || estado.ativo < 0 ? "" : "opacity-45"}`}>
    <div className={`relative overflow-hidden ${cel ? "aspect-[390/844] rounded-[1.7rem]" : "aspect-[16/9] rounded-lg"}`}>
      {quadros.map((f, i) => <Image key={f.src} src={f.src} alt={i === 0 ? (cel ? "Tela de campo: escolha do tipo de problema, busca do local e envio anônimo" : "Painel do gestor: indicadores, mapa de calor e áreas prioritárias") : ""}
        fill sizes={cel ? "300px" : "(min-width: 1024px) 760px, 100vw"} className={`object-cover object-top transition-opacity duration-500 ${i === q ? "opacity-100" : "opacity-0"}`} />)}
      {c && <div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-full w-full">
        <div className="absolute transition-[left,top] duration-[900ms] ease-[cubic-bezier(.4,0,.2,1)]" style={{ left: `${c[0]}%`, top: `${c[1]}%` }}>
          {toque > 0 && <span key={toque} className="bu-toque absolute -left-5 -top-5 h-10 w-10 rounded-full border-2 border-forest bg-mint/50" />}
          {cel
            ? <span className={`absolute -left-4 -top-4 block h-8 w-8 rounded-full border-2 border-white bg-forest/45 shadow-lg transition-transform duration-150`} />
            : <svg viewBox="0 0 20 24" className={`absolute -left-[3px] -top-[2px] h-6 w-5 drop-shadow transition-transform duration-150`}><path d="M2 1 L2 19 L6.5 15 L9.5 22 L12.5 20.7 L9.6 14 L16 14 Z" fill="#fff" stroke="#0d2b20" strokeWidth="1.5" strokeLinejoin="round" /></svg>}
        </div>
      </div>}
    </div>
  </div>;
}

function Legenda({ quadros, estado, ativo }: { quadros: Quadro[]; estado: Estado; ativo: boolean }) {
  const q = ativo ? estado.quadro : 0;
  return <p className={`mt-3 min-h-[2.5rem] text-sm text-mint/80 transition-opacity duration-300 ${ativo ? "opacity-100" : "opacity-0"}`} aria-hidden="true">
    <span className="font-semibold text-mint">Passo {q + 1} de {quadros.length}:</span> {quadros[q].rotulo}
  </p>;
}

export default function DemoTelas() {
  const raiz = useRef<HTMLDivElement>(null);
  const [e, setE] = useState<Estado>({ ativo: -1, quadro: 0, cursor: null, toque: 0 });
  useEffect(() => {
    const el = raiz.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visivel = false, parado = false, toque = 0;
    const espera = (ms: number) => new Promise<void>((r) => {
      const fim = Date.now() + ms;
      const tick = () => { if (parado) return; if (visivel && Date.now() >= fim) r(); else setTimeout(tick, visivel ? Math.max(16, fim - Date.now()) : 300); };
      tick();
    });
    async function roda() {
      while (!parado) {
        for (let f = 0; f < FLUXOS.length && !parado; f++) {
          const qs = FLUXOS[f];
          setE({ ativo: f, quadro: 0, cursor: [f ? 60 : 45, f ? 70 : 40], toque: 0 });
          await espera(900);
          for (let i = 0; i < qs.length && !parado; i++) {
            setE((s) => ({ ...s, quadro: i }));
            const a = qs[i].alvo;
            if (!a) { await espera(2400); continue; }
            await espera(500);
            setE((s) => ({ ...s, cursor: a }));
            await espera(1100);
            toque++; setE((s) => ({ ...s, toque }));
            await espera(650);
          }
          await espera(1200);
        }
      }
    }
    const io = new IntersectionObserver(([en]) => { visivel = en.isIntersecting; }, { threshold: 0.35 });
    io.observe(el);
    roda();
    return () => { parado = true; io.disconnect(); };
  }, []);

  return <div ref={raiz} className="mt-14 grid items-start gap-14 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:gap-16">
    <div>
      <div className="rounded-md bg-forest-800 p-1.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,.6)] ring-1 ring-mint/15">
        <Tela quadros={GESTOR} estado={e} ativo={e.ativo === 0} toque={e.ativo === 0 ? e.toque : 0} cel={false} />
      </div>
      <Legenda quadros={GESTOR} estado={e} ativo={e.ativo === 0} />
      <h3 className="mt-3 font-display text-2xl font-bold">Gestor</h3>
      <p className="mt-1 max-w-[52ch] text-mint/70">Prefeitura e forças de segurança acompanham as áreas de atenção, leem os relatos de campo e abrem vistorias e ordens de zeladoria.</p>
      <Link href="/gestor" className="bu-botao mt-5 bg-mint text-forest hover:bg-mint-100">Entrar como gestor</Link>
    </div>
    <div>
      <div className="mx-auto w-full max-w-[300px] rounded-[2.2rem] bg-forest-800 p-2.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,.6)] ring-1 ring-mint/15">
        <Tela quadros={CAMPO} estado={e} ativo={e.ativo === 1} toque={e.ativo === 1 ? e.toque : 0} cel />
      </div>
      <Legenda quadros={CAMPO} estado={e} ativo={e.ativo === 1} />
      <h3 className="mt-3 font-display text-2xl font-bold">Campo</h3>
      <p className="mt-1 max-w-[40ch] text-mint/70">Policiais, fiscais e cidadãos relatam pelo celular, sem login, informando o local pelo CEP, pela rua, pelo GPS ou no mapa. O protocolo permite acompanhar o andamento.</p>
      <Link href="/cidadao" className="bu-botao mt-5 border-2 border-mint/60 text-mint hover:border-mint">Entrar em campo</Link>
    </div>
  </div>;
}
