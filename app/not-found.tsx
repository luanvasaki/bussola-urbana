import Link from "next/link";
export const metadata = { title: "Página não encontrada" };
export default function NaoEncontrada() {
  return <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-6">
    <h1 className="text-3xl font-bold">Página não encontrada</h1>
    <p className="text-forest/80">O endereço pode estar incompleto ou a página mudou de lugar.</p>
    <div className="grid gap-2"><Link href="/" className="btn py-3">Ir para a página inicial</Link><Link href="/cidadao" className="btn-o py-3">Entrar em campo</Link><Link href="/gestor" className="btn-o py-3">Entrar como gestor</Link></div>
  </main>;
}
