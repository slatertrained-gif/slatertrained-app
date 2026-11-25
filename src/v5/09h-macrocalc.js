
/* =====================================================================
   09h (v5.8): Slater's Tradie Macro Calculator, moved into the app.
   Same 9 questions, same maths and same advice as the website version
   (st-macro-calc.liquid), without the email gate. In the app:
   - a client can send the results to the coach;
   - the coach can run it for a client and set the results as their
     targets, either the same every day (matches the website) or split
     into site days and rest days.
   The app's automatic starting targets (new client, recalculate) and the
   5-week projection now use this maths too.
   ===================================================================== */
const MC_JOBS = [['plumber', 'Plumber', '~450 kcal/hr', 1.04], ['sparky', 'Sparky', '~350 kcal/hr', 1.02], ['builder', 'Builder', '~480 kcal/hr', 1.05], ['roofer', 'Roofer', '~520 kcal/hr', 1.07], ['labourer', 'Labourer', '~580 kcal/hr', 1.08], ['machinist', 'Machinist', '~250 kcal/hr', 1.00], ['plasterer', 'Plasterer', '~460 kcal/hr', 1.04], ['scaffolder', 'Scaffolder', '~600 kcal/hr', 1.09], ['other', 'Other trade', 'We\'ll estimate', 1.02]];
const MC_STEPS = [
  null,
  null,
  { key: 'job', title: 'Your trade', sub: 'Your job determines how many calories you burn on site.', two: true, opts: MC_JOBS.map(j => [j[0], j[1], j[2]]) },
  { key: 'activity', title: 'Days on site', sub: 'How many days a week do you work your trade?', two: true, opts: [['1.3', '3 days', 'Part time on site'], ['1.4', '4 days', 'Most of the week'], ['1.5', '5 days', 'Standard full week'], ['1.6', '6 days', 'Long weeks'], ['1.7', '7 days', 'No days off']] },
  { key: 'training', title: 'Training days', sub: 'How many days do you train, or would like to train?', two: true, opts: [['1', '1 day', 'Barely any time'], ['2', '2 days', 'Getting started'], ['3', '3 days', 'Solid foundation'], ['4', '4 days', 'Committed'], ['5', '5 days', 'Full send'], ['6', '6+ days', 'All in']] },
  { key: 'steps', title: 'Daily steps', sub: 'How many steps do you average per day? This affects your total calorie burn.', two: true, opts: [['1.0', 'Under 5,000', 'Mostly sitting or driving'], ['1.05', '5,000–8,000', 'Light movement through the day'], ['1.1', '8,000–12,000', 'Active — typical tradie on site'], ['1.15', '12,000–16,000', 'Very active on site all day'], ['1.2', '16,000+', 'Constantly moving — heavy site days']] },
  { key: 'goal', title: 'The goal', sub: 'Be specific. Vague goals get vague results.', opts: [['cut', 'Lose fat, keep muscle', 'Drop the gut, hold on to size — abs, definition, look good on holiday'], ['recomp', 'Body recomp', 'Lose fat and build muscle at the same time'], ['bulk', 'Build muscle', 'Add size and strength — willing to eat more'], ['maintain', 'Maintain and improve performance', 'Happy with weight, want to get fitter and stronger']] },
  { key: 'diet', title: 'Current diet', sub: 'No judgement — just need to know where you\'re starting from.', opts: [['poor', 'Pretty bad', 'Takeaways most days, Monsters and Lucozade, barely any protein'], ['average', 'Hit and miss', 'Some good days, some bad — weekends a write-off'], ['decent', 'Fairly decent', 'Cooking most meals, not perfect but trying'], ['good', 'Pretty dialled in', 'Already tracking or eating well — need more precision']] },
  { key: 'sleep', title: 'Sleep', sub: 'Sleep affects your results more than most people realise.', opts: [['poor', 'Under 6 hours', 'Early starts, late nights — not enough'], ['average', '6–7 hours', 'Getting by, not thriving'], ['good', '7–8 hours', 'Solid — body can recover properly'], ['great', '8+ hours', 'Optimal — recovering well']] },
  { key: 'struggle', title: 'Biggest struggle', sub: 'This shapes the advice at the end.', opts: [['protein', 'Hitting my protein', 'Never know what to eat to get enough in'], ['consistency', 'Staying consistent', 'Start strong, fall off after a couple of weeks'], ['structure', 'No structure or plan', 'Don\'t know what to do or when to do it'], ['weekends', 'Weekends wreck me', 'Beers, takeaways, undoing the week\'s work'], ['tracking', 'Tracking food', 'Don\'t know how to track or can\'t be bothered'], ['time', 'No time', 'Long days on site — hard to fit everything in']] }
];
const MC_LBL = ['', 'Stats', 'Trade', 'On Site', 'Training', 'Steps', 'Goal', 'Diet', 'Sleep', 'Struggle'];
// App trade names → calculator trades (for automatic targets).
const MC_TRADE_MAP = { 'Electrician': 'sparky', 'Plumber': 'plumber', 'Joiner / Carpenter': 'builder', 'Fabricator / Welder': 'other', 'Bricklayer': 'builder', 'Labourer / Groundworker': 'labourer', 'Roofer / Scaffolder': 'roofer', 'Machinist / Engineer': 'machinist', 'Warehouse / Driver': 'other', 'Mostly desk-based': 'machinist' };

