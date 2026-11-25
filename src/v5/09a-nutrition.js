
/* =====================================================================
   09 v5 (build 5): MyFitnessPal-style food diary.
   Barcode scanner (camera, photo or typed), UK food database lookup
   (Open Food Facts), serving sizes in grams or servings, full label
   nutrients, recent and frequent foods, saved meals, recipes, copy
   meals, edit entries, exercise calories, fasting timer, nutrition
   report, coach meal plans with site-day / rest-day menus and a
   grocery list.
   ===================================================================== */
const f1 = x => x == null || isNaN(x) ? '—' : String(Math.round(+x * 10) / 10);
const r1 = x => x == null || x === '' || isNaN(x) ? null : Math.round(+x * 10) / 10;
const NUTS = [['fib', 'Fibre', 'g'], ['sug', 'Sugars', 'g'], ['sat', 'Saturates', 'g'], ['salt', 'Salt', 'g']];
const MET = { Walk: 3.5, Run: 9.8, Bike: 7.5, Row: 7, Swim: 8, Football: 7, Boxing: 9, Stairmaster: 9, Other: 6 };
const OFF = 'https://world.openfoodfacts.org';
IC.scan = I('<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 8v8M10 8v8M13 8v8M16 8v8"/>');
IC.timer = I('<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>');
IC.page = I('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>');
IC.db = I('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/>');
IC.list = I('<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>');
IC.star = I('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>');
IC.trash = I('<path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l1-13M9 7V4h6v3"/>');
IC.grip = I('<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>');
IC.share = I('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>');
IC.cart = I('<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.4a1 1 0 0 0 1 .8h9.7a1 1 0 0 0 1-.8L21 7H6"/>');
IC.tag = I('<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>');
IC.table = I('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16M15 4v16"/>');

function migrate5() {
  S.barcodes = S.barcodes || {}; S.myMeals = S.myMeals || []; S.recipes = S.recipes || []; S.mealPlans = S.mealPlans || []; S.fasts = S.fasts || [];
  S.settings.nut = S.settings.nut || { fib: 30, sug: 90, sat: 30, salt: 6 };
  if (S.settings.exCals == null) S.settings.exCals = false;
  if (S.settings.demo && !S.v5NutSeeded) {
    S.v5NutSeeded = true;
    const F = n => { const x = FOODS.find(f => f[0] === n); return { name: x[0], serving: x[1], qty: 1, kcal: x[2], p: x[3], c: x[4], f: x[5], fib: null, sug: null, sat: null, salt: null }; }, Q = (n, q) => ({ ...F(n), qty: q });
    const plan = { id: uid(), name: 'Site-day cut (example)', notes: 'High protein, van-friendly. Everything from Tesco, Sainsbury\'s, Aldi or Lidl. Swap like for like using the food library.', by: 'coach', ts: Date.now(),
      days: { site: { Breakfast: [F('Oats'), F('0% Greek yoghurt'), F('Banana')], Lunch: [F('Chicken breast'), F('Microwave rice pouch'), F('Frozen veg'), F('Sweet chilli sauce')], Dinner: [F('5% beef mince'), Q('Potatoes', 1), F('Broccoli')], Snacks: [F('Protein shake'), F('Apple')] },
        rest: { Breakfast: [F('Large eggs'), F('Wholemeal bread')], Lunch: [F('Tin of tuna'), F('Wholemeal wrap'), F('Bag of salad'), F('Light mayo')], Dinner: [F('Salmon fillet'), F('Sweet potato'), F('Frozen veg')], Snacks: [F('Cottage cheese'), F('Mixed berries')] } } };
    S.mealPlans.push(plan); if (S.clients[0]) S.clients[0].mealPlanId = plan.id;
    const a = S.clients[0], b = S.clients[1];
    if (a) S.recipes.push({ id: uid(), name: 'Batch chilli (makes 4)', servings: 4, by: a.id, byName: a.name, shared: true, ts: Date.now() - 864e5 * 3, method: 'Brown the mince, add the beans and a jar of chilli sauce, simmer 20 minutes. Split into four tubs.', items: [Q('5% beef mince', 4), Q('Baked beans', 2), Q('Microwave rice pouch', 4)] });
    if (b) S.myMeals.push({ id: uid(), owner: b.id, name: 'Usual brekkie', items: [F('Large eggs'), F('Wholemeal bread'), F('Flat white')], ts: Date.now() });
  }
}

/* ---------- food objects ---------- */
// One shape everywhere: values are per serving; per100 is kept when we know grams.
const N = (o) => withGrams({ name: o.name, brand: o.brand || '', serving: o.serving || '1 serving', g: o.g || null, kcal: +o.kcal || 0, p: +o.p || 0, c: +o.c || 0, f: +o.f || 0, fib: r1(o.fib), sug: r1(o.sug), sat: r1(o.sat), salt: r1(o.salt), per100: o.per100 || null, barcode: o.barcode || '', src: o.src || '', by: o.by || null, byName: o.byName || '', recipeId: o.recipeId || null, verified: !!o.verified });
function withGrams(n) {
  if (n.per100 || n.src === 'recipe') return n;
  const m = String(n.serving).match(/(\d+(?:\.\d+)?)\s*g\b/i); if (!m || /ml\b/i.test(n.serving)) return n;
  const g = +m[1]; if (!(g > 0)) return n; const k = 100 / g, v = x => n[x] == null ? null : r1(n[x] * k);
  return { ...n, g, per100: { kcal: r1(n.kcal * k), p: v('p'), c: v('c'), f: v('f'), fib: v('fib'), sug: v('sug'), sat: v('sat'), salt: v('salt') } };
}
const fromRow = f => N({ name: f[0], serving: f[1], kcal: f[2], p: f[3], c: f[4], f: f[5], src: 'st', verified: true, by: 'st' });
const fromLib = e => N({ ...e, src: e.barcode ? 'scan' : 'lib' });
function recipePer(r) { const t = k => sum(r.items, i => (i[k] || 0) * i.qty), sv = Math.max(1, +r.servings || 1), part = k => r.items.every(i => i[k] == null) ? null : t(k) / sv;
  return N({ name: r.name, serving: '1 of ' + sv + ' servings', kcal: r1(t('kcal') / sv), p: r1(t('p') / sv), c: r1(t('c') / sv), f: r1(t('f') / sv), fib: part('fib'), sug: part('sug'), sat: part('sat'), salt: part('salt'), src: 'recipe', recipeId: r.id, by: r.by, byName: r.byName }); }
const visibleRecipes = () => S.recipes.filter(r => r.shared || r.by === meId() || ses.role === 'coach');
function pickPool() {
  const seen = new Set(), out = [];
  const add = n => { const k = n.name.toLowerCase() + '|' + n.brand.toLowerCase(); if (seen.has(k)) return; seen.add(k); out.push(n); };
  (S.foodLib || []).forEach(e => add(fromLib(e))); visibleRecipes().forEach(r => add(recipePer(r))); FOODS.forEach(f => add(fromRow(f)));
  return out;
}
const entryToN = e => N({ ...e, serving: e.serving, kcal: e.kcal, src: e.src || 'log' });
function scaleN(n, amt, unit) {
  const k = unit === 'g' && n.per100 ? amt / 100 : amt, base = unit === 'g' && n.per100 ? n.per100 : n, v = x => base[x] == null ? null : base[x] * k;
  return { kcal: r1(v('kcal')) || 0, p: r1(v('p')) || 0, c: r1(v('c')) || 0, f: r1(v('f')) || 0, fib: r1(v('fib')), sug: r1(v('sug')), sat: r1(v('sat')), salt: r1(v('salt')) };
}
const dispName = n => n.brand && !n.name.toLowerCase().includes(n.brand.toLowerCase()) ? `${n.brand} ${n.name}` : n.name;

/* ---------- day maths ---------- */
function nutTotals(id, date) { const f = DB.foodOn(id, date), o = { known: 0, n: f.length };
  NUTS.forEach(([k]) => { o[k] = r1(sum(f, x => (x[k] || 0) * x.qty)); }); o.known = f.filter(x => x.fib != null || x.sug != null || x.sat != null || x.salt != null).length; return o; }
function exerciseKcal(c, date) { const kg = latestKg(c) || 80; return S.cardio.filter(x => x.clientId === c.id && x.date === date).map(x => ({ ...x, kcal: Math.round((MET[x.type] || 6) * kg * (x.mins || 0) / 60) })); }
function latestKg(c) { const d = DB.dailyOf(c.id).filter(x => x.weight); return d.length ? d[d.length - 1].weight : null; }
function maintenance(c, site) { const s = c.stats || {}, kg = latestKg(c); if (!s.age || !s.height || !kg) return null; const bmr = 10 * kg + 6.25 * s.height - 5 * s.age + (s.sex === 'f' ? -161 : 5), mult = (TRADES.find(t => t.name === c.trade) || TRADES[0]).mult; return Math.round(bmr * (site ? mult : 1.35)); }
const planOf = c => S.mealPlans.find(p => p.id === c.mealPlanId) || null;

