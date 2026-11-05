"use client";
import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import type { Area, Vistoria } from "@/lib/types";
import { nomeBairro } from "@/lib/rules";
import { criarOrdem, criarVistoria } from "@/app/actions";
type St = { erro?: string; ok?: string } | null;
const Msg = ({ s }: { s: St }) => s?.erro ? <p className="text-sm text-red-700">{s.erro}</p> : s?.ok ? <p className="text-sm text-emerald-700">{s.ok}</p> : null;
export default function Forms({ areas, vistorias }: { areas: Area[]; vistorias: Vistoria[] }) {
  const [sv, av] = useFormState(criarVistoria, null as St);
  const [so, ao] = useFormState(criarOrdem, null as St);
  // Limpa o formulário após um envio bem-sucedido (evita registros duplicados por clique repetido).
  const fv = useRef<HTMLFormElement>(null), fo = useRef<HTMLFormElement>(null);
  useEffect(() => { if (sv?.ok) fv.current?.reset(); }, [sv]);
  useEffect(() => { if (so?.ok) fo.current?.reset(); }, [so]);
  return <div className="grid gap-4 lg:grid-cols-2">
    <form ref={fv} action={av} className="card space-y-3 p-4"><h2 className="font-bold">Nova vistoria em campo</h2>
      <div><label className="lbl">Área</label><select name="area_id" className="inp" required>{areas.map((a) => <option key={a.id} value={a.id}>{nomeBairro(a.bairro)} (índice {a.indice})</option>)}</select></div>
      <div><label className="lbl">Fiscal</label><input name="fiscal" className="inp" placeholder="Nome / matrícula" /></div>
      <div><label className="lbl">Problema identificado</label><input name="problema" className="inp" required placeholder="Ex.: 3 postes sem iluminação" /></div>
      <div><label className="lbl">Observações</label><textarea name="observacoes" className="inp" rows={3} /></div><Msg s={sv} /><button className="btn">Registrar vistoria</button></form>
    <form ref={fo} action={ao} className="card space-y-3 p-4"><h2 className="font-bold">Nova ordem de zeladoria</h2>
      <div><label className="lbl">Vistoria</label><select name="vistoria_id" className="inp" required>{vistorias.map((v) => { const a = areas.find((x) => x.id === v.area_id); return <option key={v.id} value={v.id}>#{v.id} · {a ? nomeBairro(a.bairro) : v.area_id} · {v.problema}</option>; })}</select></div>
      <div><label className="lbl">Serviço</label><input name="tipo_servico" className="inp" required placeholder="Ex.: Troca de lâmpadas" /></div>
      <div><label className="lbl">Secretaria responsável</label><select name="secretaria" className="inp"><option>Secretaria de Obras / Iluminação</option><option>Secretaria de Mobilidade</option><option>Zeladoria</option></select></div><Msg s={so} /><button className="btn">Emitir ordem</button></form></div>;
}
