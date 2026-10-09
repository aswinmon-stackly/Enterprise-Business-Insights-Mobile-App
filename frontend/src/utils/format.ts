/** Indian digit grouping without relying on Intl (inconsistent on some Android JS engines). */
export function groupIndian(n: number): string {
  const s = Math.round(Math.abs(n)).toString();
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  const grouped = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3 : last3;
  return (n < 0 ? '-' : '') + grouped;
}

export function formatCurrencyCompact(n: number): string {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${groupIndian(n)}`;
}

export const formatNumber = (n: number): string => groupIndian(n);
export const formatPct = (n: number): string => `${Math.abs(n).toFixed(1)}%`;

export function greeting(date = new Date()): string {
  const h = date.getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

/** Full rupee amount, e.g. ₹24,500 or ₹1,82,000. */
export const formatRupees = (n: number): string => `₹${groupIndian(n)}`;

export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const diffMin = Math.floor((now - new Date(iso).getTime()) / 60000);
  if (Number.isNaN(diffMin)) return '';
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
  if (h < 48) return 'Yesterday';
  return `${Math.floor(h / 24)} days ago`;
}