/* ---------- the add-food sheet ---------- */
let FPICK = [], FD = null, OFFRES = null, SCAN = { stream: null, reader: null, loop: null, busy: false };
function fsStart(o) { FS = { meal: o.meal || (new Date().getHours() < 11 ? 'Breakfast' : new Date().getHours() < 15 ? 'Lunch' : new Date().getHours() < 21 ? 'Dinner' : 'Snacks'), date: o.date || today(), q: '', qty: 1, tab: o.tab || 'search', mode: o.mode || 'diary', target: o.target || null, scanMsg: '', code: '' }; OFFRES = null; renderFoodSheet(); }
const fsTitle = () => FS.mode === 'recipe' ? 'Add an ingredient' : FS.mode === 'plan' ? `Add to ${FS.target.meal.toLowerCase()} (${FS.target.day === 'site' ? 'site day' : 'rest day'})` : 'Add food';
renderFoodSheet = function () {
  stopScan();
  const diary = FS.mode === 'diary', tabs = [['search', 'Search', 'search'], ['scan', 'Scan', 'scan'], ...(diary ? [['meals', 'My meals', 'star']] : []), ['recipes', 'Recipes', 'book'], ...(diary ? [['quick', 'Quick add', 'bolt']] : [])];
  let body = '';
  if (FS.tab === 'search') body = `<div class="row nowrap"><input class="in grow" id="fq" data-fq placeholder="Search foods, brands, recipes…" value="${esc(FS.q)}" autocomplete="off" enterkeyhint="search"></div>
      <div class="list" id="foodlist">${foodListHTML()}</div>
      <div id="offbox">${offBoxHTML()}</div>`;
  else if (FS.tab === 'scan') body = scanHTML();
  else if (FS.tab === 'meals') body = mealsTabHTML();
  else if (FS.tab === 'recipes') body = recipesTabHTML();
  else body = quickHTML();
  openSheet(`${sheetHead(diary ? (FS.date === today() ? 'Today' : fmtLong(FS.date)) : FS.mode === 'recipe' ? 'Recipe' : 'Meal plan', fsTitle())}
    ${diary ? `<div class="tabs">${MEALS.map(m => `<button class="tab ${FS.meal === m ? 'on' : ''}" data-act="fsMeal" data-v="${m}">${m}</button>`).join('')}</div>` : ''}
    <div class="seg fstabs" role="tablist">${tabs.map(([k, l, i]) => `<button role="tab" class="${FS.tab === k ? 'on' : ''}" data-act="fsTab" data-v="${k}">${IC[i]}<span>${l}</span></button>`).join('')}</div>
    ${body}`);
  if (FS.tab === 'search') setTimeout(() => { const q = $('#fq'); if (q && window.innerWidth > 700) q.focus(); }, 30);
};
foodListHTML = function () {
  const c = ses.role === 'client' ? me() : null, q = FS.q.toLowerCase().trim(), pool = pickPool();
  let rows = [];
  if (!q) {
    const mine = c ? S.food.filter(f => f.clientId === c.id && f.meal !== 'Day total' && !/\(imported\)/.test(f.name)) : [];
    const recent = [...new Map(mine.slice().reverse().map(e => [e.name.toLowerCase(), e])).values()].slice(0, 6).map(e => ({ n: entryToN(e), tag: 'Recent' }));
    const cnt = {}; mine.forEach(e => { const k = e.name.toLowerCase(); cnt[k] = (cnt[k] || { n: 0, e }); cnt[k].n++; });
    const freq = Object.values(cnt).filter(x => x.n >= 2 && !recent.some(r => r.n.name.toLowerCase() === x.e.name.toLowerCase())).sort((a, b) => b.n - a.n).slice(0, 6).map(x => ({ n: entryToN(x.e), tag: `Logged ${x.n}×` }));
    rows = [...recent, ...freq, ...pool.filter(n => !recent.concat(freq).some(r => r.n.name === n.name)).slice(0, 30).map(n => ({ n }))];
  } else {
    const words = q.split(/\s+/);
    rows = pool.map(n => { const hay = (n.name + ' ' + n.brand).toLowerCase(); return { n, s: words.every(w => hay.includes(w)) ? (hay.startsWith(q) ? 3 : hay.includes(q) ? 2 : 1) : 0 }; }).filter(x => x.s).sort((a, b) => b.s - a.s).slice(0, 40);
  }
  FPICK = rows.map(r => r.n);
  return rows.map((r, i) => foodRow(r.n, i, r.tag)).join('') || `<div class="empty small">Nothing in the app matches "${esc(FS.q)}". Search the UK database below, scan the barcode, or add it yourself.</div>`;
};
function foodRow(n, i, tag = '', src = 'pick') {
  const who = n.src === 'recipe' ? 'Recipe' : n.by && n.by !== 'st' ? 'Added by ' + credit({ by: n.by, byName: n.byName }) : n.src === 'off' ? 'UK database' : '';
  return `<button class="li tap fooditem" data-act="fdOpen" data-i="${i}" data-src="${src}"><span class="grow"><span class="trunc" style="display:block">${esc(dispName(n))}${n.verified ? ` <span class="okmark" title="Checked">${IC.tick}</span>` : ''}</span><span class="tiny num">${tag ? `<span style="color:var(--orange)">${esc(tag)}</span> · ` : ''}${esc(n.serving)} · ${f1(n.p)}p ${f1(n.c)}c ${f1(n.f)}f${who ? ' · ' + esc(who) : ''}</span></span><b class="num small">${f1(n.kcal)}</b><span class="iconbtn sm or">${IC.plus}</span></button>`;
}
function offBoxHTML() {
  if (!FS.q.trim()) return '';
  if (OFFRES === 'loading') return `<div class="callout small">${IC.search} Searching the UK food database…</div>`;
  if (OFFRES && OFFRES.err) return `<div class="callout small">${esc(OFFRES.err)}</div>`;
  if (OFFRES && OFFRES.q === FS.q) return `<div class="eyebrow" style="margin-top:6px">UK database · ${OFFRES.list.length} result${OFFRES.list.length === 1 ? '' : 's'}</div><div class="list">${OFFRES.list.map((n, i) => foodRow(n, i, '', 'off')).join('') || '<div class="empty small">No matches there either. Add it yourself from the label.</div>'}</div>`;
  return `<button class="btn ghost block" data-act="offSearch">${IC.search} Search the UK supermarket database for "${esc(FS.q)}"</button>`;
}
function scanHTML() {
  const live = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  return `<div class="scanbox" id="scanbox"><video id="scv" playsinline muted></video><div class="scanframe"><i></i></div><div class="scanidle" id="scanidle">${IC.scan}<span>Point the camera at the barcode</span></div></div>
    <div class="row">${live ? `<button class="btn grow" data-act="scanLive">${IC.cam} Scan with camera</button>` : ''}<label class="btn ghost grow" style="cursor:pointer">${IC.cam} Take a photo of it<input type="file" accept="image/*" capture="environment" hidden data-barphoto></label></div>
    <div id="scanmsg">${FS.scanMsg ? `<div class="callout small">${FS.scanMsg}</div>` : ''}</div>
    <form class="row nowrap" data-form="barcode"><input class="in grow num" name="code" inputmode="numeric" pattern="[0-9 ]{6,14}" placeholder="Or type the numbers under the barcode" value="${esc(FS.code)}" required><button class="btn" type="submit">Look up</button></form>
    <p class="tiny">Anything scanned is saved to the shared library, so the next person who scans it gets it straight away, even with no signal.</p>`;
}
function mealsTabHTML() {
  const mine = S.myMeals.filter(m => m.owner === meId());
  return `<div class="list">${mine.map(m => { const k = Math.round(sum(m.items, i => i.kcal * i.qty)), p = Math.round(sum(m.items, i => i.p * i.qty));
    return `<div class="li"><div class="grow"><b class="trunc" style="display:block">${esc(m.name)}</b><span class="tiny">${m.items.length} items · ${esc(m.items.map(i => i.name).slice(0, 3).join(', '))}${m.items.length > 3 ? '…' : ''}</span></div><span class="small num sub">${k} kcal · ${p}p</span><button class="btn sm" data-act="logMyMeal" data-id="${m.id}">Log</button><button class="iconbtn sm" data-act="delMyMeal" data-id="${m.id}" aria-label="Delete ${esc(m.name)}">${IC.trash}</button></div>`; }).join('') || `<div class="empty small">${IC.star}<span>No saved meals yet. Log a meal you eat a lot, then tap <b>Save as a meal</b> under it on the Fuel screen. Next time it's one tap.</span></div>`}</div>`;
}
function recipesTabHTML() {
  const list = visibleRecipes();
  FPICK = list.map(recipePer);
  return `<div class="list">${FPICK.map((n, i) => foodRow(n, i, list[i].by === meId() ? 'Yours' : '')).join('') || '<div class="empty small">No recipes yet.</div>'}</div>
    <button class="btn ghost block" data-act="recipeNew">${IC.plus} Build a new recipe</button>`;
}
function quickHTML() {
  return `<form class="stack-sm" data-form="quickFood"><div class="fields" style="grid-template-columns:2fr 1fr"><label class="f">Name<input class="in sm" name="name" placeholder="e.g. Mum's lasagne" required></label><label class="f">Serving<input class="in sm" name="serving" placeholder="1 plate"></label></div>
      <div class="fields q4"><label class="f">kcal<input class="in sm num" name="kcal" type="number" inputmode="numeric" required></label><label class="f">Protein g<input class="in sm num" name="p" type="number" inputmode="decimal"></label><label class="f">Carbs g<input class="in sm num" name="c" type="number" inputmode="decimal"></label><label class="f">Fat g<input class="in sm num" name="f" type="number" inputmode="decimal"></label></div>
      <label class="row small" style="gap:8px;cursor:pointer"><input type="checkbox" name="share" checked> Share to the food library so the lads can use it too</label><button class="btn" type="submit">Add to ${esc(FS.meal.toLowerCase())}</button></form>`;
}

/* ---------- food detail: pick the amount ---------- */
function fdRender() {
  const n = FD.n, s = scaleN(n, +FD.amt || 0, FD.unit), diary = FS.mode === 'diary', canG = !!n.per100, g = FD.unit === 'g';
  const chips = g ? [50, 100, 150, 200, 250] : [0.5, 1, 1.5, 2, 3], custom = !chips.includes(+FD.amt);
  openSheet(`${sheetHead(n.src === 'off' ? 'UK database' : n.src === 'recipe' ? 'Recipe' : n.barcode ? 'Scanned' : 'Food', dispName(n))}
    ${n.barcode ? `<span class="tiny num">Barcode ${esc(n.barcode)}${n.by && n.by !== 'st' && n.src !== 'off' ? ' · added by ' + esc(credit({ by: n.by, byName: n.byName })) : ''}</span>` : ''}
    ${canG ? `<div class="seg unitseg" role="group" aria-label="Measure in"><button class="${g ? '' : 'on'}" data-act="fdUnit" data-v="srv">Servings</button><button class="${g ? 'on' : ''}" data-act="fdUnit" data-v="g">Grams</button></div>` : ''}
    <span class="small sub">${g ? 'How many grams are you eating?' : `How many servings? 1 serving = ${esc(n.serving)}`}</span>
    <div class="amtrow">${chips.map(v => `<button class="tab ${+FD.amt === v ? 'on' : ''}" data-act="fdQuick" data-v="${v}">${g ? v + 'g' : '× ' + v}</button>`).join('')}
      <label class="amtcustom ${custom ? 'on' : ''}"><input id="fdamt" data-fdamt type="number" inputmode="decimal" step="any" min="0" placeholder="Custom" value="${custom ? esc(FD.amt) : ''}" aria-label="${g ? 'Custom grams' : 'Custom servings'}"><span>${g ? 'g' : '×'}</span></label></div>
    <div class="eating">Eating <b class="num" id="fdsum">${fdSum()}</b></div>
    <div id="fdtot">${fdTotHTML(s)}</div>
    ${diary ? `<div class="tabs">${MEALS.map(m => `<button class="tab ${FS.meal === m ? 'on' : ''}" data-act="fdMeal" data-v="${m}">${m}</button>`).join('')}</div>` : ''}
    <button class="btn block" data-act="fdAdd">${IC.plus} ${diary ? `Add to ${FS.meal.toLowerCase()}` : FS.mode === 'recipe' ? 'Add to recipe' : 'Add to meal plan'}</button>
    <button class="btn ghost block" data-act="fdBack">Back to search</button>`);
}
const fdSum = () => { const a = +FD.amt || 0; return FD.unit === 'g' ? `${a} g` : `${a} × ${esc(FD.n.serving)}${FD.n.g ? ` (${r1(a * FD.n.g)} g)` : ''}`; };
function fdTotHTML(s) {
  return `<div class="tiles fdtiles">${[['kcal', s.kcal, ''], ['Protein', s.p, 'g'], ['Carbs', s.c, 'g'], ['Fat', s.f, 'g']].map(([l, v, u]) => `<div class="tile"><span class="big num">${f1(v)}${u}</span><span class="lbl">${l}</span></div>`).join('')}</div>
    <div class="nutrows">${NUTS.map(([k, l]) => `<div><span class="sub">${l}</span><b class="num">${s[k] == null ? '—' : s[k] + 'g'}</b></div>`).join('')}</div>`;
}
function logFood(n, amt, unit, meal, date, c = me()) {
  const s = scaleN(n, amt, unit), g = unit === 'g' && n.per100;
  const e = { id: uid(), clientId: c.id, date, meal, name: dispName(n), serving: g ? `${amt} g` : n.serving, qty: g ? 1 : +amt, ...(g ? s : { kcal: n.kcal, p: n.p, c: n.c, f: n.f, fib: n.fib, sug: n.sug, sat: n.sat, salt: n.salt }), barcode: n.barcode || undefined, src: n.src || undefined };
  withRank(c, () => S.food.push(e)); DB.ensureDay(c.id, date); return e;
}
function nToItem(n, amt, unit) { const s = scaleN(n, amt, unit), g = unit === 'g' && n.per100; return g ? { name: dispName(n), serving: `${amt} g`, qty: 1, ...s } : { name: dispName(n), serving: n.serving, qty: +amt, kcal: n.kcal, p: n.p, c: n.c, f: n.f, fib: n.fib, sug: n.sug, sat: n.sat, salt: n.salt }; }