/* The maths, exactly as on the website. Site/rest split: the website's
   days-on-site multipliers (3 days 1.3 … 7 days 1.7) work out as 1.7 on a
   site day and 1.0 on a rest day, so the split averages back to the same
   weekly number. */
function tradieCalc(D) {
  const jm = (MC_JOBS.find(j => j[0] === D.job) || MC_JOBS[8])[3], act = parseFloat(D.activity) || 1.5, sm = parseFloat(D.steps) || 1.05;
  const bmr = 10 * D.weight + 6.25 * D.height - 5 * D.age + (D.sex === 'f' ? -161 : 5), tdee = Math.round(bmr * act * jm * sm), protein = Math.round(D.weight * 2);
  const plan = base => { let calories, fat; if (D.goal === 'cut') { calories = base - 400; fat = Math.round(D.weight * 0.9); } else if (D.goal === 'bulk') { calories = base + 400; fat = Math.round(D.weight * 1.0); } else if (D.goal === 'recomp') { calories = base - 150; fat = Math.round(D.weight * 0.9); } else { calories = base; fat = Math.round(D.weight * 1.0); }
    const carbs = Math.max(50, Math.round((calories - protein * 4 - fat * 9) / 4)); return { kcal: Math.round(calories), p: protein, c: carbs, f: fat }; };
  const avg = plan(tdee);
  return { ...avg, calories: avg.kcal, tdee, bmr: Math.round(bmr), water: act >= 1.75 ? 3.5 : 3.0, site: plan(Math.round(bmr * 1.7 * jm * sm)), rest: plan(Math.round(bmr * 1.0 * jm * sm)) };
}
const MC_PRIORITY = p => ({
  protein: `Hit ${p}g of protein first — every single day. Before you worry about anything else. If you can do that consistently for 2 weeks you'll already be ahead of 90% of lads.`,
  consistency: 'Don\'t try to be perfect. Just show up. Your only job for the first 2 weeks is to hit your calories 5 out of 7 days. Consistency beats intensity every time.',
  structure: 'Start with your protein target and one meal you\'ll eat every day without thinking. Build from there. One habit at a time — trying to change everything at once is why it never sticks.',
  weekends: 'Don\'t aim to be perfect on weekends. Aim to not undo the week. Keep protein high, enjoy yourself, and get back on it Monday. Two bad days can\'t ruin five good ones.',
  tracking: 'Log everything in the Fuel tab here. Scan the barcode and it\'s done. For the first week, just log what you eat — don\'t change anything. Know your numbers first, then start adjusting.',
  time: 'Batch cook on Sunday. 2 hours of cooking = 5 days of not thinking about food. Chicken thighs, rice, eggs — simple and fast.'
});
const MC_SLEEP = { poor: 'You\'re getting under 6 hours — this is limiting your results more than your diet is. Poor sleep raises cortisol, tanks testosterone, and makes you hungrier. One extra hour will make a noticeable difference.', average: '6–7 hours is getting by but not optimal. Your body does most of its muscle repair while you sleep. Try to hit 7 hours consistently.', good: '7–8 hours is solid. Your recovery is on point — the training will do its job.', great: '8+ hours. You\'re recovering well and this gives you a real edge. Keep it up.' };
const MC_FOODS = [['6 eggs (fried or scrambled)', 36], ['200g chicken breast', 46], ['2 tins of tuna', 50], ['200g Greek yoghurt', 20], ['Protein shake (1 scoop)', 25], ['150g beef mince (5% fat)', 35], ['250ml full fat milk', 8]];
const MC_STALL = [['Losing fat: no change after 1 week', 'Lower calories by 150–200. Keep protein the same — only adjust carbs and fat.'], ['Building muscle: no change after 1 week', 'Raise calories by 150–200, mostly from carbs.'], ['Losing more than 1kg per week', 'Raise calories by 150–200 from carbs. Losing too fast means losing muscle too.'], ['Gaining too fast on bulk', 'More than 0.5kg per week — lower calories by 150–200. Slow and steady wins.'], ['Plateau for 3+ weeks', 'Take a diet break at maintenance for 1–2 weeks. Then go again.']];

