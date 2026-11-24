const paths = {
  plus: 'M12 5v14M5 12h14', arrow: 'M4 12h15m-6-6 6 6-6 6',
  external: 'M7 17 18 6M8 6h10v10', search: 'M20 20l-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  star: 'm12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9z',
  board: 'M3 5h18v14H3zM9 5v14m6-14v14', list: 'M8 6h13M8 12h13M8 18h13M3 6h1m-1 6h1m-1 6h1',
  flag: 'M5 21V4h13l-3 4 3 4H5', x: 'm6 6 12 12M18 6 6 18',
  theme: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 0v18',
  grip: 'M8 6h.1M8 12h.1M8 18h.1M15 6h.1M15 12h.1M15 18h.1',
  device: 'M3 4h18v13H3zM8 21h8m-4-4v4', check: 'm4 12 5 5L20 6',
  folder: 'M3 7h7l2 2h9v10H3zM4 7V4h7l2 2h6v3',
}
export default function Icon({ name, size = 18, fill = false }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={name === 'grip' ? 3.5 : 1.65} strokeLinecap="round" strokeLinejoin="round">
    <path d={paths[name]} fill={fill ? 'currentColor' : 'none'} />
  </svg>
}
