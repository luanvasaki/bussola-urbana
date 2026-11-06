"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { admin } from "@/lib/db";
import { COOKIE, token } from "@/lib/auth";
import { CATEGORIAS, ETAPAS, prioridade } from "@/lib/rules";

const SEM_DB = "Banco não configurado: o app está em modo demonstração (somente leitura). Configure o Supabase para gravar.";
async function exigeGestor() {
  const t = await token();
  if (t && cookies().get(COOKIE)?.value !== t) throw new Error("Não autorizado");
}

export async function entrar(_: unknown, fd: FormData) {
  const t = await token();
  if (!t) redirect("/gestor");
  if (String(fd.get("senha") ?? "") !== process.env.GESTOR_PASSWORD) return { erro: "Senha incorreta." };
  cookies().set(COOKIE, t, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 12, path: "/" });
  redirect("/gestor");
}
export async function sair() { cookies().delete(COOKIE); redirect("/gestor/login"); }

// ---- Cidadão: relato anônimo, sem login e sem dado pessoal ----
export async function criarRelato(_: unknown, fd: FormData) {
  // Campo invisível para pessoas: só robôs preenchem. Finge que deu certo para não ensinar o robô.
  if (String(fd.get("site") ?? "")) redirect("/cidadao");
  const cat = CATEGORIAS.find((c) => c.nome === fd.get("categoria"));
  const lat = Number(fd.get("lat")), lon = Number(fd.get("lon"));
  if (!cat) return { erro: "Escolha o tipo de problema." };
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -23.65 || lat > -23.35 || lon < -47.6 || lon > -47.3) return { erro: "Marque o local: busque o CEP ou a rua, use sua localização ou toque no mapa, dentro de Sorocaba." };
  const descricao = String(fd.get("descricao") ?? "").trim().slice(0, 400);
  const texto = (k: string) => String(fd.get(k) ?? "").trim().slice(0, 120) || null; // só nome de rua e bairro, sem número
  const db = admin();
  if (!db) return { erro: SEM_DB };
  // Freio contra envio em massa sem guardar IP (o relato é anônimo): limite global por minuto, folgado para a feira
  const { count } = await db.from("relatos").select("id", { count: "exact", head: true }).gte("criado_em", new Date(Date.now() - 60_000).toISOString());
  if ((count ?? 0) >= 40) return { erro: "Muitos relatos chegaram neste minuto. Aguarde um pouco e envie de novo." };
  const { data, error } = await db.from("relatos").insert({ categoria: cat.nome, eixo: cat.eixo, severidade: cat.sev, descricao: descricao || null, lat, lon, rua: texto("rua"), bairro: texto("bairro") }).select("protocolo").single();
  if (error) return { erro: "Não foi possível registrar agora. Tente novamente." };
  redirect(`/cidadao/protocolo/${data.protocolo}`);
}

// ---- Gestor ----
const SECRETARIAS = ["Secretaria de Obras / Iluminação", "Secretaria de Mobilidade", "Zeladoria"];
const STATUS_ORDEM = ["Pendente", "Em andamento", "Concluída"];
const campo = (fd: FormData, k: string, max: number) => String(fd.get(k) ?? "").trim().slice(0, max);
type Res = { erro?: string; ok?: string };
const falha = (onde: string, e: unknown): Res => { console.error(`Erro em ${onde}:`, e); return { erro: "Não foi possível salvar agora. Tente novamente." }; };
const atualiza = () => { revalidatePath("/gestor", "layout"); revalidateTag("publico"); };

// O andamento da área leva junto os relatos de campo dela, para quem relatou acompanhar pelo protocolo.
// Só avança (nunca volta) e não mexe no índice: relato continua fora do cálculo.
async function avancaRelatos(db: NonNullable<ReturnType<typeof admin>>, area_id: number, para: (typeof ETAPAS)[number]) {
  const antes = ETAPAS.slice(0, ETAPAS.indexOf(para));
  const { data, error } = await db.from("relatos").update({ status: para }).eq("area_id", area_id).in("status", antes).select("id");
  if (error) console.error("Erro ao avançar relatos:", error);
  return data?.length ?? 0;
}
const relatosTxt = (n: number) => n === 0 ? "" : n === 1 ? " 1 relato de campo da área foi atualizado." : ` ${n} relatos de campo da área foram atualizados.`;

