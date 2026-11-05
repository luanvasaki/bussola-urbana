import Link from "next/link";
import Image from "next/image";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { getPublico } from "@/lib/db";
import { prioridade } from "@/lib/rules";
import MapaDados from "@/components/landing/MapaDados";
import Letreiro from "@/components/landing/Letreiro";
import Revela from "@/components/landing/Revela";

export const dynamic = "force-dynamic";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--f-display" });
const texto = Instrument_Sans({ subsets: ["latin"], variable: "--f-texto" });

const n = (v: number) => v.toLocaleString("pt-BR");
const mes = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { month: "long" });

export default async function Home() {
  const { areas, ocorrencias, meta } = await getPublico();
  const altas = areas.filter((a) => prioridade(a.indice) === "Alta").length;
  const pctAreas = Math.round((meta.n_em_areas / meta.n_total) * 100);
  const periodo = `${mes(meta.periodo_inicio)} a ${mes(meta.periodo_fim)} de ${meta.periodo_fim.slice(0, 4)}`;

  const etapas = [
    { t: "Dados oficiais", d: `Boletins da SSP-SP de Sorocaba, de ${periodo}. Ficam só furto, roubo e tráfico com coordenada válida: ${n(meta.n_total)} ocorrências.` },
    { t: "Áreas de atenção", d: `O DBSCAN agrupa ocorrências a até 250 m umas das outras, com no mínimo 20 por grupo. Resultado: ${meta.n_areas} áreas que reúnem ${pctAreas}% dos casos.` },
    { t: "Índice de Atenção", d: "Nota de 0 a 100: metade vem do volume da área, metade de quanto os casos se concentram num período do dia. As duas partes aparecem no painel." },
    { t: "Ação dos órgãos públicos", d: "Regras escritas sugerem reforço ou monitoramento e encaminham para segurança, Obras, Iluminação ou Mobilidade. Quem está em campo relata, o gestor vistoria e abre a ordem." },
  ];

  return (
    <main className={`${display.variable} ${texto.variable} bu-landing min-h-screen`}>
      {/* Herói */}
      <section className="relative flex min-h-[640px] flex-col overflow-hidden bg-forest text-mint lg:h-[100svh]">
        <header className="relative z-20 border-b border-mint/10 bg-forest/85 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 px-6 py-3.5 lg:px-10">
            <span className="flex items-center gap-2.5">
              <svg aria-hidden="true" viewBox="0 0 32 32" className="h-8 w-8 shrink-0">
                <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M22.5 9.5 17.6 17.6 9.5 22.5 14.4 14.4Z" fill="#eefbf3" />
                <path d="M22.5 9.5 17.6 17.6 14.4 14.4Z" fill="#b91c1c" />
              </svg>
              <span>
                <span className="block font-display text-2xl font-bold leading-none tracking-tight">Bússola Urbana</span>
                <span className="mt-1 hidden text-xs text-mint/60 sm:block">UPX I, Análise e Desenvolvimento de Sistemas, Facens</span>
              </span>
            </span>
            <nav aria-label="Escolha como entrar" className="grid w-full grid-cols-2 gap-2 sm:w-auto">
              <Link href="/gestor" className="bu-entrada bg-mint text-forest hover:bg-mint-100">
                <span className="block font-display text-base font-semibold leading-tight">Entrar como gestor</span>
                <span className="block text-xs text-forest/70">Prefeitura e forças de segurança</span>
              </Link>
              <Link href="/cidadao" className="bu-entrada border border-mint/35 text-mint hover:border-mint/80">
                <span className="block font-display text-base font-semibold leading-tight">Entrar em campo</span>
                <span className="block text-xs text-mint/65">Policiais, fiscais e cidadãos</span>
              </Link>
            </nav>
          </div>
        </header>

        {/* Mapa de borda a borda, com o texto por cima à esquerda */}
        <figure className="relative h-[78svh] min-h-[460px] lg:h-auto lg:flex-1">
          <MapaDados ocorrencias={ocorrencias} areas={areas} ano={meta.periodo_fim.slice(0, 4)} />
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 hidden w-[46%] bg-gradient-to-r from-forest via-forest/80 to-transparent lg:block" />
          <div className="relative z-10 flex h-full flex-col justify-between px-6 py-8 lg:max-w-[40rem] lg:px-10 lg:py-12">
            <div className="rounded-2xl bg-forest/70 p-4 backdrop-blur-sm lg:bg-transparent lg:p-0 lg:backdrop-blur-0">
              <h1 className="max-w-[16ch] text-balance font-display text-[clamp(1.9rem,3.6vw,3.25rem)] font-bold leading-[1.04] tracking-[-0.025em]">Onde as ocorrências se concentram em Sorocaba</h1>
              <p className="mt-4 max-w-[42ch] text-pretty leading-relaxed text-mint/75 lg:text-lg">
                <b className="font-medium tabular-nums text-mint">{n(meta.n_total)} registros</b> da SSP-SP de furto, roubo e tráfico, de {periodo}, agrupados em <b className="font-medium tabular-nums text-mint">{meta.n_areas} áreas de atenção</b>. Cada área tem um índice de 0 a 100, com o cálculo à vista.
              </p>
            </div>
            <figcaption className="hidden space-y-1 lg:block">
              <span className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-mint/75">
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full border-2 border-[#b91c1c]" />{altas} áreas de alta prioridade</span>
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full border-2 border-[#d97706]" />média prioridade</span>
              </span>
              <span className="block max-w-[52ch] text-xs text-mint/50">Cada ponto é uma ocorrência registrada pela SSP-SP. O pulso repete os registros em ordem; não é tempo real.</span>
            </figcaption>
          </div>
        </figure>

        <Letreiro ocorrencias={ocorrencias} areas={areas} ano={meta.periodo_fim.slice(0, 4)} />
      </section>

      {/* Como funciona: a linha é desenhada etapa por etapa, na ordem do fluxo de dados */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <Revela>
          <h2 className="r max-w-[20ch] font-display text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.02] tracking-[-0.025em]">Do boletim de ocorrência à ordem de serviço</h2>
        </Revela>
        <Revela as="ol" className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {etapas.map((e, i) => (
            <li key={e.t} className="bu-etapa relative pt-5" style={{ ["--i" as string]: i }}>
              <span className="bu-num font-display text-5xl font-extrabold leading-none">{i + 1}</span>
              <div className="r">
                <h3 className="mt-3 font-display text-xl font-bold">{e.t}</h3>
                <p className="mt-2 max-w-[36ch] leading-relaxed text-forest/75">{e.d}</p>
              </div>
            </li>
          ))}
        </Revela>
      </section>

      {/* As duas entradas, com as telas reais do app */}
      <section className="overflow-hidden bg-forest text-mint">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <Revela>
            <h2 className="r max-w-[18ch] font-display text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.02] tracking-[-0.025em]">Duas formas de entrar, um só fluxo</h2>
            <p className="r mt-4 max-w-[56ch] text-lg leading-relaxed text-mint/70" style={{ ["--i" as string]: 1 }}>Quem está na rua aponta o problema. Quem decide vê o problema no mapa, ao lado do índice da área, e transforma em vistoria e ordem de serviço.</p>
          </Revela>
          <Revela className="mt-14 grid items-end gap-14 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:gap-16">
            <div className="r r-esq">
              <div className="overflow-hidden rounded-xl bg-forest-800 p-1.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,.6)] ring-1 ring-mint/15">
                <Image src="/telas/gestor.jpg" alt="Painel do gestor: indicadores, mapa de calor de Sorocaba e lista de zonas prioritárias" width={1568} height={759} sizes="(min-width: 1024px) 760px, 100vw" className="rounded-lg" />
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold">Gestor</h3>
              <p className="mt-1 max-w-[52ch] text-mint/70">Prefeitura e forças de segurança acompanham as áreas de atenção, leem os relatos de campo e abrem vistorias e ordens de zeladoria.</p>
              <Link href="/gestor" className="bu-botao mt-5 bg-mint text-forest hover:bg-mint-100">Entrar como gestor</Link>
            </div>
            <div className="r r-dir" style={{ ["--i" as string]: 1 }}>
              <div className="mx-auto w-full max-w-[300px] rounded-[2.2rem] bg-forest-800 p-2.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,.6)] ring-1 ring-mint/15">
                <Image src="/telas/campo.jpg" alt="Tela de campo: escolha do tipo de problema, ponto marcado no mapa e envio anônimo" width={401} height={873} sizes="300px" className="rounded-[1.7rem]" />
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold">Campo</h3>
              <p className="mt-1 max-w-[40ch] text-mint/70">Policiais, fiscais e cidadãos relatam pelo celular, sem login. O protocolo permite acompanhar o andamento.</p>
              <Link href="/cidadao" className="bu-botao mt-5 border-2 border-mint/60 text-mint hover:border-mint">Entrar em campo</Link>
            </div>
          </Revela>
        </div>
      </section>

      {/* Limites */}
      <section className="bg-mint-100">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:px-10 lg:py-24">
          <Revela>
            <h2 className="r max-w-[16ch] font-display text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.02] tracking-[-0.025em]">O que a Bússola não faz</h2>
          </Revela>
          <div className="space-y-8">
            <Revela as="dl" className="grid gap-6 sm:grid-cols-3">
              <div className="r border-t-2 border-forest pt-4"><dt className="font-display text-lg font-bold">Não prevê crime</dt><dd className="mt-1 text-forest/75">Mostra onde já houve concentração. A decisão continua com os órgãos públicos: prefeitura e forças de segurança.</dd></div>
              <div className="r border-t-2 border-forest pt-4" style={{ ["--i" as string]: 1 }}><dt className="font-display text-lg font-bold">Não avalia pessoas</dt><dd className="mt-1 text-forest/75">Trabalha com lugares e horários, nunca com perfis.</dd></div>
              <div className="r border-t-2 border-forest pt-4" style={{ ["--i" as string]: 2 }}><dt className="font-display text-lg font-bold">Não mistura relatos</dt><dd className="mt-1 text-forest/75">O relato de campo orienta a zeladoria, mas fica fora do índice.</dd></div>
            </Revela>
            <Revela>
              <p className="r max-w-[68ch] border-l-4 border-forest-600 pl-5 leading-relaxed text-forest/85">
                Testamos se as áreas se mantêm no tempo: treinando com janeiro a março, elas reuniram 39,9% das ocorrências de abril a junho. Uma seleção simples por densidade chegou a 41,8%. O agrupamento não ganhou em cobertura, mas gera áreas contínuas e fáceis de explicar. Os detalhes estão em <Link href="/gestor/analise" className="font-semibold underline decoration-forest-600/40 underline-offset-4 hover:decoration-forest-600">Análise, método e limites</Link>.
              </p>
            </Revela>
          </div>
        </div>
      </section>

      <footer className="bg-forest text-mint/70">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-12 text-sm sm:grid-cols-3 lg:px-10">
          <p><span className="font-semibold text-mint">Equipe</span><br />Luan, Igor, Yasmin e Hudson. Esquema de dados inicial de Hudson Albuquerque Machado.</p>
          <p><span className="font-semibold text-mint">Tecnologia</span><br />Next.js, Supabase com PostGIS, MapLibre e Python com scikit-learn.</p>
          <p><span className="font-semibold text-mint">Dados</span><br />{meta.fonte}. Relatos, vistorias e ordens de exemplo aparecem marcados como demonstrativos.</p>
        </div>
        <p className="mx-auto max-w-7xl px-6 pb-10 text-xs text-mint/45 lg:px-10">Projeto UPX I, Análise e Desenvolvimento de Sistemas, Facens, 2026.</p>
      </footer>
    </main>
  );
}

