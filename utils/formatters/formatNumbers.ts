/**
 * Formats a number into a human-readable string with k/m suffix
 * e.g., 1500 => "1.5k", 2_500_000 => "2.5m"
 */
export const formatNumber = (num: number): string => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  return num.toString();
};