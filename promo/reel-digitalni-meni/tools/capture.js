// Captures real screens of the demo site (served locally from the repo
// that is deployed to stranice-restorani.vercel.app) at iPhone size, @3x.
const { chromium } = require('playwright');
const fontCss = require('./fontcss');
const OUT = process.argv[2];
const URL = 'http://127.0.0.1:8765/';
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
    reducedMotion: 'reduce', locale: 'hr-HR', timezoneId: 'Europe/Zagreb',
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  // font mapping only (Georgia -> metric-compatible Gelasio); content-visibility
  // is a paint optimisation that blanks off-screen sections in full-page captures.
  await page.addStyleTag({ content: fontCss() + 'main>section{content-visibility:visible!important}' });
  for (let y = 0; y < 8000; y += 300) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(40); }
  await page.evaluate(() => { document.querySelectorAll('img[data-src]').forEach(i => { i.src = i.dataset.src; delete i.dataset.src; }); });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);

  const top = (sel) => page.evaluate((s) => Math.round(document.querySelector(s).getBoundingClientRect().top + scrollY), sel);
  const shot = async (name, y) => {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    console.log('shot', name, y);
  };

  await shot('hero', 0);
  await shot('hero_scrolled', 60);
  const onama = await top('#o-nama');
  await shot('onama', onama);
  const menu = await top('#jelovnik');
  await shot('menu_top', menu);
  await shot('menu_mid', menu + 400);
  // tall strip of the menu section (for in-phone scrolling), without fixed overlays
  await page.addStyleTag({ content: '.zaglavlje,.plutajuce-mreze{visibility:hidden!important}' });
  const menuH = await page.evaluate(() => document.querySelector('#jelovnik').getBoundingClientRect().height);
  await page.evaluate((y) => window.scrollTo(0, y), menu);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/strip_menu.png`, fullPage: true, clip: { x: 0, y: menu - 90, width: 390, height: Math.round(menuH) + 90 } });
  // hero + about + menu strip (scroll from hero into menu)
  await page.screenshot({ path: `${OUT}/strip_top.png`, fullPage: true, clip: { x: 0, y: 0, width: 390, height: menu + Math.round(menuH) } });
  await page.addStyleTag({ content: '.zaglavlje,.plutajuce-mreze{visibility:visible!important}' });

  // filter: Glavna jela
  await page.evaluate((y) => window.scrollTo(0, y), menu);
  await page.waitForTimeout(200);
  const filt = page.locator('#jelovnik-filteri button', { hasText: 'Glavna jela' });
  await filt.click();
  await page.waitForTimeout(700);
  await shot('menu_glavna', menu);
  await shot('menu_glavna2', menu + 300);
  const sve = page.locator('#jelovnik-filteri button', { hasText: 'Sve' });
  await sve.click();
  await page.waitForTimeout(500);

  // reservation flow
  const rez = await top('#rezervacija');
  await shot('rez_1', rez - 70);
  const free = page.locator('.rez-kalendar__dan--slobodno:not([disabled])');
  console.log('free days', await free.count());
  await free.nth(2).click();
  await page.waitForTimeout(500);
  await shot('rez_2', rez - 70);
  const termini = await top('#rez-termini-polje');
  await shot('rez_2b', termini - 200);
  const slot = page.locator('#rez-termini-lista button:not([disabled])');
  console.log('slots', await slot.count());
  await slot.nth(3).click();
  await page.waitForTimeout(500);
  const stolovi = await top('#rez-stolovi-polje');
  await shot('rez_3', stolovi - 260);
  const table = page.locator('.rez-stol:not(.rez-stol--zauzet)');
  await table.nth(1).click();
  await page.waitForTimeout(500);
  await shot('rez_4', stolovi - 260);
  await shot('rez_4b', stolovi - 120);

  const gal = await top('#galerija');
  await shot('galerija', gal - 40);
  const info = await top('#radno-vrijeme');
  await shot('info', info);
  const kontakt = await top('#kontakt');
  await shot('kontakt', kontakt - 40);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  await shot('footer', h - 844);
  await browser.close();
})();
