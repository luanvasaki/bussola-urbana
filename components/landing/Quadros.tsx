"use client";
import { traco, Nota, TINTA, VERMELHO, LARANJA, MENTA } from "./lapis";

/**
 * Desenhos passo a passo que detalham as etapas 2 e 3 da página inicial:
 * como o DBSCAN forma uma área (desenho de exemplo) e como sai a nota de 0 a 100 (números reais da área em 1º lugar).
 */
export type DadosIndice = {
  nome: string; n: number;
  vol: number[]; posVol: number;        // casos de cada área, em ordem crescente, e a posição da área do exemplo
  conc: number[]; posConc: number;      // concentração no período mais comum (%), em ordem crescente
  periodos: { nome: string; n: number }[]; comHorario: number; semHorario: number; picoN: number; picoFrase: string; pct: number;
  sv: number; st: number; indice: number; prioridade: string;
};

export type Painel = { titulo: string; texto: React.ReactNode; alt: string; desenho: React.ReactNode; alto?: number };
export type Detalhe = {
  titulo: string; intro: string; colunas: string; paineis: Painel[];
  fonte: React.ReactNode;                                   // de onde vem o método
  codigo: { linhas: string; explica: React.ReactNode };     // a linha de verdade do programa (analytics/pipeline.py)
};

const r1 = (v: number) => Math.round(v * 10) / 10;
const T = (p: React.ComponentProps<typeof Nota>) => <Nota tam={12.5} {...p} />;
// pontos espalhados num disco (espiral áurea), sempre iguais no servidor e no navegador
const espiral = (cx: number, cy: number, r: number, k: number, giro = 0) =>
  Array.from({ length: k }, (_, i) => { const d = r * Math.sqrt((i + 0.5) / k), a = (i + giro) * 2.39996; return [r1(cx + d * Math.cos(a)), r1(cy + d * Math.sin(a))]; });
const pontos = (ps: number[][]) => ps.map(([x, y], i) => <circle key={i} data-surge="" data-rapido="" cx={x} cy={y} r="3" fill={TINTA} />);
const circulo = (cx: number, cy: number, r: number, cor = MENTA) => <path {...traco} stroke={cor} d={`M${cx + r} ${cy} a${r} ${r} 0 1 1 ${-2 * r} 0 a${r} ${r} 0 1 1 ${2 * r} 0`} />;
// "34 ÷ 37 × 50 ≈ 46": usa "=" só quando a conta é exata
// nome do eixo vertical, escrito de baixo para cima
const EixoY = ({ y, children }: { y: number; children: string }) =>
  <text data-surge="" x={0} y={0} transform={`translate(9 ${y}) rotate(-90)`} textAnchor="middle" fontSize="10" fill={TINTA} opacity="0.75">{children}</text>;
const EixoX = ({ y, children }: { y: number; children: string }) =>
  <text data-surge="" x={120} y={y} textAnchor="middle" fontSize="10" fill={TINTA} opacity="0.75">{children}</text>;
const conta = (k: number, N: number, r: number) => `${k} ÷ ${N} × 50 ${Math.abs((k / N) * 50 - r) < 0.05 ? "=" : "≈"} ${r}`;

