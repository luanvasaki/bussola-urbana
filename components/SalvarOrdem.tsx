"use client";
import { useFormState, useFormStatus } from "react-dom";
import { atualizarOrdem, atualizarRelato } from "@/app/actions";

type Res = { erro?: string; ok?: string } | null;
const ACOES = { relato: atualizarRelato, ordem: atualizarOrdem };

function Botao() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="rounded-md bg-forest px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-60">{pending ? "Salvando…" : "Salvar"}</button>;
}

/** Troca a situação de um relato ou de uma ordem e diz o que aconteceu (inclusive o efeito na área). */
export function Situacao({ tipo, id, atual, opcoes, rotulo }: { tipo: keyof typeof ACOES; id: number; atual: string; opcoes: readonly string[]; rotulo: string }) {
  const [st, acao] = useFormState(ACOES[tipo], null as Res);
  return <form action={acao} className="flex flex-col items-end gap-1">
    <div className="flex gap-1">
      <input type="hidden" name="id" value={id} />
      <select name="status" aria-label={rotulo} defaultValue={atual} className="rounded-md border border-forest/25 bg-transparent px-1 py-1 text-xs font-semibold">{opcoes.map((o) => <option key={o}>{o}</option>)}</select>
      <Botao />
    </div>
    {st && <p role={st.erro ? "alert" : "status"} className={`max-w-[34ch] text-right text-xs ${st.erro ? "text-red-700" : "text-emerald-800"}`}>{st.erro ?? st.ok}</p>}
  </form>;
}
