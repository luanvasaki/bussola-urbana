import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";

// Mesmo par de fontes da página de apresentação em todo o app
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--f-display" });
const texto = Instrument_Sans({ subsets: ["latin"], variable: "--f-texto" });

const descricao = "Onde as ocorrências se concentram em Sorocaba: áreas de atenção com dados abertos da SSP-SP e relato anônimo de problemas na rua. Projeto acadêmico UPX I, Facens.";
export const metadata: Metadata = {
  metadataBase: new URL("https://bussola-urbana-app.vercel.app"),
  title: { default: "Bússola Urbana", template: "%s · Bússola Urbana" },
  description: descricao,
  openGraph: { type: "website", locale: "pt_BR", siteName: "Bússola Urbana", title: "Bússola Urbana", description: descricao },
  twitter: { card: "summary_large_image", title: "Bússola Urbana", description: descricao },
};
export const viewport: Viewport = { themeColor: "#0d2b20" };

export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR" className={`${display.variable} ${texto.variable}`}><body className="font-sans antialiased">{children}</body></html>;
}
