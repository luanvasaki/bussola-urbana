import type { MetadataRoute } from "next";
// Permite "Adicionar à tela inicial" no celular; abre direto no acesso de campo
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bússola Urbana", short_name: "Bússola",
    description: "Áreas de atenção em Sorocaba e relato anônimo de problemas na rua.",
    start_url: "/cidadao", display: "standalone", background_color: "#eefbf3", theme_color: "#0d2b20", lang: "pt-BR",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }, { src: "/apple-icon", sizes: "180x180", type: "image/png" }],
  };
}
