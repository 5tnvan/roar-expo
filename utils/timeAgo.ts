// utils/timeAgo.ts
export function timeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d${days > 1 ? "" : ""}`;
  } else if (hours > 0) {
    return `${hours}h${hours > 1 ? "" : ""}`;
  } else if (minutes > 0) {
    return `${minutes}m${minutes > 1 ? "" : ""}`;
  } else {
    return "just now";
  }
}
