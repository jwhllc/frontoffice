const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const seed = JSON.parse(fs.readFileSync(path.join(root, 'data/seed/starting-scenario.json'), 'utf8'));
seed.kind='current';
seed.payBands=[{id:'parttime',name:'Associate',min:36000,max:48000},{id:'manager',name:'Manager',min:48000,max:62000},{id:'lead',name:'Lead Manager',min:62000,max:67000},{id:'director',name:'Director',min:65000,max:89000},{id:'chief',name:'Chief',min:90000,max:null}];
seed.people.find(p=>p.id==='p-kendrick').band='lead';
// FICTIONAL test data only
let FB={},FP={};let k=0;
for(const p of seed.people){ if(!p.name) continue; k++;
  const n=1+(k*7)%6; const yrs=[];const pay={years:{}};
  const baseStart = p.tier==='chief'?95000:p.tier==='director'?66000:p.tier==='parttime'?0:47000+(k%4)*1500;
  for(let i=0;i<n;i++){const id='y'+i;yrs.push({id,label:'PY'+(27-n+1+i),title:p.title,inProgress:i===n-1,habits:{},okras:[],milestone:''});
    if(baseStart) pay.years[id]={base:baseStart+i*2200+(k%3)*900};}
  FB[p.id]={personId:p.id,name:p.name,years:yrs}; if(baseStart) FP[p.id]=pay; }
const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0}[hidden]{display:none!important}img{max-width:100%}</style></head><body>${src}</body></html>`;
const out = path.join(__dirname, 'out'); fs.mkdirSync(out, { recursive: true });
const mock = `(() => {
  const store = { scenarios: { seed1: Object.assign(${JSON.stringify(seed)}, {updatedAt: new Date().toISOString(), updatedBy: 'u_josh'}) }, build: ${JSON.stringify(FB)}, pay: ${JSON.stringify(FP)}, buildmeta: {} };
  window.__store = store; window.__saved=[]; const subs = {}; const dsubs = {};
  const snap = (c) => ({ docs: Object.entries(store[c]||{}).map(([id, d]) => ({ id, exists: true, data: () => JSON.parse(JSON.stringify(d)) })), metadata: { fromCache: false } });
  const notify = (c, id) => setTimeout(() => { (subs[c]||[]).forEach(f => f(snap(c))); (dsubs[c+'/'+id]||[]).forEach(f => f({ id, exists: !!(store[c]||{})[id], data: () => JSON.parse(JSON.stringify(store[c][id])) })); }, 5);
  let n = 0;
  const ref = (c, id) => ({ id, set: async d => { store[c] = store[c]||{}; store[c][id] = JSON.parse(JSON.stringify(d)); notify(c, id); }, update: async d => { Object.assign(store[c][id], d); notify(c, id); }, delete: async () => { delete store[c][id]; notify(c, id); },
    onSnapshot: (next) => { (dsubs[c+'/'+id] = dsubs[c+'/'+id]||[]).push(next); setTimeout(() => next({ id, exists: !!(store[c]||{})[id], data: () => store[c][id] }), 10); return () => {}; } });
  const db = { collection: c => ({ doc: id => ref(c, id || ('new' + (++n))), onSnapshot: next => { (subs[c] = subs[c]||[]).push(next); setTimeout(() => next(snap(c)), 15); return () => {}; } }), doc: p => { const [c, id] = p.split('/'); return ref(c, id); } };
  const user = { id: async () => 'u_josh', can: async () => true, canEdit: async () => !window.__viewer, profiles: async ids => Object.fromEntries([].concat(ids).map(i => [i, { id: i, name: 'Josh Howard', isMe: true }])) };
  const downloads = { save: async ({filename,data}) => { window.__saved.push({filename,size:data.size}); return {status:'saved'}; } };
  window.claude = { use: async name => name === 'db' ? db : name === 'user' ? user : name==='downloads' ? downloads : null };
})();`;
(async () => {
  const browser = await chromium.launch(); const errors = [];
  async function newPage(opts) {
    const ctx = await browser.newContext(opts); const page = await ctx.newPage();
    page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
    await page.addInitScript(mock);
    await page.route('https://fonts.googleapis.com/**', r => r.abort()); await page.route('https://fonts.gstatic.com/**', r => r.abort());
    await page.route('https://planner.test/', r => r.fulfill({ body: html, contentType: 'text/html' }));
    await page.goto('https://planner.test/', { waitUntil: 'load' }); await page.waitForTimeout(300); return page;
  }
  const page = await newPage({ viewport: { width: 1440, height: 1000 } });
  const tile=()=>page.$eval('.tile:nth-child(7)', e=>e.innerText.replace(/\n/g,' | '));
  console.log('MID:', await tile());
  await page.click('[data-act="cost-mode"][data-mode="actual"]'); await page.waitForTimeout(400);
  console.log('ACTUAL:', await tile());
  console.log('title:', await page.$eval('.tile:nth-child(7) [title]', e=>e.title));
  await page.screenshot({ path: out + '/cost-tile.png', clip:{x:860,y:60,width:580,height:230} });
  await page.click('#tab-compare'); await page.waitForTimeout(200);
  console.log('compare rows:', await page.$eval('.cmp-tbl th', a=>a.map(x=>x.textContent).join(' / ')).catch(()=>'none'));
  await page.click('[data-act="cost-mode"][data-mode="mid"]'); await page.waitForTimeout(200);
  console.log('BACK:', await tile());
  console.log('ERRORS', errors); await browser.close();
})();
