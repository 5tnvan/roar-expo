export function formatMinutes(seconds: number) {
  const totalMinutes = Math.max(1, Math.floor(seconds / 60))
  if (totalMinutes >= 1_000_000_000) return (totalMinutes / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'b mins'
  if (totalMinutes >= 1_000_000) return (totalMinutes / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm mins'
  if (totalMinutes >= 1_000) return (totalMinutes / 1_000).toFixed(1).replace(/\.0$/, '') + 'k mins'
  return totalMinutes + ' mins'
}