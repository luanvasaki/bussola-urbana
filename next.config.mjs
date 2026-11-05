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
  async headers() { return [{ source: "/:path*", headers: seguranca }]; },
};
