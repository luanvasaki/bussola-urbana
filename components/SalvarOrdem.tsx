"use client";
import { useFormStatus } from "react-dom";
export function SalvarOrdem() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="rounded-md bg-forest px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-60">{pending ? "Salvando…" : "Salvar"}</button>;
}
