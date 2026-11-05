import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Bússola Urbana", description: "Inteligência urbana preventiva para Sorocaba/SP — projeto acadêmico (Facens, UPX I)." };
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="pt-BR"><body className="font-sans antialiased">{children}</body></html>;
}
