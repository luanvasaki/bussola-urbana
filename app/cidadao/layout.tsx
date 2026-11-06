import Link from "next/link";
export const metadata = { title: "Campo" };
export default function L({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto min-h-screen max-w-md bg-mint">
    <header className="flex items-center justify-between bg-forest px-4 py-2 text-white">
      <Link href="/cidadao" className="flex items-center gap-2 py-1.5 font-display text-lg font-bold">
        <svg aria-hidden="true" viewBox="0 0 32 32" className="h-7 w-7"><circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M22.5 9.5 17.6 17.6 9.5 22.5 14.4 14.4Z" fill="#eefbf3" /><path d="M22.5 9.5 17.6 17.6 14.4 14.4Z" fill="#b91c1c" /></svg>
        Bússola Urbana
      </Link>
      <Link href="/" className="rounded-md px-3 py-3 text-sm text-white/85 hover:bg-white/10">Página inicial</Link>
    </header>
    <main id="conteudo" className="p-4">{children}</main>
  </div>;
}
