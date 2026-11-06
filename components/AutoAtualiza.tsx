"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Recarrega os dados da página a cada 20 s enquanto a aba está visível: um relato enviado pelo celular aparece sozinho no telão. */
export default function AutoAtualiza({ segundos = 20 }: { segundos?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => { if (document.visibilityState === "visible") router.refresh(); }, segundos * 1000);
    return () => clearInterval(id);
  }, [router, segundos]);
  return null;
}
