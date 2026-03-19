/** Returns a hex colour for a progress bar based on value and direction.
 *  Use invert=true for metrics where higher is better (e.g. ammo). */
export function barColor(v: number, invert = false): string {
  if (v >= 100) return invert ? '#22c55e' : '#ef4444';
  const high = invert ? v < 30 : v > 70;
  return high ? '#22c55e' : v > 30 ? '#f59e0b' : '#ef4444';
}

/** Maps an array of i18n keys to Dropdown-compatible option objects. */
export function buildOptions(keys: string[], t: (k: string) => string): { label: string; value: string }[] {
  return keys.map((k) => ({ label: t(k), value: k }));
}
