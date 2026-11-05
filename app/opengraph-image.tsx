import { ImageResponse } from "next/og";
export const alt = "Bússola Urbana: onde as ocorrências se concentram em Sorocaba";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Cartão que aparece ao compartilhar o link (WhatsApp, redes, e-mail)
export default function Cartao() {
  // Pontos fixos, no espírito do mapa da página inicial
  const pontos = Array.from({ length: 140 }, (_, i) => {
    const a = i * 2.39996, r = 18 + Math.sqrt(i) * 19;
    return { x: 860 + Math.cos(a) * r * 1.15, y: 315 + Math.sin(a) * r * 0.95, s: i % 9 === 0 ? 9 : 5 };
  });
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#0d2b20", color: "#eefbf3", position: "relative" }}>
      {pontos.map((p, i) => <div key={i} style={{ position: "absolute", left: p.x, top: p.y, width: p.s, height: p.s, borderRadius: 99, background: i % 9 === 0 ? "#dc2626" : "#a7e8c4", opacity: i % 9 === 0 ? 0.95 : 0.55 }} />)}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: 700 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="64" height="64" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="none" stroke="#eefbf3" strokeWidth="2" /><path d="M22.5 9.5 17.6 17.6 9.5 22.5 14.4 14.4Z" fill="#eefbf3" /><path d="M22.5 9.5 17.6 17.6 14.4 14.4Z" fill="#dc2626" /></svg>
          <div style={{ fontSize: 40, fontWeight: 700 }}>Bússola Urbana</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.05 }}>Onde as ocorrências se concentram em Sorocaba</div>
          <div style={{ fontSize: 28, color: "#a7e8c4" }}>Dados abertos da SSP-SP e relato anônimo de problemas na rua</div>
        </div>
        <div style={{ fontSize: 22, color: "#eefbf3", opacity: 0.75 }}>Projeto acadêmico UPX I, Facens</div>
      </div>
    </div>,
    size,
  );
}
