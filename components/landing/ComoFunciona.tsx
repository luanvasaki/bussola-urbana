"use client";
import { useRef } from "react";
import { traco, Nota, Lapis, useLapis, TINTA, VERMELHO, LARANJA, MENTA } from "./lapis";
import { detalheDbscan, detalheIndice, type DadosIndice, type Detalhe } from "./Quadros";

/**
 * "Do boletim de ocorrência à ordem de serviço", de cima para baixo e na ordem:
 * cada etapa tem um desenho a lápis e, nas etapas 2 e 3, a conta vem logo em seguida, passo a passo (2.1, 2.2…),
 * antes de seguir para a próxima etapa. O lápis desenha cada parte quando ela entra na tela.
 */
type Etapa = { t: string; d: string };

// Pontos do desenho do DBSCAN: um aglomerado e alguns casos isolados
const GRUPO = [[118, 78], [104, 70], [130, 66], [110, 92], [134, 90], [98, 84], [124, 104], [142, 76], [112, 58], [146, 100], [92, 98], [150, 62], [86, 72], [128, 116], [108, 80], [126, 84], [116, 68], [122, 72], [110, 74], [128, 78], [114, 88], [120, 96], [102, 78], [134, 72], [118, 106], [96, 72]];
const ISOLADOS = [[30, 30], [212, 34], [28, 124], [214, 128]];
const NUCLEO = GRUPO[0];

// ponteiro do medidor da etapa 3: 0 à esquerda, 100 à direita
const ponteiro = (v: number) => { const a = Math.PI * (1 - v / 100); return `M120 112 L${(120 + 55 * Math.cos(a)).toFixed(1)} ${(112 - 55 * Math.sin(a)).toFixed(1)}`; };

const desenho = (i: number, indice: number) => [
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
    <Nota x={200} y={128} cor={MENTA}>no mapa</Nota>
  </>,
  // 2. DBSCAN: pontos, raio de 250 m em volta de um caso, vizinhos ligados, grupo formado
  <>
    {[...GRUPO, ...ISOLADOS].map(([x, y], k) => <circle key={k} data-surge="" cx={x} cy={y} r="3.2" fill={k === 0 ? VERMELHO : TINTA} />)}
    <path {...traco} stroke={MENTA} d={`M${NUCLEO[0] + 30} ${NUCLEO[1]} a30 30 0 1 1 -60 0 a30 30 0 1 1 60 0`} />
    <path {...traco} stroke={MENTA} strokeWidth="1.6" d={`M${NUCLEO[0]} ${NUCLEO[1]} L${NUCLEO[0] + 30} ${NUCLEO[1]}`} />
    <Nota x={NUCLEO[0] + 46} y={NUCLEO[1] - 30} cor={MENTA}>250 m</Nota>
    <path {...traco} stroke={VERMELHO} d="M74 64 C80 38 150 36 162 58 C176 84 160 128 126 128 C92 130 70 112 74 64 Z" />
    <Nota x={190} y={92} cor={VERMELHO} anchor="start">área</Nota>
    <Nota x={30} y={18}>isolado</Nota>
  </>,
  // 3. Índice de Atenção: metade volume, metade horário
  <>
    <path {...traco} strokeOpacity="0.3" strokeWidth="5" d="M50 112 A70 70 0 0 1 109.1 42.9" />
    <path {...traco} stroke={LARANJA} strokeWidth="5" d="M109.1 42.9 A70 70 0 0 1 161.1 55.4" />
    <path {...traco} stroke={VERMELHO} strokeWidth="5" d="M161.1 55.4 A70 70 0 0 1 190 112" />
    <path {...traco} d="M50 120 V112 M190 120 V112" />
    <Nota x={50} y={134}>0</Nota><Nota x={190} y={134}>100</Nota>
    <Nota x={120} y={146}>volume + horário</Nota>
    <path {...traco} stroke={VERMELHO} strokeWidth="3" d={ponteiro(indice)} />
    <circle data-surge="" cx="120" cy="112" r="5" fill={TINTA} />
    <text data-surge="" x="120" y="96" textAnchor="middle" fill={VERMELHO} fontSize="26" fontWeight="700" style={{ fontFamily: "var(--f-display), Georgia, serif" }}>{indice}</text>
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
][i];

