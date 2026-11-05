"use client";
import dynamic from "next/dynamic";
import type { Area } from "@/lib/types";
const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => <div className="h-72 animate-pulse rounded-xl bg-mint-100" /> });
export function MapaInicio({ areas }: { areas: Area[] }) { return <MapView className="h-80" areas={areas} heat={false} cooperativo />; }
export function MapaPick({ valor, onChange }: { valor: { lat: number; lon: number } | null; onChange: (p: { lat: number; lon: number }) => void }) {
  return <MapView className="h-72" picked={valor} heat={false} onPick={onChange} cooperativo />;
}