// Automatic starting targets now use the same maths (5 days on site, 8–12k steps).
calcMacros = function ({ sex = 'm', age, height, weight, trade, goal }) {
  const r = tradieCalc({ sex, age, height, weight, job: MC_TRADE_MAP[trade] || 'other', activity: '1.5', steps: '1.1', goal: goal || 'maintain' });
  return { site: { kcal: r.kcal, p: r.p, c: r.c, f: r.f }, rest: { kcal: r.kcal, p: r.p, c: r.c, f: r.f }, bmr: r.bmr };
};
// 5-week projection: weekly-average maintenance from the same maths.
maintenance = function (c) { const s = c.stats || {}, kg = latestKg(c); if (!s.age || !s.height || !kg) return null; const m = c.calc && c.calc.in; return tradieCalc({ sex: s.sex, age: s.age, height: s.height, weight: kg, job: (m && m.job) || MC_TRADE_MAP[c.trade] || 'other', activity: (m && m.activity) || '1.5', steps: (m && m.steps) || '1.1', goal: 'maintain' }).tdee; };

/* ---------- the wizard ---------- */
let MC = null;
function mcStart(cid) { const c = cid ? DB.client(cid) : ses.role === 'client' ? me() : null, st = (c && c.stats) || {}, prev = c && c.calc && c.calc.in;
  MC = { cid: c ? c.id : null, step: 1, err: '', wu: (c && c.units === 'lbs') ? 'lbs' : 'kg', hu: 'cm', res: null,
    D: { name: c ? first(c.name) : '', age: st.age || '', weightRaw: c && latestKg(c) ? (c.units === 'lbs' ? Math.round(latestKg(c) * 2.20462) : latestKg(c)) : '', cm: st.height || '', ft: '', inch: '', sex: st.sex || 'm', job: (prev && prev.job) || (c && MC_TRADE_MAP[c.trade]) || '', activity: '', training: '', steps: '', goal: (prev && prev.goal) || (c && c.goal === 'cut' ? 'cut' : c && c.goal === 'bulk' ? 'bulk' : ''), diet: '', sleep: '', struggle: '' } }; }
