import Link from "next/link";
import { getPublico } from "@/lib/db";
import { MapaInicio } from "@/components/MapaCidadao";
export const dynamic = "force-dynamic";
export default async function Page() {
  const { areas } = await getPublico();
  return <div className="space-y-4"><div><h1 className="text-2xl font-bold">Mapa da cidade</h1><p className="text-sm text-forest/70">Áreas de atenção identificadas com dados abertos da SSP-SP. Viu um problema na rua? Relate falhas de iluminação, calçadas e uso do espaço para que os órgãos públicos possam agir.</p></div>
    <MapaInicio areas={areas.slice(0, 12)} />
    <Link href="/cidadao/relatar" className="btn w-full py-3">Relatar um problema</Link><Link href="/cidadao/acompanhar" className="btn-o w-full py-3">Acompanhar relato</Link>
    <p className="text-xs text-forest/60">Os números no mapa são o Índice de Atenção das 12 áreas mais críticas. Não indica que um lugar é perigoso para quem o frequenta.</p></div>;
}
