"use client";
import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { Area, Vistoria } from "@/lib/types";
import { nomeBairro } from "@/lib/rules";
import { criarOrdem, criarVistoria } from "@/app/actions";
type St = { erro?: string; ok?: string } | null;
const Msg = ({ s }: { s: St }) => s?.erro ? <p role="alert" className="text-sm text-red-700">{s.erro}</p> : s?.ok ? <p role="status" className="text-sm text-emerald-800">{s.ok}</p> : null;
// Botão que trava durante o envio: evita registro duplicado com internet lenta
function Enviar({ texto, enviando }: { texto: string; enviando: string }) {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="btn">{pending ? enviando : texto}</button>;
}
export default function Forms({ areas, vistorias }: { areas: Area[]; vistorias: Vistoria[] }) {
  const [sv, av] = useFormState(criarVistoria, null as St);
  const [so, ao] = useFormState(criarOrdem, null as St);
  // Limpa o formulário após um envio bem-sucedido (evita registros duplicados por clique repetido).
  const fv = useRef<HTMLFormElement>(null), fo = useRef<HTMLFormElement>(null);
  useEffect(() => { if (sv?.ok) fv.current?.reset(); }, [sv]);
  useEffect(() => { if (so?.ok) fo.current?.reset(); }, [so]);
  return <div className="grid gap-4 lg:grid-cols-2">
    <form ref={fv} action={av} className="card space-y-3 p-4"><h2 className="font-bold">Nova vistoria em campo</h2>
      <div><label className="lbl" htmlFor="v-area">Área</label><select id="v-area" name="area_id" className="inp" required>{areas.map((a) => <option key={a.id} value={a.id}>{nomeBairro(a.bairro)} (índice {a.indice})</option>)}</select></div>
      <div><label className="lbl" htmlFor="v-fiscal">Fiscal</label><input id="v-fiscal" name="fiscal" className="inp" maxLength={80} placeholder="Nome ou matrícula" /></div>
      <div><label className="lbl" htmlFor="v-prob">Problema identificado</label><input id="v-prob" name="problema" className="inp" required maxLength={200} placeholder="Ex.: 3 postes sem iluminação" /></div>
      <div><label className="lbl" htmlFor="v-obs">Observações</label><textarea id="v-obs" name="observacoes" className="inp" rows={3} maxLength={600} /></div><Msg s={sv} /><Enviar texto="Registrar vistoria" enviando="Registrando…" /></form>
    <form ref={fo} action={ao} className="card space-y-3 p-4"><h2 className="font-bold">Nova ordem de zeladoria</h2>
      <div><label className="lbl" htmlFor="o-vist">Vistoria</label><select id="o-vist" name="vistoria_id" className="inp" required>{vistorias.map((v) => { const a = areas.find((x) => x.id === v.area_id); return <option key={v.id} value={v.id}>Vistoria {v.id}: {a ? nomeBairro(a.bairro) : v.area_id}, {v.problema}</option>; })}</select></div>
      <div><label className="lbl" htmlFor="o-serv">Serviço</label><input id="o-serv" name="tipo_servico" className="inp" required maxLength={120} placeholder="Ex.: Troca de lâmpadas" /></div>
      <div><label className="lbl" htmlFor="o-sec">Secretaria responsável</label><select id="o-sec" name="secretaria" className="inp"><option>Secretaria de Obras / Iluminação</option><option>Secretaria de Mobilidade</option><option>Zeladoria</option></select></div><Msg s={so} /><Enviar texto="Emitir ordem" enviando="Emitindo…" /></form></div>;
}
