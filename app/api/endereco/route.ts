import { NextResponse, type NextRequest } from "next/server";

/**
 * Busca de endereço para o relato de campo.
 *   ?q=18035-060          CEP: ViaCEP confirma rua e cidade; OpenStreetMap (Nominatim) dá a coordenada
 *   ?q=Avenida Itavuvu    rua, bairro ou ponto de referência, só em Sorocaba
 *   ?lat=..&lon=..        ponto tocado no mapa → rua e bairro
 * Roda no servidor para identificar o app ao Nominatim (política de uso) e guardar as respostas em cache.
 */
import type { Lugar } from "@/lib/types";

const UA = "BussolaUrbana/1.0 (+https://bussola-urbana-app.vercel.app)";
const LIMITE = { latMin: -23.65, latMax: -23.35, lonMin: -47.6, lonMax: -47.3 }; // mesmo recorte do criarRelato
const VIEWBOX = `${LIMITE.lonMin},${LIMITE.latMax},${LIMITE.lonMax},${LIMITE.latMin}`;
const DENTRO = (lat: number, lon: number) => lat >= LIMITE.latMin && lat <= LIMITE.latMax && lon >= LIMITE.lonMin && lon <= LIMITE.lonMax;

type Nom = { lat: string; lon: string; name?: string; address?: Record<string, string> };

async function obter<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "pt-BR" }, signal: AbortSignal.timeout(7000), next: { revalidate: 86400 } });
    return r.ok ? ((await r.json()) as T) : null;
  } catch { return null; }
}
// O Nominatim aceita 1 consulta por segundo. As chamadas desta instância entram numa fila espaçada;
// se a fila crescer demais, a rota responde na hora pedindo para marcar no mapa, em vez de deixar a pessoa esperando.
let fila: Promise<unknown> = Promise.resolve();
let naFila = 0;
class Ocupado extends Error {}
function espacado<T>(fn: () => Promise<T>): Promise<T> {
  if (naFila >= 6) return Promise.reject(new Ocupado());
  naFila++;
  const vez = fila.then(fn);
  fila = vez.catch(() => null).then(() => new Promise((r) => setTimeout(r, 1100)));
  return vez.finally(() => { naFila--; });
}
const nominatim = (caminho: string, p: Record<string, string>) =>
  espacado(() => obter<Nom[] | Nom>(`https://nominatim.openstreetmap.org/${caminho}?${new URLSearchParams({ format: "jsonv2", addressdetails: "1", ...p })}`));

const bairroDe = (a: Record<string, string> = {}) => a.suburb ?? a.neighbourhood ?? a.quarter ?? a.city_district ?? null;
const cidadeDe = (a: Record<string, string> = {}) => a.city ?? a.town ?? a.municipality ?? "";
const rotular = (rua: string | null, bairro: string | null, extra?: string) => [rua, bairro, extra].filter(Boolean).join(", ") || "Local sem nome no mapa";

function paraLugar(n: Nom): Lugar | null {
  const lat = +n.lat, lon = +n.lon, a = n.address ?? {};
  if (!DENTRO(lat, lon) || !/sorocaba/i.test(cidadeDe(a))) return null;
  const bairro = bairroDe(a), nome = a.road ?? a.pedestrian ?? n.name ?? null;
  const rua = nome && nome !== bairro ? nome : null; // quando o resultado é o próprio bairro, não repete o nome
  return { rotulo: rotular(rua, bairro), rua, bairro, lat: +lat.toFixed(6), lon: +lon.toFixed(6) };
}
// Abreviações comuns em endereços: "R. XV de Novembro" vira "Rua Quinze de Novembro".
const ABREV: [RegExp, string][] = [
  [/\bav\.?(?=\s)/gi, "Avenida"], [/\br\.(?=\s)/gi, "Rua"], [/\bdr\.?(?=\s)/gi, "Doutor"], [/\bprof\.?(?=\s)/gi, "Professor"],
  [/\bp[cç]a\.?(?=\s)/gi, "Praça"], [/\bjd\.?(?=\s)/gi, "Jardim"], [/\bvl\.?(?=\s)/gi, "Vila"], [/\bpq\.?(?=\s)/gi, "Parque"], [/\bsta\.?(?=\s)/gi, "Santa"], [/\bsto\.?(?=\s)/gi, "Santo"],
  [/\bXV\b/g, "Quinze"], [/\bXIII\b/g, "Treze"], [/\bXII\b/g, "Doze"], [/\bIX\b/g, "Nove"], [/\bVII\b/g, "Sete"], [/\bVI\b/g, "Seis"], [/\bIV\b/g, "Quatro"],
];
const expandir = (q: string) => ABREV.reduce((t, [re, por]) => t.replace(re, por), q);

