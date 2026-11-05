"use client";
import { useState } from "react";

/** Mostra a capa do vídeo e só carrega o player do YouTube quando a pessoa clica: a página continua leve. */
export default function Video({ id, titulo }: { id: string; titulo: string }) {
  const [tocando, setTocando] = useState(false);
  return (
    <div className="relative aspect-video overflow-hidden rounded-md bg-forest-800 shadow-[0_30px_80px_-20px_rgba(0,0,0,.6)] ring-1 ring-mint/15">
      {tocando ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={titulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button type="button" onClick={() => setTocando(true)} className="group absolute inset-0 h-full w-full" aria-label={`Assistir: ${titulo}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover opacity-85 transition-opacity group-hover:opacity-100" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-mint text-forest shadow-xl transition-transform group-hover:scale-105 group-focus-visible:scale-105">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="ml-1 h-8 w-8" fill="currentColor"><path d="M8 5.5v13l10.5-6.5z" /></svg>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
