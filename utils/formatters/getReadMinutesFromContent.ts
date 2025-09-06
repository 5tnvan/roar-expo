import { formatNumber } from "./formatNumbers";

// Helper: format content into minutes
export const getReadMinutesFromContent = (content?: string | null) => {
  if (!content) return 0;
  const words = content.split(/\s+/).length;
  return formatNumber(Math.max(1, Math.ceil(words / 200))); // assuming 200 wpm
};