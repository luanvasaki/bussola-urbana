import { ImageResponse } from "next/og";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
// Ícone de "Adicionar à tela inicial": a mesma bússola do cabeçalho
export default function Icone() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d2b20" }}>
      <svg width="130" height="130" viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" fill="none" stroke="#eefbf3" strokeWidth="2" /><path d="M22.5 9.5 17.6 17.6 9.5 22.5 14.4 14.4Z" fill="#eefbf3" /><path d="M22.5 9.5 17.6 17.6 14.4 14.4Z" fill="#dc2626" /></svg>
    </div>,
    size,
  );
}
