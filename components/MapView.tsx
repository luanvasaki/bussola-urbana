"use client";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Area, Oc, Relato } from "@/lib/types";
import { COR, prioridade, nomeBairro } from "@/lib/rules";

type Props = {
  areas?: Area[]; pontos?: Oc[]; relatos?: Relato[]; selectedId?: number | null; heat?: boolean;
  onSelect?: (id: number) => void; onPick?: (p: { lat: number; lon: number }) => void; picked?: { lat: number; lon: number } | null;
  className?: string;
};
const SOROCABA: [number, number] = [-47.4526, -23.5015];

export default function MapView({ areas = [], pontos = [], relatos = [], selectedId, heat = true, onSelect, onPick, picked, className = "h-[420px]" }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const pick = useRef<maplibregl.Marker | null>(null);
  const cb = useRef({ onSelect, onPick }); cb.current = { onSelect, onPick };

  useEffect(() => {
    const m = new maplibregl.Map({
      container: el.current!, center: SOROCABA, zoom: 11.3, attributionControl: { compact: true },
      style: { version: 8, sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: "© OpenStreetMap" } }, layers: [{ id: "osm", type: "raster", source: "osm" }] },
    });
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    m.on("click", (e) => cb.current.onPick?.({ lat: +e.lngLat.lat.toFixed(6), lon: +e.lngLat.lng.toFixed(6) }));
    if (cb.current.onPick) m.getCanvas().style.cursor = "crosshair";
    map.current = m;
    // O MapLibre só acompanha o redimensionamento da janela; isto cobre mudanças no tamanho do contêiner.
    const ro = new ResizeObserver(() => m.resize());
    ro.observe(el.current!);
    return () => { ro.disconnect(); m.remove(); };
  }, []);

  // mapa de calor das ocorrências (dado oficial)
  useEffect(() => {
    const m = map.current; if (!m) return;
    const draw = () => {
      const data = { type: "FeatureCollection" as const, features: heat ? pontos.map((p) => ({ type: "Feature" as const, properties: {}, geometry: { type: "Point" as const, coordinates: [p.lon, p.lat] } })) : [] };
      const src = m.getSource("pts") as maplibregl.GeoJSONSource | undefined;
      if (src) { src.setData(data); return; }
      m.addSource("pts", { type: "geojson", data });
      m.addLayer({ id: "heat", type: "heatmap", source: "pts", paint: {
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, 6, 15, 24], "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 10, 0.25, 15, 0.9], "heatmap-opacity": 0.6,
        "heatmap-color": ["interpolate", ["linear"], ["heatmap-density"], 0, "rgba(255,255,255,0)", 0.3, "rgba(253,186,116,.55)", 0.6, "rgba(239,68,68,.7)", 1, "rgba(153,27,27,.9)"] } });
    };
    m.loaded() ? draw() : m.once("load", draw);
  }, [pontos, heat]);

  // marcadores: áreas (índice) e relatos
  useEffect(() => {
    const m = map.current; if (!m) return;
    markers.current.forEach((x) => x.remove()); markers.current = [];
    for (const a of areas) {
      const cor = COR[prioridade(a.indice)];
      const d = document.createElement("button");
      d.title = `${nomeBairro(a.bairro)} — índice ${a.indice}`;
      const sel = a.id === selectedId;
      d.style.cssText = `background:${cor};color:#fff;border:${sel ? "3px solid #0d2b20" : "2px solid #fff"};border-radius:999px;min-width:${sel ? 36 : 30}px;height:${sel ? 36 : 30}px;font:700 12px system-ui;box-shadow:0 1px 4px rgba(0,0,0,.4);cursor:pointer`;
      d.textContent = String(a.indice);
      d.onclick = (ev) => { ev.stopPropagation(); cb.current.onSelect?.(a.id); };
      markers.current.push(new maplibregl.Marker({ element: d }).setLngLat([a.lon, a.lat]).addTo(m));
    }
    for (const r of relatos) {
      const d = document.createElement("div");
      d.title = `${r.categoria} · ${r.protocolo}`;
      d.style.cssText = "width:12px;height:12px;background:#2563eb;border:2px solid #fff;border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,.4)";
      markers.current.push(new maplibregl.Marker({ element: d }).setLngLat([r.lon, r.lat]).addTo(m));
    }
  }, [areas, relatos, selectedId]);

  useEffect(() => {
    const m = map.current; if (!m || !selectedId) return;
    const a = areas.find((x) => x.id === selectedId);
    if (a) m.flyTo({ center: [a.lon, a.lat], zoom: Math.max(m.getZoom(), 14.2), duration: 700 });
  }, [selectedId, areas]);

  useEffect(() => {
    const m = map.current; if (!m) return;
    pick.current?.remove(); pick.current = null;
    if (picked) pick.current = new maplibregl.Marker({ color: "#b91c1c" }).setLngLat([picked.lon, picked.lat]).addTo(m);
  }, [picked]);

  return <div ref={el} className={`w-full overflow-hidden rounded-xl ${className}`} />;
}