const erro = (msg: string, status = 404) => NextResponse.json({ erro: msg }, { status });
// A rede da Vercel guarda respostas iguais por 1 dia: menos consultas ao ViaCEP e ao Nominatim (limite de 1 por segundo)
const CACHE = { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" };
const ok = (corpo: unknown) => NextResponse.json(corpo, { headers: CACHE });

export async function GET(req: NextRequest) {
  try { return await responder(req); } catch (e) {
    if (e instanceof Ocupado) return erro("Muitas buscas ao mesmo tempo. Tente de novo em alguns segundos ou toque no mapa.", 503);
    throw e;
  }
}

async function responder(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  // Ponto tocado no mapa
  if (sp.has("lat")) {
    // 4 casas decimais (cerca de 10 m) bastam para achar a rua e fazem toques próximos reaproveitarem o cache
    const lat = +Number(sp.get("lat")).toFixed(4), lon = +Number(sp.get("lon")).toFixed(4);
    if (!DENTRO(lat, lon)) return erro("Ponto fora de Sorocaba.", 400);
    const n = (await nominatim("reverse", { lat: String(lat), lon: String(lon), zoom: "18" })) as Nom | null;
    const a = n?.address ?? {};
    const rua = a.road ?? a.pedestrian ?? null, bairro = bairroDe(a);
    return ok({ lugar: { rotulo: rotular(rua, bairro), rua, bairro, lat, lon } satisfies Lugar });
  }

  const q = (sp.get("q") ?? "").trim().slice(0, 120);
  const cep = q.replace(/\D/g, "");

  // CEP
  if (cep.length === 8 && /^[\d\s.-]+$/.test(q)) {
    const v = await obter<{ erro?: boolean | string; logradouro?: string; bairro?: string; localidade?: string }>(`https://viacep.com.br/ws/${cep}/json/`);
    if (!v) return erro("Não foi possível consultar o CEP agora. Tente pelo nome da rua.", 502);
    if (v.erro) return erro("CEP não encontrado. Confira os números ou busque pelo nome da rua.");
    if (v.localidade !== "Sorocaba") return erro(`Esse CEP é de ${v.localidade}. Por enquanto, a Bússola atende só Sorocaba.`, 422);
    const rua = v.logradouro || null, bairro = v.bairro || null;
    let ponto = ((await nominatim("search", { postalcode: cep, country: "Brasil", limit: "1" })) as Nom[] | null)?.[0];
    if ((!ponto || !DENTRO(+ponto.lat, +ponto.lon)) && rua)
      ponto = ((await nominatim("search", { street: rua, city: "Sorocaba", country: "Brasil", limit: "1", viewbox: VIEWBOX, bounded: "1" })) as Nom[] | null)?.[0];
    if (!ponto || !DENTRO(+ponto.lat, +ponto.lon)) return erro("Achamos o CEP, mas não o ponto no mapa. Toque no mapa para marcar o local.");
    return ok({ lugares: [{ rotulo: rotular(rua, bairro, `CEP ${cep.slice(0, 5)}-${cep.slice(5)}`), rua, bairro, lat: +(+ponto.lat).toFixed(6), lon: +(+ponto.lon).toFixed(6) }] satisfies Lugar[] });
  }

  // Rua, bairro ou ponto de referência
  if (q.length < 3) return erro("Digite um CEP ou pelo menos parte do nome da rua.", 400);
  const buscar = async (t: string) => ((await nominatim("search", { q: `${t}, Sorocaba`, countrycodes: "br", limit: "8", viewbox: VIEWBOX, bounded: "1" })) as Nom[] | null) ?? [];
  let r = await buscar(q);
  const q2 = expandir(q);
  if (!r.some((n) => paraLugar(n)) && q2 !== q) r = await buscar(q2);
  const vistos = new Set<string>();
  const lugares = r.map(paraLugar).filter((l): l is Lugar => !!l && !vistos.has(l.rotulo) && !!vistos.add(l.rotulo)).slice(0, 5);
  if (!lugares.length) return erro("Não encontramos esse endereço em Sorocaba. Tente o nome completo da rua, sem abreviar (ex.: Rua Quinze de Novembro), ou toque no mapa.");
  return ok({ lugares });
}
