/** Width (px) reserved for one x-axis label, based on the longest label ("Mon" is narrower than "12 Oct"). */
export function labelWidthFor(labels: string[]): number {
  const longest = labels.reduce((m, l) => Math.max(m, l.length), 0);
  return Math.min(Math.max(longest * 7 + 12, 32), 64);
}

/** Which x-axis labels to draw so they never overlap: all of them when they fit, otherwise evenly spaced (first and last included). */
export function pickLabelIndices(count: number, plotWidth: number, labelWidth: number): number[] {
  if (count <= 0) return [];
  const slots = Math.max(2, Math.floor(plotWidth / labelWidth));
  if (count <= slots) return Array.from({ length: count }, (_, i) => i);
  const picked = new Set<number>();
  for (let k = 0; k < slots; k++) picked.add(Math.round((k * (count - 1)) / (slots - 1)));
  return [...picked];
}

export function nearestIndex(xs: number[], x: number): number {
  let best = 0;
  xs.forEach((px, i) => { if (Math.abs(px - x) < Math.abs((xs[best] ?? 0) - x)) best = i; });
  return best;
}
