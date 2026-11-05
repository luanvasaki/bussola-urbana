"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { admin } from "@/lib/db";
import { COOKIE, token } from "@/lib/auth";
import { CATEGORIAS, prioridade } from "@/lib/rules";

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
  const cat = CATEGORIAS.find((c) => c.nome === fd.get("categoria"));
  const lat = Number(fd.get("lat")), lon = Number(fd.get("lon"));
  if (!cat) return { erro: "Escolha o tipo de problema." };
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -23.65 || lat > -23.35 || lon < -47.6 || lon > -47.3) return { erro: "Toque no mapa para marcar o local, dentro de Sorocaba." };
  const descricao = String(fd.get("descricao") ?? "").slice(0, 400);
  const db = admin();
  if (!db) return { erro: SEM_DB };
  const { data, error } = await db.from("relatos").insert({ categoria: cat.nome, eixo: cat.eixo, severidade: cat.sev, descricao: descricao || null, lat, lon }).select("protocolo").single();
  if (error) return { erro: "Não foi possível registrar agora. Tente novamente." };
  redirect(`/cidadao/protocolo/${data.protocolo}`);
}

// ---- Gestor ----
export async function atualizarRelato(fd: FormData) {
  await exigeGestor();
  const db = admin(); if (!db) return;
  await db.from("relatos").update({ status: String(fd.get("status")) }).eq("id", Number(fd.get("id")));
  revalidatePath("/gestor", "layout");
}
export async function criarVistoria(_: unknown, fd: FormData) {
  await exigeGestor();
  const db = admin(); if (!db) return { erro: SEM_DB };
  const area_id = Number(fd.get("area_id")), problema = String(fd.get("problema") ?? "").trim();
  if (!area_id || !problema) return { erro: "Informe a área e o problema identificado." };
  const { error } = await db.from("vistorias").insert({ area_id, fiscal: String(fd.get("fiscal") || "Fiscal de campo"), problema, observacoes: String(fd.get("observacoes") ?? "") || null });
  if (error) return { erro: error.message };
  await db.from("areas").update({ status_workflow: "Em vistoria" }).eq("id", area_id).in("status_workflow", ["Aguardando triagem"]);
  revalidatePath("/gestor", "layout");
  return { ok: "Vistoria registrada." };
}
export async function criarOrdem(_: unknown, fd: FormData) {
  await exigeGestor();
  const db = admin(); if (!db) return { erro: SEM_DB };
  const vistoria_id = Number(fd.get("vistoria_id")), tipo = String(fd.get("tipo_servico") ?? "").trim(), sec = String(fd.get("secretaria") ?? "").trim();
  if (!vistoria_id || !tipo || !sec) return { erro: "Preencha vistoria, serviço e secretaria." };
  const { data: v } = await db.from("vistorias").select("area_id").eq("id", vistoria_id).single();
  const { error } = await db.from("ordens_zeladoria").insert({ vistoria_id, tipo_servico: tipo, secretaria: sec });
  if (error) return { erro: error.message };
  if (v) await db.from("areas").update({ status_workflow: "Ordem emitida" }).eq("id", v.area_id);
  revalidatePath("/gestor", "layout");
  return { ok: "Ordem emitida." };
}
export async function atualizarOrdem(fd: FormData) {
  await exigeGestor();
  const db = admin(); if (!db) return;
  const id = Number(fd.get("id")), status = String(fd.get("status"));
  await db.from("ordens_zeladoria").update({ status, concluida_em: status === "Concluída" ? new Date().toISOString() : null }).eq("id", id);
  if (status === "Concluída") {
    const { data: o } = await db.from("ordens_zeladoria").select("vistorias(area_id)").eq("id", id).single();
    const area_id = (o as unknown as { vistorias: { area_id: number } } | null)?.vistorias?.area_id;
    if (area_id) {
      const { data: a } = await db.from("areas").select("indice").eq("id", area_id).single();
      await db.from("areas").update({ status_workflow: "Concluída" }).eq("id", area_id);
      if (a) await db.from("historico_prioridades").insert({ area_id, score: a.indice, prioridade: prioridade(a.indice), motivo: "Ordem de zeladoria concluída (o score só muda com novos dados oficiais)" });
    }
  }
  revalidatePath("/gestor", "layout");
}