export async function atualizarRelato(_: unknown, fd: FormData): Promise<Res> {
  await exigeGestor();
  const db = admin(); if (!db) return { erro: SEM_DB };
  const id = Number(fd.get("id")), status = String(fd.get("status"));
  if (!Number.isInteger(id) || !(ETAPAS as readonly string[]).includes(status)) return { erro: "Situação inválida." };
  const { error } = await db.from("relatos").update({ status }).eq("id", id);
  if (error) return falha("atualizarRelato", error);
  atualiza();
  return { ok: "Salvo." };
}
export async function criarVistoria(_: unknown, fd: FormData): Promise<Res> {
  await exigeGestor();
  const db = admin(); if (!db) return { erro: SEM_DB };
  const area_id = Number(fd.get("area_id")), problema = campo(fd, "problema", 200);
  if (!Number.isInteger(area_id) || !problema) return { erro: "Informe a área e o problema identificado." };
  const { error } = await db.from("vistorias").insert({ area_id, fiscal: campo(fd, "fiscal", 80) || "Fiscal de campo", problema, observacoes: campo(fd, "observacoes", 600) || null });
  if (error) return falha("criarVistoria", error);
  // Nova vistoria abre o fluxo, e reabre uma área que já estava concluída
  const { error: e2 } = await db.from("areas").update({ status_workflow: "Em vistoria" }).eq("id", area_id).in("status_workflow", ["Aguardando triagem", "Concluída"]);
  if (e2) console.error("Erro ao mover a área para Em vistoria:", e2);
  const n = await avancaRelatos(db, area_id, "Em análise municipal");
  atualiza();
  return { ok: `Vistoria registrada.${relatosTxt(n)}` };
}
export async function criarOrdem(_: unknown, fd: FormData): Promise<Res> {
  await exigeGestor();
  const db = admin(); if (!db) return { erro: SEM_DB };
  const vistoria_id = Number(fd.get("vistoria_id")), tipo = campo(fd, "tipo_servico", 120), sec = campo(fd, "secretaria", 80);
  if (!Number.isInteger(vistoria_id) || !tipo || !SECRETARIAS.includes(sec)) return { erro: "Preencha vistoria, serviço e secretaria." };
  const { data: v } = await db.from("vistorias").select("area_id").eq("id", vistoria_id).single();
  if (!v) return { erro: "Vistoria não encontrada." };
  const { error } = await db.from("ordens_zeladoria").insert({ vistoria_id, tipo_servico: tipo, secretaria: sec });
  if (error) return falha("criarOrdem", error);
  const { error: e2 } = await db.from("areas").update({ status_workflow: "Ordem emitida" }).eq("id", v.area_id);
  if (e2) console.error("Erro ao mover a área para Ordem emitida:", e2);
  const n = await avancaRelatos(db, v.area_id, "Encaminhado ao órgão responsável");
  atualiza();
  return { ok: `Ordem emitida.${relatosTxt(n)}` };
}
export async function atualizarOrdem(_: unknown, fd: FormData): Promise<Res> {
  await exigeGestor();
  const db = admin(); if (!db) return { erro: SEM_DB };
  const id = Number(fd.get("id")), status = String(fd.get("status"));
  if (!Number.isInteger(id) || !STATUS_ORDEM.includes(status)) return { erro: "Situação inválida." };
  const { data: o } = await db.from("ordens_zeladoria").select("status, vistorias(area_id)").eq("id", id).single();
  if (!o) return { erro: "Ordem não encontrada." };
  if (o.status === status) return { ok: "Sem mudança." }; // não grava data nem histórico de novo
  let msg = "Salvo.";
  const area_id = (o as unknown as { vistorias: { area_id: number } | null }).vistorias?.area_id;
  const { error } = await db.from("ordens_zeladoria").update({ status, concluida_em: status === "Concluída" ? new Date().toISOString() : null }).eq("id", id);
  if (error) return falha("atualizarOrdem", error);
  if (area_id) {
    // A área só fica "Concluída" quando todas as ordens dela estiverem concluídas
    const { data: vs } = await db.from("vistorias").select("id").eq("area_id", area_id);
    const { data: os } = await db.from("ordens_zeladoria").select("status").in("vistoria_id", (vs ?? []).map((x) => x.id));
    const todas = (os ?? []).length > 0 && (os ?? []).every((x) => x.status === "Concluída");
    const { data: a } = await db.from("areas").select("indice, status_workflow").eq("id", area_id).single();
    if (a && todas && a.status_workflow !== "Concluída") {
      await db.from("areas").update({ status_workflow: "Concluída" }).eq("id", area_id);
      await db.from("historico_prioridades").insert({ area_id, score: a.indice, prioridade: prioridade(a.indice), motivo: "Ordens de zeladoria concluídas (o índice só muda com novos dados oficiais)" });
      const n = await avancaRelatos(db, area_id, "Concluído");
      msg = `Salvo. Todas as ordens da área estão concluídas: a área foi marcada como Concluída.${relatosTxt(n)}`;
    } else if (!todas && a?.status_workflow === "Concluída") {
      await db.from("areas").update({ status_workflow: "Ordem emitida" }).eq("id", area_id); // ordem reaberta
      msg = "Salvo. A área voltou para Ordem emitida.";
    }
  }
  atualiza();
  return { ok: msg };
}
