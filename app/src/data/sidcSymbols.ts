// Mapping from SIDC to local SVG file in /public/symbols/
export const SIDC_SYMBOL_MAP: Record<string, string> = {
  'SFGPUCI----K----': '/symbols/friendly-infantry.svg',
  'SFGPUCA----K----': '/symbols/friendly-armor.svg',
  'SFGPUCF----K----': '/symbols/friendly-artillery.svg',
  'SHGPUCI----K----': '/symbols/hostile-infantry.svg',
  'SHGPUCA----K----': '/symbols/hostile-armor.svg',
  'SFGPUCR----K----': '/symbols/friendly-recon.svg',
  'SFGPUCE----K----': '/symbols/friendly-engineer.svg',
  'SHGPUCF----K----': '/symbols/hostile-artillery.svg',
  'SHGPUCR----K----': '/symbols/hostile-recon.svg',
};

export function symbolUrl(sidc: string): string {
  return SIDC_SYMBOL_MAP[sidc] ?? '/symbols/friendly-infantry.svg';
}
