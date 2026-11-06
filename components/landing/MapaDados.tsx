import type { Area, Oc } from "@/lib/types";
import { nomeBairro, prioridade, COR } from "@/lib/rules";
import MapaVivo, { type Alvo } from "./MapaVivo";

/** Mapa-assinatura da página de entrada: SVG estático renderizado no servidor a partir dos dados reais. */
const W = 1000;
const RUAS = { latN: -23.28, latS: -23.72, lonO: -47.8, lonL: -47.1 }; // recorte usado ao gerar public/ruas-sorocaba.svg

function pct(v: number[], p: number) {
  const s = [...v].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.floor((p / 100) * s.length)))];
}

export default function MapaDados({ ocorrencias, areas, ano }: { ocorrencias: Oc[]; areas: Area[]; ano: string }) {
  const lats = ocorrencias.map((o) => o.lat), lons = ocorrencias.map((o) => o.lon);
  const pad = 0.012;
  const minLat = pct(lats, 1) - pad, maxLat = pct(lats, 99) + pad, minLon = pct(lons, 1) - pad, maxLon = pct(lons, 99) + pad;
  const k = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const escala = W / ((maxLon - minLon) * k);
  const H = Math.round((maxLat - minLat) * escala);
  const xy = (lat: number, lon: number) => [(lon - minLon) * k * escala, (maxLat - lat) * escala] as const;

  // Uma bolinha sólida por ocorrência. Registros na mesma coordenada se espalham numa espiral fixa (ângulo áureo),
  // sem inventar nenhum registro. A cor vem da concentração ao redor: verde claro onde há poucos, verde escuro onde há muitos.
  const OURO = Math.PI * (3 - Math.sqrt(5)), PASSO = 1.1;
  const vistos = new Map<string, number>();
  const pontos: { x: number; y: number }[] = [];
  for (const o of ocorrencias) {
    let [x, y] = xy(o.lat, o.lon);
    if (x < -0.8 * W || y < -0.4 * H || x > 1.8 * W || y > 1.4 * H) continue; // pontos distantes também entram: o mapa vai de borda a borda
    const c = `${o.lat},${o.lon}`, i = vistos.get(c) ?? 0; vistos.set(c, i + 1);
    if (i) { const r = PASSO * Math.sqrt(i), t = i * OURO; x += r * Math.cos(t); y += r * Math.sin(t); }
    pontos.push({ x, y });
  }
  // concentração = quantas ocorrências num raio de ~12 unidades (grade de células para contar rápido)
  const CEL = 12, celulas = new Map<string, number>();
  for (const p of pontos) { const c = `${Math.floor(p.x / CEL)},${Math.floor(p.y / CEL)}`; celulas.set(c, (celulas.get(c) ?? 0) + 1); }
  const dens = pontos.map((p) => {
    const cx = Math.floor(p.x / CEL), cy = Math.floor(p.y / CEL); let n = 0;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) n += celulas.get(`${cx + dx},${cy + dy}`) ?? 0;
    return n;
  });
  const cortes = [40, 65, 82, 93].map((q) => pct(dens, q));
  const NIVEIS = ["#dff5e8", "#a7e8c4", "#6fdc98", "#2fb866", "#16884a"]; // do mais claro (pouca concentração) ao mais escuro (muita)
  const caminhos = NIVEIS.map(() => "");
  pontos.forEach((p, i) => { const n = cortes.filter((c) => dens[i] > c).length; caminhos[n] += `M${p.x.toFixed(1)} ${p.y.toFixed(1)}h0`; });

  // A bússola fica no quadrante mais vazio do mapa e aponta para a área de maior índice.
  const quadrantes = [[0.16, 0.2], [0.84, 0.2], [0.16, 0.82], [0.84, 0.82]].map(([fx, fy]) => {
    const x = fx * W, y = fy * H;
    return { x, y, peso: pontos.reduce((a, p) => a + (Math.hypot(p.x - x, p.y - y) < 120 ? 1 : 0), 0) };
  });
  const { x: cx, y: cy } = quadrantes.sort((a, b) => a.peso - b.peso)[0];
  const alvos: Alvo[] = [...areas].sort((a, b) => b.indice - a.indice || b.n - a.n)
    .filter((a, i) => i === 0 || prioridade(a.indice) === "Alta")
    .map((a) => { const [x, y] = xy(a.lat, a.lon); return { x: Math.round(x), y: Math.round(y), nome: nomeBairro(a.bairro), indice: a.indice }; });
  const pulsos = ocorrencias.map((o) => { const [x, y] = xy(o.lat, o.lon); return [Math.round(x), Math.round(y), o.mes, o.area_id != null ? 1 : 0] as [number, number, number, number]; })
    .filter(([x, y]) => x >= -0.8 * W && y >= -0.4 * H && x <= 1.8 * W && y <= 1.4 * H);
  const topo = alvos[0];

  // Grade de coordenadas a cada 0,02°, estendida além do recorte para atravessar a tela inteira.
  const grade: { d: string }[] = [];
  for (let lon = Math.ceil((minLon - 0.5) / 0.02) * 0.02; lon <= maxLon + 0.5; lon += 0.02) { const [x] = xy(minLat, lon); grade.push({ d: `M ${x.toFixed(1)} ${-2 * H} V ${3 * H}` }); }
  for (let lat = Math.ceil((minLat - 0.3) / 0.02) * 0.02; lat <= maxLat + 0.3; lat += 0.02) { const [, y] = xy(lat, minLon); grade.push({ d: `M ${-2 * W} ${y.toFixed(1)} H ${3 * W}` }); }

  // Ruas de Sorocaba (OpenStreetMap) desenhadas bem fracas sob os pontos: public/ruas-sorocaba.svg cobre o recorte RUAS
  const [rx, ry] = xy(RUAS.latN, RUAS.lonO), [rx2, ry2] = xy(RUAS.latS, RUAS.lonL);

  return (
    <>
    <svg viewBox={`0 0 ${W} ${H}`} overflow="visible" className="absolute inset-0 h-full w-full" role="img"
      aria-label={`Mapa de Sorocaba com ${ocorrencias.length.toLocaleString("pt-BR")} ocorrências oficiais e ${areas.length} áreas de atenção. A agulha percorre as áreas de alta prioridade, começando por ${topo.nome}, índice ${topo.indice}.`}>
      <g aria-hidden="true">
        <defs>
          <radialGradient id="ruas-fade" gradientUnits="userSpaceOnUse" cx={W / 2} cy={H / 2} r={W}>
            <stop offset="0.45" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="ruas-mask" maskUnits="userSpaceOnUse" x={rx} y={ry} width={rx2 - rx} height={ry2 - ry}><rect x={rx} y={ry} width={rx2 - rx} height={ry2 - ry} fill="url(#ruas-fade)" /></mask>
        </defs>
        <image href="/ruas-sorocaba.svg" x={rx} y={ry} width={rx2 - rx} height={ry2 - ry} preserveAspectRatio="none" opacity="0.13" mask="url(#ruas-mask)" />
        <path d={grade.map((g) => g.d).join(" ")} stroke="#eefbf3" strokeOpacity="0.06" strokeWidth="1" fill="none" />
        {caminhos.map((d, n) => <path key={n} d={d} stroke={NIVEIS[n]} strokeOpacity={0.6 + n * 0.1} strokeWidth={3} strokeLinecap="round" fill="none" />)}
        {areas.map((a) => {
          const [x, y] = xy(a.lat, a.lon);
          const pr = prioridade(a.indice);
          return <circle key={a.id} cx={x} cy={y} r={Math.max(a.raio_km * escala * 0.011, 9)} fill="none"
            stroke={pr === "Baixa" ? "#a7e8c4" : COR[pr]} strokeOpacity={pr === "Baixa" ? 0.35 : 0.9} strokeWidth={pr === "Alta" ? 2.2 : 1.4} />;
        })}

        {/* Rosa dos ventos; a agulha animada fica em MapaVivo */}
        <g opacity="0.55" fill="#eefbf3" fontSize="20" fontWeight="600" textAnchor="middle">
          <circle cx={cx} cy={cy} r="108" fill="none" stroke="#eefbf3" strokeWidth="1" />
          <circle cx={cx} cy={cy} r="96" fill="none" stroke="#eefbf3" strokeWidth="1" strokeDasharray="1.5 7.5" />
          {[0, 90, 180, 270].map((g) => <line key={g} x1={cx} y1={cy - 108} x2={cx} y2={cy - 92} stroke="#eefbf3" strokeWidth="2" transform={`rotate(${g} ${cx} ${cy})`} />)}
          <text x={cx} y={cy - 118}>N</text><text x={cx} y={cy + 133}>S</text>
          <text x={cx + 126} y={cy + 7}>L</text><text x={cx - 126} y={cy + 7}>O</text>
        </g>
      </g>
    </svg>
    <MapaVivo W={W} H={H} cx={cx} cy={cy} alvos={alvos} pulsos={pulsos} ano={ano} />
    </>
  );
}
