"use client";
import Link from "next/link";
import { useEffect } from "react";
// Erro dentro do acesso de campo: mantém o cabeçalho e oferece tentar de novo
export default function Erro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <div className="space-y-4 py-6">
    <h1 className="text-3xl font-semibold leading-[1.05] tracking-[-0.015em]">Não foi possível carregar</h1>
    <p className="text-forest/80">Algo falhou ao abrir esta tela. Confira a internet e tente de novo. Se você acabou de enviar um relato, procure o número em Acompanhar relato antes de reenviar.</p>
    <div className="grid gap-2"><button type="button" onClick={reset} className="btn py-3">Tentar de novo</button><Link href="/cidadao/acompanhar" className="btn-o py-3">Acompanhar relato</Link><Link href="/cidadao" className="btn-o py-3">Voltar ao mapa</Link></div>
  </div>;
}
