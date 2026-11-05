// Proteção simples da área do gestor (MVP): senha única em GESTOR_PASSWORD. Sem a variável, a área fica aberta (demonstração local).
export const COOKIE = "bu_gestor";
export async function token(): Promise<string | null> {
  const pw = process.env.GESTOR_PASSWORD;
  if (!pw) return null;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`bussola-urbana:${pw}`));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
