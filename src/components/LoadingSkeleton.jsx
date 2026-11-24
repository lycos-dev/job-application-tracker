export default function LoadingSkeleton() {
  return <main className="tracker loading" aria-busy="true" aria-label="Loading Roleward">
    <div className="skeleton-title" /><div className="skeleton-tiles">{Array.from({ length: 5 }, (_, i) => <i key={i}/>)}</div>
    <div className="skeleton-toolbar" /><div className="skeleton-panel" />
  </main>
}