/* ---------- barcode scanning ---------- */
function loadZX() {
  if (window.ZXing) return Promise.resolve(window.ZXing);
  if (loadZX.p) return loadZX.p;
  const src = ['https://unpkg.com/@zxing/library@0.21.3/umd/index.min.js', 'https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js'];
  loadZX.p = new Promise((res, rej) => { let i = 0; const next = () => { if (i >= src.length) { loadZX.p = null; return rej(new Error('lib')); } const s = document.createElement('script'); s.src = src[i++]; s.onload = () => window.ZXing ? res(window.ZXing) : next(); s.onerror = next; document.head.appendChild(s); }; next(); });
  return loadZX.p;
}
const hasBD = () => 'BarcodeDetector' in window;
function scanMsg(t) { FS.scanMsg = t; const m = $('#scanmsg'); if (m) m.innerHTML = t ? `<div class="callout small">${t}</div>` : ''; }
async function startLiveScan() {
  const v = $('#scv'), idle = $('#scanidle'); if (!v) return;
  scanMsg('Starting the camera…');
  try {
    if (hasBD()) {
      const det = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] });
      SCAN.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      v.srcObject = SCAN.stream; await v.play(); idle && (idle.hidden = true); $('#scanbox')?.classList.add('live'); scanMsg('');
      SCAN.loop = setInterval(async () => { if (SCAN.busy || !v.videoWidth) return; SCAN.busy = true; try { const r = await det.detect(v); if (r[0]) { stopScan(); gotCode(r[0].rawValue); } } catch (e) {} SCAN.busy = false; }, 280);
    } else {
      const ZX = await loadZX(); SCAN.reader = new ZX.BrowserMultiFormatReader();
      idle && (idle.hidden = true); $('#scanbox')?.classList.add('live'); scanMsg('');
      await SCAN.reader.decodeFromVideoDevice(null, 'scv', (res) => { if (res) { const t = res.getText(); stopScan(); gotCode(t); } });
    }
  } catch (e) {
    stopScan(); const blocked = e && (e.name === 'NotAllowedError' || e.name === 'SecurityError' || e.name === 'NotFoundError');
    scanMsg(e && e.message === 'lib' ? 'The scanner couldn\'t load (no signal?). Type the numbers under the barcode instead.' : blocked ? 'The camera is blocked here. Tap <b>Take a photo of it</b> instead, or type the numbers. (The Claude preview link blocks live camera. The installed app on your phone doesn\'t.)' : 'Couldn\'t start the camera. Try <b>Take a photo of it</b> instead.');
  }
}
function stopScan() { try { clearInterval(SCAN.loop); } catch (e) {} SCAN.loop = null; try { SCAN.reader && SCAN.reader.reset(); } catch (e) {} SCAN.reader = null; if (SCAN.stream) { SCAN.stream.getTracks().forEach(t => t.stop()); SCAN.stream = null; } $('#scanbox')?.classList.remove('live'); }
async function decodePhoto(url) {
  const img = new Image(); img.src = url; await img.decode();
  if (hasBD()) { try { const r = await new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] }).detect(img); if (r[0]) return r[0].rawValue; } catch (e) {} }
  const ZX = await loadZX(); const rd = new ZX.BrowserMultiFormatReader(); const res = await rd.decodeFromImageElement(img); return res.getText();
}
function gotCode(raw) { const code = String(raw).replace(/\D/g, ''); if (code.length < 6) return scanMsg('That didn\'t read properly. Try again closer, in good light.'); FS.code = code; try { navigator.vibrate && navigator.vibrate(60); } catch (e) {} lookupBarcode(code); }
function parseOFF(p, code) {
  const n = p.nutriments || {}, kcal100 = n['energy-kcal_100g'] != null ? +n['energy-kcal_100g'] : n.energy_100g != null ? n.energy_100g / 4.184 : null;
  if (kcal100 == null || isNaN(kcal100)) return null;
  const per100 = { kcal: r1(kcal100), p: r1(n.proteins_100g) || 0, c: r1(n.carbohydrates_100g) || 0, f: r1(n.fat_100g) || 0, fib: r1(n.fiber_100g), sug: r1(n.sugars_100g), sat: r1(n['saturated-fat_100g']), salt: r1(n.salt_100g) };
  const g = +p.serving_quantity > 0 ? +p.serving_quantity : null, k = (g || 100) / 100, sv = k2 => per100[k2] == null ? null : per100[k2] * k;
  return N({ name: (p.product_name || p.product_name_en || 'Unnamed product').trim(), brand: (p.brands || '').split(',')[0].trim(), serving: p.serving_size ? String(p.serving_size) : g ? g + 'g' : '100g', g: g || 100, kcal: r1(sv('kcal')), p: r1(sv('p')), c: r1(sv('c')), f: r1(sv('f')), fib: sv('fib'), sug: sv('sug'), sat: sv('sat'), salt: sv('salt'), per100, barcode: code || p.code || '', src: 'off' });
}
async function fetchJSON(url, ms = 9000) { const ac = new AbortController(), t = setTimeout(() => ac.abort(), ms); try { const r = await fetch(url, { signal: ac.signal }); if (!r.ok) throw new Error('http ' + r.status); return await r.json(); } finally { clearTimeout(t); } }
async function lookupBarcode(code) {
  const hit = S.barcodes[code] || (S.foodLib || []).find(e => e.barcode === code);
  if (hit) { FD = { n: N({ ...hit, src: hit.src === 'off' ? 'off' : 'scan' }), amt: 1, unit: 'srv' }; return fdRender(); }
  scanMsg(`${IC.search} Looking up <b class="num">${esc(code)}</b>…`);
  try {
    const j = await fetchJSON(`${OFF}/api/v2/product/${code}.json?fields=code,product_name,product_name_en,brands,serving_size,serving_quantity,nutriments`);
    const n = j && j.status === 1 && j.product ? parseOFF(j.product, code) : null;
    if (!n) return addBarcodeForm(code, 'Not in the UK database yet. Add it from the label and it\'s saved for everyone.');
    S.barcodes[code] = { ...n, ts: Date.now() }; save(); FD = { n, amt: 1, unit: 'srv' }; fdRender();
  } catch (e) { addBarcodeForm(code, 'Couldn\'t reach the food database. That\'s either no signal, or the Claude preview link, which blocks it. The installed app does the lookup. You can add it from the label now and it\'s saved for everyone.'); }
}
function addBarcodeForm(code, why) {
  openSheet(`${sheetHead('Barcode ' + code, 'Add this product')}<p class="small sub">${esc(why)}</p>
    <form class="stack-sm" data-form="barcodeAdd" data-code="${esc(code)}"><div class="fields" style="grid-template-columns:2fr 1fr"><label class="f">Product name<input class="in sm" name="name" required placeholder="e.g. Chicken tikka pot"></label><label class="f">Brand<input class="in sm" name="brand" placeholder="Tesco"></label></div>
      <label class="f">Serving size (g)<input class="in sm num" name="g" type="number" inputmode="decimal" placeholder="e.g. 250"></label>
      <div class="eyebrow">Per 100g, from the back of the pack</div>
      <div class="fields q4"><label class="f">kcal<input class="in sm num" name="kcal" type="number" inputmode="decimal" required></label><label class="f">Protein<input class="in sm num" name="p" type="number" step="any" inputmode="decimal"></label><label class="f">Carbs<input class="in sm num" name="c" type="number" step="any" inputmode="decimal"></label><label class="f">Fat<input class="in sm num" name="f" type="number" step="any" inputmode="decimal"></label></div>
      <div class="fields q4"><label class="f">Fibre<input class="in sm num" name="fib" type="number" step="any" inputmode="decimal"></label><label class="f">Sugars<input class="in sm num" name="sug" type="number" step="any" inputmode="decimal"></label><label class="f">Saturates<input class="in sm num" name="sat" type="number" step="any" inputmode="decimal"></label><label class="f">Salt<input class="in sm num" name="salt" type="number" step="any" inputmode="decimal"></label></div>
      <button class="btn block" type="submit">Save and continue</button></form><button class="btn ghost block" data-act="fsTab" data-v="scan">Back to the scanner</button>`);
}
async function offSearch() {
  const q = FS.q.trim(); if (!q) return; OFFRES = 'loading'; $('#offbox') && ($('#offbox').innerHTML = offBoxHTML());
  try { const j = await fetchJSON(`${OFF}/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=24&fields=code,product_name,brands,serving_size,serving_quantity,nutriments&tagtype_0=countries&tag_contains_0=contains&tag_0=united-kingdom`, 12000);
    OFFRES = { q: FS.q, list: (j.products || []).map(p => parseOFF(p, p.code)).filter(Boolean) };
  } catch (e) { OFFRES = { err: 'Couldn\'t reach the UK food database. That\'s either no signal, or the Claude preview link, which blocks it. The installed app can search it. For now, scan the barcode or add the food yourself.' }; }
  if (FS.tab === 'search') { const b = $('#offbox'); if (b) b.innerHTML = offBoxHTML(); }
}

