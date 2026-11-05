export default function Carregando() {
  return <div className="space-y-4" role="status" aria-label="Carregando">
    <div className="h-9 w-1/2 animate-pulse rounded-lg bg-mint-100" />
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-md bg-white/70" />)}</div>
    <div className="h-[460px] animate-pulse rounded-md bg-white/70" />
  </div>;
}
