/**
 * Merge COMB shell / wing filter params from the current page into a URLSearchParams instance.
 * Used when drilling into chart-breakdown so Back can return with ?comb=1 and keep the sidebar hidden.
 */
export function appendShellParams(target, locationSearch) {
  const existing = new URLSearchParams(locationSearch || '');
  if (existing.get('comb') === '1') {
    target.set('comb', '1');
  }
  const wing = existing.get('wing');
  if (wing) {
    target.set('wing', wing);
  }
}
