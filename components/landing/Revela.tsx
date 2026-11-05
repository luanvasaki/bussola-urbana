"use client";
import { useEffect, useRef } from "react";

/**
 * Revela o conteúdo quando entra na tela. Sem JS ou com "reduzir movimento", tudo já aparece visível:
 * o estado escondido só é aplicado depois que o componente monta (data-revela="pronto").
 */
export default function Revela({ children, className = "", as: Tag = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "section" | "ol" | "dl" }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.dataset.revela = "pronto";
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.dataset.revela = "visivel"; io.disconnect(); } }, { threshold: 0.25, rootMargin: "0px 0px -8% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref as never} className={className}>{children}</Tag>;
}
