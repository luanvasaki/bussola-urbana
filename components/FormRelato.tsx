"use client";
import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { CATEGORIAS } from "@/lib/rules";
import { criarRelato } from "@/app/actions";
import { MapaPick } from "./MapaCidadao";
import type { Lugar } from "@/lib/types";

type Ponto = { lat: number; lon: number };

export default function FormRelato() {
  const [st, act] = useFormState(criarRelato, null as { erro?: string } | null);
  const [cat, setCat] = useState("");
  return <form action={act} className="space-y-5">
    <fieldset><legend className="lbl">1. Tipo de problema</legend><div className="grid grid-cols-2 gap-2">{CATEGORIAS.map((c) => <button type="button" key={c.nome} aria-pressed={cat === c.nome} onClick={() => setCat(c.nome)} className={`rounded-md border-2 px-2.5 py-2.5 text-left text-sm ${cat === c.nome ? "border-forest bg-forest text-white" : "border-forest/15 bg-white"}`}><div className="font-semibold">{c.nome}</div><div className="text-xs opacity-80">{c.eixo}</div></button>)}</div><input type="hidden" name="categoria" value={cat} /></fieldset>
    {/* Armadilha para robôs: invisível e fora da navegação por teclado; pessoas nunca preenchem */}
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden"><label>Site<input name="site" tabIndex={-1} autoComplete="off" /></label></div>
    <Local />
    <div><label className="lbl" htmlFor="d">3. Descrição (opcional)</label><textarea id="d" name="descricao" className="inp" rows={3} maxLength={400} placeholder="Ex.: 3 postes seguidos sem luz" /></div>
    <p className="text-xs text-forest/70">Seu relato é anônimo: não pedimos nome, CPF, telefone nem e-mail. Não relate pessoas, apenas problemas do lugar.</p>
    {st?.erro && <p role="alert" className="rounded-md bg-red-50 p-2 text-sm text-red-800">{st.erro}</p>}<Enviar /></form>;
}

// Trava o botão durante o envio: com internet lenta, evita relato duplicado
function Enviar() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="btn w-full py-3">{pending ? "Enviando…" : "Enviar relato"}</button>;
}

/** Passo 2: o local pode vir do CEP, do endereço, do GPS do celular ou de um toque no mapa. */
function Local() {
  const [q, setQ] = useState("");
  const [p, setP] = useState<Ponto | null>(null);
  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [opcoes, setOpcoes] = useState<Lugar[]>([]);
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState<"" | "busca" | "gps">("");
  const pedido = useRef(0); // descarta respostas que chegaram depois de uma ação mais nova

  async function consultar(params: string) {
    const r = await fetch(`/api/endereco?${params}`);
    const j = await r.json().catch(() => ({ erro: "Não foi possível buscar agora. Toque no mapa para marcar o local." }));
    return j as { erro?: string; lugares?: Lugar[]; lugar?: Lugar };
  }
  function escolher(l: Lugar) { setP({ lat: l.lat, lon: l.lon }); setLugar(l); setOpcoes([]); setAviso(""); }

  async function buscar() {
    const t = q.trim(); if (!t) { setAviso("Digite um CEP, uma rua ou um bairro."); return; }
    const n = ++pedido.current; setOcupado("busca"); setAviso(""); setOpcoes([]);
    const j = await consultar(`q=${encodeURIComponent(t)}`);
    if (n !== pedido.current) return;
    setOcupado("");
    if (j.erro || !j.lugares?.length) { setAviso(j.erro ?? "Endereço não encontrado."); return; }
    if (j.lugares.length === 1) escolher(j.lugares[0]); else setOpcoes(j.lugares);
  }

  // Toque no mapa ou GPS: marca na hora e busca o nome da rua em seguida
  async function marcar(pt: Ponto, origem?: "gps") {
    const n = ++pedido.current; setP(pt); setOpcoes([]); setAviso(""); setLugar(null);
    const j = await consultar(`lat=${pt.lat.toFixed(4)}&lon=${pt.lon.toFixed(4)}`); // arredondado: toques próximos usam o mesmo cache
    if (n !== pedido.current) return;
    if (j.erro) { setAviso(origem === "gps" ? "Sua localização está fora de Sorocaba. Busque o endereço ou toque no mapa." : j.erro); if (origem === "gps") setP(null); return; }
    if (j.lugar) setLugar(j.lugar);
  }

  function gps() {
    if (!navigator.geolocation) { setAviso("Este navegador não informa a localização. Busque o endereço ou toque no mapa."); return; }
    setOcupado("gps"); setAviso("");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setOcupado(""); marcar({ lat: +pos.coords.latitude.toFixed(6), lon: +pos.coords.longitude.toFixed(6) }, "gps"); },
      () => { setOcupado(""); setAviso("Não foi possível pegar sua localização. Confira a permissão do navegador, busque o endereço ou toque no mapa."); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return <div>
    <label className="lbl" htmlFor="busca-local">2. Onde é o problema?</label>
    <div className="flex gap-2">
      <input id="busca-local" className="inp" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); buscar(); } }}
        placeholder="CEP, rua ou bairro" autoComplete="off" enterKeyHint="search" />
      <button type="button" onClick={buscar} disabled={ocupado !== ""} className="btn shrink-0 px-4 disabled:opacity-60">{ocupado === "busca" ? "Buscando…" : "Buscar"}</button>
    </div>
    <button type="button" onClick={gps} disabled={ocupado !== ""} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-forest underline decoration-forest/30 underline-offset-4 hover:decoration-forest disabled:opacity-60">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><circle cx="12" cy="12" r="7.5" /></svg>
      {ocupado === "gps" ? "Pegando sua localização…" : "Usar minha localização"}
    </button>

    {opcoes.length > 0 && <div className="mt-2 rounded-md border border-forest/15 bg-white p-1" role="group" aria-label="Escolha o endereço">
      <p className="px-2 pb-1 pt-1.5 text-xs text-forest/70">Encontramos mais de um trecho. Qual deles?</p>
      {opcoes.map((l) => <button type="button" key={`${l.lat},${l.lon}`} onClick={() => escolher(l)} className="block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-mint">{l.rotulo}</button>)}
    </div>}
    {aviso && <p className="mt-2 rounded-md bg-amber-50 p-2 text-sm text-amber-900" role="status">{aviso}</p>}

    <div className="mt-3"><MapaPick valor={p} onChange={(pt) => marcar(pt)} /></div>
    <p className="mt-1 text-xs text-forest/70">No celular, use dois dedos para mover o mapa.</p>
    <p className="mt-1.5 text-xs text-forest/70" aria-live="polite">
      {p ? <><b className="font-semibold text-forest">{lugar ? lugar.rotulo : "Local marcado"}</b>. Se não for o ponto exato, toque no mapa para ajustar.</> : "Você também pode tocar direto no mapa."}
    </p>
    <input type="hidden" name="lat" value={p?.lat ?? ""} /><input type="hidden" name="lon" value={p?.lon ?? ""} />
    <input type="hidden" name="rua" value={lugar?.rua ?? ""} /><input type="hidden" name="bairro" value={lugar?.bairro ?? ""} />
  </div>;
}