export function detalheDbscan(): Detalhe {
  const A = [84, 72], B = [134, 72], C = [170, 96];
  return {
    titulo: "Como o DBSCAN forma uma área",
    intro: "Desenho de exemplo, com pontos inventados. Na etapa 3 os números são reais.",
    colunas: "lg:grid-cols-3",
    fonte: <>O DBSCAN não foi inventado por nós: foi publicado por Martin Ester e colegas em 1996 (congresso KDD-96) e é muito usado para achar concentrações em mapas. Usamos a versão pronta da biblioteca scikit-learn, em Python. Os dois números, 250 m e 20 casos, foram escolhidos pelo grupo, não calculados por uma fórmula. Também testamos 200 m e 300 m, e 250 m ficou como meio-termo.</>,
    codigo: {
      linhas: "DBSCAN(eps=0.25, min_samples=20).fit(X)",
      explica: <>Esta é a linha do nosso programa que faz tudo o que está acima. <code>eps=0.25</code> é o raio (0,25 km = 250 m), <code>min_samples=20</code> é o mínimo de casos e <code>X</code> são as posições das ocorrências. O computador testa todas as ocorrências de uma vez, em poucos segundos.</>,
    },
    paineis: [
      {
        titulo: "Um círculo de 250 m",
        texto: "Para cada ocorrência, o DBSCAN conta quantos casos aconteceram num raio de 250 m em volta dela. Se forem 20 casos ou mais, aquele ponto vira o centro de um grupo. Exigir pelo menos 20 casos evita marcar como área um lugar com só alguns casos soltos.",
        alt: "Círculo de 250 metros em volta de uma ocorrência, com 22 casos dentro. Como 22 é pelo menos 20, ela vira centro de um grupo.",
        desenho: <>
          {pontos(espiral(120, 74, 46, 21))}
          <circle data-surge="" cx="120" cy="74" r="5" fill={VERMELHO} />
          {circulo(120, 74, 54)}
          <path {...traco} stroke={MENTA} strokeWidth="1.4" d="M120 74 H174" />
          <T x={179} y={70} cor={MENTA} anchor="start">250 m</T>
          <T x={120} y={158} cor={VERMELHO} tam={13}>22 casos ≥ 20 → centro</T>
        </>,
      },
      {
        titulo: "O grupo cresce pelos vizinhos",
        texto: "Os casos ao redor entram no grupo. Se um deles também tem 20 ou mais casos por perto, vira outro centro (em vermelho) e o grupo cresce a partir dele. Quem está perto de um centro, mas não chega a 20, entra como borda: faz parte do grupo, mas não o faz crescer.",
        alt: "Dois círculos de 250 metros que se sobrepõem, cada um com um centro em vermelho, e um caso de borda. Juntos formam uma única área.",
        desenho: <>
          {pontos(espiral(A[0], A[1], 46, 19))}{pontos(espiral(B[0], B[1], 46, 19, 0.6))}
          <circle data-surge="" cx={A[0]} cy={A[1]} r="5" fill={VERMELHO} />
          {circulo(A[0], A[1], 54)}
          <circle data-surge="" cx={B[0]} cy={B[1]} r="5" fill={VERMELHO} />
          {circulo(B[0], B[1], 54)}
          <circle data-surge="" cx={C[0]} cy={C[1]} r="4" fill="#fff" stroke={TINTA} strokeWidth="2" />
          <path {...traco} strokeWidth="1.3" d={`M${C[0] + 5} ${C[1] + 4} L204 114`} />
          <T x={232} y={126} anchor="end">borda</T>
          <path {...traco} stroke={VERMELHO} d="M7 72 a102 64 0 1 1 204 0 a102 64 0 1 1 -204 0" />
          <T x={120} y={160} cor={VERMELHO} tam={13}>2 centros + borda = uma área</T>
        </>,
      },
      {
        titulo: "Longe de tudo, fica de fora",
        texto: "Uma ocorrência com poucos casos por perto e longe de qualquer centro fica fora das áreas e não entra na nota. Um caso sozinho não mostra um padrão.",
        alt: "Uma ocorrência com só 4 casos no círculo de 250 metros e nenhum centro por perto. Ela fica de fora; a área mais próxima está longe.",
        desenho: <>
          {pontos([[78, 62], [124, 100], [84, 112]])}
          <circle data-surge="" cx="96" cy="84" r="5" fill="#fff" stroke={TINTA} strokeWidth="2" />
          {circulo(96, 84, 54, TINTA)}
          <g opacity="0.4">{pontos(espiral(204, 32, 16, 8))}{circulo(204, 32, 24)}</g>
          <T x={234} y={76} cor={MENTA} tam={11} anchor="end">área mais perto</T>
          <T x={120} y={160} tam={13}>4 casos, nenhum centro → fora</T>
        </>,
      },
    ],
  };
}

// Fila de barras em ordem crescente: a área do exemplo em vermelho, uma chave embaixo das que ficam abaixo ou empatadas
// e outra em cima das que ficam à frente dela
function Fila({ valores, pos, altura, rotulo, nome, frente, txtConta, cor, eixoX, eixoY }: { valores: number[]; pos: number; altura: (v: number) => number; rotulo: string; nome: string; frente: string; txtConta: string; cor: string; eixoX: string; eixoY: string }) {
  const N = valores.length, passo = 200 / N, x = (i: number) => r1(22 + i * passo), larg = r1(passo * 0.7);
  const xe = r1(x(pos) + larg / 2), topo = r1(118 - altura(valores[pos])), resto = N - 1 - pos;
  return <>
    <path {...traco} d="M18 118 H224 M18 118 V26" />
    <EixoY y={72}>{eixoY}</EixoY>
    <EixoX y={133}>{eixoX}</EixoX>
    {valores.map((v, i) => i !== pos &&
      <rect key={i} data-surge="" data-rapido="" x={x(i)} y={r1(118 - altura(v))} width={larg} height={r1(altura(v))} fill={TINTA} opacity={i < pos ? 0.75 : 0.45} />)}
    <rect data-surge="" x={x(pos)} y={topo} width={larg} height={r1(118 - topo)} fill={VERMELHO} />
    <path {...traco} stroke={VERMELHO} strokeWidth="1.4" d={`M${xe} ${Math.min(topo - 4, 70)} V${topo - 3}`} />
    <T x={xe + 3} y={Math.min(topo - 8, 66)} cor={VERMELHO} anchor="end">{nome}</T>
    {resto > 0 && <>
      <path {...traco} strokeWidth="1.4" d={`M${x(pos + 1)} 22 v-5 H${r1(x(N - 1) + larg)} v5`} />
      <T x={224} y={12} anchor="end" tam={11}>{frente}</T>
    </>}
    <path {...traco} stroke={cor} d={`M${x(0)} 140 v5 H${r1(x(pos) + larg)} v-5`} />
    <T x={r1((x(0) + x(pos) + larg) / 2)} y={159} cor={cor} tam={11.5}>{rotulo}</T>
    <T x={120} y={182} cor={cor} tam={14}>{txtConta}</T>
  </>;
}

