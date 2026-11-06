/** @type {import('next').NextConfig} */
const seguranca = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" }, // ninguém embute o app; o app pode embutir o vídeo do YouTube
  { key: "Permissions-Policy", value: "geolocation=(self), camera=(), microphone=(), payment=()" },
];
export default {
  reactStrictMode: true,
  poweredByHeader: false,
  // Sem cache de páginas no navegador: um relato enviado pelo celular aparece na hora no telão do gestor
  experimental: { staleTimes: { dynamic: 0 } },
  async headers() { return [{ source: "/:path*", headers: seguranca }, { source: "/ruas-sorocaba.svg", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }] }]; },
};
