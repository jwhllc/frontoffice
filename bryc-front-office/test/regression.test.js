const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const page_src = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const seed = JSON.parse(fs.readFileSync(path.join(root, 'data/seed/starting-scenario.json'), 'utf8'));
const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0;font:14px system-ui}[hidden]{display:none!important}img{max-width:100%}</style></head><body>${page_src}</body></html>`;
const out = path.join(__dirname, 'out');
fs.mkdirSync(out, { recursive: true });

const mock = `
(() => {
  const store = { scenarios: { 'seed1': Object.assign(${JSON.stringify(seed)}, {updatedAt: new Date(Date.now()-300000).toISOString(), updatedBy: 'u_josh'}) } };
  window.__store = store; window.__writes = 0;
  const subs = [];
  const snap = () => ({ docs: Object.entries(store.scenarios).map(([id, d]) => ({ id, exists: true, data: () => JSON.parse(JSON.stringify(d)), metadata:{fromCache:false,hasPendingWrites:false} })), size: Object.keys(store.scenarios).length, metadata: { fromCache: false, hasPendingWrites: false } });
  const notify = () => setTimeout(() => subs.forEach(f => f(snap())), 5);
  let n = 0;
  const docRef = (id) => ({ id, path: 'scenarios/' + id,
    set: async (d) => { window.__writes++; store.scenarios[id] = JSON.parse(JSON.stringify(d)); notify(); },
    update: async (d) => { window.__writes++; Object.assign(store.scenarios[id], d); notify(); },
    delete: async () => { delete store.scenarios[id]; notify(); },
    get: async () => ({ id, exists: !!store.scenarios[id], data: () => store.scenarios[id] }) });
  const db = {
    collection: (p) => ({ path: p, doc: (id) => docRef(id || ('new' + (++n))), onSnapshot: (next) => { subs.push(next); setTimeout(() => next(snap()), 20); return () => {}; } }),
    doc: (p) => docRef(p.split('/')[1])
  };
  const user = { id: async () => 'u_josh', can: async () => true, profiles: async (ids) => Object.fromEntries([].concat(ids).map(i => [i, { id: i, name: 'Josh Howard', isMe: true }])) };
  window.claude = { use: async (name) => name === 'db' ? db : name === 'user' ? user : null };
})();`;

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  async function newPage(opts) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
    await page.addInitScript(mock);
    await page.route('https://fonts.googleapis.com/**', r => r.abort());
    await page.route('https://fonts.gstatic.com/**', r => r.abort());
    await page.route('https://planner.test/', r => r.fulfill({ body: html, contentType: 'text/html' }));
    await page.goto('https://planner.test/', { waitUntil: 'load' });
    await page.waitForTimeout(300);
    return page;
  }
  const page = await newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  console.log('EARLY ERRORS', errors, (await page.innerText('body')).slice(0,300));
  await page.screenshot({ path: out + '/roster.png', fullPage: true });
  const checks = await page.$$eval('.ck', els => els.map(e => e.className.split(' ')[1] + ': ' + e.textContent));
  console.log('CHECKS\n' + checks.join('\n'));
  const tiles = await page.$$eval('.tile', els => els.map(e => e.innerText.replace(/\n+/g, ' | ')));
  console.log('TILES\n' + tiles.join('\n'));

  await page.click('#tab-program'); await page.waitForTimeout(100);
  await page.screenshot({ path: out + '/program.png', fullPage: true });
  await page.click('#tab-nights'); await page.waitForTimeout(100);
  await page.screenshot({ path: out + '/nights.png', fullPage: true });

  // drag an unplaced DT cohort into the Tuesday Hustle 2 cell
  const src = await page.$('.tray[data-campus="DT"] .coh');
  const srcId = await src.getAttribute('data-cohort');
  await page.dragAndDrop(`.tray[data-campus="DT"] .coh[data-cohort="${srcId}"]`, 'td.cell[data-campus="DT"][data-night="Tue"][data-room="dt-h2"]', { sourcePosition: { x: 30, y: 10 } });
  await page.waitForTimeout(900);
  let st = await page.evaluate(() => window.__store.scenarios.seed1.placements);
  console.log('DRAG cohort', srcId, '->', JSON.stringify(st[srcId]), 'writes', await page.evaluate(() => window.__writes));
  // drag a person onto that cohort
  await page.evaluate((cid) => {
    const dt = new DataTransfer();
    const src = document.querySelector('.load[data-person="p-tristan"]');
    const tgt = document.querySelector(`.coh[data-cohort="${cid}"] .coh-name`);
    src.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
    tgt.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt }));
    tgt.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
    src.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer: dt }));
  }, srcId);
  await page.waitForTimeout(900);
  st = await page.evaluate(() => window.__store.scenarios.seed1.placements);
  console.log('LEAD', JSON.stringify(st[srcId]));
  // auto place
  await page.click('[data-act="auto-place"]'); await page.waitForTimeout(900);
  console.log('TOAST', await page.$eval('#toastHost', e => e.textContent));

  // roster drag: move Alexis to Directors tier
  await page.click('#tab-roster'); await page.waitForTimeout(100);
  await page.dragAndDrop('.card[data-person="p-alexis"]', '.mx-cell[data-team="persistence"][data-tier="director"]');
  await page.waitForTimeout(900);
  const alexis = await page.evaluate(() => window.__store.scenarios.seed1.people.find(p => p.id === 'p-alexis'));
  console.log('ALEXIS tier', alexis.tier);
  // open editor, change name field
  await page.click('.card[data-person="p-commeng"]'); await page.waitForTimeout(150);
  await page.fill('#ed-name', 'Test Hire'); await page.press('#ed-name', 'Tab'); await page.waitForTimeout(900);
  const ce = await page.evaluate(() => window.__store.scenarios.seed1.people.find(p => p.id === 'p-commeng'));
  console.log('COMMENG', ce.name, ce.status, 'focused:', await page.evaluate(() => document.activeElement && document.activeElement.id));
  await page.screenshot({ path: out + '/drawer.png' });
  await page.keyboard.press('Escape');
  // undo twice
  await page.click('[data-act="undo"]'); await page.waitForTimeout(800);
  // org chart
  await page.click('[data-act="roster-mode"][data-mode="chart"]'); await page.waitForTimeout(150);
  await page.screenshot({ path: out + '/chart.png', fullPage: true });
  // duplicate + compare
  await page.click('.mast [data-act="name-open"][data-mode="new"]'); await page.fill('#scenNewName','Copy test'); await page.press('#scenNewName','Enter'); await page.waitForTimeout(400);
  await page.click('#tab-program'); await page.waitForTimeout(100);
  await page.fill('#fel-DT-11', '130'); await page.press('#fel-DT-11', 'Enter'); await page.waitForTimeout(900);
  await page.click('[data-act="basis"][data-basis="attending"]'); await page.waitForTimeout(900);
  await page.click('#tab-compare'); await page.waitForTimeout(150);
  await page.screenshot({ path: out + '/compare.png', fullPage: true });
  const changes = await page.$$eval('.changes li', els => els.map(e => e.textContent));
  console.log('CHANGES\n' + changes.join('\n'));
  await page.click('#tab-setup'); await page.waitForTimeout(100);
  await page.screenshot({ path: out + '/setup.png', fullPage: true });
  await page.click('#tab-program'); await page.click('[data-act="roll-open"]'); await page.waitForTimeout(100);
  await page.click('[data-act="roll-create"]'); await page.waitForTimeout(500);
  console.log('SCENARIOS', await page.evaluate(() => Object.values(window.__store.scenarios).map(s => s.name + ' [' + s.kind + '] DT12=' + s.campuses[0].fellows[12])));

  // dark + mobile
  const dark = await newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, colorScheme: 'dark' });
  await dark.click('#tab-nights'); await dark.waitForTimeout(100);
  await dark.screenshot({ path: out + '/nights-dark.png', fullPage: false });
  await dark.click('#tab-roster'); await dark.waitForTimeout(100);
  await dark.screenshot({ path: out + '/roster-dark.png', fullPage: false });
  const mob = await newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await mob.screenshot({ path: out + '/mobile.png', fullPage: false });
  const ov = await mob.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log('MOBILE overflow px', ov);
  await mob.click('.card[data-person="p-kendrick"]'); await mob.waitForTimeout(150);
  await mob.screenshot({ path: out + '/mobile-drawer.png', fullPage: false });
  console.log('ERRORS', errors);
  await browser.close();
})();
