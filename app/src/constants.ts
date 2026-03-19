// ── Localisation ────────────────────────────────────────────────
export const LANGUAGES = ['cs', 'en', 'sk'] as const;

export type Language = typeof LANGUAGES[number];

/** Returns the next language in the rotation after the currently active one. */
export function nextLanguage(current: string): Language {
  const idx = LANGUAGES.indexOf(current as Language);
  return LANGUAGES[(idx + 1) % LANGUAGES.length];
}

// ── WebSocket ────────────────────────────────────────────────────
export const WS_HOST = 'wss://simulator-server.martinkobelka.cz';
export const WS_PORT: number | undefined = undefined;
export const WS_URL = WS_PORT ? `${WS_HOST}:${WS_PORT}` : WS_HOST;

// ── Grid layout ──────────────────────────────────────────────────
export const GRID_COLS = 12;
export const GRID_ROW_HEIGHT = 30;
export const GRID_MARGIN: [number, number] = [4, 4];
