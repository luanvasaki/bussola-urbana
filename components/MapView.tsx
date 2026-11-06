"use client";
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Area, Oc, Relato } from "@/lib/types";
import { COR, prioridade, nomeBairro, NATUREZA_ROTULO, rotuloPeriodo } from "@/lib/rules";
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

type Props = {
  areas?: Area[]; pontos?: Oc[]; relatos?: Relato[]; selectedId?: number | null; heat?: boolean;
  onSelect?: (id: number) => void; onPick?: (p: { lat: number; lon: number }) => void; picked?: { lat: number; lon: number } | null;
  className?: string; cooperativo?: boolean;
};
const SOROCABA: [number, number] = [-47.4526, -23.5015];

export default function MapView({ areas = [], pontos = [], relatos = [], selectedId, heat = true, onSelect, onPick, picked, className = "h-[420px]", cooperativo = false }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const pick = useRef<maplibregl.Marker | null>(null);
  const cb = useRef({ onSelect, onPick }); cb.current = { onSelect, onPick };
  const [falhou, setFalhou] = useState(false);
  const areasIniciais = useRef(areas);

  useEffect(() => {
    // Sem WebGL (navegador embutido de leitor de QR, aparelho antigo, economia de energia) o MapLibre lança erro:
    // mostra um aviso no lugar do mapa em vez de derrubar a página inteira.
    let m: maplibregl.Map;
    try { m = new maplibregl.Map({
      container: el.current!, center: SOROCABA, zoom: 11.3, attributionControl: { compact: true },
      // Em telas de toque, um dedo rola a página e dois movem o mapa (o mapa não "prende" a rolagem do formulário)
      cooperativeGestures: cooperativo && window.matchMedia("(pointer: coarse)").matches,
      locale: { "CooperativeGesturesHandler.MobileHelpText": "Use dois dedos para mover o mapa", "CooperativeGesturesHandler.WindowsHelpText": "Use Ctrl + rolagem para aproximar", "CooperativeGesturesHandler.MacHelpText": "Use ⌘ + rolagem para aproximar",
        "Map.Title": "Mapa", "NavigationControl.ZoomIn": "Aproximar", "NavigationControl.ZoomOut": "Afastar", "AttributionControl.ToggleAttribution": "Créditos do mapa", "Marker.Title": "Marcador" },
      style: { version: 8, sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: "© OpenStreetMap" } }, layers: [{ id: "fundo", type: "background", paint: { "background-color": "#eefbf3" } }, { id: "osm", type: "raster", source: "osm", paint: { "raster-saturation": -0.85, "raster-contrast": -0.05, "raster-opacity": 0.85 } }] },
    }); } catch (e) { console.error("Mapa indisponível:", e); setFalhou(true); return; }
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    m.on("click", (e) => cb.current.onPick?.({ lat: +e.lngLat.lat.toFixed(6), lon: +e.lngLat.lng.toFixed(6) }));
    if (cb.current.onPick) m.getCanvas().style.cursor = "crosshair";
    map.current = m;
    m.on("webglcontextlost", () => setFalhou(true));
    // Enquadra todas as áreas (no celular o centro fixo cortava metade delas)
    if (areasIniciais.current.length > 1 && !cb.current.onPick) {
      const b = new maplibregl.LngLatBounds();
      areasIniciais.current.forEach((a) => b.extend([a.lon, a.lat]));
      m.fitBounds(b, { padding: 36, duration: 0, maxZoom: 13 });
    }
    // O MapLibre só acompanha o redimensionamento da janela; isto cobre mudanças no tamanho do contêiner.
    const ro = new ResizeObserver(() => m.resize());
    ro.observe(el.current!);
    return () => { ro.disconnect(); m.remove(); };
  }, []);

  // mapa de calor das ocorrências (dado oficial)
  useEffect(() => {
    const m = map.current; if (!m) return;
    const draw = () => {
      const data = { type: "FeatureCollection" as const, features: heat ? pontos.map((p) => ({ type: "Feature" as const, properties: { t: `${NATUREZA_ROTULO[p.natureza] ?? p.natureza}, ${rotuloPeriodo(p.periodo).toLowerCase()}, ${MESES[p.mes - 1]}/2026` }, geometry: { type: "Point" as const, coordinates: [p.lon, p.lat] } })) : [] };
      const src = m.getSource("pts") as maplibregl.GeoJSONSource | undefined;
      if (src) { src.setData(data); return; }
      m.addSource("pts", { type: "geojson", data });
      m.addLayer({ id: "heat", type: "heatmap", source: "pts", paint: {
        "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 10, 6, 15, 24], "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 10, 0.25, 15, 0.9], "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0.6, 15.5, 0.15],
        "heatmap-color": ["interpolate", ["linear"], ["heatmap-density"], 0, "rgba(255,255,255,0)", 0.3, "rgba(253,186,116,.55)", 0.6, "rgba(239,68,68,.7)", 1, "rgba(153,27,27,.9)"] } });
      // De perto, cada registro aparece como um ponto (o calor esmaece)
      m.addLayer({ id: "pts-c", type: "circle", source: "pts", minzoom: 13, paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 13, 2.5, 17, 5.5], "circle-color": "#0d2b20", "circle-opacity": 0.55, "circle-stroke-color": "#eefbf3", "circle-stroke-width": 0.75 } });
      // Passar o mouse (ou tocar) num ponto mostra o tipo de crime, o período do dia e o mês.
      // Vários registros no mesmo endereço ficam sobrepostos: a dica lista todos.
      const dica = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 8, className: "bu-dica" });
      const mostra = (e: maplibregl.MapLayerMouseEvent) => {
        const fs = e.features ?? []; if (!fs.length) return;
        const linhas = fs.map((f) => String(f.properties?.t ?? ""));
        const cont = new Map<string, number>(); linhas.forEach((l) => cont.set(l, (cont.get(l) ?? 0) + 1));
        const lista = [...cont].slice(0, 6).map(([l, n]) => `<li>${n > 1 ? `<b>${n}×</b> ` : ""}${l}</li>`).join("");
        const titulo = fs.length === 1 ? "Ocorrência SSP-SP" : `${fs.length} ocorrências neste ponto`;
        m.getCanvas().style.cursor = "pointer";
        dica.setLngLat(e.lngLat).setHTML(`<div class="bu-dica-t">${titulo}</div><ul>${lista}</ul>${cont.size > 6 ? `<div class="bu-dica-mais">e mais ${cont.size - 6} tipos</div>` : ""}`).addTo(m);
      };
      m.on("mousemove", "pts-c", mostra);
      m.on("click", "pts-c", mostra);
      m.on("mouseleave", "pts-c", () => { dica.remove(); m.getCanvas().style.cursor = cb.current.onPick ? "crosshair" : ""; });
    };
    m.loaded() ? draw() : m.once("load", draw);
  }, [pontos, heat]);

  // marcadores: áreas (índice) e relatos
  useEffect(() => {
    const m = map.current; if (!m) return;
    markers.current.forEach((x) => x.remove()); markers.current = [];
    for (const a of areas) {
      const cor = COR[prioridade(a.indice)];
      const clicavel = Boolean(cb.current.onSelect);
      const d = document.createElement(clicavel ? "button" : "div");
      const rotulo = `${nomeBairro(a.bairro)}, Índice de Atenção ${a.indice}, prioridade ${prioridade(a.indice).toLowerCase()}`;
      d.title = rotulo; d.setAttribute("aria-label", clicavel ? `Selecionar ${rotulo}` : rotulo); if (!clicavel) d.setAttribute("role", "img");
      const sel = a.id === selectedId;
      const texto = prioridade(a.indice) === "Média" ? "#0d2b20" : "#fff"; // branco sobre laranja não tem contraste suficiente
      d.style.cssText = `display:grid;place-items:center;background:${cor};color:${texto};border:${sel ? "3px solid #0d2b20" : "2px solid #eefbf3"};${sel ? "outline:2px solid #eefbf3;" : ""}border-radius:999px;min-width:${sel ? 36 : 30}px;height:${sel ? 36 : 30}px;font:700 12px var(--f-texto),system-ui;font-variant-numeric:tabular-nums;cursor:${clicavel ? "pointer" : "default"}`;
      d.textContent = String(a.indice);
      d.onclick = (ev) => { ev.stopPropagation(); cb.current.onSelect?.(a.id); };
      markers.current.push(new maplibregl.Marker({ element: d }).setLngLat([a.lon, a.lat]).addTo(m));
      d.setAttribute("aria-label", clicavel ? `Selecionar ${rotulo}` : rotulo); // o MapLibre troca por "Map marker"
    }
    for (const r of relatos) {
      const d = document.createElement("div");
      d.title = `Relato de campo: ${r.categoria}, ${r.protocolo}`;
      d.style.cssText = "width:11px;height:11px;background:#0d2b20;border:2px solid #eefbf3;border-radius:1px";
      markers.current.push(new maplibregl.Marker({ element: d }).setLngLat([r.lon, r.lat]).addTo(m));
      d.setAttribute("role", "img"); d.setAttribute("aria-label", d.title);
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
    if (!picked) return;
    pick.current = new maplibregl.Marker({ color: "#b91c1c" }).setLngLat([picked.lon, picked.lat]).addTo(m);
    // ponto vindo da busca de endereço ou do GPS: leva o mapa até lá, perto o bastante para ajustar com o dedo
    if (!m.getBounds().contains([picked.lon, picked.lat]) || m.getZoom() < 15) m.flyTo({ center: [picked.lon, picked.lat], zoom: 16, duration: 900 });
  }, [picked]);

  if (falhou) return <div role="status" className={`grid w-full place-items-center rounded-md border-[1.5px] border-dashed border-forest/30 p-6 text-center text-sm text-forest/80 ${className}`}>
    <p className="max-w-[32ch]">{onPick ? "O mapa não abre neste aparelho. Busque o CEP ou a rua, ou use \"Usar minha localização\" acima." : "O mapa não abre neste aparelho. Os dados continuam disponíveis nas listas."}</p></div>;
  return <div ref={el} className={`w-full overflow-hidden rounded-md ${className}`} />;
}