function Seta() {
  return <div data-passo="" className="flex justify-center py-6" aria-hidden="true">
    <svg viewBox="0 0 64 32" className="h-10 w-20 rotate-90">
      <path {...traco} strokeWidth="2" d="M4 18 C18 10 34 24 54 15" />
      <path {...traco} strokeWidth="2" d="M45 8 L55 15 L46 23" />
    </svg>
  </div>;
}

function PassoAPasso({ etapa, det }: { etapa: number; det: Detalhe }) {
  return (
    <div className="mt-10 rounded-lg border-[1.5px] border-dashed border-forest/30 p-5 sm:p-8">
      <p className="rotulo text-forest/70">Etapa {etapa}, passo a passo</p>
      <h4 className="mt-1 font-display text-2xl font-bold">{det.titulo}</h4>
      <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-forest/75 lg:text-base">{det.intro}</p>
      <ol className={`mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 ${det.colunas}`}>
        {det.paineis.map((p, i) => (
          <li key={p.titulo} data-passo="">
            <svg viewBox={`0 0 240 ${p.alto ?? 170}`} role="img" aria-label={p.alt} className="w-full rounded-md border-[1.5px] border-forest/15 bg-white/70">
              {p.desenho}
              <Lapis />
            </svg>
            <div data-texto="" className="mt-4">
              <p className="rotulo text-forest/70">{etapa}.{i + 1}</p>
              <h5 className="mt-1 font-display text-lg font-bold leading-snug">{p.titulo}</h5>
              <p className="mt-1.5 text-[15px] leading-relaxed text-forest/75 lg:text-base">{p.texto}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-12 grid gap-6 border-t border-forest/15 pt-8 lg:grid-cols-2 lg:gap-10">
        <div>
          <p className="rotulo text-forest/70">De onde vem</p>
          <p className="mt-2 text-[15px] leading-relaxed text-forest/75 lg:text-base">{det.fonte}</p>
        </div>
        <div>
          <p className="rotulo text-forest/70">No programa</p>
          <pre className="mt-2 overflow-x-auto rounded-md bg-forest px-4 py-3 text-[13px] leading-relaxed text-white"><code>{det.codigo.linhas}</code></pre>
          <p className="mt-3 text-[15px] leading-relaxed text-forest/75 lg:text-base [&_code]:rounded [&_code]:bg-forest/10 [&_code]:px-1 [&_code]:text-[0.9em]">{det.codigo.explica}</p>
        </div>
      </div>
    </div>
  );
}

export default function ComoFunciona({ etapas, dados }: { etapas: Etapa[]; dados: DadosIndice | null }) {
  const raiz = useRef<HTMLOListElement>(null);
  useLapis(raiz);
  const detalhes: (Detalhe | null)[] = [null, detalheDbscan(), dados && detalheIndice(dados), null];

  return (
    <ol ref={raiz} className="bu-como mt-14">
      {etapas.map((e, i) => (
        <li key={e.t}>
          {i > 0 && <Seta />}
          <div data-passo="" className="grid items-center gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12">
            <svg viewBox="0 0 240 150" className="w-full max-w-md rounded-md border-[1.5px] border-forest/15 bg-white/60" aria-hidden="true">
              {desenho(i, dados?.indice ?? 92)}
              <Lapis />
            </svg>
            <div data-texto="">
              <p className="rotulo text-forest/70">Etapa {i + 1} de {etapas.length}</p>
              <h3 className="mt-1 font-display text-3xl font-bold">{e.t}</h3>
              <p className="mt-3 max-w-[52ch] text-lg leading-relaxed text-forest/80">{e.d}</p>
            </div>
          </div>
          {detalhes[i] && <PassoAPasso etapa={i + 1} det={detalhes[i]!} />}
        </li>
      ))}
    </ol>
  );
}
