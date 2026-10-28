export function restoreAppearance(store: Pick<Storage, 'getItem'>, systemDark: boolean): boolean {
  try { const value = store.getItem('morrow-theme'); return value === 'dark' ? true : value === 'light' ? false : systemDark; } catch { return systemDark; }
}
export function persistAppearance(store: Pick<Storage, 'setItem'>, dark: boolean) {
  try { store.setItem('morrow-theme', dark ? 'dark' : 'light'); } catch { /* Session appearance still works. */ }
}
