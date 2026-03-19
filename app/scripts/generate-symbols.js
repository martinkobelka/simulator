const ms = require('milsymbol');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../public/symbols');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const symbols = [
  { sidc: 'SFGPUCI----K----', name: 'friendly-infantry' },
  { sidc: 'SFGPUCA----K----', name: 'friendly-armor' },
  { sidc: 'SFGPUCF----K----', name: 'friendly-artillery' },
  { sidc: 'SHGPUCI----K----', name: 'hostile-infantry' },
  { sidc: 'SHGPUCA----K----', name: 'hostile-armor' },
];

symbols.forEach(({ sidc, name }) => {
  const symbol = new ms.Symbol(sidc, { size: 40, strokeWidth: 4 });
  const svg = symbol.asSVG();
  const filePath = path.join(outDir, `${name}.svg`);
  fs.writeFileSync(filePath, svg, 'utf8');
  console.log(`Generated: ${name}.svg`);
});

console.log(`\nAll symbols saved to ${outDir}`);
