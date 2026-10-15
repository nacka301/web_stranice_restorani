// QR kod (moduli kao SVG putanja) koji vodi na demo stranicu.
//   node tools/qr.js > shots/qr.json
const QR = require('qrcode');
const q = QR.create('https://stranice-restorani.vercel.app/', { errorCorrectionLevel: 'M' });
const n = q.modules.size;
let d = '';
for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (q.modules.get(x, y)) d += `M${x} ${y}h1v1h-1z`;
process.stdout.write(JSON.stringify({ n, d }));