function viewCalc5() {
  const coach = ses.role === 'coach'; if (!MC || (coach && ses.p.cid && MC.cid !== ses.p.cid) || ses.p.fresh) { mcStart(ses.p.cid); delete ses.p.fresh; }
  const c = MC.cid ? DB.client(MC.cid) : null, s = MC.step, D = MC.D;
  const dots = `<div class="mcbar" aria-label="Step ${Math.min(s, 9)} of 9">${MC_LBL.slice(1).map((l, i) => `<div class="mcdot ${i + 1 < s ? 'done' : i + 1 === s ? 'on' : ''}"><b>${i + 1}</b><span>${l}</span></div>`).join('')}</div>`;
  let body = '';
  if (s === 1) body = `<div class="mchd"><h2>Your stats</h2><p>Be accurate — your targets are built from this.</p></div>
    <div class="stack-sm"><label class="f">First name<input class="in" data-mc="name" value="${esc(D.name)}" placeholder="e.g. Jake"></label>
    <label class="f">Age<input class="in num" type="number" inputmode="numeric" data-mc="age" value="${esc(D.age)}" placeholder="e.g. 24"></label>
    <div class="f"><div class="row between"><span>Weight</span><div class="seg mini">${['kg', 'lbs'].map(u => `<button class="${MC.wu === u ? 'on' : ''}" data-act="mcUnit" data-k="wu" data-v="${u}">${u}</button>`).join('')}</div></div><input class="in num" type="number" inputmode="decimal" data-mc="weightRaw" value="${esc(D.weightRaw)}" placeholder="${MC.wu === 'kg' ? 'e.g. 85' : 'e.g. 187'}" aria-label="Weight in ${MC.wu}"></div>
    <div class="f"><div class="row between"><span>Height</span><div class="seg mini">${[['ft', 'ft / in'], ['cm', 'cm']].map(([u, l]) => `<button class="${MC.hu === u ? 'on' : ''}" data-act="mcUnit" data-k="hu" data-v="${u}">${l}</button>`).join('')}</div></div>
      ${MC.hu === 'cm' ? `<input class="in num" type="number" inputmode="numeric" data-mc="cm" value="${esc(D.cm)}" placeholder="e.g. 178" aria-label="Height in cm">` : `<div class="fields" style="grid-template-columns:1fr 1fr"><select class="in" data-mc="ft" aria-label="Feet"><option value="">Feet</option>${[4, 5, 6, 7].map(f => `<option value="${f}" ${+D.ft === f && D.ft !== '' ? 'selected' : ''}>${f} ft</option>`).join('')}</select><select class="in" data-mc="inch" aria-label="Inches"><option value="">Inches</option>${[...Array(12)].map((_, i) => `<option value="${i}" ${D.inch !== '' && +D.inch === i ? 'selected' : ''}>${i} in</option>`).join('')}</select></div>`}</div></div>`;
  else if (s <= 9) { const st = MC_STEPS[s]; body = `<div class="mchd"><h2>${st.title}</h2><p>${esc(st.sub)}</p></div><div class="mcopts ${st.two ? 'two' : ''}">${st.opts.map(([v, l, sub]) => `<button class="mcopt ${D[st.key] === v ? 'sel' : ''}" data-act="mcPick" data-k="${st.key}" data-v="${v}" aria-pressed="${D[st.key] === v}"><b>${esc(l)}</b><span>${esc(sub)}</span></button>`).join('')}</div>`; }
  if (s <= 9) return shell('Macro Calculator', coach ? 'Coach HQ' : 'Tools', `${pageHead(c && coach ? 'For ' + c.name : 'Free tool · SlaterTrained', 'Tradie Macro Calculator', s === 1 ? '9 questions. Your personalised calorie and macro targets — built around your trade, your body, and your goal.' : '')}
    ${dots}<section class="card mccard">${body}${MC.err ? `<div class="mcerr">${esc(MC.err)}</div>` : ''}
    <div class="row mcnav">${s > 1 ? `<button class="btn ghost" data-act="mcBack">← Back</button>` : ''}<button class="btn grow" data-act="mcNext">${s === 9 ? 'Get my results →' : 'Next →'}</button></div></section>`, { back: true, nav: coach ? 'clients' : 'tools' });
  return mcResults(c, coach);
}
function mcResults(c, coach) {
  const r = MC.res, D = MC.D, run = []; let tot = 0; MC_FOODS.forEach(f => { if (tot < r.p + 10) { tot += f[1]; run.push(f); } });
  const wShow = MC.wu === 'lbs' ? Math.round(D.weightRaw) + 'lbs' : Math.round(D.weight) + 'kg';
  return shell('Your targets', coach ? 'Coach HQ' : 'Tools', `
    <section class="card hero mcres"><div class="eyebrow">Your personalised targets</div><span class="small sub">${esc(D.name || (c ? first(c.name) : ''))} — ${wShow}, ${D.age} yrs old</span>
      <div class="row nowrap" style="align-items:baseline;gap:8px"><b class="mccal num">${r.calories.toLocaleString()}</b><span class="sub">kcal / day</span></div>
      <div class="tiles three">${[['Protein', r.p], ['Carbs', r.c], ['Fat', r.f]].map(([l, v]) => `<div class="tile"><span class="big num">${v}</span><span class="lbl">grams · ${l}</span></div>`).join('')}</div></section>
    <div class="tiles three">${[['Litres / day', r.water], ['Training days', D.training === '6' ? '6+' : D.training], [MC.wu === 'lbs' ? 'lbs bodyweight' : 'kg bodyweight', MC.wu === 'lbs' ? Math.round(D.weight * 2.205) : Math.round(D.weight)]].map(([l, v]) => `<div class="tile"><span class="big num">${v}</span><span class="lbl">${l}</span></div>`).join('')}</div>
    ${coach && c ? `<section class="card stripe"><h3>Set these as ${esc(first(c.name))}'s targets</h3><div class="stack-sm">
      <button class="check ${MC.mode !== 'split' ? 'on' : ''}" data-act="mcMode" data-v="same"><span class="box">${MC.mode !== 'split' ? IC.tick : ''}</span><span class="grow"><b>Same every day</b><span class="tiny" style="display:block">${r.kcal} kcal · ${r.p}p ${r.c}c ${r.f}f. Matches the website calculator.</span></span></button>
      <button class="check ${MC.mode === 'split' ? 'on' : ''}" data-act="mcMode" data-v="split"><span class="box">${MC.mode === 'split' ? IC.tick : ''}</span><span class="grow"><b>Split site days and rest days</b><span class="tiny" style="display:block">Site ${r.site.kcal} kcal · ${r.site.c}c &nbsp; Rest ${r.rest.kcal} kcal · ${r.rest.c}c. Same weekly total, same protein and fat.</span></span></button></div>
      <button class="btn block" data-act="mcSet">${IC.tick} Set as ${esc(first(c.name))}'s targets</button><span class="tiny">Their current targets: site ${c.targets.site.kcal} kcal, rest ${c.targets.rest.kcal} kcal.</span></section>` : ''}
    ${!coach ? `<section class="card stripe"><h3>Send these to ${esc(S.settings.coachName)}</h3><p class="small sub">These are your starting numbers. ${esc(S.settings.coachName)} sets your actual targets and adjusts them every 2–4 weeks from your check-ins.</p><button class="btn block" data-act="mcSend">${IC.chat} Send to ${esc(S.settings.coachName)}</button></section>` : ''}
    <section class="card mcprio"><div class="eyebrow">Your #1 priority right now</div><p>${esc(MC_PRIORITY(r.p)[D.struggle])}</p></section>
    <section class="card"><div class="eyebrow">How to hit your protein — tradie meals</div><div class="list">${run.map(f => `<div class="li"><span class="grow small">${esc(f[0])}</span><b class="num small" style="color:var(--orange)">${f[1]}g</b></div>`).join('')}<div class="li mctotal"><b class="grow small">Total</b><b class="num small" style="color:var(--orange)">${Math.min(tot, r.p)}g+</b></div></div></section>
    <section class="card"><div class="eyebrow">Sleep &amp; recovery</div><p class="small">${esc(MC_SLEEP[D.sleep])}</p></section>
    <section class="card"><div class="eyebrow">If progress stalls</div>${MC_STALL.map(([h, t]) => `<div class="mcadj"><b>${esc(h)}</b><span class="small">${esc(t)}</span></div>`).join('')}</section>
    <button class="btn ghost block" data-act="mcReset">↺ Start over</button>`, { back: true, nav: coach ? 'clients' : 'tools' });
}
function mcValidateStats() {
  const D = MC.D, age = parseInt(D.age), raw = parseFloat(D.weightRaw), kg = MC.wu === 'lbs' ? raw * 0.453592 : raw;
  if (!String(D.name).trim() || !D.age || !D.weightRaw) return 'Fill in your name, age and weight to continue.';
  if (isNaN(age) || age < 16 || age > 80) return 'Enter an age between 16 and 80.';
  if (isNaN(kg) || kg < 40 || kg > 250) return MC.wu === 'lbs' ? 'Enter a weight between 88 and 550 lbs.' : 'Enter a weight between 40 and 250 kg.';
  let cm; if (MC.hu === 'cm') { cm = parseFloat(D.cm); if (isNaN(cm)) return 'Enter your height in cm.'; } else { if (D.ft === '') return 'Pick your height in feet and inches.'; cm = (parseInt(D.ft) * 12 + (D.inch !== '' ? parseInt(D.inch) : 0)) * 2.54; }
  if (cm < 130 || cm > 230) return 'Enter a height between 130 and 230 cm (4ft 3 – 7ft 6).';
  D.ageN = age; D.weight = Math.round(kg * 10) / 10; D.height = Math.round(cm); return '';
}
const MC_ERRS = ['', '', 'Select your trade to continue.', 'Select your work days to continue.', 'Select your training days to continue.', 'Select your average steps to continue.', 'Select your goal to continue.', 'Select your current diet to continue.', 'Select your sleep to continue.', 'Select your biggest struggle to continue.'];
Object.assign(ACTS, {
  mcPick: el => { MC.D[el.dataset.k] = el.dataset.v; MC.err = ''; const y = window.scrollY; stay({}); window.scrollTo(0, y); },
  mcUnit: el => { const k = el.dataset.k, v = el.dataset.v, D = MC.D; if (MC[k] === v) return;
    if (k === 'wu') { const n = parseFloat(D.weightRaw); if (!isNaN(n)) D.weightRaw = v === 'lbs' ? Math.round(n * 2.20462) : Math.round(n / 2.20462 * 10) / 10; }
    else if (v === 'cm') { if (D.ft !== '') D.cm = Math.round((parseInt(D.ft) * 12 + (D.inch !== '' ? parseInt(D.inch) : 0)) * 2.54); } else { const n = parseFloat(D.cm); if (!isNaN(n)) { const ti = Math.round(n / 2.54), f = Math.floor(ti / 12); if (f >= 4 && f <= 7) { D.ft = String(f); D.inch = String(ti % 12); } } }
    MC[k] = v; stay({}); },
  mcNext: () => { const s = MC.step; if (s === 1) { MC.err = mcValidateStats(); if (MC.err) return stay({}); } else if (!MC.D[MC_STEPS[s].key]) { MC.err = MC_ERRS[s]; return stay({}); }
    MC.err = ''; if (s === 9) { const D = MC.D; MC.res = tradieCalc({ ...D, age: D.ageN }); MC.mode = 'same'; } MC.step = s + 1; stay({}); window.scrollTo(0, 0); },
  mcBack: () => { MC.err = ''; MC.step = Math.max(1, MC.step - 1); stay({}); window.scrollTo(0, 0); },
  mcReset: () => { mcStart(MC.cid); stay({}); window.scrollTo(0, 0); },
  mcMode: el => { MC.mode = el.dataset.v; const y = window.scrollY; stay({}); window.scrollTo(0, y); },
  mcSet: () => { const c = DB.client(MC.cid), r = MC.res, same = { kcal: r.kcal, p: r.p, c: r.c, f: r.f }; c.targets.site = MC.mode === 'split' ? { ...r.site } : { ...same }; c.targets.rest = MC.mode === 'split' ? { ...r.rest } : { ...same };
    c.stats = { ...(c.stats || {}), age: MC.D.ageN, height: MC.D.height }; c.calc = { in: { job: MC.D.job, activity: MC.D.activity, steps: MC.D.steps, goal: MC.D.goal, training: MC.D.training }, res: r, date: today() };
    save(); toast(`${first(c.name)}'s targets updated`); go('client', { id: c.id, tab: 'nutrition' }); },
  mcSend: () => { const c = me(), r = MC.res, D = MC.D, job = (MC_JOBS.find(j => j[0] === D.job) || [, , ''])[1];
    S.messages.push({ id: uid(), clientId: c.id, from: 'client', text: `Ran the Tradie Macro Calculator: ${r.calories} kcal a day, ${r.p}g protein, ${r.c}g carbs, ${r.f}g fat. ${job}, ${MC_STEPS[3].opts.find(o => o[0] === D.activity)[1]} on site, training ${D.training === '6' ? '6+' : D.training} days, goal: ${MC_STEPS[6].opts.find(o => o[0] === D.goal)[1].toLowerCase()}.`, ts: Date.now(), read: false });
    c.calc = { in: { job: D.job, activity: D.activity, steps: D.steps, goal: D.goal, training: D.training }, res: r, date: today() }; c.stats = { ...(c.stats || {}), age: c.stats && c.stats.age || D.ageN, height: c.stats && c.stats.height || D.height };
    save(); toast(`Sent to ${S.settings.coachName}`); }
});
document.addEventListener('input', e => { const t = e.target; if (t.dataset && t.dataset.mc && MC) { MC.D[t.dataset.mc] = t.value; if (MC.err) { MC.err = ''; const x = document.querySelector('.mcerr'); if (x) x.remove(); } } });
// Coach: run it from the client's Nutrition tab.
{ const _cn2 = clientNutrition; clientNutrition = function (c, ...a) { const h = _cn2(c, ...a); return h.replace(`${IC.chart} Nutrition report</button>`, `${IC.chart} Nutrition report</button><button class="btn ghost sm" data-go="calc" data-p="${P({ cid: c.id, fresh: 1, _back: 'client', _backP: { id: c.id, tab: 'nutrition' } })}">${IC.calc} Macro calculator</button>`); }; }