/* ---------- Fuel (rewritten) ---------- */
function viewFuel5() {
  const c = me(), date = ses.p.date || today(), d = DB.day(c.id, date) || { water: 0 }, tg = targetsFor(c, date), tot = dayTotals(c.id, date), food = DB.foodOn(c.id, date), yest = DB.foodOn(c.id, addDays(date, -1));
  const wt = S.settings.waterTarget, photos = mealPhotosOf(c.id, date), plan = planOf(c), pday = plan ? plan.days[tg.site ? 'site' : 'rest'] : null, ex = exerciseKcal(c, date), exK = sum(ex, x => x.kcal), useEx = S.settings.exCals;
  const goal = tg.kcal + (useEx ? exK : 0), left = goal - tot.kcal, nt = nutTotals(c.id, date), fast = S.fasts.find(f => f.clientId === c.id && !f.end);
  const groups = [...MEALS, ...new Set(food.map(f => f.meal).filter(m => !MEALS.includes(m)))];
  const mealCard = m => { const items = food.filter(f => f.meal === m), k = f1(sum(items, f => f.kcal * f.qty)), pp = f1(sum(items, f => f.p * f.qty)), ph = photos.filter(x => x.meal === m), y = yest.filter(f => f.meal === m), isMeal = MEALS.includes(m), planned = pday ? (pday[m] || []) : [];
    return `<section class="card mealcard"><div class="row between nowrap"><div><h3>${esc(m)}</h3>${k ? `<span class="tiny num">${k} kcal · ${pp}g protein</span>` : planned.length ? `<span class="tiny num">Plan: ${Math.round(sum(planned, i => i.kcal * i.qty))} kcal</span>` : ''}</div><div class="row nowrap" style="gap:6px">${isMeal ? `<label class="iconbtn sm" style="cursor:pointer" aria-label="Add a photo of your ${m.toLowerCase()}">${IC.cam}<input type="file" accept="image/*" hidden data-mealphoto="${m}" data-date="${date}"></label><button class="iconbtn sm" data-act="fsOpen" data-tab="scan" data-meal="${m}" data-date="${date}" aria-label="Scan a barcode for ${m}">${IC.scan}</button><button class="iconbtn sm or" data-act="fsOpen" data-meal="${m}" data-date="${date}" aria-label="Add to ${m}">${IC.plus}</button>` : ''}</div></div>
      ${ph.length ? `<div class="thumbs">${ph.map(x => `<button class="thumbbtn" data-act="sheetMealPhoto" data-id="${x.id}" aria-label="Open photo"><img src="${imgSrc(x.img)}" alt="${esc(m)} photo">${x.coachNote ? '<i></i>' : ''}</button>`).join('')}</div>` : ''}
      ${items.length ? `<div class="list">${items.map(f => `<button class="li tap fooditem" data-act="editFood" data-id="${f.id}"><span class="grow"><span class="trunc" style="display:block">${esc(f.name)}${f.qty !== 1 ? ` <span class="sub">× ${f.qty}</span>` : ''}</span><span class="tiny num">${f.serving ? esc(f.serving) + ' · ' : ''}${f1(f.p * f.qty)}p · ${f1(f.c * f.qty)}c · ${f1(f.f * f.qty)}f</span></span><b class="num small">${f1(f.kcal * f.qty)}</b></button>`).join('')}</div>` : ''}
      ${planned.length && !items.length ? `<div class="planned"><div class="row between"><span class="eyebrow">On your plan</span><button class="btn sm" data-act="logPlanned" data-meal="${m}" data-date="${date}">${IC.tick} Ate this</button></div>${planned.map((i, k2) => `<div class="li"><span class="grow small">${esc(i.name)} <span class="tiny">${esc(i.serving)}${i.qty !== 1 ? ' × ' + i.qty : ''}</span></span><span class="tiny num">${f1(i.kcal * i.qty)}</span><button class="iconbtn sm" data-act="logPlannedOne" data-meal="${m}" data-date="${date}" data-k="${k2}" aria-label="Log ${esc(i.name)}">${IC.plus}</button></div>`).join('')}</div>` : ''}
      ${isMeal ? `<div class="row mealacts">${!items.length && y.length ? `<button class="btn ghost sm" data-act="copyMeal" data-meal="${m}" data-date="${date}">Same as yesterday (${Math.round(sum(y, f => f.kcal * f.qty))} kcal)</button>` : ''}${items.length ? `<button class="btn ghost sm" data-act="saveMealSheet" data-meal="${m}" data-date="${date}">${IC.star} Save as a meal</button><button class="btn ghost sm" data-act="copyMealSheet" data-meal="${m}" data-date="${date}">${IC.copy} Copy to…</button>` : ''}${!items.length && !planned.length && !y.length ? '<span class="tiny">Nothing logged.</span>' : ''}</div>` : ''}</section>`; };
  return shell('Fuel', 'Nutrition', `
    <div class="row between"><div class="head"><div class="eyebrow ruled">${date === today() ? 'Today' : fmtLong(date)}</div><h1>Fuel</h1></div>
      <div class="row nowrap"><button class="iconbtn" data-act="setP" data-k="date" data-v="${addDays(date, -1)}" aria-label="Previous day">${IC.back}</button>${date !== today() ? `<button class="btn ghost sm" data-act="setP" data-k="date" data-v="${today()}">Today</button>` : ''}${date < today() ? `<button class="iconbtn" data-act="setP" data-k="date" data-v="${addDays(date, 1)}" aria-label="Next day">${IC.fwd}</button>` : ''}</div></div>
    <section class="card hero"><div class="row between"><div class="seg" role="group" aria-label="Day type"><button class="${tg.site ? 'on' : ''}" data-act="siteDay" data-v="1" data-date="${date}">Site day</button><button class="${!tg.site ? 'on' : ''}" data-act="siteDay" data-v="0" data-date="${date}">Rest day</button></div><button class="btn sm" data-act="fsOpen" data-tab="scan" data-date="${date}">${IC.scan} Scan food</button></div>
      ${macroRings(tot, { ...tg, kcal: goal })}
      <div class="equation" aria-label="Calories remaining"><div><b class="num">${tg.kcal}</b><span>Goal</span></div><i>−</i><div><b class="num">${tot.kcal}</b><span>Food</span></div><i>+</i><div><b class="num">${useEx ? exK : 0}</b><span>Exercise</span></div><i>=</i><div class="${left < 0 ? 'over' : ''}"><b class="num">${left}</b><span>${left < 0 ? 'Over' : 'Left'}</span></div></div>
      ${!useEx && exK ? `<span class="tiny">You burned about ${exK} kcal from cardio today. ${esc(S.settings.coachName)} has it set so exercise calories aren't added back to your target.</span>` : ''}</section>
    ${groups.map(mealCard).join('')}
    <section class="card"><div class="row between"><span><b>Water</b> <span class="sub small num">${((d.water || 0) / 1000).toFixed(2)} / ${(wt / 1000).toFixed(1)} L</span></span><div class="row" style="gap:6px"><button class="iconbtn sm" data-act="water" data-v="-250" data-date="${date}" aria-label="Remove a glass">−</button><button class="btn sm" data-act="water" data-v="250" data-date="${date}">${IC.drop} 250ml</button><button class="btn ghost sm" data-act="water" data-v="500" data-date="${date}">500ml</button></div></div>
      <div class="bar ${d.water >= wt ? 'good' : ''}"><i style="width:${Math.min(100, (d.water || 0) / wt * 100)}%"></i></div></section>
    <div class="grid-2">
      <section class="card"><div class="row between"><h3>Exercise</h3><button class="btn ghost sm" data-act="sheetCardio">${IC.run} Log cardio</button></div>${ex.length ? `<div class="list">${ex.map(x => `<div class="li"><span class="grow">${esc(x.type)} <span class="tiny num">${x.mins} min${x.km ? ' · ' + x.km + ' km' : ''}</span></span><b class="num small">${x.kcal} kcal</b></div>`).join('')}</div>` : '<span class="tiny">No cardio logged. Estimates use your bodyweight and how hard each activity is.</span>'}</section>
      <section class="card"><div class="row between"><h3>From the labels</h3><span class="tiny num">${nt.known}/${nt.n} foods</span></div><div class="nutbars">${NUTS.map(([k, l]) => { const g = S.settings.nut[k], v = nt[k] || 0, pc = Math.min(100, v / g * 100), lim = k !== 'fib'; return `<div class="nutbar"><span class="small">${l}</span><div class="bar ${!lim && v >= g ? 'good' : lim && v > g ? 'warnb' : ''}"><i style="width:${pc}%"></i></div><span class="tiny num">${v} / ${g}g ${lim ? 'max' : ''}</span></div>`; }).join('')}</div><span class="tiny">Fibre, sugars, saturates and salt come from scanned and database foods. Basic library foods don't carry them.</span></section>
      <section class="card ${fast ? 'hot' : ''}"><div class="row between"><h3>Fasting</h3><button class="btn ghost sm" data-act="sheetFast">${fast ? 'Manage' : IC.timer + ' Start a fast'}</button></div>${fast ? fastClockHTML(fast) : `<span class="tiny">${(() => { const l = S.fasts.filter(f => f.clientId === c.id && f.end).sort((a, b) => b.end - a.end)[0]; return l ? `Last fast: ${fmtDur(l.end - l.start)} (goal ${l.goal}h)` : 'Optional. Only if it suits your shifts and your coach is happy with it.'; })()}</span>`}</section>
      <section class="card"><h3>Notes</h3><textarea class="in" data-foodnote="${date}" placeholder="How did today go? Cravings, takeaway, eating out…" aria-label="Food notes for the day">${esc(d.foodNote || '')}</textarea></section>
    </div>
    <button class="btn block" data-act="finishDay" data-date="${date}">${IC.tick} Finish this day</button>
    <div class="grid">
      <button class="card tap stripe" data-go="nutrition" data-p="${P({ _back: 'fuel' })}"><div class="eyebrow">Reports</div><h3>Nutrition report</h3><span class="small sub">Averages, macro split, top foods, nutrients.</span></button>
      ${plan ? `<button class="card tap stripe" data-go="myplan" data-p="${P({ _back: 'fuel' })}"><div class="eyebrow">From ${esc(S.settings.coachName)}</div><h3>${esc(plan.name)}</h3><span class="small sub">Your site-day and rest-day menus, plus the shopping list.</span></button>` : ''}
      <button class="card tap" data-go="recipes" data-p="${P({ _back: 'fuel' })}"><div class="eyebrow">Cook once, eat all week</div><h3>Recipes</h3><span class="small sub">${visibleRecipes().length} recipes. Build your own batch cook and log it by the portion.</span></button>
      <button class="card tap" data-go="foodlib" data-p="${P({ _back: 'fuel' })}"><div class="eyebrow">Shared by the team</div><h3>Food library</h3><span class="small sub">${S.foodLib.length + FOODS.length} foods, ${Object.keys(S.barcodes).length} scanned barcodes.</span></button>
      ${c.mealPlanUrl ? `<a class="card tap" href="${esc(c.mealPlanUrl)}" target="_blank" rel="noopener" style="text-decoration:none"><div class="eyebrow">Your plan</div><h3>Open your meal plan PDF</h3><span class="small sub">The PDF ${esc(S.settings.coachName)} built for you.</span></a>` : ''}
      <button class="card tap" data-go="meal" data-p="${P({ _back: 'fuel' })}"><div class="eyebrow">Tool</div><h3>Tradie Meal Builder</h3><span class="small sub">Build a van-friendly meal from UK supermarket basics.</span></button>
      <button class="card tap" data-go="topups" data-p="${P({ _back: 'fuel' })}"><div class="eyebrow">Short on protein?</div><h3>8 quick top-ups</h3><span class="small sub">Cheap options from Tesco, Sainsbury's, Aldi and Lidl.</span></button></div>
    ${mealPhotoGrid(c, false, 9)}`);
}
const fmtDur = ms => { const m = Math.max(0, Math.floor(ms / 6e4)); return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`; };
function fastClockHTML(f) { const el = Date.now() - f.start, pc = Math.min(1, el / (f.goal * 36e5)); return `<div class="row nowrap" style="gap:14px">${ring(pc, 76, 7, `<b class="num" style="font-size:13px" id="fastpct">${Math.round(pc * 100)}%</b>`, pc >= 1 ? 'var(--good)' : 'var(--orange)')}<div><b class="num fastclock" id="fastclock" data-start="${f.start}">${fmtDur(el)}</b><span class="tiny" style="display:block">of a ${f.goal}h fast · ends ${new Date(f.start + f.goal * 36e5).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span></div></div>`; }
setInterval(() => { const el = $('#fastclock'); if (el) el.textContent = fmtDur(Date.now() - +el.dataset.start); }, 30000);

/* ---------- nutrition report ---------- */
function viewNutrition() {
  const coach = ses.role === 'coach', c = coach ? DB.client(ses.p.cid) : me(); if (!c) return back();
  const rg = +ses.p.rg || 7, days = [...Array(rg)].map((_, i) => addDays(today(), i - rg + 1)), food = S.food.filter(f => f.clientId === c.id && f.date >= days[0]);
  const logged = days.filter(d => food.some(f => f.date === d)), per = days.map(d => ({ d, t: dayTotals(c.id, d), tg: targetsFor(c, d) }));
  const L = per.filter(x => x.t.n), avg = k => L.length ? Math.round(sum(L, x => x.t[k]) / L.length) : 0, avgT = k => L.length ? Math.round(sum(L, x => x.tg[k]) / L.length) : Math.round(targetsFor(c, today())[k]);
  const kc = avg('kcal'), mp = avg('p') * 4, mc = avg('c') * 4, mf = avg('f') * 9, mt = mp + mc + mf || 1;
  const byName = {}; food.forEach(f => { const k = f.name; byName[k] = byName[k] || { name: k, kcal: 0, p: 0, n: 0 }; byName[k].kcal += f.kcal * f.qty; byName[k].p += f.p * f.qty; byName[k].n++; });
  const topK = Object.values(byName).sort((a, b) => b.kcal - a.kcal).slice(0, 6), topP = Object.values(byName).sort((a, b) => b.p - a.p).slice(0, 6);
  const byMeal = MEALS.map(m => ({ m, k: sum(food.filter(f => f.meal === m), f => f.kcal * f.qty) })), mk = sum(byMeal, x => x.k) || 1;
  const hiK = Math.max(...per.map(x => Math.max(x.t.kcal, x.tg.kcal)), 1), hit = L.filter(x => Math.abs(x.t.kcal - x.tg.kcal) <= x.tg.kcal * 0.1).length, pHit = L.filter(x => x.t.p >= x.tg.p * 0.95).length;
  const nutAvg = k => { const ds = logged.map(d => sum(food.filter(f => f.date === d), f => (f[k] || 0) * f.qty)); return ds.length ? r1(sum(ds) / ds.length) : 0; };
  return shell('Nutrition report', coach ? c.name : 'Nutrition', `${pageHead(coach ? c.name : 'Reports', 'Nutrition report', `${logged.length} of ${rg} days logged.`)}
    <div class="tabs">${[7, 14, 30, 90].map(n => `<button class="tab ${rg === n ? 'on' : ''}" data-act="setP" data-k="rg" data-v="${n}">${n} days</button>`).join('')}</div>
    <div class="tiles">${[['Avg calories', kc, 'kcal', avgT('kcal')], ['Avg protein', avg('p'), 'g', avgT('p')], ['Days on calories', hit, '/' + L.length, null], ['Days protein hit', pHit, '/' + L.length, null]].map(([l, v, u, t]) => `<div class="tile"><span class="big num">${v}<small>${u}</small></span><span class="lbl">${l}${t ? ` · target ${t}` : ''}</span></div>`).join('')}</div>
    <section class="card"><div class="row between"><h3>Calories by day</h3><span class="tiny"><i class="lg-dot" style="background:var(--good)"></i>within 10% <i class="lg-dot" style="background:var(--orange)"></i>off target <i class="lg-line"></i>target</span></div>
      <div class="kbars ${rg > 30 ? 'dense' : ''}">${per.map(x => { const h = x.t.kcal / hiK * 100, th = x.tg.kcal / hiK * 100, ok = x.t.n && Math.abs(x.t.kcal - x.tg.kcal) <= x.tg.kcal * 0.1; return `<div class="kb" title="${fmt(x.d)}: ${x.t.kcal} kcal"><i class="tgt" style="bottom:${th}%"></i>${x.t.n ? `<i class="v ${ok ? 'ok' : ''}" style="height:${h}%"></i>` : ''}<span>${rg <= 14 ? DOWS[dow(x.d)][0] : ''}</span></div>`; }).join('')}</div></section>
    <div class="grid-2">
      <section class="card"><h3>Macro split</h3><div class="splitbar"><i style="width:${mp / mt * 100}%;background:var(--orange)"></i><i style="width:${mc / mt * 100}%;background:#D9D4CB"></i><i style="width:${mf / mt * 100}%;background:var(--warn)"></i></div>
        <div class="row between small"><span><i class="lg-dot" style="background:var(--orange)"></i>Protein ${Math.round(mp / mt * 100)}%</span><span><i class="lg-dot" style="background:#D9D4CB"></i>Carbs ${Math.round(mc / mt * 100)}%</span><span><i class="lg-dot" style="background:var(--warn)"></i>Fat ${Math.round(mf / mt * 100)}%</span></div>
        <div class="eyebrow">Calories by meal</div>${byMeal.map(x => `<div class="nutbar"><span class="small">${x.m}</span><div class="bar"><i style="width:${x.k / mk * 100}%"></i></div><span class="tiny num">${Math.round(x.k / mk * 100)}%</span></div>`).join('')}</section>
      <section class="card"><h3>Daily averages from labels</h3>${NUTS.map(([k, l]) => `<div class="li"><span class="grow small">${l}</span><b class="num small">${nutAvg(k)}g</b><span class="tiny num">${k === 'fib' ? 'aim ' : 'max '}${S.settings.nut[k]}g</span></div>`).join('')}<span class="tiny">Only counts foods with full label data (scanned or from the UK database).</span></section>
      <section class="card"><h3>Most calories from</h3><div class="list">${topK.map(x => `<div class="li"><span class="grow small trunc">${esc(x.name)} <span class="tiny">× ${x.n}</span></span><b class="num small">${Math.round(x.kcal)}</b></div>`).join('') || '<div class="empty small">Nothing logged in this range.</div>'}</div></section>
      <section class="card"><h3>Most protein from</h3><div class="list">${topP.map(x => `<div class="li"><span class="grow small trunc">${esc(x.name)}</span><b class="num small">${Math.round(x.p)}g</b></div>`).join('') || '<div class="empty small">Nothing logged in this range.</div>'}</div></section></div>`, { back: true, nav: coach ? 'clients' : 'fuel' });
}

/* ---------- recipes ---------- */
function viewRecipes() {
  const list = visibleRecipes(), coach = ses.role === 'coach';
  return shell('Recipes', coach ? 'Coach HQ' : 'Nutrition', `${pageHead('Batch cook, log by the portion', 'Recipes', 'Add the ingredients once, say how many portions it makes, and log one portion with a tap. Shared recipes can be used by everyone.', `<button class="btn" data-act="recipeNew">${IC.plus} New recipe</button>`)}
    <div class="grid">${list.map(r => { const n = recipePer(r); return `<button class="card tap ${r.by === meId() ? 'stripe' : ''}" data-go="recipe" data-p="${P({ id: r.id, _back: 'recipes', _backP: ses.p })}"><div class="eyebrow">${r.by === meId() ? 'Yours' : 'By ' + esc(credit(r))}</div><h3>${esc(r.name)}</h3><span class="small sub num">Per portion: ${f1(n.kcal)} kcal · ${f1(n.p)}p ${f1(n.c)}c ${f1(n.f)}f</span><span class="tiny">${r.items.length} ingredients · makes ${r.servings}${r.shared ? '' : ' · private'}</span></button>`; }).join('') || '<div class="card"><div class="empty small">No recipes yet.</div></div>'}</div>`, { back: true, nav: coach ? 'mealplans' : 'fuel' });
}
function viewRecipe() {
  const r = S.recipes.find(x => x.id === ses.p.id); if (!r) return back();
  const can = r.by === meId() || ses.role === 'coach', n = recipePer(r), t = k => Math.round(sum(r.items, i => (i[k] || 0) * i.qty));
  return shell(r.name, 'Recipe', `${can ? `<input class="in titlein" data-rb="name" data-id="${r.id}" value="${esc(r.name)}" aria-label="Recipe name">` : `<h1>${esc(r.name)}</h1>`}
    <section class="card hero"><div class="tiles">${[['kcal', f1(n.kcal)], ['Protein', f1(n.p) + 'g'], ['Carbs', f1(n.c) + 'g'], ['Fat', f1(n.f) + 'g']].map(([l, v]) => `<div class="tile"><span class="big num">${v}</span><span class="lbl">${l} per portion</span></div>`).join('')}</div>
      <div class="row between"><label class="row small" style="gap:8px">Makes<input class="in sm num" style="width:80px" type="number" min="1" data-rb="servings" data-id="${r.id}" value="${r.servings}" ${can ? '' : 'disabled'}>portions</label><span class="tiny num">Whole batch: ${t('kcal')} kcal · ${t('p')}g protein</span></div></section>
    <section class="card"><div class="row between"><h3>Ingredients</h3>${can ? `<button class="btn sm" data-act="fsOpen" data-mode="recipe" data-target="${r.id}">${IC.plus} Add</button>` : ''}</div>
      <div class="list">${r.items.map((i, k) => `<div class="li"><span class="grow"><span class="trunc" style="display:block">${esc(i.name)}</span><span class="tiny num">${esc(i.serving)}${i.qty !== 1 ? ' × ' + i.qty : ''} · ${f1(i.p * i.qty)}p</span></span><b class="num small">${f1(i.kcal * i.qty)}</b>${can ? `<button class="iconbtn sm" data-act="rbDel" data-id="${r.id}" data-k="${k}" aria-label="Remove ${esc(i.name)}">${IC.x}</button>` : ''}</div>`).join('') || '<div class="empty small">Add the ingredients for the whole batch.</div>'}</div></section>
    <section class="card"><h3>Method</h3>${can ? `<textarea class="in" data-rb="method" data-id="${r.id}" placeholder="How to make it">${esc(r.method || '')}</textarea>` : `<p class="small">${esc(r.method || 'No method written.')}</p>`}</section>
    <div class="row">${ses.role === 'client' && r.items.length ? `<button class="btn" data-act="recipeLog" data-id="${r.id}">${IC.plus} Log a portion</button>` : ''}${can ? `<label class="row small" style="gap:8px;cursor:pointer"><input type="checkbox" data-rb="shared" data-id="${r.id}" ${r.shared ? 'checked' : ''}> Share with everyone</label><button class="btn danger sm" data-act="recipeDel" data-id="${r.id}">Delete</button>` : `<button class="btn ghost sm" data-act="recipeCopy" data-id="${r.id}">${IC.copy} Copy to my recipes</button>`}</div>`, { back: true, nav: ses.role === 'coach' ? 'mealplans' : 'fuel' });
}

/* ---------- meal plans (coach) ---------- */
const planDayTot = d => { const all = MEALS.flatMap(m => d[m] || []); return { kcal: Math.round(sum(all, i => i.kcal * i.qty)), p: Math.round(sum(all, i => i.p * i.qty)), c: Math.round(sum(all, i => i.c * i.qty)), f: Math.round(sum(all, i => i.f * i.qty)) }; };
function viewMealPlans() {
  return shell('Meal plans', 'Coach HQ', `${pageHead('Nutrition', 'Meal plans', 'Build a site-day menu and a rest-day menu, assign it, and it shows up in their Fuel screen with a one-tap "Ate this" and a shopping list.', `<button class="btn" data-act="planNew">${IC.plus} New plan</button>`)}
    <div class="grid">${S.mealPlans.map(p => { const s = planDayTot(p.days.site), r = planDayTot(p.days.rest), who = S.clients.filter(c => c.mealPlanId === p.id);
      return `<button class="card tap stripe" data-go="mealplan" data-p="${P({ id: p.id })}"><h3>${esc(p.name)}</h3><span class="small sub num">Site day ${s.kcal} kcal · ${s.p}p &nbsp; Rest day ${r.kcal} kcal · ${r.p}p</span><span class="tiny">${who.length ? 'On it: ' + esc(who.map(c => first(c.name)).join(', ')) : 'Not assigned yet'}</span></button>`; }).join('') || '<div class="card"><div class="empty small">No meal plans yet.</div></div>'}</div>
    <div class="grid"><button class="card tap" data-go="recipes"><div class="eyebrow">Shared</div><h3>Recipes</h3><span class="small sub">${S.recipes.length} recipes, built by you and the lads.</span></button>
      <section class="card"><h3>Diary settings</h3><label class="row between small" style="cursor:pointer">Add exercise calories back to targets<input type="checkbox" data-nutset="exCals" ${S.settings.exCals ? 'checked' : ''}></label>
        <div class="eyebrow">Daily guides from the labels</div><div class="fields q4">${NUTS.map(([k, l]) => `<label class="f">${l} g<input class="in sm num" type="number" data-nutset="${k}" value="${S.settings.nut[k]}"></label>`).join('')}</div><span class="tiny">Set to UK reference intakes for men: fibre 30g (aim), sugars 90g, saturates 30g and salt 6g (max).</span></section></div>`, { nav: 'mealplans' });
}
function viewMealPlan() {
  const p = S.mealPlans.find(x => x.id === ses.p.id); if (!p) return back();
  const dk = ses.p.day || 'site', d = p.days[dk], t = planDayTot(d);
  return shell(p.name, 'Meal plan', `<input class="in titlein" data-mp="name" data-id="${p.id}" value="${esc(p.name)}" aria-label="Plan name">
    <div class="row between"><div class="seg">${[['site', 'Site day'], ['rest', 'Rest day']].map(([k, l]) => `<button class="${dk === k ? 'on' : ''}" data-act="setP" data-k="day" data-v="${k}">${l}</button>`).join('')}</div><span class="small num"><b>${t.kcal} kcal</b> · ${t.p}p ${t.c}c ${t.f}f</span></div>
    ${MEALS.map(m => { const it = d[m] || []; return `<section class="card"><div class="row between"><h3>${m}</h3><div class="row nowrap"><span class="tiny num">${Math.round(sum(it, i => i.kcal * i.qty))} kcal</span><button class="iconbtn sm or" data-act="fsOpen" data-mode="plan" data-target="${P({ id: p.id, day: dk, meal: m })}" aria-label="Add to ${m}">${IC.plus}</button></div></div>
      <div class="list">${it.map((i, k) => `<div class="li"><span class="grow"><span class="trunc" style="display:block">${esc(i.name)}</span><span class="tiny num">${esc(i.serving)}${i.qty !== 1 ? ' × ' + i.qty : ''} · ${f1(i.p * i.qty)}p ${f1(i.c * i.qty)}c ${f1(i.f * i.qty)}f</span></span><b class="num small">${f1(i.kcal * i.qty)}</b><button class="iconbtn sm" data-act="mpDel" data-id="${p.id}" data-day="${dk}" data-meal="${m}" data-k="${k}" aria-label="Remove ${esc(i.name)}">${IC.x}</button></div>`).join('') || '<span class="tiny">Nothing planned.</span>'}</div></section>`; }).join('')}
    <section class="card"><h3>Notes for the client</h3><textarea class="in" data-mp="notes" data-id="${p.id}">${esc(p.notes || '')}</textarea></section>
    <section class="card"><h3>Who's on this plan</h3><div class="stack-sm">${DB.active().map(c => { const on = c.mealPlanId === p.id; return `<button class="check ${on ? 'on' : ''}" data-act="mpAssign" data-id="${p.id}" data-c="${c.id}"><span class="box">${on ? IC.tick : ''}</span><span class="grow">${esc(c.name)}</span><span class="tiny">${c.mealPlanId && !on ? 'On another plan' : ''}</span></button>`; }).join('')}</div></section>
    <div class="row"><button class="btn ghost sm" data-act="mpCopyDay" data-id="${p.id}" data-day="${dk}">${IC.copy} Copy ${dk === 'site' ? 'site day to rest day' : 'rest day to site day'}</button><button class="btn ghost sm" data-act="mpDup" data-id="${p.id}">Duplicate plan</button><button class="btn danger sm" data-act="mpDelPlan" data-id="${p.id}">Delete plan</button></div>`, { back: true, nav: 'mealplans' });
}
function viewMyPlan() {
  const c = me(), p = planOf(c); if (!p) return back();
  const dk = ses.p.day || (targetsFor(c, today()).site ? 'site' : 'rest'), d = p.days[dk], t = planDayTot(d);
  return shell(p.name, 'Nutrition', `${pageHead('From ' + S.settings.coachName, p.name, esc(p.notes || ''), `<button class="btn" data-go="grocery" data-p="${P({ _back: 'myplan' })}">${IC.cart} Shopping list</button>`)}
    <div class="row between"><div class="seg">${[['site', 'Site day'], ['rest', 'Rest day']].map(([k, l]) => `<button class="${dk === k ? 'on' : ''}" data-act="setP" data-k="day" data-v="${k}">${l}</button>`).join('')}</div><span class="small num"><b>${t.kcal} kcal</b> · ${t.p}g protein</span></div>
    ${MEALS.map(m => `<section class="card"><div class="row between"><h3>${m}</h3><span class="tiny num">${Math.round(sum(d[m] || [], i => i.kcal * i.qty))} kcal</span></div><div class="list">${(d[m] || []).map(i => `<div class="li"><span class="grow small">${esc(i.name)} <span class="tiny">${esc(i.serving)}${i.qty !== 1 ? ' × ' + i.qty : ''}</span></span><span class="tiny num">${f1(i.p * i.qty)}p</span><b class="num small">${f1(i.kcal * i.qty)}</b></div>`).join('') || '<span class="tiny">Nothing planned.</span>'}</div></section>`).join('')}
    <p class="tiny">Swap like for like if you need to: same protein source size, same carb size. Log what you actually ate.</p>`, { back: true, nav: 'fuel' });
}
function viewGrocery() {
  const c = me(), p = planOf(c); if (!p) return back();
  const sd = ses.p.sd != null ? +ses.p.sd : 5, rd = 7 - sd, wk = mondayOf(today()), ticks = (c.groceryTicks = c.groceryTicks || {})[wk] || [];
  const agg = {}; const add = (d, n) => MEALS.forEach(m => (d[m] || []).forEach(i => { const k = i.name + '|' + i.serving; agg[k] = agg[k] || { name: i.name, serving: i.serving, n: 0 }; agg[k].n += i.qty * n; }));
  add(p.days.site, sd); add(p.days.rest, rd);
  const cat = n => (FOODS.find(f => f[0] === n) || [])[6] || 'Other', cats = ['Protein', 'Carbs', 'Fruit & veg', 'Extras', 'On the go', 'Drinks', 'Other'];
  const rows = Object.values(agg); const left = rows.filter(r => !ticks.includes(r.name + '|' + r.serving)).length;
  return shell('Shopping list', 'Nutrition', `${pageHead('Week of ' + fmt(wk), 'Shopping list', `Built from ${esc(p.name)}. ${left} of ${rows.length} items left to get.`)}
    <section class="card"><span class="small">Site days this week</span><div class="tabs">${[3, 4, 5, 6].map(n => `<button class="tab ${sd === n ? 'on' : ''}" data-act="setP" data-k="sd" data-v="${n}">${n} site · ${7 - n} rest</button>`).join('')}</div></section>
    ${cats.map(g => { const it = rows.filter(r => cat(r.name) === g); return it.length ? `<section class="card"><h3>${g}</h3><div class="stack-sm">${it.map(r => { const k = r.name + '|' + r.serving, on = ticks.includes(k); return `<button class="check ${on ? 'on' : ''}" data-act="groTick" data-k="${esc(k)}"><span class="box">${on ? IC.tick : ''}</span><span class="grow ${on ? 'struck' : ''}">${esc(r.name)}</span><span class="tiny num">${r.n % 1 ? r.n.toFixed(1) : r.n} × ${esc(r.serving)}</span></button>`; }).join('')}</div></section>` : ''; }).join('')}
    <button class="btn ghost" data-act="groCopy">${IC.copy} Copy the list</button>`, { back: true, nav: 'fuel' });
}

/* ---------- coach view of a client's nutrition: link the new tools ---------- */
if (typeof clientNutrition === 'function') { const _cn = clientNutrition; clientNutrition = function (c, ...a) { const h = _cn(c, ...a);
  return `<section class="card stripe"><div class="row between"><div><div class="eyebrow">Build 5</div><h3>Meal plan and report</h3></div><div class="row"><button class="btn sm" data-go="nutrition" data-p="${P({ cid: c.id, _back: 'client', _backP: { id: c.id, tab: 'nutrition' } })}">${IC.chart} Nutrition report</button></div></div>
    <label class="f">Meal plan<select class="in" data-cplan="${c.id}"><option value="">No meal plan</option>${opt(S.mealPlans, c.mealPlanId, p => [p.id, p.name])}</select></label></section>${h}`; }; }

/* ---------- actions ---------- */
Object.assign(ACTS, {
  sheetFood: el => fsStart({ meal: el.dataset.meal, date: el.dataset.date }),
  fsOpen: el => { let t = el.dataset.target; if (t && t[0] === '{') t = JSON.parse(t); fsStart({ meal: el.dataset.meal, date: el.dataset.date, tab: el.dataset.tab, mode: el.dataset.mode, target: t }); },
  fsTab: el => { FS.tab = el.dataset.v; FS.scanMsg = ''; renderFoodSheet(); },
  fsMeal: el => { FS.meal = el.dataset.v; renderFoodSheet(); },
  fdOpen: el => { const n = el.dataset.src === 'off' ? OFFRES.list[+el.dataset.i] : FPICK[+el.dataset.i]; if (!n) return; FD = { n, amt: 1, unit: 'srv' }; fdRender(); },
  fdQuick: el => { FD.amt = +el.dataset.v; fdRender(); },
  fdUnit: el => { if (FD.unit === el.dataset.v) return; FD.unit = el.dataset.v; FD.amt = FD.unit === 'g' ? (FD.n.g || 100) : 1; fdRender(); if (FD.unit === 'g') setTimeout(() => $('#fdamt')?.focus(), 50); },
  fdMeal: el => { FS.meal = el.dataset.v; fdRender(); },
  fdBack: () => renderFoodSheet(),
  fdAdd: () => { const n = FD.n, amt = +FD.amt; if (!(amt > 0)) return toast('Enter an amount first.');
    if (n.src === 'off' && n.barcode && !S.barcodes[n.barcode]) S.barcodes[n.barcode] = { ...n, ts: Date.now() };
    if (FS.mode === 'recipe') { const r = S.recipes.find(x => x.id === FS.target); r.items.push(nToItem(n, amt, FD.unit)); save(); closeSheet(); toast(`${dispName(n)} added`); return stay({}); }
    if (FS.mode === 'plan') { const t = FS.target, p = S.mealPlans.find(x => x.id === t.id); (p.days[t.day][t.meal] = p.days[t.day][t.meal] || []).push(nToItem(n, amt, FD.unit)); save(); closeSheet(); toast(`${dispName(n)} added to ${t.meal.toLowerCase()}`); return stay({}); }
    logFood(n, amt, FD.unit, FS.meal, FS.date); save(); closeSheet(); toast(`${dispName(n)} added to ${FS.meal.toLowerCase()}`); stay({}); },
  offSearch: () => offSearch(),
  scanLive: () => startLiveScan(),
  editFood: el => { const f = S.food.find(x => x.id === el.dataset.id); if (!f) return;
    const gm = String(f.serving || '').match(/^(\d+(?:\.\d+)?) g$/);
    openSheet(`${sheetHead(f.meal + ' · ' + fmt(f.date), f.name)}<form class="stack" data-form="editFood" data-id="${f.id}"><div class="fields">${gm ? `<label class="f">Grams eaten<input class="in num" name="grams" type="number" step="any" min="0" inputmode="decimal" value="${r1(+gm[1] * f.qty)}" required></label>` : `<label class="f">Servings (${esc(f.serving || '1 serving')})<input class="in num" name="qty" type="number" step="any" min="0" inputmode="decimal" value="${f.qty}" required></label>`}<label class="f">Meal<select class="in" name="meal">${opt(MEALS, f.meal)}</select></label></div>
      <div class="tiles fdtiles">${[['kcal', f.kcal * f.qty], ['Protein', f.p * f.qty], ['Carbs', f.c * f.qty], ['Fat', f.f * f.qty]].map(([l, v]) => `<div class="tile"><span class="big num">${f1(v)}</span><span class="lbl">${l}</span></div>`).join('')}</div>
      <button class="btn block" type="submit">Save</button></form><button class="btn danger block" data-act="delFood" data-id="${f.id}">${IC.trash} Remove from diary</button>`); },
  delFood: el => { S.food = S.food.filter(f => f.id !== el.dataset.id); save(); closeSheet(); stay({}); },
  saveMealSheet: el => openSheet(`${sheetHead('Save for next time', 'Save ' + el.dataset.meal.toLowerCase() + ' as a meal')}<form class="stack" data-form="saveMeal" data-meal="${el.dataset.meal}" data-date="${el.dataset.date}"><label class="f">Name<input class="in" name="name" required maxlength="40" placeholder="e.g. Usual van lunch"></label><button class="btn block" type="submit">Save meal</button></form>`),
  copyMealSheet: el => openSheet(`${sheetHead(el.dataset.meal, 'Copy this meal')}<form class="stack" data-form="copyMealTo" data-meal="${el.dataset.meal}" data-date="${el.dataset.date}"><div class="fields"><label class="f">To date<input class="in" type="date" name="date" value="${addDays(el.dataset.date, 1)}" required></label><label class="f">Meal<select class="in" name="meal">${opt(MEALS, el.dataset.meal)}</select></label></div><button class="btn block" type="submit">Copy</button></form>`),
  logMyMeal: el => { const m = S.myMeals.find(x => x.id === el.dataset.id), c = me(); withRank(c, () => m.items.forEach(i => S.food.push({ ...i, id: uid(), clientId: c.id, date: FS.date, meal: FS.meal }))); DB.ensureDay(c.id, FS.date); save(); closeSheet(); toast(`${m.name} logged to ${FS.meal.toLowerCase()}`); stay({}); },
  delMyMeal: el => twoTap(el, IC.tick, () => { S.myMeals = S.myMeals.filter(x => x.id !== el.dataset.id); save(); renderFoodSheet(); }),
  logPlanned: el => { const c = me(), p = planOf(c), date = el.dataset.date, d = p.days[targetsFor(c, date).site ? 'site' : 'rest'][el.dataset.meal] || []; withRank(c, () => d.forEach(i => S.food.push({ ...i, id: uid(), clientId: c.id, date, meal: el.dataset.meal }))); DB.ensureDay(c.id, date); save(); toast(`${el.dataset.meal} logged as planned`); stay({}); },
  logPlannedOne: el => { const c = me(), p = planOf(c), date = el.dataset.date, i = p.days[targetsFor(c, date).site ? 'site' : 'rest'][el.dataset.meal][+el.dataset.k]; withRank(c, () => S.food.push({ ...i, id: uid(), clientId: c.id, date, meal: el.dataset.meal })); DB.ensureDay(c.id, date); save(); toast(`${i.name} logged`); stay({}); },
  sheetFast: () => { const c = me(), f = S.fasts.find(x => x.clientId === c.id && !x.end), hist = S.fasts.filter(x => x.clientId === c.id && x.end).sort((a, b) => b.end - a.end).slice(0, 6);
    openSheet(`${sheetHead('Intermittent fasting', f ? 'Fast in progress' : 'Start a fast')}${f ? fastClockHTML(f) + `<button class="btn block" data-act="fastEnd">End fast now</button><button class="btn ghost block" data-act="fastCancel">Cancel (don't save it)</button>` : `<div class="qa">${[12, 14, 16, 18].map(h => `<button data-act="fastStart" data-h="${h}">${IC.timer}${h}:${24 - h}</button>`).join('')}</div><p class="tiny">Starts now. Water, black coffee and tea are fine. Stop if you feel unwell on site. Safety first.</p>`}
      ${hist.length ? `<div class="eyebrow">Recent fasts</div><div class="list">${hist.map(x => `<div class="li"><span class="grow small">${fmtLong(iso(new Date(x.start)))}</span><span class="small num">${fmtDur(x.end - x.start)}</span><span class="pill ${x.end - x.start >= x.goal * 36e5 ? 'good' : 'mute'}">${x.goal}h goal</span></div>`).join('')}</div>` : ''}`); },
  fastStart: el => { S.fasts.push({ id: uid(), clientId: me().id, start: Date.now(), end: null, goal: +el.dataset.h }); save(); closeSheet(); toast(`${el.dataset.h}-hour fast started`); stay({}); },
  fastEnd: () => { const f = S.fasts.find(x => x.clientId === me().id && !x.end); f.end = Date.now(); save(); closeSheet(); toast(`Fast ended: ${fmtDur(f.end - f.start)}`); stay({}); },
  fastCancel: () => { S.fasts = S.fasts.filter(x => !(x.clientId === me().id && !x.end)); save(); closeSheet(); stay({}); },
  finishDay: el => { const c = me(), date = el.dataset.date, t = dayTotals(c.id, date), tg = targetsFor(c, date), mt = maintenance(c, tg.site), kg = latestKg(c);
    let proj = ''; if (mt && kg && t.kcal) { const ch = (t.kcal - mt) * 35 / 7700, to = kg + ch; proj = `<div class="callout"><span class="small">If every day were like today, you'd weigh about</span><b class="num" style="font-size:30px;display:block;font-family:Syne,sans-serif">${kgTo(to, c.units)} ${c.units}</b><span class="small">in 5 weeks (${ch >= 0 ? '+' : ''}${kgTo(ch, c.units)} ${c.units}). That's a rough estimate from your stats and trade, not a promise.</span></div>`; }
    const ok = Math.abs(t.kcal - tg.kcal) <= tg.kcal * 0.1, pk = t.p >= tg.p * 0.95;
    openSheet(`${sheetHead(fmtLong(date), 'Day complete')}<div class="stack-sm"><div class="li"><span class="grow">Calories</span><b class="num">${t.kcal} / ${tg.kcal}</b><span class="pill ${ok ? 'good' : 'warn'}">${ok ? 'On target' : t.kcal < tg.kcal ? 'Under' : 'Over'}</span></div><div class="li"><span class="grow">Protein</span><b class="num">${t.p} / ${tg.p}g</b><span class="pill ${pk ? 'good' : 'warn'}">${pk ? 'Hit' : 'Short'}</span></div></div>${proj || (t.kcal ? '<p class="tiny">Add your age and height in your onboarding details to see a 5-week projection.</p>' : '<p class="small sub">Nothing logged for this day yet.</p>')}<button class="btn block" data-act="closeSheet">Sorted</button>`);
    const d = DB.ensureDay(c.id, date); d.complete = true; save(); },
  recipeNew: () => { const by = meId(), r = { id: uid(), name: 'New recipe', servings: 4, by, byName: by === 'coach' ? S.settings.coachName : me().name, shared: true, ts: Date.now(), method: '', items: [] }; S.recipes.unshift(r); save(); go('recipe', { id: r.id, _back: 'recipes' }); },
  rbDel: el => { const r = S.recipes.find(x => x.id === el.dataset.id); r.items.splice(+el.dataset.k, 1); save(); stay({}); },
  recipeDel: el => twoTap(el, 'Tap again to delete', () => { S.recipes = S.recipes.filter(x => x.id !== el.dataset.id); save(); toast('Recipe deleted'); go('recipes'); }),
  recipeCopy: el => { const r = S.recipes.find(x => x.id === el.dataset.id), by = meId(), n = { ...JSON.parse(JSON.stringify(r)), id: uid(), by, byName: by === 'coach' ? S.settings.coachName : me().name, ts: Date.now(), name: r.name + ' (my version)' }; S.recipes.unshift(n); save(); go('recipe', { id: n.id, _back: 'recipes' }); },
  recipeLog: el => { const r = S.recipes.find(x => x.id === el.dataset.id); FS = { meal: new Date().getHours() < 11 ? 'Breakfast' : new Date().getHours() < 15 ? 'Lunch' : new Date().getHours() < 21 ? 'Dinner' : 'Snacks', date: today(), q: '', qty: 1, tab: 'recipes', mode: 'diary' }; FD = { n: recipePer(r), amt: 1, unit: 'srv' }; fdRender(); },
  planNew: () => { const p = { id: uid(), name: 'New meal plan', notes: '', by: 'coach', ts: Date.now(), days: { site: {}, rest: {} } }; S.mealPlans.unshift(p); save(); go('mealplan', { id: p.id, _back: 'mealplans' }); },
  mpDel: el => { const p = S.mealPlans.find(x => x.id === el.dataset.id); p.days[el.dataset.day][el.dataset.meal].splice(+el.dataset.k, 1); save(); stay({}); },
  mpAssign: el => { const c = DB.client(el.dataset.c); c.mealPlanId = c.mealPlanId === el.dataset.id ? null : el.dataset.id; save(); toast(c.mealPlanId ? `${first(c.name)} is on this plan` : `${first(c.name)} taken off this plan`); stay({}); },
  mpCopyDay: el => { const p = S.mealPlans.find(x => x.id === el.dataset.id), from = el.dataset.day, to = from === 'site' ? 'rest' : 'site'; p.days[to] = JSON.parse(JSON.stringify(p.days[from])); save(); toast(`Copied to ${to === 'site' ? 'site day' : 'rest day'}`); stay({}); },
  mpDup: el => { const p = S.mealPlans.find(x => x.id === el.dataset.id), n = { ...JSON.parse(JSON.stringify(p)), id: uid(), name: p.name + ' (copy)', ts: Date.now() }; S.mealPlans.unshift(n); save(); go('mealplan', { id: n.id, _back: 'mealplans' }); },
  mpDelPlan: el => twoTap(el, 'Tap again to delete', () => { S.mealPlans = S.mealPlans.filter(x => x.id !== el.dataset.id); S.clients.forEach(c => { if (c.mealPlanId === el.dataset.id) c.mealPlanId = null; }); save(); go('mealplans'); }),
  groTick: el => { const c = me(), wk = mondayOf(today()), t = (c.groceryTicks[wk] = c.groceryTicks[wk] || []), k = el.dataset.k; c.groceryTicks[wk] = t.includes(k) ? t.filter(x => x !== k) : [...t, k]; save(); stay({}); },
  groCopy: async () => { const txt = [...document.querySelectorAll('.content .check')].map(b => `${b.classList.contains('on') ? '[x]' : '[ ]'} ${b.querySelector('.grow').textContent} – ${b.querySelector('.tiny').textContent}`).join('\n'); try { await navigator.clipboard.writeText(txt); toast('Shopping list copied'); } catch (e) { toast('Couldn\'t copy here. Long-press to select instead.'); } }
});
Object.assign(FORMS, {
  barcode: (f, d) => { const code = String(d.code).replace(/\D/g, ''); if (code.length < 6) return toast('Barcodes are 8 or 13 digits.'); FS.code = code; lookupBarcode(code); },
  barcodeAdd: (f, d) => { const code = f.dataset.code, g = +d.g || null, per100 = { kcal: +d.kcal || 0, p: +d.p || 0, c: +d.c || 0, f: +d.f || 0, fib: r1(d.fib), sug: r1(d.sug), sat: r1(d.sat), salt: r1(d.salt) }, k = (g || 100) / 100, sv = x => per100[x] == null ? null : per100[x] * k, by = meId(), byName = by === 'coach' ? S.settings.coachName : me().name;
    const n = N({ name: d.name.trim(), brand: (d.brand || '').trim(), serving: g ? g + 'g' : '100g', g: g || 100, kcal: r1(sv('kcal')), p: r1(sv('p')), c: r1(sv('c')), f: r1(sv('f')), fib: sv('fib'), sug: sv('sug'), sat: sv('sat'), salt: sv('salt'), per100, barcode: code, src: 'scan', by, byName });
    S.barcodes[code] = { ...n, ts: Date.now() };
    if (!(S.foodLib || []).some(e => e.barcode === code)) S.foodLib.unshift({ id: uid(), name: dispName(n), serving: n.serving, kcal: n.kcal, p: n.p, c: n.c, f: n.f, fib: n.fib, sug: n.sug, sat: n.sat, salt: n.salt, per100, barcode: code, cat: 'Extras', by, byName, ts: Date.now(), verified: false, img: null });
    save(); toast('Saved. Anyone who scans it now gets it straight away.'); FD = { n, amt: 1, unit: 'srv' }; fdRender(); },
  editFood: (f, d) => { const e = S.food.find(x => x.id === f.dataset.id), gm = String(e.serving || '').match(/^(\d+(?:\.\d+)?) g$/); if (gm && d.grams) e.qty = r1(+d.grams / +gm[1] * 1000) / 1000 || e.qty; else e.qty = +d.qty || e.qty; e.meal = d.meal; save(); closeSheet(); toast('Updated'); stay({}); },
  saveMeal: (f, d) => { const c = me(), items = DB.foodOn(c.id, f.dataset.date).filter(x => x.meal === f.dataset.meal).map(({ id, clientId, date, meal, ...rest }) => rest); S.myMeals.unshift({ id: uid(), owner: c.id, name: d.name.trim(), items, ts: Date.now() }); save(); closeSheet(); toast(`Saved. Find it under My meals when you add food.`); },
  copyMealTo: (f, d) => { const c = me(), items = DB.foodOn(c.id, f.dataset.date).filter(x => x.meal === f.dataset.meal); withRank(c, () => items.forEach(i => S.food.push({ ...i, id: uid(), date: d.date, meal: d.meal }))); DB.ensureDay(c.id, d.date); save(); closeSheet(); toast(`Copied to ${d.meal.toLowerCase()}, ${fmt(d.date)}`); stay({}); }
});
document.addEventListener('input', e => { const t = e.target, ds = t.dataset; if (!ds) return;
  if (ds.fdamt !== undefined) { FD.amt = t.value === '' ? (FD.unit === 'g' ? 100 : 1) : t.value; const b = $('#fdtot'); if (b) b.innerHTML = fdTotHTML(scaleN(FD.n, +FD.amt || 0, FD.unit)); const sm = $('#fdsum'); if (sm) sm.innerHTML = fdSum();
    document.querySelectorAll('.amtrow .tab').forEach(c => c.classList.toggle('on', t.value === '' && +c.dataset.v === +FD.amt)); t.parentElement.classList.toggle('on', t.value !== ''); return; }
  if (ds.fdunit !== undefined) { const n = FD.n; FD.unit = t.value; FD.amt = t.value === 'g' ? (n.g || 100) : 1; fdRender(); return; }
  if (ds.foodnote) { DB.ensureDay(me().id, ds.foodnote).foodNote = t.value; lazySave(); return; }
  if (ds.rb && ds.id) { const r = S.recipes.find(x => x.id === ds.id); if (!r) return; if (ds.rb === 'shared') { r.shared = t.checked; save(); return; } r[ds.rb] = ds.rb === 'servings' ? Math.max(1, +t.value || 1) : t.value; lazySave(); if (ds.rb === 'servings') { clearTimeout(viewRecipe._t); viewRecipe._t = setTimeout(() => stay({}), 500); } return; }
  if (ds.mp && ds.id) { const p = S.mealPlans.find(x => x.id === ds.id); p[ds.mp] = t.value; lazySave(); return; }
  if (ds.nutset) { if (ds.nutset === 'exCals') S.settings.exCals = t.checked; else S.settings.nut[ds.nutset] = +t.value || 0; lazySave(); return; }
  if (ds.cplan) { DB.client(ds.cplan).mealPlanId = t.value || null; save(); toast(t.value ? 'Meal plan assigned' : 'Meal plan removed'); return; }
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target && e.target.id === 'fq') { e.preventDefault(); if (FS.q.trim()) offSearch(); } });
document.addEventListener('change', e => { const t = e.target; if (t.dataset && t.dataset.barphoto !== undefined && t.files && t.files[0]) {
  scanMsg('Reading the barcode…'); readImage(t.files[0], 1400, 'image/jpeg', async url => { try { const code = await decodePhoto(url); gotCode(code); } catch (err) { scanMsg(err && err.message === 'lib' ? 'The scanner couldn\'t load (no signal?). Type the numbers under the barcode instead.' : 'Couldn\'t read a barcode in that photo. Get closer, fill the frame with the barcode, and keep it flat and in good light. Or type the numbers.'); } }); } });
closeSheet = function () { stopScan(); const s = $('#sheet'); if (s) s.innerHTML = ''; };
