// Renderira video.html sličicu po sličicu (Playwright + Chromium).
//
//   node tools/render.js --frames <dir> [--fps 60] [--workers 4] [--from 0] [--to 20]
//   node tools/render.js --stills <dir> --at 0.5,3.2,9.4 [--safe]
//
// Svaka sličica: renderAt(t) -> PNG snimka 1080x1920. Kodiranje u MP4
// radi tools/encode.sh (ffmpeg).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf('--' + name); return i < 0 ? def : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const ROOT = path.resolve(__dirname, '..');
const PAGE = 'file://' + path.join(ROOT, 'video.html');

async function openPage(browser, extra = '') {
  const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('pageerror:', e.message));
  await page.goto(PAGE + '?render=1' + extra);
  await page.waitForFunction('window.__ready === true', null, { timeout: 60000 });
  const cdp = await page.context().newCDPSession(page);
  return { page, cdp };
}
async function grab({ page, cdp }, t) {
  await page.evaluate((t) => window.renderAt(t), t);
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true });
  return Buffer.from(data, 'base64');
}

(async () => {
  const browser = await chromium.launch({ args: ['--force-color-profile=srgb', '--font-render-hinting=none', '--disable-lcd-text', '--allow-file-access-from-files'] });
  if (opt('stills')) {
    const dir = opt('stills');
    fs.mkdirSync(dir, { recursive: true });
    const w = await openPage(browser, opt('safe') ? '&safe=1' : '');
    for (const t of String(opt('at')).split(',').map(Number)) {
      fs.writeFileSync(path.join(dir, `t_${t.toFixed(2)}.png`), await grab(w, t));
    }
  } else {
    const dir = opt('frames');
    const fps = Number(opt('fps', 60)), from = Number(opt('from', 0)), to = Number(opt('to', 20));
    const workers = Number(opt('workers', 4));
    fs.mkdirSync(dir, { recursive: true });
    const first = Math.round(from * fps), last = Math.round(to * fps);
    const t0 = Date.now();
    let done = 0;
    await Promise.all([...Array(workers)].map(async (_, wi) => {
      const w = await openPage(browser);
      for (let f = first + wi; f < last; f += workers) {
        fs.writeFileSync(path.join(dir, `f_${String(f).padStart(5, '0')}.png`), await grab(w, f / fps));
        if (++done % 60 === 0) console.log(`${done}/${last - first} sličica, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
      }
    }));
  }
  await browser.close();
})();
