import Link from "next/link";
export default function L({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto min-h-screen max-w-md bg-mint"><header className="flex items-center justify-between bg-forest px-4 py-3 text-white"><Link href="/cidadao" className="font-bold">Bússola Urbana</Link><Link href="/" className="text-xs text-white/70">Início</Link></header><div className="p-4">{children}</div></div>;
}
