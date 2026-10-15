// Reservation-flow strips (same page coordinates per state, so states can be
// swapped seamlessly while scrolling) + floating social buttons on transparent bg.
const { chromium } = require('playwright');
const fontCss = require('./fontcss');
const OUT = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, reducedMotion: 'reduce', locale: 'hr-HR', timezoneId: 'Europe/Zagreb' });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:8765/', { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: fontCss() + 'main>section{content-visibility:visible!important}' });
  for (let y = 0; y < 8000; y += 300) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(40); }
  await page.evaluate(() => { document.querySelectorAll('img[data-src]').forEach(i => { i.src = i.dataset.src; delete i.dataset.src; }); });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  const top = (sel) => page.evaluate((s) => Math.round(document.querySelector(s).getBoundingClientRect().top + scrollY), sel);
  const hideFixed = '.zaglavlje,.plutajuce-mreze{visibility:hidden!important}';
  const strip = async (name, y0, h) => {
    const tag = await page.addStyleTag({ content: hideFixed });
    await page.evaluate((y) => window.scrollTo(0, y), y0);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true, clip: { x: 0, y: y0, width: 390, height: h } });
    await tag.evaluate((n) => n.remove());
    console.log('strip', name, y0, h);
  };
  const rez = await top('#rezervacija');
  const y0 = rez - 60, H = 2000;
  await strip('strip_rez_0', y0, H);                 // calendar, nothing chosen
  await page.locator('.rez-kalendar__dan--slobodno:not([disabled])').nth(2).click();
  await page.waitForTimeout(400);
  await strip('strip_rez_A', y0, H);                 // date chosen -> time slots
  await page.locator('#rez-termini-lista button:not([disabled])').nth(3).click();
  await page.waitForTimeout(400);
  await strip('strip_rez_B', y0, H);                 // time chosen -> table plan
  await page.locator('.rez-stol:not(.rez-stol--zauzet)').nth(1).click();
  await page.waitForTimeout(400);
  await strip('strip_rez_C', y0, H);                 // table chosen
  // element boxes (CSS px, relative to strip top) for tap targets
  const box = (loc) => loc.evaluate((e, y0) => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + scrollY - y0 + r.height / 2, w: r.width, h: r.height }; }, y0);
  const boxes = {
    day: await box(page.locator('.rez-kalendar__dan--odabran').first()),
    slot: await box(page.locator('#rez-termini-lista button.termin-opcija--odabran, #rez-termini-lista button[aria-pressed="true"]').first().or(page.locator('#rez-termini-lista button:not([disabled])').nth(3))),
    table: await box(page.locator('.rez-stol--odabran').first()),
    next: await box(page.locator('#rez-nastavi')),
    calendar: await box(page.locator('#rez-kalendar')),
    plan: await box(page.locator('#rez-stolovi')),
  };
  console.log(JSON.stringify(boxes));
  require('fs').writeFileSync(`${OUT}/rez_boxes.json`, JSON.stringify({ y0, H, boxes }, null, 1));
  // menu: dish card box for pop-out
  const menu = await top('#jelovnik');
  const cards = await page.evaluate((m) => [...document.querySelectorAll('#jelovnik-mreza > *')].map(c => { const r = c.getBoundingClientRect(); return { t: c.innerText.split('\n')[0], x: r.x, y: r.y + scrollY - (m - 90), w: r.width, h: r.height }; }), menu);
  require('fs').writeFileSync(`${OUT}/menu_cards.json`, JSON.stringify(cards, null, 1));
  console.log(cards.map(c => c.t + ' ' + Math.round(c.y)).join(' | '));
  // floating social buttons alone, transparent
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.addStyleTag({ content: 'html,body{background:transparent!important} main,header,footer,.zaglavlje{visibility:hidden!important}' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/float_social.png`, omitBackground: true });
  await browser.close();
})();
