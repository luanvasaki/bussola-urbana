import { getPublico } from "@/lib/db";
import { Aviso } from "@/components/ui";
export default async function Page() {
  const { meta, ocorrencias: oc, areas } = await getPublico();
  const per = ["De madrugada", "Pela manhã", "A tarde", "A noite", "Em hora incerta"].map((k) => [k, oc.filter((o) => o.periodo === k).length] as const);
  const nat = (["furto", "roubo", "trafico"] as const).map((k) => [k, oc.filter((o) => o.natureza === k).length] as const);
  const max = Math.max(...per.map((p) => p[1]));
  return <div className="max-w-3xl space-y-4"><h1 className="text-2xl font-bold">Análise, método e limites</h1>
    <section className="card space-y-2 p-4 text-sm"><h2 className="font-bold">Base de dados</h2>
      <p>{meta.fonte}. Furto, roubo e tráfico em Sorocaba com coordenada válida, de {meta.periodo_inicio} a {meta.periodo_fim}: <b>{meta.n_total.toLocaleString("pt-BR")}</b> ocorrências, das quais <b>{meta.n_em_areas.toLocaleString("pt-BR")}</b> ({Math.round((meta.n_em_areas / meta.n_total) * 100)}%) em {areas.length} áreas de atenção.</p>
      <p className="text-xs text-forest/60">Natureza: {nat.map(([k, n]) => `${k} ${n}`).join(" · ")}.</p></section>
    <section className="card space-y-2 p-4 text-sm"><h2 className="font-bold">Como as áreas e o índice são calculados</h2>
      <ol className="list-decimal space-y-1 pl-5"><li>Agrupamento espacial DBSCAN (scikit-learn): raio de 250 m e mínimo de 20 ocorrências por área.</li><li>Índice de Atenção = 50% percentil de volume + 50% percentil de concentração no período do dia de maior incidência.</li><li>“Em hora incerta” nunca vira horário de pico.</li><li>Recomendação por regra condicional (índice ≥ 70: reforço; ≥ 45: monitorar). Não é modelo de IA.</li></ol></section>
    <section className="card space-y-2 p-4"><h2 className="font-bold">Ocorrências por período do dia</h2>{per.map(([k, n]) => <div key={k} className="flex items-center gap-2 text-sm"><span className="w-32">{k}</span><div className="h-2 flex-1 rounded-full bg-black/10"><div className="h-full rounded-full bg-forest-600" style={{ width: `${(n / max) * 100}%` }} /></div><span className="w-12 text-right">{n}</span></div>)}</section>
    <Aviso><b>Limites.</b> Teste de persistência (treino jan–mar, teste abr–jun): as áreas reuniram 39,9% das ocorrências do teste; uma seleção simples por densidade, na mesma área, reuniu 41,8%. Ou seja, o agrupamento não trouxe vantagem de cobertura; ele forma áreas contínuas e fáceis de explicar. Os parâmetros (250 m, mínimo 20) não passaram por teste de sensibilidade completo. A base de dados desta versão (jan–set/2026) é mais nova que a do relatório (jan–jun), por isso contagens e áreas diferem do documento entregue. O sistema apoia a decisão; não prevê crime e não avalia pessoas.</Aviso></div>;
}
