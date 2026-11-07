import Link from "next/link";
import Image from "next/image";
import { getPublico } from "@/lib/db";
import { prioridade } from "@/lib/rules";
import MapaDados from "@/components/landing/MapaDados";
import Letreiro from "@/components/landing/Letreiro";
import Revela from "@/components/landing/Revela";
import ComoFunciona from "@/components/landing/ComoFunciona";
import DemoTelas from "@/components/landing/DemoTelas";
import Video from "@/components/landing/Video";

export const dynamic = "force-dynamic";

const n = (v: number) => v.toLocaleString("pt-BR");
const mes = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR", { month: "long" });

export default async function Home() {
  const { areas, ocorrencias, meta } = await getPublico();
  const altas = areas.filter((a) => prioridade(a.indice) === "Alta").length;
  const pctAreas = Math.round((meta.n_em_areas / meta.n_total) * 100);
  const periodo = `${mes(meta.periodo_inicio)} a ${mes(meta.periodo_fim)} de ${meta.periodo_fim.slice(0, 4)}`;

  const etapas = [
    { t: "Dados oficiais", d: `Boletins da SSP-SP de Sorocaba, de ${periodo}. Ficam só furto, roubo e tráfico com coordenada válida: ${n(meta.n_total)} ocorrências.` },
    { t: "Áreas de atenção", d: `O DBSCAN junta as ocorrências que estão perto umas das outras. Resultado: ${meta.n_areas} áreas que reúnem ${pctAreas}% dos casos.`,
      extra: "O que é o DBSCAN? Um método que procura aglomerados no mapa. Em volta de cada ocorrência, ele olha um raio de 250 m: se houver pelo menos 20 casos ali, forma um grupo, que vai crescendo pelos vizinhos. Casos isolados ficam de fora." },
    { t: "Índice de Atenção", d: "Nota de 0 a 100: metade vem do volume da área, metade de quanto os casos se concentram num período do dia. As duas partes aparecem no painel." },
    { t: "Ação dos órgãos públicos", d: "Regras escritas sugerem reforço ou monitoramento e encaminham para segurança, Obras, Iluminação ou Mobilidade. Quem está em campo relata, o gestor vistoria e abre a ordem." },
  ];

  return (
    <main id="conteudo" className="bu-landing min-h-screen">
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

        {/* Computador: mapa de borda a borda, com o texto por cima à esquerda. Celular: texto acima e mapa inteiro logo abaixo. */}
        <figure className="flex flex-col lg:relative lg:block lg:flex-1">
          <div className="relative h-[68svh] min-h-[400px] overflow-hidden lg:absolute lg:inset-0 lg:h-auto lg:min-h-0 lg:overflow-visible">
            <MapaDados ocorrencias={ocorrencias} areas={areas} ano={meta.periodo_fim.slice(0, 4)} />
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 hidden w-[46%] bg-gradient-to-r from-forest via-forest/80 to-transparent lg:block" />
          <div className="relative z-10 order-first px-6 pb-2 pt-7 lg:order-none lg:flex lg:h-full lg:max-w-[40rem] lg:flex-col lg:justify-between lg:px-10 lg:py-12">
            <div>
              <h1 className="max-w-[16ch] text-balance font-display text-[clamp(1.9rem,3.6vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.015em]">Onde as ocorrências se concentram em Sorocaba</h1>
              <dl className="mt-5 flex gap-x-8 border-b-[3px] border-mint/70 pb-4 lg:max-w-[30rem]">
                <div className="flex flex-col-reverse"><dt className="rotulo mt-2 text-mint/70">registros da SSP-SP</dt><dd className="font-display text-[2.4rem] font-bold leading-[0.9] tracking-[-0.02em] sm:text-[clamp(2.6rem,4.4vw,3.6rem)]">{n(meta.n_total)}</dd></div>
                <div className="flex flex-col-reverse"><dt className="rotulo mt-2 text-mint/70">áreas de atenção</dt><dd className="font-display text-[2.4rem] font-bold leading-[0.9] tracking-[-0.02em] sm:text-[clamp(2.6rem,4.4vw,3.6rem)]">{meta.n_areas}</dd></div>
              </dl>
              <p className="mt-4 max-w-[42ch] text-pretty leading-relaxed text-mint/75">
                Furto, roubo e tráfico de {periodo}. Cada área tem um índice de 0 a 100, com o cálculo à vista.
              </p>
              <a href="#video" className="mt-5 hidden items-center lg:inline-flex gap-2.5 rounded-md border border-mint/35 py-2 pl-2 pr-4 text-sm font-medium text-mint transition-colors hover:border-mint/80">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-mint text-forest"><svg aria-hidden="true" viewBox="0 0 24 24" className="ml-0.5 h-3.5 w-3.5" fill="currentColor"><path d="M8 5.5v13l10.5-6.5z" /></svg></span>
                Assistir ao vídeo de apresentação
              </a>
            </div>
            <figcaption className="hidden space-y-1 lg:block">
              <span className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-mint/75">
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full border-2 border-[#b91c1c]" />{altas} áreas de alta prioridade</span>
                <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full border-2 border-[#d97706]" />média prioridade</span>
              </span>
              <span className="block max-w-[52ch] text-xs text-mint/65">Cada ponto é uma ocorrência registrada pela SSP-SP; quanto mais escuro o verde, mais registros ao redor. O pulso repete os registros mês a mês, com destaque para os que estão dentro das áreas de atenção; não é tempo real. Ruas: © colaboradores do OpenStreetMap.</span>
            </figcaption>
          </div>
        </figure>

        <Letreiro ocorrencias={ocorrencias} areas={areas} ano={meta.periodo_fim.slice(0, 4)} />
      </section>

      {/* Como funciona: um lápis desenha etapa por etapa, seguindo as setas */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <Revela>
          <h2 className="r max-w-[20ch] font-display text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.015em]">Do boletim de ocorrência à ordem de serviço</h2>
        </Revela>
        <ComoFunciona etapas={etapas} />
      </section>

      {/* As duas entradas, com as telas reais do app */}
      <section className="overflow-hidden bg-forest text-mint">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
          <Revela>
            <h2 className="r max-w-[18ch] font-display text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.015em]">Duas formas de entrar, um só fluxo</h2>
            <p className="r mt-4 max-w-[56ch] text-lg leading-relaxed text-mint/70" style={{ ["--i" as string]: 1 }}>Quem está na rua aponta o problema. Quem decide vê o problema no mapa, ao lado do índice da área, e transforma em vistoria e ordem de serviço.</p>
          </Revela>
          <DemoTelas />
        </div>
      </section>

      {/* Validação com usuários (relatório da AF, seção 9) */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
        <Revela>
          <h2 className="r max-w-[20ch] font-display text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.015em]">Testado com quem vai usar</h2>
          <p className="r mt-4 max-w-[60ch] text-lg leading-relaxed text-forest/75" style={{ ["--i" as string]: 1 }}>Três entrevistas, cada uma seguida de um teste com três tarefas no protótipo. Dois dos três pediram a mesma coisa, e o pedido virou parte do app.</p>
        </Revela>
        <Revela as="ol" className="mt-12 grid gap-8 md:grid-cols-3">
          {[
            { d: "29 de outubro", q: "Decisor", p: "Coordenador operacional de um batalhão da PM", v: "Achou a área de maior atenção em segundos. Para usar na sala de operações, pediu dados atualizados de hora em hora e integração com o Infocrim." },
            { d: "30 de outubro", q: "Agente de campo", p: "Policial militar da Ronda Patrulha", v: "Registrou a vistoria em cerca de 30 segundos. Hoje relata problemas da rua e nunca sabe se o pedido andou, por isso pediu um protocolo." },
            { d: "2 de novembro", q: "Munícipe", p: "Estudante que circula a pé e de ônibus", v: "Enviou o relato anônimo em cerca de 45 segundos. Pediu protocolo e preferiu um site a um aplicativo que ocupe memória do celular." },
          ].map((e, i) => (
            <li key={e.q} className="r rounded-md border-[1.5px] border-forest/25 p-6" style={{ ["--i" as string]: i }}>
              <span className="text-sm text-forest/70">{e.d}</span>
              <h3 className="mt-2 font-display text-xl font-bold">{e.q}</h3>
              <p className="text-sm text-forest/70">{e.p}</p>
              <p className="mt-3 leading-relaxed text-forest/80">{e.v}</p>
            </li>
          ))}
        </Revela>
        <Revela>
          <p className="r mt-10 max-w-[68ch] border-l-4 border-forest-600 pl-5 leading-relaxed text-forest/85">O que mudou: o relato de campo passou a gerar um <b className="font-semibold text-forest">número de protocolo com acompanhamento</b>, e o acesso de campo funciona pelo navegador, sem instalar nada. As entrevistas são exploratórias, com participantes escolhidos por conveniência, e indicam a direção do produto, sem generalização.</p>
        </Revela>
      </section>

      {/* Vídeo pitch da equipe */}
      <section id="video" className="scroll-mt-6 bg-forest text-mint">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:px-10 lg:py-28">
          <Revela>
            <h2 className="r max-w-[14ch] font-display text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.015em]">A equipe apresenta a Bússola</h2>
            <p className="r mt-4 max-w-[40ch] text-lg leading-relaxed text-mint/70" style={{ ["--i" as string]: 1 }}>O vídeo pitch do projeto: o problema, a solução e como chegamos até aqui.</p>
            <a href="https://www.youtube.com/watch?v=oJHUoOpUxeE" target="_blank" rel="noopener noreferrer" className="r mt-6 inline-block text-sm text-mint/70 underline decoration-mint/40 underline-offset-4 hover:text-mint hover:decoration-mint" style={{ ["--i" as string]: 2 }}>Abrir no YouTube</a>
          </Revela>
          <Revela>
            <div className="r r-dir"><Video id="oJHUoOpUxeE" titulo="Bússola Urbana, pitch UPX I, Facens 2026" /></div>
          </Revela>
        </div>
      </section>

      {/* Limites */}
      <section className="bg-mint-100">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:px-10 lg:py-24">
          <Revela>
            <h2 className="r max-w-[16ch] font-display text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.015em]">O que a Bússola não faz</h2>
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
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 text-sm sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
          <div><p className="font-semibold text-mint">Equipe</p><ul className="mt-1 space-y-0.5"><li>Luan Vasaki Morais Guimarães</li><li>Igor Kendi Grigoleto Takeyama</li><li>Yasmin Alves Braga Carvalho</li><li>Hudson Albuquerque Machado</li></ul></div>
          <p><span className="font-semibold text-mint">Orientação</span><br />Profa. Ma. Brenda Medina de Oliveira</p>
          <div><p className="font-semibold text-mint">Tecnologia</p><ul className="mt-1 space-y-0.5"><li>Next.js e React</li><li>Supabase com PostGIS</li><li>MapLibre e OpenStreetMap</li><li>Python com scikit-learn</li><li>Vercel</li></ul><a href="https://github.com/luanvasaki/bussola-urbana" className="mt-2 inline-block underline decoration-mint/40 underline-offset-4 hover:decoration-mint">Código no GitHub</a></div>
          <p><span className="font-semibold text-mint">Dados</span><br />{meta.fonte}. Relatos, vistorias e ordens criados para a apresentação aparecem marcados como de exemplo. Ruas do mapa: © colaboradores do OpenStreetMap.</p>
        </div>
        <p className="mx-auto max-w-7xl px-6 pb-10 text-xs text-mint/65 lg:px-10">Usina de Projetos Experimentais I (UPX 1), Análise e Desenvolvimento de Sistemas, Centro Universitário Facens, Sorocaba, 2026. Alinhado aos ODS 11 e 16.</p>
      </footer>
    </main>
  );
}

