"use client";
import dynamic from "next/dynamic";
import type { Area, Oc, Relato } from "@/lib/types";
const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => <div className="h-80 animate-pulse rounded-md bg-forest/[.06]" /> });
export default function MapaZona({ area, pontos, relatos }: { area: Area; pontos: Oc[]; relatos: Relato[] }) {
  return <MapView className="h-80" areas={[area]} pontos={pontos} relatos={relatos} selectedId={area.id} />;
}
