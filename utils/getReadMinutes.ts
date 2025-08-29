export const getReadMinutes = (content?: string | null) => {
  if (!content) return 0;
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200)); // assuming 200 wpm
};