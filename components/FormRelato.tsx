"use client";
import { useState } from "react";
import { useFormState } from "react-dom";
import { CATEGORIAS } from "@/lib/rules";
import { criarRelato } from "@/app/actions";
import { MapaPick } from "./MapaCidadao";
export default function FormRelato() {
  const [st, act] = useFormState(criarRelato, null as { erro?: string } | null);
  const [cat, setCat] = useState(""); const [p, setP] = useState<{ lat: number; lon: number } | null>(null);
  return <form action={act} className="space-y-4">
    <div><span className="lbl">1. Tipo de problema</span><div className="grid grid-cols-2 gap-2">{CATEGORIAS.map((c) => <button type="button" key={c.nome} onClick={() => setCat(c.nome)} className={`rounded-xl border-2 px-2 py-2 text-left text-sm ${cat === c.nome ? "border-forest bg-forest text-white" : "border-forest/15 bg-white"}`}><div className="font-semibold">{c.nome}</div><div className="text-[11px] opacity-70">{c.eixo}</div></button>)}</div><input type="hidden" name="categoria" value={cat} /></div>
    <div><span className="lbl">2. Toque no mapa para marcar o local</span><MapaPick onChange={setP} />{p && <p className="mt-1 text-xs text-forest/60">Local marcado: {p.lat.toFixed(4)}, {p.lon.toFixed(4)}</p>}<input type="hidden" name="lat" value={p?.lat ?? ""} /><input type="hidden" name="lon" value={p?.lon ?? ""} /></div>
    <div><label className="lbl" htmlFor="d">3. Descrição (opcional)</label><textarea id="d" name="descricao" className="inp" rows={3} maxLength={400} placeholder="Ex.: 3 postes seguidos sem luz" /></div>
    <p className="text-xs text-forest/70">Seu relato é anônimo: não pedimos nome, CPF, telefone nem e-mail. Não relate pessoas, apenas problemas do lugar.</p>
    {st?.erro && <p className="rounded-xl bg-red-50 p-2 text-sm text-red-800">{st.erro}</p>}<button className="btn w-full py-3">Enviar relato</button></form>;
}