export function detalheIndice(d: DadosIndice): Detalhe {
  const N = d.vol.length, iguaisVol = d.posVol + 1, iguaisConc = d.posConc + 1;
  const maxV = d.vol[N - 1], maxC = d.conc[N - 1];
  const barras = [...d.periodos, { nome: "sem hora", n: d.semHorario }], maxP = Math.max(...barras.map((p) => p.n));
  const fmt = (v: number) => v.toLocaleString("pt-BR");
  const curto: Record<string, string> = { madrugada: "madrug." };
  const pico = d.periodos.reduce((a, b) => (b.n > a.n ? b : a));
  return {
    titulo: "A conta da área em 1º lugar",
    intro: `A área fica perto da ${d.nome}. A nota mostra onde agir primeiro; ela não quer dizer que o bairro seja perigoso.`,
    colunas: "",
    fonte: <>A ideia de comparar pela posição na fila se chama <i>percentil</i> e é estatística comum. A forma de juntar as duas partes (metade volume, metade horário) e os cortes 45 e 70 foram propostos pelo grupo; ainda não foram testados na prática por uma prefeitura. Os casos vêm do portal de dados abertos da SSP-SP.</>,
    codigo: {
      linhas: `volume  = round(lugar_na_fila_casos   / ${N} * 50)\nhorario = round(lugar_na_fila_horario / ${N} * 50)\nindice  = volume + horario`,
      explica: <>As linhas do programa que fazem a conta acima, com nomes simplificados para facilitar a leitura. Para a área do exemplo, os dois lugares na fila são {iguaisVol} e {iguaisConc}. É automático: um programa em Python (<code>analytics/pipeline.py</code>) lê a planilha da SSP-SP, acha as áreas e calcula a nota de todas elas de uma vez. A única parte manual é baixar a planilha nova da SSP e rodar dois comandos; depois disso o site mostra os números novos sozinho, em até uma hora.</>,
    },
    paineis: [
      {
        titulo: "Volume: em que lugar da fila ela fica?",
        texto: <>As {N} áreas fazem uma fila, da que tem menos casos para a que tem mais. {iguaisVol} delas têm {fmt(d.n)} casos ou menos, contando esta. Então volume = {conta(iguaisVol, N, d.sv)} (× 50 porque o volume vale metade da nota). O que conta é o lugar na fila, não o número de casos.{N - iguaisVol > 0 && <> As {N - iguaisVol} barras mais claras, à direita, não foram descartadas: são as áreas com mais casos do que esta. Elas só não entram nesta contagem, que pergunta quantas áreas ficam atrás ou empatadas. Mesmo com mais casos, essas {N - iguaisVol} ficaram com nota final menor, porque os casos delas se espalham mais pelos horários do dia.</>}</>,
        alt: `Fila com as ${N} áreas em ordem de número de casos. A área do exemplo, com ${d.n} casos, está em vermelho; ${iguaisVol} áreas têm ${d.n} casos ou menos. ${conta(iguaisVol, N, d.sv)}.`,
        alto: 192,
        desenho: <Fila valores={d.vol} pos={d.posVol} altura={(v) => 4 + 86 * (v / maxV)} nome={d.nome} cor={MENTA} eixoY="casos" eixoX={`as ${N} áreas, em ordem de casos →`}
          frente={`${N - iguaisVol} com mais`} rotulo={`${iguaisVol} com ${fmt(d.n)} ou menos`} txtConta={conta(iguaisVol, N, d.sv)} />,
      },
      {
        titulo: "Horário: quando mais acontece",
        texto: <>Só contam os casos com horário anotado: {d.comHorario} dos {fmt(d.n)}. Nos outros {d.semHorario} (barra tracejada), o boletim diz &ldquo;hora incerta&rdquo;. Dos {d.comHorario}, {d.picoN} foram {d.picoFrase}: {d.pct}%. Quanto maior esse número, mais os casos se repetem no mesmo horário.</>,
        alt: `Barras com os casos por período do dia: ${d.periodos.map((p) => `${p.nome} ${p.n}`).join(", ")}, e ${d.semHorario} sem hora, que ficam fora da conta. ${d.picoN} de ${d.comHorario} dá ${d.pct}%.`,
        alto: 192,
        desenho: <>
          <path {...traco} d="M18 118 H230 M18 118 V30" />
          <EixoY y={74}>casos</EixoY>
          <EixoX y={152}>período do dia</EixoX>
          {barras.map((p, i) => {
            const x = 24 + i * 42, h = r1(4 + 74 * (p.n / maxP)), semHora = i === barras.length - 1, ehPico = p === pico;
            return <g key={p.nome}>
              {semHora
                ? <rect data-surge="" x={x} y={r1(118 - h)} width="30" height={h} fill="none" stroke={TINTA} strokeWidth="1.6" strokeDasharray="4 3" opacity="0.6" />
                : <rect data-surge="" x={x} y={r1(118 - h)} width="30" height={h} fill={ehPico ? LARANJA : TINTA} opacity={ehPico ? 1 : 0.5} />}
              <T x={x + 15} y={r1(112 - h)} cor={ehPico ? LARANJA : TINTA} tam={12}>{p.n}</T>
              <T x={x + 15} y={135} tam={10} reto>{curto[p.nome] ?? p.nome}</T>
            </g>;
          })}
          <T x={120} y={182} cor={LARANJA} tam={14}>{`${d.picoN} ÷ ${d.comHorario} ≈ ${d.pct}%`}</T>
        </>,
      },
      {
        titulo: "Horário: de novo, a fila",
        texto: <>Agora a fila é pelo horário. {iguaisConc} das {N} áreas têm {d.pct}% ou menos. Então horário = {conta(iguaisConc, N, d.st)}.{N - iguaisConc > 0 && <> De novo, as {N - iguaisConc} mais claras não saem da conta: concentram ainda mais casos num só horário, mas têm menos casos no total, e por isso somaram menos.</>}</>,
        alt: `Fila com as ${N} áreas em ordem de concentração no horário. ${iguaisConc} têm ${d.pct}% ou menos. ${conta(iguaisConc, N, d.st)}.`,
        alto: 192,
        desenho: <Fila valores={d.conc} pos={d.posConc} altura={(v) => 4 + 86 * (v / maxC)} nome={`${d.pct}%`} cor={LARANJA} eixoY="% no pico" eixoX={`as ${N} áreas, em ordem de % no pico →`}
          frente={`${N - iguaisConc} com mais`} rotulo={`${iguaisConc} com ${d.pct}% ou menos`} txtConta={conta(iguaisConc, N, d.st)} />,
      },
      {
        titulo: "A soma dá a nota",
        texto: <>Volume mais horário: {d.sv} + {d.st} = <b>{d.indice}</b>. Nota 70 ou mais: prioridade alta. De 45 a 69: média. Abaixo de 45: baixa. Alta quer dizer que a área está entre as que mais pedem atenção em Sorocaba no período; é uma comparação entre áreas, não uma medida de perigo.</>,
        alt: `${d.sv} mais ${d.st} dá ${d.indice}. Numa régua de 0 a 100, com baixa até 44, média de 45 a 69 e alta a partir de 70, a nota fica em prioridade ${d.prioridade.toLowerCase()}.`,
        alto: 192,
        desenho: <>
          <text data-surge="" x="120" y="44" textAnchor="middle" fontSize="24" fontWeight="700" fontStyle="italic" style={{ fontFamily: "var(--f-display), Georgia, serif" }}>
            <tspan fill={MENTA}>{d.sv}</tspan><tspan fill={LARANJA}> + {d.st}</tspan><tspan fill={VERMELHO}> = {d.indice}</tspan>
          </text>
          <path {...traco} strokeOpacity="0.3" strokeWidth="6" d="M20 104 H110" />
          <path {...traco} stroke={LARANJA} strokeWidth="6" d="M110 104 H160" />
          <path {...traco} stroke={VERMELHO} strokeWidth="6" d="M160 104 H220" />
          <T x={65} y={124} tam={12}>baixa</T><T x={135} y={124} cor={LARANJA} tam={12}>média</T><T x={190} y={124} cor={VERMELHO} tam={12}>alta</T>
          <T x={20} y={142} tam={11} reto>0</T><T x={110} y={142} tam={11} reto>45</T><T x={160} y={142} tam={11} reto>70</T><T x={220} y={142} tam={11} reto>100</T>
          <path {...traco} stroke={VERMELHO} strokeWidth="2.6" d={`M${20 + 2 * d.indice} 58 V96 M${14 + 2 * d.indice} 88 L${20 + 2 * d.indice} 96 L${26 + 2 * d.indice} 88`} />
          <EixoX y={158}>nota de 0 a 100</EixoX>
          <T x={120} y={182} cor={VERMELHO} tam={13}>{`prioridade ${d.prioridade.toLowerCase()}`}</T>
        </>,
      },
    ],
  };
}
