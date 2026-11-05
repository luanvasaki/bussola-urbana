"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import type { Area } from "@/lib/types";
const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => <div className="h-72 animate-pulse rounded-xl bg-mint-100" /> });
export function MapaInicio({ areas }: { areas: Area[] }) { return <MapView className="h-80" areas={areas} heat={false} />; }
export function MapaPick({ onChange }: { onChange: (p: { lat: number; lon: number }) => void }) {
  const [p, setP] = useState<{ lat: number; lon: number } | null>(null);
  return <MapView className="h-72" picked={p} heat={false} onPick={(x) => { setP(x); onChange(x); }} />;
}
