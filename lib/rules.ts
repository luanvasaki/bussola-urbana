import type { Area } from "./types";
export const FAIXA: Record<string, string> = { "De madrugada": "0h–6h", "Pela manhã": "6h–12h", "A tarde": "12h–18h", "A noite": "18h–24h" };
export const PERIODO_CURTO: Record<string, string> = { "De madrugada": "madrugada", "Pela manhã": "pela manhã", "A tarde": "à tarde", "A noite": "à noite" };
// Faixas documentadas no relatório e no artigo: alta ≥ 70, média 45–69, baixa < 45.
export const prioridade = (i: number) => (i >= 70 ? "Alta" : i >= 45 ? "Média" : "Baixa") as "Alta" | "Média" | "Baixa";
export const COR = { Alta: "#b91c1c", Média: "#d97706", Baixa: "#1f6b4e" } as const;

// A base da SSP traz bairros em caixa alta e sem acento ("VILA MINEIRAO"). Padroniza e devolve os acentos conhecidos.
const ACENTOS: Record<string, string> = {
  Mineirao: "Mineirão", Barao: "Barão", Cecilia: "Cecília", Rosalia: "Rosália", America: "América", Betania: "Betânia", Sao: "São",
  Tres: "Três", Vitoria: "Vitória", Regia: "Régia", Hortencia: "Hortência", Espirito: "Espírito", Olimpia: "Olímpia", Eugenia: "Eugênia",
  Joao: "João", Jose: "José", Antonio: "Antônio", Conceicao: "Conceição", Paraiso: "Paraíso", Gloria: "Glória", Lucia: "Lúcia",
};
const MINUSCULAS = new Set(["de", "da", "do", "das", "dos", "di", "e"]);
export const nomeBairro = (s: string) =>
  s.trim().toLowerCase().split(/\s+/).map((w, i) => {
    if (i > 0 && MINUSCULAS.has(w)) return w;
    if (/^(i{1,3}|iv|vi{1,3}|ix)$/.test(w)) return w.toUpperCase(); // "Vila Hortência III"
    const t = w.charAt(0).toUpperCase() + w.slice(1);
    return ACENTOS[t] ?? t;
  }).join(" ");

/** Rótulo do período do dia com crase ("À tarde"); as chaves vêm assim da base. */
export const rotuloPeriodo = (k: string) => ({ "A tarde": "À tarde", "A noite": "À noite" } as Record<string, string>)[k] ?? k;
export const NATUREZA_ROTULO: Record<string, string> = { furto: "Furto", roubo: "Roubo", trafico: "Tráfico" };

// Regras de negócio especificadas em docs/ARQUITETURA.md — transparentes, sem IA.
export function recomendacao(a: Area): string {
  if (a.periodo_pico === "não disponível") return "Volume relevante, mas sem horário confiável nos boletins.";
  const fx = (FAIXA[a.periodo_pico] ?? "").toLowerCase();
  let t = a.indice >= 70 ? `Avaliar reforço preventivo no período ${fx}.` : a.indice >= 45 ? `Concentração moderada: monitorar, principalmente ${fx}.` : "Concentração dentro da faixa comum da região.";
  if (a.pct_hora_incerta >= 20) t += ` (${Math.round(a.pct_hora_incerta)}% dos casos sem horário preciso.)`;
  return t;
}
export function encaminhamentos(a: Area): string[] {
  const out: string[] = [];
  if (a.indice >= 45 && a.ambiente_top === "Via Pública") out.push("Secretaria de Obras / Iluminação (ambiente predominante: via pública)");
  if (a.indice >= 45 && a.pct_veiculo >= 15) out.push(`Secretaria de Mobilidade (${Math.round(a.pct_veiculo)}% das ocorrências envolvem veículo)`);
  return out;
}

export const CATEGORIAS = [
  { nome: "Lâmpada apagada", eixo: "Iluminação", sev: "Alta" },
  { nome: "Iluminação queimada", eixo: "Iluminação", sev: "Alta" },
  { nome: "Ponto cego / local escuro", eixo: "Iluminação", sev: "Alta" },
  { nome: "Calçada danificada", eixo: "Infraestrutura", sev: "Média" },
  { nome: "Buraco na via", eixo: "Infraestrutura", sev: "Média" },
  { nome: "Vandalismo", eixo: "Uso do espaço", sev: "Média" },
  { nome: "Mato alto em terreno", eixo: "Uso do espaço", sev: "Baixa" },
] as const;
export const ETAPAS = ["Relato recebido", "Em análise municipal", "Encaminhado ao órgão responsável", "Concluído"] as const;
export const ETAPA_DESC = ["Registrado com localização aproximada", "A equipe municipal avalia o relato", "Ex.: iluminação pública", "Status atualizado neste protocolo"];
export const WORKFLOW = ["Aguardando triagem", "Em vistoria", "Ordem emitida", "Concluída"] as const;
