// Esqueleto enquanto a página de campo busca os dados: evita tela branca com internet lenta
export default function Carregando() {
  return <div className="space-y-4" role="status" aria-label="Carregando">
    <div className="h-8 w-2/3 animate-pulse rounded-lg bg-mint-100" />
    <div className="h-4 w-full animate-pulse rounded bg-mint-100" />
    <div className="h-72 animate-pulse rounded-md bg-mint-100" />
    <div className="h-12 animate-pulse rounded-md bg-mint-100" />
  </div>;
}
