import type { Area } from "./types";
export const FAIXA: Record<string, string> = { "De madrugada": "0h–6h", "Pela manhã": "6h–12h", "A tarde": "12h–18h", "A noite": "18h–24h" };
export const PERIODO_CURTO: Record<string, string> = { "De madrugada": "madrugada", "Pela manhã": "pela manhã", "A tarde": "à tarde", "A noite": "à noite" };
export const prioridade = (i: number) => (i >= 70 ? "Alta" : i >= 50 ? "Média" : "Baixa") as "Alta" | "Média" | "Baixa";
export const COR = { Alta: "#b91c1c", Média: "#d97706", Baixa: "#1f6b4e" } as const;

export const nomeBairro = (s: string) =>
  s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase()).replace(/ (Dos|Das|De|Do|Da|E) /g, (m) => m.toLowerCase());

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
