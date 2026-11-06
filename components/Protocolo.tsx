"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

// Protocolos enviados deste aparelho: ficam só no navegador da pessoa, nada vai para o servidor
const CHAVE = "bussola-protocolos";
const ler = (): string[] => { try { return JSON.parse(localStorage.getItem(CHAVE) ?? "[]"); } catch { return []; } };

/** Copiar e compartilhar o número, e guardar no aparelho para achar depois. */
export function ProtocoloAcoes({ protocolo }: { protocolo: string }) {
  const [msg, setMsg] = useState("");
  const [podeCompartilhar, setPode] = useState(false);
  useEffect(() => {
    setPode(typeof navigator.share === "function");
    const lista = ler().filter((p) => p !== protocolo);
    try { localStorage.setItem(CHAVE, JSON.stringify([protocolo, ...lista].slice(0, 10))); } catch { /* modo privado: segue sem guardar */ }
  }, [protocolo]);
  const url = () => `${location.origin}/cidadao/acompanhar?codigo=${encodeURIComponent(protocolo)}`;
  async function copiar() {
    try { await navigator.clipboard.writeText(protocolo); setMsg("Número copiado."); } catch { setMsg("Não deu para copiar. Anote o número acima."); }
  }
  async function compartilhar() {
    try { await navigator.share({ title: "Meu relato na Bússola Urbana", text: `Protocolo ${protocolo}`, url: url() }); } catch { /* a pessoa cancelou */ }
  }
  return <div className="mt-3">
    <div className="flex gap-2">
      <button type="button" onClick={copiar} className="btn-o flex-1 py-2">Copiar número</button>
      {podeCompartilhar && <button type="button" onClick={compartilhar} className="btn-o flex-1 py-2">Compartilhar</button>}
    </div>
    <p className="mt-2 text-xs text-forest/70" aria-live="polite">{msg || "O número também fica salvo neste celular, sem nenhum dado pessoal."}</p>
  </div>;
}

/** Atalhos para os relatos enviados deste aparelho. */
export function MeusRelatos({ atual }: { atual?: string }) {
  const [lista, setLista] = useState<string[]>([]);
  useEffect(() => setLista(ler()), []);
  const outros = lista.filter((p) => p !== atual);
  if (!outros.length) return null;
  return <section className="card p-4">
    <h2 className="rotulo font-sans text-forest/70">Relatos enviados deste celular</h2>
    <ul className="mt-2 divide-y divide-forest/10">{outros.map((p) => <li key={p}><Link href={`/cidadao/acompanhar?codigo=${encodeURIComponent(p)}`} className="block py-2.5 font-semibold underline decoration-forest/30 underline-offset-4">{p}</Link></li>)}</ul>
  </section>;
}
