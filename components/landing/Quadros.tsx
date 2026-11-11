"use client";
import { useRef } from "react";
import { traco, Nota, Lapis, useLapis, TINTA, VERMELHO, LARANJA, MENTA } from "./ComoFunciona";

/**
 * Quadros desenhados a lápis que mostram as contas por trás das etapas 2 e 3:
 * como o DBSCAN forma uma área e como sai a nota de 0 a 100, com os números reais da área em 1º lugar.
 */
export type DadosIndice = {
  nome: string; n: number; total: number;
  vol: number[]; posVol: number;        // casos de cada área, em ordem crescente, e a posição da área do exemplo
  conc: number[]; posConc: number;      // concentração no período mais comum (%), em ordem crescente
  periodos: { nome: string; n: number }[]; comHorario: number; semHorario: number; pico: string; picoFrase: string; pct: number;
  sv: number; st: number; indice: number; prioridade: string;
};

type Painel = { titulo: string; texto: React.ReactNode; desenho: React.ReactNode };

const r1 = (v: number) => Math.round(v * 10) / 10;
// pontos espalhados num disco (espiral áurea), sempre iguais no servidor e no navegador
const espiral = (cx: number, cy: number, r: number, k: number, giro = 0) =>
  Array.from({ length: k }, (_, i) => { const d = r * Math.sqrt((i + 0.5) / k), a = (i + giro) * 2.39996; return [r1(cx + d * Math.cos(a)), r1(cy + d * Math.sin(a))]; });
const pontos = (ps: number[][], cor = TINTA) => ps.map(([x, y], i) => <circle key={i} data-surge="" cx={x} cy={y} r="3" fill={cor} />);
const circulo = (cx: number, cy: number, r: number, cor = MENTA) => <path {...traco} stroke={cor} d={`M${cx + r} ${cy} a${r} ${r} 0 1 1 ${-2 * r} 0 a${r} ${r} 0 1 1 ${2 * r} 0`} />;

