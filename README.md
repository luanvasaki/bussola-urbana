# Bússola Urbana (MVP web)

Projeto acadêmico UPX I (ADS, Facens). Next.js 14 + TypeScript + Tailwind + MapLibre GL + Supabase (PostgreSQL/PostGIS) + Python (scikit-learn).

Dois fluxos: **gestor** (`/gestor`: painel, zonas, ocorrências/relatos, intervenções) e **campo** (`/cidadao`: relato anônimo feito por policiais, fiscais ou cidadãos, protocolo, acompanhamento).

## Dado real × demonstrativo
- Real: ocorrências SSP-SP (furto, roubo, tráfico, Sorocaba) e as áreas/índices calculados sobre elas.
- Demonstrativo: relatos de campo, vistorias e ordens de exemplo (marcados no app).
- O índice usa só dado oficial; relato de campo nunca entra no cálculo. Backtest: o agrupamento não superou a densidade simples (ver /gestor/analise).

## Rodar local (sem Supabase, só leitura)
Requer Node 24 (a biblioteca do Supabase exige Node 22+).
```
npm install
npm run dev
```
Sem variáveis de ambiente o app lê `data/*.json` (modo demonstração, sem gravar).

## Ligar o Supabase
1. Crie o projeto no Supabase. No SQL Editor, rode `supabase/schema.sql` (ativa PostGIS e cria tabelas, triggers e RLS).
2. Copie `.env.example` para `.env.local` e preencha as chaves.
3. `npm run seed` carrega áreas, ocorrências e os dados demonstrativos.
4. `npm run dev`: o rodapé do menu passa a mostrar "Dados: supabase" e relatos/vistorias/ordens gravam no banco.

## Publicar na Vercel
Produção: https://bussola-urbana-app.vercel.app. Defina as variáveis do `.env.example` em Environment Variables (a service role SEM prefixo NEXT_PUBLIC; `GESTOR_PASSWORD` é opcional — sem ela o /gestor fica aberto) e faça o deploy (`npx vercel deploy --prod`).

## Atualizar os dados (Python)
```
pip install pandas scikit-learn openpyxl
python analytics/pipeline.py --entrada SPDadosCriminais_2026.xlsx --fim 2026-09-30
npm run seed
```
O pipeline filtra Sorocaba, roda DBSCAN (250 m, mín. 20) e calcula o Índice de Atenção (50% percentil de volume + 50% percentil de concentração no período do dia).

## Privacidade
Relato anônimo: sem nome, CPF, telefone ou e-mail; o protocolo é o único vínculo. Relatos, vistorias e ordens só são lidos/escritos pelo servidor (service role); o navegador lê apenas dado oficial agregado (RLS).

## Limites
Apoio à decisão: não prevê crime nem avalia pessoas. Esta base (jan–set/2026) é mais nova que a do relatório (jan–jun), então contagens e áreas diferem do documento entregue.
Créditos: esquema de dados inicial de Hudson Albuquerque Machado; Luan, Igor, Yasmin e Hudson (grupo).
