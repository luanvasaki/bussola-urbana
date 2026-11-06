"use client";
import { useEffect } from "react";
// Erro dentro do acesso do gestor: mantém o menu lateral
export default function Erro({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <div className="max-w-lg space-y-4 py-6">
    <h1 className="text-3xl font-semibold leading-[1.05] tracking-[-0.015em]">Não foi possível carregar</h1>
    <p className="text-forest/80">A leitura dos dados falhou agora. Tente de novo em instantes ou abra outra tela pelo menu.</p>
    <button type="button" onClick={reset} className="btn py-3">Tentar de novo</button>
  </div>;
}
