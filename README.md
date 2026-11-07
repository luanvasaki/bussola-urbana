# Bússola Urbana

**Inteligência de dados para priorizar áreas de atenção em Sorocaba/SP.**

A Bússola Urbana usa os registros abertos de ocorrências da Secretaria da Segurança Pública de São Paulo (SSP-SP) para mostrar onde as ocorrências se concentram em Sorocaba e organizar essas áreas por um **Índice de Atenção** que dá para explicar. A decisão continua sendo de uma pessoa: o sistema apoia a escolha de onde vistoriar, iluminar ou reforçar a manutenção, mas não prevê crimes e não avalia pessoas.

- **Site:** https://bussola-urbana-app.vercel.app
- **Vídeo de apresentação:** https://www.youtube.com/watch?v=oJHUoOpUxeE
- **Projeto acadêmico:** Usina de Projetos Experimentais I (UPX 1), Análise e Desenvolvimento de Sistemas, Centro Universitário Facens, 2026, com o tema Cidades Inteligentes.
- **Orientação:** Profa. Ma. Brenda Medina de Oliveira

---

## Sumário

1. [O problema](#o-problema)
2. [O que o app faz](#o-que-o-app-faz)
3. [Método](#método)
4. [Dados: o que é real e o que é demonstrativo](#dados-o-que-é-real-e-o-que-é-demonstrativo)
5. [Validação](#validação)
6. [Arquitetura e tecnologia](#arquitetura-e-tecnologia)
7. [Estrutura do repositório](#estrutura-do-repositório)
8. [Como rodar](#como-rodar)
9. [Privacidade e ética](#privacidade-e-ética)
10. [Limites](#limites)
11. [Próximos passos](#próximos-passos)
12. [Equipe](#equipe)
13. [Links do projeto](#links-do-projeto)
14. [Referências](#referências)

---

## O problema

Prefeituras e polícias já produzem muitos dados, mas eles costumam ficar espalhados. Sem uma leitura reunida, a escolha de onde enviar uma equipe, trocar uma lâmpada ou limpar um terreno depende da percepção de quem decide, e fica difícil explicar essa escolha depois.

As tentativas de resolver isso costumam cair no policiamento preditivo, criticado porque repete os lugares onde a polícia já atuou e amplia o viés dos registros (Lum; Isaac, 2016). O problema tem, portanto, uma parte técnica, que é tirar um padrão de dados brutos, e uma parte ética, que é fazer isso sem criar uma ferramenta de vigilância.

**Pergunta de pesquisa:** como transformar registros abertos de ocorrências em uma lista de áreas de atenção, ordenada e fácil de explicar, para ajudar o gestor de Sorocaba, sem recorrer a policiamento preditivo e sem tratar pessoas como alvo?

Três regras guiaram o projeto desde o começo:

1. usar só dados abertos e agrupados por área;
2. não coletar dado pessoal;
3. deixar a decisão final com uma pessoa.

## O que o app faz

O app tem duas entradas, escolhidas na página inicial.

### Gestor (`/gestor`)
Para a prefeitura e as forças de segurança.

| Tela | O que mostra |
|---|---|
| **Painel** | Indicadores, mapa de calor das ocorrências oficiais com as áreas de atenção e as zonas prioritárias ordenadas pelo índice |
| **Relatos de campo** | Relatos com busca e filtros, e mudança de status (relato recebido, em análise municipal, encaminhado ao órgão responsável, concluído) |
| **Intervenções** | Registro de vistorias em campo e emissão de ordens de zeladoria para a secretaria responsável |
| **Áreas de atenção** | Tabela das 37 áreas com índice, prioridade, volume, período de pico e etapa do fluxo |
| **Detalhe da área** | Composição do índice, natureza das ocorrências, distribuição por período do dia, recomendação por regra e encaminhamentos sugeridos |
| **Análise e método** | Base de dados, método, distribuição por período e limites, incluindo o teste de persistência |

### Campo (`/cidadao`)
Para quem está na rua: policiais, fiscais ou cidadãos.

- **Mapa** com as áreas de atenção mais críticas.
- **Relato anônimo:** tipo de problema (iluminação, infraestrutura, uso do espaço), local e descrição opcional. Não pede nome, CPF, telefone nem e-mail.
- **Local do problema** de quatro jeitos: pelo **CEP**, pelo **nome da rua ou do bairro** (abreviações como "Av." e "XV" são entendidas), pela **localização do celular** ou tocando no mapa. O ponto encontrado aparece no mapa para ajuste fino.
- **Protocolo** gerado no envio, no formato `BU-2026-000123`.
- **Acompanhamento** do relato pelo protocolo, com uma linha do tempo de quatro etapas.

### Página de apresentação (`/`)
Página feita para a banca e para a feira: um mapa animado com as ocorrências reais, uma bússola que percorre as áreas de alta prioridade, um letreiro com registros em ordem cronológica, o método, as telas do app, a validação com usuários e os limites.

## Método

### 1. Dados
Ocorrências de **furto, roubo e tráfico** em Sorocaba, do portal de dados abertos da SSP-SP, mantendo só os registros com coordenada válida.

### 2. Agrupamento espacial (DBSCAN)
O DBSCAN (Ester et al., 1996), pela biblioteca scikit-learn, junta ocorrências próximas e descarta as isoladas.

- **Raio (`eps`) = 250 m**, cerca de duas quadras.
- **Mínimo (`min_samples`) = 20 ocorrências** dentro do raio.

O DBSCAN foi escolhido no lugar do k-Means por quatro motivos: não exige dizer antes quantas áreas existem, acompanha o formato real das ocorrências (ruas, praças, corredores de ônibus), descarta o caso isolado (ninguém é enviado a campo por um registro único) e tem uma regra que cabe numa frase. Os dois parâmetros são escolhas do grupo, não valores otimizados.

### 3. Índice de Atenção (0 a 100)

```
IA = (Fvol × 0,50) + (Ftemp × 0,50)
```

- **Fvol:** percentil da área em volume de ocorrências, comparada com as outras áreas.
- **Ftemp:** percentil da área em concentração no período do dia de pico (madrugada, manhã, tarde ou noite). Ocorrências "em hora incerta" nunca viram pico.

| Faixa | Índice | Sugestão |
|---|---|---|
| Alta | 70 ou mais | Vistoria imediata em campo |
| Média | 45 a 69 | Vistoria de rotina |
| Baixa | abaixo de 45 | Apenas acompanhar |

Exemplo: uma área no percentil 73 em volume e 70 em horário fica com IA ≈ 72, na faixa alta. Os pesos e as faixas são propostas do grupo, ainda não validadas em operação.

### 4. Recomendação por regra
Sem IA: regras escritas em `lib/rules.ts` sugerem reforço (alta) ou monitoramento (média) no período de pico, e encaminham para a Secretaria de Obras/Iluminação quando o ambiente predominante é via pública, ou para a Secretaria de Mobilidade quando muitas ocorrências envolvem veículo.

### 5. Fluxo de trabalho
Relato de campo → triagem do gestor → vistoria → ordem de zeladoria → conclusão. Cada área tem uma etapa: aguardando triagem, em vistoria, ordem emitida ou concluída.

## Dados: o que é real e o que é demonstrativo

| Natureza | O que é |
|---|---|
| **Real** | Ocorrências da SSP-SP, as áreas de atenção e o Índice de Atenção calculados sobre elas |
| **Demonstrativo** | Relatos, vistorias e ordens de exemplo, marcados como "de exemplo" no app |
| **Real, gerado no uso** | Relatos, vistorias e ordens enviados pelo site, gravados no Supabase |

O índice usa **só dado oficial**. O relato de campo orienta a zeladoria, mas nunca entra no cálculo.

**Sobre as bases:** o relatório e o artigo usam o conjunto consolidado do 1º semestre de 2026 (4.279 ocorrências, 23 áreas). Este app usa uma base mais nova, de **janeiro a setembro de 2026: 5.921 ocorrências e 37 áreas**, que reúnem 3.392 casos (57%). Por isso as contagens e as áreas diferem dos documentos entregues. O método é o mesmo.

## Validação

### Teste de persistência (dados reais)
O agrupamento foi treinado com as ocorrências de janeiro a março e testado com as de abril a junho. Como o treino tem metade do período, o mínimo por área foi ajustado para 10.

- As 26 áreas do treino reuniram **39,9%** das ocorrências do trimestre seguinte, perto dos 40,1% do próprio treino.
- Uma seleção simples por densidade, com células de 50 m cobrindo a mesma área, reuniu **41,8%**. O DBSCAN **não trouxe vantagem de cobertura**. Ele foi mantido porque forma áreas contínuas e fáceis de explicar.
- Com raio de 200 m e de 300 m, a cobertura foi de 23,4% e 56,9%. Os 250 m são uma escolha de projeto.
- O índice teve correlação fraca com o volume do trimestre seguinte (ρ de Spearman = 0,21; p = 0,30), enquanto o volume isolado teve correlação moderada (ρ = 0,44; p = 0,02). **O índice descreve o padrão do período e não demonstrou prever o volume futuro.**

### Entrevistas com usuários
Três entrevistas semiestruturadas, cada uma seguida de um teste com três tarefas no protótipo:

| Perfil | O que se observou | O que gerou |
|---|---|---|
| **Decisor**, coordenador operacional de batalhão da PM (29/10/2026) | Achou a área de maior atenção em segundos. Os dados consolidados da SSP chegam com cerca de dois meses de atraso. | Atualização automática e integração com o Infocrim, registradas em Próximos passos |
| **Agente de campo**, policial militar da Ronda Patrulha (30/10/2026) | Registrou a vistoria em cerca de 30 s. Sem protocolo, não sabia o que acontece depois do registro. | **Protocolo com acompanhamento** |
| **Munícipe**, estudante que circula a pé e de ônibus (02/11/2026) | Enviou o relato em cerca de 45 s. Pediu protocolo e prefere site a aplicativo. | O mesmo protocolo, e acesso de campo pelo navegador, sem instalar nada |

Os resultados são exploratórios: os participantes foram escolhidos por conveniência, dois são policiais e os tempos são estimados.

## Arquitetura e tecnologia

```
 SSP-SP (planilha)                                   Navegador
       │                                                 │
       ▼                                                 ▼
 analytics/pipeline.py ──► data/*.json ──► scripts/seed.mjs ──► Supabase (PostgreSQL + PostGIS)
 (pandas + scikit-learn,                                     ▲          │
  DBSCAN e índice)                                           │          ▼
                                       Server Actions (service role) ◄── Next.js 14 na Vercel
                                       relatos, vistorias, ordens        (App Router, React, Tailwind,
                                                                          MapLibre GL)
```

| Camada | Tecnologia |
|---|---|
| Interface | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| Mapas | MapLibre GL (app) e SVG/Canvas próprio (página de apresentação) |
| Banco | Supabase: PostgreSQL com PostGIS, gatilhos e Row Level Security |
| Análise | Python, pandas, scikit-learn (DBSCAN) |
| Hospedagem | Vercel (Node 24) |

**Modo demonstração:** sem as variáveis do Supabase, o app lê `data/*.json` e funciona só para leitura. O rodapé do menu do gestor mostra a origem: "Dados: supabase" ou "Dados: arquivo local".

## Estrutura do repositório

```
app/
  page.tsx                 Página de apresentação
  api/endereco/route.ts    Busca de CEP e endereço (ViaCEP e OpenStreetMap) para o relato de campo
  actions.ts               Server Actions: relato, vistoria, ordem, status
  gestor/                  Painel, relatos, intervenções, zonas, análise, login
  cidadao/                 Fluxo de campo: mapa, relatar, protocolo, acompanhar
components/
  landing/                 Mapa animado, bússola, letreiro, revelação na rolagem
  Painel.tsx, MapView.tsx, ...
lib/
  db.ts                    Leitura do Supabase com volta para os arquivos locais
  rules.ts                 Faixas de prioridade, recomendações e encaminhamentos
  auth.ts                  Senha opcional da área do gestor
analytics/pipeline.py      Pipeline de dados (DBSCAN e índice)
data/                      areas.json, ocorrencias.json, meta.json, demo.json
scripts/seed.mjs           Carga dos dados no Supabase
supabase/schema.sql        Tabelas, PostGIS, gatilhos e RLS
public/telas/              Capturas do app usadas na página inicial
```

## Como rodar

### Requisitos
- **Node 24.** A biblioteca do Supabase exige Node 22 ou mais novo.
- Python 3 com `pandas`, `scikit-learn` e `openpyxl`, só para regenerar os dados.

### Local, só leitura (sem banco)
```bash
npm install
npm run dev
```
Abra http://localhost:3000. Sem variáveis de ambiente, o app usa `data/*.json`.

### Com o Supabase
1. Crie um projeto no Supabase e rode `supabase/schema.sql` no SQL Editor (ou com `npx supabase db query --remote=<ref> -f supabase/schema.sql`).
2. Copie `.env.example` para `.env.local` e preencha a URL, a chave `anon` e a chave `service_role`.
3. Carregue os dados:
   ```bash
   npm run seed
   ```
4. `npm run dev`. O rodapé do gestor passa a mostrar "Dados: supabase".

| Variável | Onde | Uso |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | navegador e servidor | Endereço do projeto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | navegador e servidor | Leitura do dado oficial agregado |
| `SUPABASE_SERVICE_ROLE_KEY` | **só servidor** | Gravação de relatos, vistorias e ordens. Nunca use prefixo `NEXT_PUBLIC` nem publique esta chave |
| `GESTOR_PASSWORD` | servidor (opcional) | Protege `/gestor` com senha. Sem ela, a área fica aberta, como na demonstração da feira |

### Publicar na Vercel
Defina as variáveis acima em *Settings → Environment Variables* e publique:
```bash
npx vercel deploy --prod
```

### Atualizar os dados
```bash
pip install pandas scikit-learn openpyxl
python analytics/pipeline.py --entrada SPDadosCriminais_2026.xlsx --inicio 2026-01-01 --fim 2026-09-30
npm run seed
```

## Privacidade e ética

- **Relato anônimo:** sem nome, CPF, telefone ou e-mail. O protocolo é o único vínculo, e o formulário orienta a relatar problemas do lugar, nunca pessoas.
- **Endereço sem número:** o relato guarda só o nome da rua e o bairro, além do ponto no mapa. A busca de CEP e endereço é feita pelo servidor do app no ViaCEP e no OpenStreetMap (Nominatim), sem enviar nada do relato.
- **Acesso aos dados:** relatos, vistorias e ordens só são lidos e escritos pelo servidor, com a service role. O navegador lê apenas o dado oficial agregado, protegido por RLS.
- **Sem previsão e sem perfis:** o índice descreve onde as ocorrências já se concentraram, nunca quem as cometeu. O reconhecimento facial e a integração com o Banco Nacional de Mandados de Prisão ficaram fora do escopo de propósito.
- **Transparência:** cada parte do índice aparece no app, e a página de análise expõe os limites do método.

O projeto se alinha principalmente ao **ODS 11** (Cidades e Comunidades Sustentáveis) e, de forma secundária, ao **ODS 16** (Paz, Justiça e Instituições Eficazes).

## Limites

- Uma cidade e poucos meses de dados, então os resultados não se generalizam.
- Os registros mostram só o que chegou às autoridades, com o viés que isso traz (Lum; Isaac, 2016).
- O resultado do agrupamento muda bastante com o raio. Os pesos e as faixas do índice são escolhas do grupo.
- O índice não superou o volume isolado no teste de persistência.
- A validação com usuários foi exploratória: três pessoas, duas delas policiais.
- Os dados da SSP chegam com atraso e não há atualização em tempo real.
- O protocolo acompanha o status dado pelo gestor no app, mas ainda não está ligado ao sistema de quem executa o serviço.

## Próximos passos

- Ampliar a validação com mais gestores da prefeitura, agentes de campo e munícipes.
- Atualizar os dados automaticamente e integrar com o Infocrim.
- Ligar o protocolo ao sistema de quem executa o serviço.
- Incluir foto no relato de campo, como pediu o agente entrevistado.
- Usar séries mais longas para rever os pesos do índice e acompanhar o antes e depois das intervenções.
- Reduzir o raio para 60 a 80 m, aproximando a análise do nível de segmento de rua.
- Testar o método em outros municípios.
- Migrar para o Next.js 16.

## Equipe

| Integrante | Função |
|---|---|
| Luan Vasaki Morais Guimarães | Gestor do projeto (líder), arquitetura de dados, DBSCAN e relatório |
| Igor Kendi Grigoleto Takeyama | UI/UX: protótipo, design system e fluxos no Figma |
| Yasmin Alves Braga Carvalho | Pesquisa bibliográfica, revisão da documentação, landing page e banner |
| Hudson Albuquerque Machado | Banco de dados, repositório original e MVP low-code |

**Orientadora:** Profa. Ma. Brenda Medina de Oliveira

## Links do projeto

| | |
|---|---|
| Site (este app) | https://bussola-urbana-app.vercel.app |
| Repositório original (documentação e fluxo de dados) | https://github.com/hudsonam87/ADSEAD80_UPXITSN1_BussolaUrbana_InteligenciaUrbana |
| Protótipo no Figma (app web) | [abrir protótipo](https://www.figma.com/proto/2O0kJ7FHDVJPgvXw8MbKx8/UPX-I---B%C3%9ASSOLA-URBANA---AC2?node-id=1-10&starting-point-node-id=1%3A10&scaling=min-zoom&hide-ui=1) |
| Protótipo no Figma (app mobile) | [abrir protótipo](https://www.figma.com/proto/2O0kJ7FHDVJPgvXw8MbKx8/UPX-I---B%C3%9ASSOLA-URBANA---AC2?node-id=1-2403&starting-point-node-id=1%3A2403&scaling=min-zoom&hide-ui=1) |
| Landing page (Figma) | https://www.figma.com/site/Bxk12K881G6ukxJJBtej1u/Projeto-UPX |
| Vídeo pitch | https://youtu.be/oJHUoOpUxeE |
| Banner | https://canva.link/j91lc7o71tap635 |
| Trello | https://trello.com/b/zABNfg66/mvp-bussola-urbana-upx |

## Referências

- BRANTINGHAM, P. L.; BRANTINGHAM, P. J. Environment, routine, and situation: toward a pattern theory of crime. In: CLARKE, R. V.; FELSON, M. (ed.). *Routine activity and rational choice*. New Brunswick: Transaction, 1993. p. 259-294.
- CAPDEVILA, I.; ZARLENGA, M. I. Smart city or smart citizens? The Barcelona case. *Journal of Strategy and Management*, v. 8, n. 3, p. 266-282, 2015. DOI: 10.1108/JSMA-03-2015-0030.
- CHALFIN, A. et al. Reducing crime through environmental design: evidence from a randomized experiment of street lighting in New York City. *Journal of Quantitative Criminology*, v. 38, n. 1, p. 127-157, 2022. DOI: 10.1007/s10940-020-09490-6.
- ESTER, M. et al. A density-based algorithm for discovering clusters in large spatial databases with noise. In: *Proceedings of KDD-96*. Menlo Park: AAAI Press, 1996. p. 226-231.
- IBGE. *Censo Demográfico 2022*. Rio de Janeiro: IBGE, 2022. SIDRA, tabela 4709.
- JEFFERY, C. R. *Crime prevention through environmental design*. Beverly Hills: Sage, 1971.
- LUM, K.; ISAAC, W. To predict and serve? *Significance*, v. 13, n. 5, p. 14-19, 2016. DOI: 10.1111/j.1740-9713.2016.00960.x.
- PEDREGOSA, F. et al. Scikit-learn: machine learning in Python. *Journal of Machine Learning Research*, v. 12, p. 2825-2830, 2011.
- SÃO PAULO (Estado). Secretaria da Segurança Pública. *Dados abertos de criminalidade*. Disponível em: https://www.ssp.sp.gov.br/estatistica/consultas.
- WELSH, B. C.; FARRINGTON, D. P.; DOUGLAS, S. The impact and policy relevance of street lighting for crime prevention. *Criminology & Public Policy*, v. 21, n. 3, p. 739-765, 2022. DOI: 10.1111/1745-9133.12585.

---

Bússola Urbana é um protótipo acadêmico de apoio à decisão. Não é um produto comercial, não prevê crimes e não avalia pessoas.