function Quadro({ titulo, paineis, colunas }: { titulo: string; paineis: Painel[]; colunas: string }) {
  const raiz = useRef<HTMLOListElement>(null);
  useLapis(raiz);
  return (
    <div className="mt-14">
      <h3 className="font-display text-2xl font-bold">{titulo}</h3>
      <ol ref={raiz} className={`bu-como mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2 ${colunas}`}>
        {paineis.map((p, i) => (
          <li key={p.titulo} data-passo="">
            <svg viewBox="0 0 240 170" className="w-full rounded-md border-[1.5px] border-forest/15 bg-white/60" aria-hidden="true">
              {p.desenho}
              <Lapis />
            </svg>
            <div data-texto="" className="mt-4">
              <p className="rotulo text-forest/70">Passo {i + 1}</p>
              <h4 className="mt-1 font-display text-lg font-bold">{p.titulo}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-forest/75">{p.texto}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Fila de barras em ordem crescente, com a área do exemplo em vermelho e uma chave embaixo das que ficam abaixo ou empatadas
function Fila({ valores, pos, altura, rotulo, nome, conta }: { valores: number[]; pos: number; altura: (v: number) => number; rotulo: string; nome: string; conta: string }) {
  const passo = 200 / valores.length, x = (i: number) => r1(20 + i * passo), larg = r1(passo * 0.7);
  const xe = r1(x(pos) + larg / 2), topo = r1(118 - altura(valores[pos]));
  return <>
    <path {...traco} d="M16 118 H224" />
    <g data-surge="">{valores.map((v, i) => i !== pos &&
      <rect key={i} x={x(i)} y={r1(118 - altura(v))} width={larg} height={r1(altura(v))} fill={TINTA} opacity={i <= pos ? 0.7 : 0.25} />)}</g>
    <rect data-surge="" x={x(pos)} y={topo} width={larg} height={r1(118 - topo)} fill={VERMELHO} />
    <path {...traco} stroke={VERMELHO} strokeWidth="1.4" d={`M${xe} ${Math.min(topo - 4, 70)} V${topo - 3}`} />
    <Nota x={xe + 3} y={Math.min(topo - 8, 66)} cor={VERMELHO} anchor="end">{nome}</Nota>
    <path {...traco} stroke={MENTA} d={`M${x(0)} 124 v5 H${r1(x(pos) + larg)} v-5`} />
    <Nota x={r1((x(0) + x(pos) + larg) / 2)} y={143} cor={MENTA}>{rotulo}</Nota>
    <Nota x={120} y={163} cor={VERMELHO} tam={14}>{conta}</Nota>
  </>;
}

export default function Quadros({ d }: { d: DadosIndice }) {
  const N = d.vol.length, iguaisVol = d.posVol + 1, iguaisConc = d.posConc + 1;
  const maxV = d.vol[N - 1], maxC = d.conc[N - 1], maxP = Math.max(...d.periodos.map((p) => p.n));
  const fmt = (v: number) => v.toLocaleString("pt-BR");

  // DBSCAN: 1) círculo de 250 m com 22 casos; 2) dois centros vizinhos e uma borda formam um grupo; 3) caso isolado
  const A = [88, 74], B = [152, 74], C = [186, 98];
  const dbscan: Painel[] = [
    {
      titulo: "Um círculo de 250 m",
      texto: "Para cada ocorrência, o DBSCAN conta quantos casos existem num raio de 250 m, contando ela mesma. Com 20 ou mais, ela vira um centro de grupo.",
      desenho: <>
        {pontos(espiral(120, 76, 46, 21))}
        <circle data-surge="" cx="120" cy="76" r="5" fill={VERMELHO} />
        {circulo(120, 76, 54)}
        <path {...traco} stroke={MENTA} strokeWidth="1.4" d="M120 76 H174" />
        <Nota x={196} y={34} cor={MENTA}>250 m</Nota>
        <Nota x={120} y={156} cor={VERMELHO} tam={13}>22 casos ≥ 20 → centro</Nota>
      </>,
    },
    {
      titulo: "O grupo cresce pelos vizinhos",
      texto: "Os vizinhos entram no grupo. Se um vizinho também tiver 20 casos por perto, ele vira centro e puxa os próprios vizinhos. Quem fica perto de um centro mas não chega a 20 entra só como borda.",
      desenho: <>
        {pontos(espiral(A[0], A[1], 34, 13))}{pontos(espiral(B[0], B[1], 34, 13, 0.6))}
        <circle data-surge="" cx={A[0]} cy={A[1]} r="5" fill={VERMELHO} /><circle data-surge="" cx={B[0]} cy={B[1]} r="5" fill={VERMELHO} />
        {circulo(A[0], A[1], 42)}{circulo(B[0], B[1], 42)}
        <circle data-surge="" cx={C[0]} cy={C[1]} r="3.4" fill="none" stroke={TINTA} strokeWidth="1.6" />
        <path {...traco} stroke={VERMELHO} d="M30 76 a90 50 0 1 1 180 0 a90 50 0 1 1 -180 0" />
        <Nota x={A[0]} y={144}>centro</Nota><Nota x={B[0]} y={144}>centro</Nota><Nota x={224} y={124} anchor="end">borda</Nota>
        <Nota x={120} y={164} cor={VERMELHO} tam={13}>tudo vira uma área</Nota>
      </>,
    },
    {
      titulo: "Quem fica sozinho, fica de fora",
      texto: "Uma ocorrência com poucos casos por perto e longe de qualquer centro não forma área. O DBSCAN a trata como ruído, e ela não entra no índice.",
      desenho: <>
        {pontos([[100, 56], [148, 92], [104, 104], [24, 24], [218, 30], [30, 140], [212, 136]])}
        <circle data-surge="" cx="120" cy="76" r="5" fill="none" stroke={TINTA} strokeWidth="2" />
        {circulo(120, 76, 54, TINTA)}
        <Nota x={120} y={156} tam={13}>4 casos &lt; 20 → isolado</Nota>
      </>,
    },
  ];

  const indice: Painel[] = [
    {
      titulo: "Volume: a fila das áreas",
      texto: <>As {N} áreas vão para uma fila, da que tem menos casos para a que tem mais. {d.nome} tem {fmt(d.n)} casos, e {iguaisVol} áreas têm {fmt(d.n)} ou menos, contando ela. Então volume = {iguaisVol} ÷ {N} × 50 = <b>{d.sv}</b>.</>,
      desenho: <Fila valores={d.vol} pos={d.posVol} altura={(v) => 4 + 86 * Math.sqrt(v / maxV)} nome={d.nome} rotulo={`${iguaisVol} com ${fmt(d.n)} ou menos`} conta={`${iguaisVol} ÷ ${N} × 50 = ${d.sv}`} />,
    },
    {
      titulo: "Horário: o período mais comum",
      texto: <>Só entram os casos com período registrado: {d.comHorario} dos {fmt(d.n)}. Os outros {d.semHorario} estão como &ldquo;em hora incerta&rdquo; e ficam fora da conta. {d.periodos.find((p) => p.nome === d.pico)?.n} foram {d.picoFrase}, então a concentração é <b>{d.pct}%</b>.</>,
      desenho: <>
        <path {...traco} d="M16 118 H224" />
        {d.periodos.map((p, i) => {
          const x = 22 + i * 54, h = r1(4 + 76 * (p.n / maxP)), pico = p.nome === d.pico;
          return <g key={p.nome}>
            <rect data-surge="" x={x} y={r1(118 - h)} width="34" height={h} fill={pico ? LARANJA : TINTA} opacity={pico ? 1 : 0.35} />
            <Nota x={x + 17} y={r1(112 - h)} cor={pico ? LARANJA : TINTA}>{p.n}</Nota>
            <Nota x={x + 17} y={134} tam={9.5}>{p.nome}</Nota>
          </g>;
        })}
        <Nota x={120} y={163} cor={VERMELHO} tam={14}>{`${d.periodos.find((p) => p.nome === d.pico)?.n} ÷ ${d.comHorario} = ${d.pct}%`}</Nota>
      </>,
    },
    {
      titulo: "Horário: a mesma fila",
      texto: <>A concentração de cada área também vai para uma fila. {iguaisConc} das {N} áreas têm {d.pct}% ou menos. Então horário = {iguaisConc} ÷ {N} × 50 = <b>{d.st}</b>.</>,
      desenho: <Fila valores={d.conc} pos={d.posConc} altura={(v) => 4 + 86 * (v / maxC)} nome={`${d.pct}%`} rotulo={`${iguaisConc} com ${d.pct}% ou menos`} conta={`${iguaisConc} ÷ ${N} × 50 = ${d.st}`} />,
    },
    {
      titulo: "A soma dá a nota",
      texto: <>Volume mais horário: {d.sv} + {d.st} = <b>{d.indice}</b>. A partir de 70 a prioridade é alta; de 45 a 69, média; abaixo de 45, baixa.</>,
      desenho: <>
        <Nota x={120} y={46} tam={24}>{`${d.sv} + ${d.st} = ${d.indice}`}</Nota>
        <path {...traco} stroke={MENTA} strokeWidth="5" d="M20 112 H110" />
        <path {...traco} stroke={LARANJA} strokeWidth="5" d="M110 112 H160" />
        <path {...traco} stroke={VERMELHO} strokeWidth="5" d="M160 112 H220" />
        <Nota x={65} y={100} cor={MENTA}>baixa</Nota><Nota x={135} y={100} cor={LARANJA}>média</Nota><Nota x={180} y={100} cor={VERMELHO}>alta</Nota>
        <Nota x={20} y={132}>0</Nota><Nota x={110} y={132}>45</Nota><Nota x={160} y={132}>70</Nota><Nota x={220} y={132}>100</Nota>
        <path {...traco} stroke={VERMELHO} strokeWidth="2.6" d={`M${20 + 2 * d.indice} 62 V104 M${14 + 2 * d.indice} 96 L${20 + 2 * d.indice} 104 L${26 + 2 * d.indice} 96`} />
        <Nota x={120} y={160} cor={VERMELHO} tam={13}>{`prioridade ${d.prioridade.toLowerCase()}`}</Nota>
      </>,
    },
  ];

  return (
    <>
      <Quadro titulo="Etapa 2 de perto: como o DBSCAN forma uma área" paineis={dbscan} colunas="lg:grid-cols-3" />
      <Quadro titulo={`Etapa 3 de perto: a nota de ${d.nome}, passo a passo`} paineis={indice} colunas="lg:grid-cols-4" />
    </>
  );
}
