// @font-face CSS (base64) koji se ubacuje u demo stranicu prije snimanja:
// Georgia -> Gelasio (metrički kompatibilan s Georgijom) i "Segoe UI" -> Inter
// (sistemski sans iz stoga fontova stranice; na iPhoneu je to SF Pro, Inter je najbliži).
// Mijenja se samo font kojim se crta — raspored i sadržaj stranice ostaju isti.
const fs = require('fs');
const path = require('path');
const FONTS = path.join(__dirname, '..', 'fonts');
const LATIN = 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+FEFF,U+FFFD';
const LATINEXT = 'U+0100-02AF,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';
module.exports = function fontCss() {
  let css = '';
  for (const f of fs.readdirSync(FONTS).filter((n) => n.endsWith('.woff2'))) {
    const [, fam, sub, w, st] = f.match(/^(gelasio|inter)-(latin-ext|latin)-(\d+)-(normal|italic)\.woff2$/);
    const family = fam === 'gelasio' ? 'Georgia' : 'Segoe UI';
    const b64 = fs.readFileSync(path.join(FONTS, f)).toString('base64');
    css += `@font-face{font-family:"${family}";src:url(data:font/woff2;base64,${b64}) format('woff2');font-weight:${w};font-style:${st};font-display:block;unicode-range:${sub === 'latin' ? LATIN : LATINEXT};}`;
  }
  return css;
};
