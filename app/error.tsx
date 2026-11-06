"use client";
import Link from "next/link";
import { useEffect } from "react";
// Aparece quando uma página falha (por exemplo, o banco demorou demais). Oferece tentar de novo sem perder o caminho.
export default function Erro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center gap-4 p-6">
    <h1 className="text-3xl font-semibold leading-[1.05] tracking-[-0.015em]">Não foi possível carregar</h1>
    <p className="text-forest/80">Algo falhou ao abrir esta página. Confira a internet e tente de novo.</p>
    <div className="grid gap-2"><button type="button" onClick={reset} className="btn py-3">Tentar de novo</button><Link href="/" className="btn-o py-3">Ir para a página inicial</Link></div>
  </main>;
}
