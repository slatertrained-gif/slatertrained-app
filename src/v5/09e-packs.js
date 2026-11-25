
/* =====================================================================
   09e (v5.5): habit schedules, starter packs, the full exercise
   library with demo videos.
   - Habits can run on chosen days (every day, weekdays, or picked days).
     Scores, points, targets and the to-do list only count a habit on
     its days.
   - Starter packs bundle a programme, habits (with days), tasks, a meal
     plan, a roadmap and a welcome message, applied to a client in one tap.
   - ~685 built-in exercises (EXLIB) merged into the library with stable
     ids. Each can have a demo: a link (YouTube, Instagram, Loom, Drive)
     or a video uploaded from the phone.
   ===================================================================== */

/* ---------- habit schedules ---------- */
const ALLD = [0, 1, 2, 3, 4, 5, 6], WKD = [1, 2, 3, 4, 5];
function habitsOn(c, date) { const w = dow(date); return (c.habits || []).filter(h => !h.days || h.days.includes(w)); }
function habitSlots(c, since, days) { let n = 0; for (let i = 0; i < days; i++) n += habitsOn(c, addDays(since, i)).length; return n; }
function habitDaysText(h) { const d = h.days; return !d || d.length === 7 ? 'Every day' : d.join() === '1,2,3,4,5' ? 'Weekdays' : d.join() === '0,6' ? 'Weekends' : [1, 2, 3, 4, 5, 6, 0].filter(x => d.includes(x)).map(x => DAYN[x]).join(', '); }
const dayChips = (sel, name = 'hd') => `<div class="row" style="gap:6px">${[1, 2, 3, 4, 5, 6, 0].map(d => `<label class="segopt dayopt"><input type="checkbox" name="${name}${d}" ${sel.includes(d) ? 'checked' : ''}><span>${DAYN[d]}</span></label>`).join('')}</div>`;
const dayQuick = name => `<div class="row" style="gap:6px"><button type="button" class="tab" data-act="dayPick" data-n="${name}" data-v="all">Every day</button><button type="button" class="tab" data-act="dayPick" data-n="${name}" data-v="wkd">Weekdays</button><button type="button" class="tab" data-act="dayPick" data-n="${name}" data-v="wke">Weekends</button></div>`;
const readDays = (d, name = 'hd') => ALLD.filter(x => d[name + x]);
SHEETS.habitDays = el => { const c = DB.client(el.dataset.c), h = c.habits.find(x => x.id === el.dataset.h);
  openSheet(`${sheetHead(c.name, h.label)}<form class="stack-sm" data-form="habitDays" data-c="${c.id}" data-h="${h.id}"><label class="f">Habit<input class="in" name="label" value="${esc(h.label)}" required maxlength="60"></label><div class="eyebrow">Which days</div>${dayQuick('hd')}${dayChips(h.days || ALLD)}<button class="btn block" type="submit">Save</button></form>`); };
FORMS.habitDays = (f, d) => { const c = DB.client(f.dataset.c), h = c.habits.find(x => x.id === f.dataset.h), days = readDays(d); if (!days.length) return toast('Pick at least one day.'); h.label = d.label.trim(); h.days = days.length === 7 ? undefined : days; save(); closeSheet(); toast('Habit updated'); stay({}); };
let HAS_DAYS = ALLD.slice();
Object.assign(ACTS, {
  sheetHabitDays: el => SHEETS.habitDays(el),
  dayPick: el => { const v = el.dataset.v, set = v === 'all' ? ALLD : v === 'wkd' ? WKD : [0, 6]; ALLD.forEach(x => { const i = document.querySelector(`input[name="${el.dataset.n}${x}"]`); if (i) i.checked = set.includes(x); }); },
  sheetHabitAssign: el => { const n = el.dataset.n; openSheet(`${sheetHead('Assign habit', n)}<div class="eyebrow">On which days</div><div class="row" style="gap:6px">${[1, 2, 3, 4, 5, 6, 0].map(d => `<button class="tab ${HAS_DAYS.includes(d) ? 'on' : ''}" data-act="hasDay" data-d="${d}" data-n="${esc(n)}">${DAYN[d]}</button>`).join('')}</div><span class="tiny">${esc(habitDaysText({ days: HAS_DAYS }))}. Tap a client to give it to them.</span>
    <div class="stack-sm">${DB.active().map(c => { const on = c.habits.some(h => h.label === n); return `<button class="check ${on ? 'on' : ''}" data-act="habitAssign" data-n="${esc(n)}" data-c="${c.id}"><span class="box">${on ? IC.tick : ''}</span><span class="grow">${esc(c.name)}</span><span class="tiny num">${on ? esc(habitDaysText(c.habits.find(h => h.label === n))) : c.habits.length + ' habits'}</span></button>`; }).join('')}</div>`); },
  hasDay: el => { const d = +el.dataset.d; HAS_DAYS = HAS_DAYS.includes(d) ? HAS_DAYS.filter(x => x !== d) : [...HAS_DAYS, d].sort(); if (!HAS_DAYS.length) HAS_DAYS = [d]; ACTS.sheetHabitAssign(el); },
  habitAssign: el => { const c = DB.client(el.dataset.c), n = el.dataset.n, i = c.habits.findIndex(h => h.label === n); if (i >= 0) c.habits.splice(i, 1); else c.habits.push({ id: uid(), label: n, days: HAS_DAYS.length === 7 ? undefined : HAS_DAYS.slice() }); save(); toast(i >= 0 ? `Removed from ${first(c.name)}` : `Assigned to ${first(c.name)}`); ACTS.sheetHabitAssign(el); }
});

/* ---------- starter packs ---------- */
function migrate5e() {
  S.packs = S.packs || [];
  S.exercises.forEach(e => { if (e.video && !e.url) e.url = e.video; delete e.video; });
  const have = new Map(S.exercises.map(e => [e.name.toLowerCase(), e]));
  EXLIB.forEach(([id, name, muscle, equip]) => { const ex = have.get(name.toLowerCase()); if (ex) { if (!ex.lib) { ex.muscle = muscle; ex.lib = 1; } } else S.exercises.push({ id, name, muscle, equip, url: '', cues: '', lib: 1 }); });
  if (S.settings.demo && !S.v5PackSeeded) { S.v5PackSeeded = true; const tpl = S.programmes.find(p => p.isTemplate);
    S.packs.push({ id: uid(), name: 'New starter: site-day cut (example)', desc: 'Everything a new lad on a fat-loss plan needs from day one.', programmeId: tpl ? tpl.id : '', mealPlanId: S.mealPlans[0] ? S.mealPlans[0].id : '', roadmap: true,
      habits: [{ label: '3L water' }, { label: 'Protein target hit' }, { label: '10,000 steps', days: [0, 6] }, { label: 'Prep tomorrow\'s lunch tonight', days: [0, 1, 2, 3, 4] }],
      tasks: [{ title: 'Fill in your onboarding form', link: '', repeat: 'once', days: [], dueIn: 1 }, { title: 'Take your starting photos', link: 'progress', repeat: 'once', days: [], dueIn: 2 }, { title: 'Take your progress photos', link: 'progress', repeat: 'days', days: [0], dueIn: 0 }],
      message: 'Welcome in, {name}. Your plan, habits and to-do list are all set up on your Today screen. Start with the onboarding form and your starting photos.', ts: Date.now() }); }
}
function applyPack(pk, c) {
  const did = [];
  if (pk.programmeId && DB.prog(pk.programmeId)) { c.programmeId = copyProg(pk.programmeId, c.id); did.push('programme'); }
  if (pk.mealPlanId && S.mealPlans.some(m => m.id === pk.mealPlanId)) { c.mealPlanId = pk.mealPlanId; did.push('meal plan'); }
  let nh = 0; (pk.habits || []).forEach(h => { if (!c.habits.some(x => x.label.toLowerCase() === h.label.toLowerCase())) { c.habits.push({ id: uid(), label: h.label, days: h.days && h.days.length < 7 ? h.days.slice() : undefined }); nh++; } }); if (nh) did.push(nh + ' habit' + (nh > 1 ? 's' : ''));
  (pk.tasks || []).forEach(t => S.tasks.push({ id: uid(), clientId: c.id, title: t.title, note: t.note || '', link: t.link || '', repeat: t.repeat, days: t.days || [], due: t.repeat === 'once' && t.dueIn ? addDays(today(), +t.dueIn) : '', done: {}, start: today(), ts: Date.now() })); if ((pk.tasks || []).length) did.push(pk.tasks.length + ' task' + (pk.tasks.length > 1 ? 's' : ''));
  if (pk.roadmap && !S.pages.some(p => !p.trashed && Array.isArray(p.share) && p.share.length === 1 && p.share[0] === c.id && /roadmap/i.test(p.title))) { tplRoadmap(c, null); did.push('roadmap'); }
  if (pk.message && pk.message.trim()) { S.messages.push({ id: uid(), clientId: c.id, from: 'coach', text: pk.message.replace(/\{name\}/g, first(c.name)), ts: Date.now(), read: false }); did.push('welcome message'); }
  (c.packs = c.packs || []).push({ id: pk.id, name: pk.name, date: today() });
  return did;
}
function packSummary(pk) { const pr = DB.prog(pk.programmeId), mp = S.mealPlans.find(m => m.id === pk.mealPlanId);
  return [pr && 'Programme: ' + pr.name, mp && 'Meal plan: ' + mp.name, (pk.habits || []).length && pk.habits.length + ' habits', (pk.tasks || []).length && pk.tasks.length + ' tasks', pk.roadmap && 'Roadmap', pk.message && 'Welcome message'].filter(Boolean).join(' · ') || 'Empty so far'; }
function viewPacks() {
  return shell('Starter packs', 'Coach HQ', `${pageHead('Set a new lad up in one tap', 'Starter packs', 'A pack bundles a programme, habits on their days, to-do tasks, a meal plan, their roadmap and a welcome message. Apply it when someone joins, or any time after.', `<button class="btn" data-act="packNew">${IC.plus} New pack</button>`)}
    <div class="grid">${S.packs.map(pk => { const n = S.clients.filter(c => (c.packs || []).some(x => x.id === pk.id)).length; return `<button class="card tap stripe" data-go="pack" data-p="${P({ id: pk.id })}"><h3>${esc(pk.name)}</h3><span class="small sub">${esc(pk.desc || '')}</span><span class="tiny">${esc(packSummary(pk))}</span>${n ? `<span class="tiny">Used for ${n} client${n > 1 ? 's' : ''}</span>` : ''}</button>`; }).join('') || '<div class="card"><div class="empty small">No starter packs yet.</div></div>'}</div>`, { nav: 'packs' });
}
function viewPack() {
  const pk = S.packs.find(x => x.id === ses.p.id); if (!pk) return back();
  const tpls = S.programmes.filter(p => p.isTemplate), linkName = l => (TASK_LINKS.find(x => x[0] === l) || [, ''])[1].split(' (')[0];
  return shell(pk.name, 'Starter pack', `<input class="in titlein" data-pk="name" data-id="${pk.id}" value="${esc(pk.name)}" aria-label="Pack name">
    <input class="in" data-pk="desc" data-id="${pk.id}" value="${esc(pk.desc || '')}" placeholder="What's this pack for? e.g. Fat loss, 4 sessions a week">
    <section class="card"><h3>Training and food</h3><div class="fields"><label class="f">Programme<select class="in" data-pk="programmeId" data-id="${pk.id}"><option value="">None</option>${opt(tpls, pk.programmeId, p => [p.id, p.name])}</select></label><label class="f">Meal plan<select class="in" data-pk="mealPlanId" data-id="${pk.id}"><option value="">None</option>${opt(S.mealPlans, pk.mealPlanId, p => [p.id, p.name])}</select></label></div>
      <label class="row small" style="gap:8px;cursor:pointer"><input type="checkbox" data-pk="roadmap" data-id="${pk.id}" ${pk.roadmap ? 'checked' : ''}> Make their roadmap (from the Workspace template) and share it with them</label></section>
    <section class="card"><div class="row between"><h3>Habits</h3><button class="btn sm" data-act="packHabit" data-id="${pk.id}">${IC.plus} Add</button></div><div class="list">${(pk.habits || []).map((h, i) => `<div class="li"><span class="grow"><b>${esc(h.label)}</b> <span class="tiny">${esc(habitDaysText(h))}</span></span><button class="iconbtn sm" data-act="packHabit" data-id="${pk.id}" data-i="${i}" aria-label="Edit">${IC.edit}</button><button class="iconbtn sm" data-act="packDel" data-id="${pk.id}" data-k="habits" data-i="${i}" aria-label="Remove">${IC.x}</button></div>`).join('') || '<span class="tiny">No habits yet.</span>'}</div></section>
    <section class="card"><div class="row between"><h3>To-do tasks</h3><button class="btn sm" data-act="packTask" data-id="${pk.id}">${IC.plus} Add</button></div><div class="list">${(pk.tasks || []).map((t, i) => `<div class="li"><span class="grow"><b>${esc(t.title)}</b> <span class="tiny">${t.repeat === 'once' ? (t.dueIn ? `Due ${t.dueIn} day${t.dueIn > 1 ? 's' : ''} after they start` : 'One-off') : esc(repeatText(t))}${t.link ? ' · opens ' + esc(linkName(t.link)) : ''}</span></span><button class="iconbtn sm" data-act="packTask" data-id="${pk.id}" data-i="${i}" aria-label="Edit">${IC.edit}</button><button class="iconbtn sm" data-act="packDel" data-id="${pk.id}" data-k="tasks" data-i="${i}" aria-label="Remove">${IC.x}</button></div>`).join('') || '<span class="tiny">No tasks yet.</span>'}</div></section>
    <section class="card"><h3>Welcome message</h3><textarea class="in" data-pk="message" data-id="${pk.id}" placeholder="Sent to their messages when the pack is applied. {name} = their first name.">${esc(pk.message || '')}</textarea></section>
    <section class="card"><h3>Apply to a client</h3><div class="stack-sm">${DB.active().map(c => { const used = (c.packs || []).find(x => x.id === pk.id); return `<button class="li tap tplrow" data-act="packApply" data-id="${pk.id}" data-c="${c.id}"><div class="avatar">${esc(initials(c.name))}</div><span class="grow">${esc(c.name)}</span><span class="tiny">${used ? 'Applied ' + fmt(used.date) : 'Apply'}</span></button>`; }).join('')}</div></section>
    <div class="row"><button class="btn ghost sm" data-act="packDup" data-id="${pk.id}">${IC.copy} Duplicate</button><button class="btn danger sm" data-act="packDelPack" data-id="${pk.id}">Delete pack</button></div>`, { back: true, nav: 'packs' });
}
SHEETS.packHabit = el => { const pk = S.packs.find(x => x.id === el.dataset.id), i = el.dataset.i, h = i != null ? pk.habits[+i] : { label: '', days: undefined };
  openSheet(`${sheetHead(pk.name, i != null ? 'Edit habit' : 'Add a habit')}<form class="stack-sm" data-form="packHabit" data-id="${pk.id}" data-i="${i ?? ''}"><label class="f">Habit<input class="in" name="label" list="habpool" required maxlength="60" value="${esc(h.label)}" placeholder="Pick from the library or type your own"><datalist id="habpool">${habitPool().map(x => `<option value="${esc(x.name)}">`).join('')}</datalist></label><div class="eyebrow">Which days</div>${dayQuick('hd')}${dayChips(h.days || ALLD)}<button class="btn block" type="submit">Save</button></form>`); };
SHEETS.packTask = el => { const pk = S.packs.find(x => x.id === el.dataset.id), i = el.dataset.i, t = i != null ? pk.tasks[+i] : { title: '', link: '', repeat: 'once', days: [], dueIn: '' }, rep = t.repeat === 'once' ? 'once' : 'days';
  openSheet(`${sheetHead(pk.name, i != null ? 'Edit task' : 'Add a task')}<form class="stack-sm" data-form="packTask" data-id="${pk.id}" data-i="${i ?? ''}">
    <label class="f">Task<input class="in" name="title" required maxlength="80" value="${esc(t.title)}"></label>
    <div class="seg repseg">${[['once', 'Once'], ['days', 'Repeats']].map(([k, l]) => `<label class="segopt"><input type="radio" name="rep" value="${k}" ${rep === k ? 'checked' : ''} data-packrep><span>${l}</span></label>`).join('')}</div>
    <label class="f" id="pkdue" ${rep === 'once' ? '' : 'hidden'}>Due this many days after they start (optional)<input class="in num" type="number" min="0" name="dueIn" value="${esc(t.dueIn || '')}"></label>
    <div id="pkdays" ${rep === 'days' ? '' : 'hidden'}>${dayQuick('td')}${dayChips(t.days, 'td')}</div>
    <label class="f">When they tap it, open<select class="in" name="link">${opt(TASK_LINKS, t.link, x => x)}</select></label>
    <button class="btn block" type="submit">Save</button></form>`); };
Object.assign(FORMS, {
  packHabit: (f, d) => { const pk = S.packs.find(x => x.id === f.dataset.id), days = readDays(d); if (!days.length) return toast('Pick at least one day.'); const h = { label: d.label.trim(), days: days.length === 7 ? undefined : days };
    if (f.dataset.i !== '') pk.habits[+f.dataset.i] = h; else (pk.habits = pk.habits || []).push(h); save(); closeSheet(); stay({}); },
  packTask: (f, d) => { const pk = S.packs.find(x => x.id === f.dataset.id), days = readDays(d, 'td'); if (d.rep === 'days' && !days.length) return toast('Pick at least one day.');
    const t = { title: d.title.trim(), link: d.link || '', repeat: d.rep === 'once' ? 'once' : 'days', days: d.rep === 'once' ? [] : days, dueIn: d.rep === 'once' ? (+d.dueIn || 0) : 0 };
    if (f.dataset.i !== '') pk.tasks[+f.dataset.i] = t; else (pk.tasks = pk.tasks || []).push(t); save(); closeSheet(); stay({}); }
});
SHEETS.packPick = el => { const c = DB.client(el.dataset.c);
  openSheet(`${sheetHead(c.name, 'Apply a starter pack')}${S.packs.length ? `<p class="small sub">Adds everything in the pack. Habits they already have aren't doubled up. A programme in the pack replaces their current one.</p><div class="stack-sm">${S.packs.map(pk => `<button class="li tap tplrow" data-act="packApply" data-id="${pk.id}" data-c="${c.id}"><span class="pgicon sm">${IC.bolt}</span><span class="grow"><b style="display:block">${esc(pk.name)}</b><span class="tiny">${esc(packSummary(pk))}</span></span>${IC.fwd}</button>`).join('')}</div>` : '<p class="small sub">No starter packs yet. Make one under Coach HQ → Starter packs.</p>'}
    <button class="btn ghost block" data-act="${S.packs.length ? 'closeSheet' : 'packNew'}">${S.packs.length ? 'Not now' : 'Make a starter pack'}</button>`); };
Object.assign(ACTS, {
  packNew: () => { const pk = { id: uid(), name: 'New starter pack', desc: '', programmeId: '', mealPlanId: '', roadmap: true, habits: [], tasks: [], message: '', ts: Date.now() }; S.packs.unshift(pk); save(); closeSheet(); go('pack', { id: pk.id, _back: 'packs' }); },
  packHabit: el => SHEETS.packHabit(el), packTask: el => SHEETS.packTask(el), packPick: el => SHEETS.packPick(el),
  packDel: el => { const pk = S.packs.find(x => x.id === el.dataset.id); pk[el.dataset.k].splice(+el.dataset.i, 1); save(); stay({}); },
  packApply: el => { const pk = S.packs.find(x => x.id === el.dataset.id), c = DB.client(el.dataset.c), done = (c.packs || []).some(x => x.id === pk.id);
    if (done && !el.dataset.sure) { el.dataset.sure = '1'; el.querySelector('.tiny') ? el.querySelector('.tiny').textContent = 'Already applied. Tap again to apply again' : toast('Already applied. Tap again to apply again'); return; }
    const did = applyPack(pk, c); save(); closeSheet(); toast(`${pk.name} applied to ${first(c.name)}: ${did.join(', ') || 'nothing new'}`); stay({}); },
  packDup: el => { const pk = S.packs.find(x => x.id === el.dataset.id), n = { ...JSON.parse(JSON.stringify(pk)), id: uid(), name: pk.name + ' (copy)', ts: Date.now() }; S.packs.unshift(n); save(); go('pack', { id: n.id, _back: 'packs' }); },
  packDelPack: el => twoTap(el, 'Tap again to delete', () => { S.packs = S.packs.filter(x => x.id !== el.dataset.id); save(); toast('Pack deleted'); go('packs'); })
});
// After adding a new client, offer a pack straight away.
{ const _inv = FORMS.invite; FORMS.invite = (f, d) => { _inv(f, d); const c = S.clients[S.clients.length - 1]; if (c && S.packs.length) setTimeout(() => SHEETS.packPick({ dataset: { c: c.id } }), 60); }; }
// Starter pack button on the client's to-do card.
{ const _ct = coachTodoCard; coachTodoCard = function (c) { const h = _ct(c), used = (c.packs || []).map(x => x.name); return h.replace(`<button class="btn sm" data-act="sheetTask" data-c="${c.id}">`, `<button class="btn ghost sm" data-act="packPick" data-c="${c.id}">${IC.bolt} Starter pack</button><button class="btn sm" data-act="sheetTask" data-c="${c.id}">`).replace('</h3>', `</h3>${used.length ? `<span class="tiny">Packs: ${esc(used.join(', '))}</span>` : ''}`); }; }

/* ---------- exercise library and demo videos ---------- */
// Uploaded demo videos live in their own browser store (they're big). Until the
// database is connected they're only on the device that uploaded them.
const vdb = {
  db: null, urls: {},
  open() { return this.db ? Promise.resolve(this.db) : new Promise(res => { try { const r = indexedDB.open('tt_videos', 1); r.onupgradeneeded = () => r.result.createObjectStore('v'); r.onsuccess = () => { this.db = r.result; res(this.db); }; r.onerror = () => res(null); } catch (e) { res(null); } }); },
  async put(id, blob) { const db = await this.open(); if (!db) throw new Error('nodb'); return new Promise((res, rej) => { const t = db.transaction('v', 'readwrite'); t.objectStore('v').put(blob, id); t.oncomplete = res; t.onerror = () => rej(t.error); }); },
  async url(id) { if (this.urls[id]) return this.urls[id]; const db = await this.open(); if (!db) return null; return new Promise(res => { const q = db.transaction('v').objectStore('v').get(id); q.onsuccess = () => { if (!q.result) return res(null); this.urls[id] = URL.createObjectURL(q.result); res(this.urls[id]); }; q.onerror = () => res(null); }); },
  async del(id) { const db = await this.open(); if (db) db.transaction('v', 'readwrite').objectStore('v').delete(id); if (this.urls[id]) { URL.revokeObjectURL(this.urls[id]); delete this.urls[id]; } }
};
function ytId(u) { const m = String(u || '').match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/); return m ? m[1] : null; }
const hasDemo = e => !!(e && (e.url || e.vid));
function exDemoHTML(e) {
  const yt = ytId(e.url);
  return `${e.vid ? `<div class="vidbox"><video id="exvid" controls playsinline preload="metadata"></video></div>` : yt ? `<div class="vidbox"><iframe src="https://www.youtube-nocookie.com/embed/${yt}?rel=0&playsinline=1" title="${esc(e.name)} demo" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe></div>` : ''}
    ${e.url ? `<a class="btn ghost block" href="${esc(e.url)}" target="_blank" rel="noopener">${IC.play} ${yt ? 'Open on YouTube' : 'Watch the demo'}</a>` : ''}
    ${!e.vid && !e.url ? `<div class="empty small">${IC.play}<span>No demo yet.${ses.role === 'coach' ? ' Add a link or upload a video below.' : ''}</span></div>` : ''}`;
}
function openExSheet(id) {
  const e = DB.ex(id); if (!e) return; const coach = ses.role === 'coach';
  openSheet(`${sheetHead(`${e.muscle} · ${e.equip}`, e.name)}${exDemoHTML(e)}
    ${e.cues && !coach ? `<div class="callout small">${esc(e.cues)}</div>` : ''}
    ${coach ? `<form class="stack-sm" data-form="exEdit" data-id="${e.id}">
      <div class="fields"><label class="f">Name<input class="in sm" name="name" value="${esc(e.name)}" required></label><label class="f">Muscle<input class="in sm" name="muscle" list="exmus" value="${esc(e.muscle)}" required><datalist id="exmus">${[...new Set(S.exercises.map(x => x.muscle))].sort().map(m => `<option value="${esc(m)}">`).join('')}</datalist></label><label class="f">Equipment<select class="in sm" name="equip">${opt([...new Set(['Barbell', 'Dumbbells', 'Machine', 'Cable', 'Bodyweight', 'Other', e.equip])], e.equip)}</select></label></div>
      <label class="f">Demo link (YouTube, Instagram, Loom, Google Drive)<input class="in sm" name="url" type="url" value="${esc(e.url || '')}" placeholder="https://"></label>
      <label class="f">Coaching cues<textarea class="in" name="cues" placeholder="e.g. Brace, chest up, knees out, drive through the whole foot">${esc(e.cues || '')}</textarea></label>
      <button class="btn block" type="submit">Save</button></form>
      <label class="btn ghost block" style="cursor:pointer">${IC.cam} ${e.vid ? 'Replace the uploaded video' : 'Upload a video from your phone'}<input type="file" accept="video/*" hidden data-exvidup="${e.id}"></label>
      ${e.vid ? `<button class="btn ghost block" data-act="exVidDel" data-id="${e.id}">Remove the uploaded video</button>` : ''}
      <p class="tiny">Uploaded videos only play on this device until the app is connected to the database. For now, if you want every client to see a demo, put it on YouTube as Unlisted and paste the link.</p>
      ${e.lib ? '' : `<button class="btn danger" data-act="exDel" data-id="${e.id}">Delete exercise</button>`}` : ''}`);
  if (e.vid) vdb.url(e.vid).then(u => { const v = $('#exvid'); if (v && u) v.src = u; else if (v) v.parentElement.outerHTML = '<div class="empty small">This video was uploaded on another device.</div>'; });
}
function viewLibrary5() {
  const q = (ses.p.q || '').toLowerCase().trim(), mus = ses.p.mus || '', eq = ses.p.eq || '', vf = ses.p.vf || '', lim = +ses.p.lim || 60;
  const muscles = [...new Set(S.exercises.map(e => e.muscle))].sort(), equips = [...new Set(S.exercises.map(e => e.equip))].sort(), words = q.split(/\s+/).filter(Boolean);
  const all = S.exercises.filter(e => (!mus || e.muscle === mus) && (!eq || e.equip === eq) && (!vf || (vf === 'yes') === hasDemo(e)) && words.every(w => (e.name + ' ' + e.muscle + ' ' + e.equip).toLowerCase().includes(w))).sort((a, b) => a.name.localeCompare(b.name));
  const nv = S.exercises.filter(hasDemo).length;
  return shell('Exercise library', 'Coach HQ', `${pageHead('Training', 'Exercises', `${S.exercises.length} exercises · ${nv} with a demo video. Tap one to add a demo link, upload a video or write coaching cues.`, `<button class="btn" data-act="exNew">${IC.plus} New exercise</button>`)}
    <input class="in" id="lq" data-q="q" placeholder="Search, e.g. incline dumbbell, lunge, cable" value="${esc(ses.p.q || '')}">
    <div class="tabs"><button class="tab ${!mus ? 'on' : ''}" data-act="setP" data-k="mus" data-v="">All muscles</button>${muscles.map(m => `<button class="tab ${mus === m ? 'on' : ''}" data-act="setP" data-k="mus" data-v="${esc(m)}">${esc(m)}</button>`).join('')}</div>
    <div class="tabs"><button class="tab ${!eq ? 'on' : ''}" data-act="setP" data-k="eq" data-v="">All kit</button>${equips.map(m => `<button class="tab ${eq === m ? 'on' : ''}" data-act="setP" data-k="eq" data-v="${esc(m)}">${esc(m)}</button>`).join('')}<button class="tab ${vf === 'no' ? 'on' : ''}" data-act="setP" data-k="vf" data-v="${vf === 'no' ? '' : 'no'}">No demo yet</button><button class="tab ${vf === 'yes' ? 'on' : ''}" data-act="setP" data-k="vf" data-v="${vf === 'yes' ? '' : 'yes'}">Has demo</button></div>
    <span class="tiny">${all.length} match${all.length === 1 ? '' : 'es'}</span>
    <section class="card"><div class="list">${all.slice(0, lim).map(e => `<button class="li tap fooditem" data-act="exOpen" data-id="${e.id}"><span class="grow" style="min-width:0"><b class="trunc" style="display:block">${esc(e.name)}</b><span class="tiny">${esc(e.muscle)} · ${esc(e.equip)}${e.lib ? '' : ' · yours'}</span></span>${hasDemo(e) ? `<span class="pill good">${IC.play} Demo</span>` : '<span class="pill mute">No demo</span>'}</button>`).join('') || '<div class="empty small">Nothing matches. Add it with New exercise.</div>'}</div>
      ${all.length > lim ? `<button class="btn ghost block" data-act="setP" data-k="lim" data-v="${lim + 120}">Show more (${all.length - lim} left)</button>` : ''}</section>`, { nav: 'library' });
}
Object.assign(ACTS, {
  exOpen: el => openExSheet(el.dataset.id),
  exNew: () => { const e = { id: uid(), name: 'New exercise', muscle: ses.p.mus || 'Chest', equip: 'Dumbbells', url: '', cues: '' }; S.exercises.push(e); save(); openExSheet(e.id); },
  exDel: el => twoTap(el, 'Tap again to delete', () => { const e = DB.ex(el.dataset.id); if (e.vid) vdb.del(e.vid); S.exercises = S.exercises.filter(x => x.id !== e.id); save(); closeSheet(); toast('Exercise deleted'); stay({}); }),
  exVidDel: el => { const e = DB.ex(el.dataset.id); vdb.del(e.vid); delete e.vid; save(); openExSheet(e.id); stay({}); },
  exDemo: el => openExSheet(el.dataset.id)
});
FORMS.exEdit = (f, d) => { const e = DB.ex(f.dataset.id); Object.assign(e, { name: d.name.trim(), muscle: d.muscle.trim(), equip: d.equip, url: d.url.trim(), cues: d.cues.trim() }); save(); toast('Saved'); openExSheet(e.id); stay({}); };
document.addEventListener('change', async e => { const t = e.target; if (!t.dataset || !t.dataset.exvidup || !t.files || !t.files[0]) return; const f = t.files[0], ex = DB.ex(t.dataset.exvidup);
  if (f.size > 200 * 1024 * 1024) return toast('That video is over 200 MB. Trim it first, or upload it to YouTube and paste the link.');
  toast('Saving the video…'); try { const id = 'v' + uid(); await vdb.put(id, f); if (ex.vid) vdb.del(ex.vid); ex.vid = id; save(); toast('Video saved'); openExSheet(ex.id); stay({}); } catch (err) { toast('Couldn\'t save the video here. The Claude preview may block it. Use the installed app, or paste a link instead.'); } });
document.addEventListener('input', e => { const t = e.target, ds = t.dataset; if (!ds) return;
  if (ds.packrep !== undefined && t.checked) { const a = $('#pkdue'), b = $('#pkdays'); if (a) a.hidden = t.value !== 'once'; if (b) b.hidden = t.value !== 'days'; return; }
  if (ds.pk && ds.id) { const pk = S.packs.find(x => x.id === ds.id); if (!pk) return; pk[ds.pk] = t.type === 'checkbox' ? t.checked : t.value; t.tagName === 'SELECT' || t.type === 'checkbox' ? save() : lazySave(); } });

/* ---------- per-client habits sheet (v5.6) ----------
   One place to manage a client's habits: pick from the master library, or add a
   custom habit just for them (not saved to the library unless you tick the box). */
let HLP = { cat: '' };
SHEETS.clientHabits = el => { const c = DB.client(el.dataset.c), f = first(c.name);
  openSheet(`${sheetHead(c.name, 'Habits')}
    <div class="list">${c.habits.map(h => `<div class="li"><span class="grow" style="min-width:0"><b class="trunc" style="display:block">${esc(h.label)}</b><span class="tiny">${esc(habitDaysText(h))}${habitPool().some(x => x.name.toLowerCase() === h.label.toLowerCase()) ? ' · from library' : ' · just for ' + esc(f)}</span></span><button class="iconbtn sm" data-act="sheetHabitDays" data-c="${c.id}" data-h="${h.id}" data-back="1" aria-label="Edit ${esc(h.label)}">${IC.edit}</button><button class="iconbtn sm" data-act="chRemove" data-c="${c.id}" data-h="${h.id}" aria-label="Remove ${esc(h.label)}">${IC.x}</button></div>`).join('') || `<span class="tiny">${esc(f)} has no habits yet.</span>`}</div>
    <button class="btn block" data-act="habitLibPick" data-c="${c.id}">${IC.book} Add from your master library</button>
    <form class="card stripe stack-sm" data-form="chCustom" data-c="${c.id}"><h3>Custom habit just for ${esc(f)}</h3>
      <input class="in" name="label" required maxlength="60" placeholder="e.g. No energy drinks before 12">
      <div class="eyebrow">Which days</div>${dayQuick('hd')}${dayChips(ALLD)}
      <label class="row small" style="gap:8px;cursor:pointer"><input type="checkbox" name="lib"> Also save it to my master library</label>
      <button class="btn block" type="submit">Add for ${esc(f)}</button></form>`); };
SHEETS.habitLibPick = el => { const c = DB.client(el.dataset.c), pool = habitPool(), cats = [...new Set(pool.map(h => h.cat))]; if (!cats.includes(HLP.cat)) HLP.cat = cats[0];
  openSheet(`${sheetHead(c.name, 'Master habit library')}
    <div class="eyebrow">On which days</div><div class="row" style="gap:6px">${[1, 2, 3, 4, 5, 6, 0].map(d => `<button class="tab ${HAS_DAYS.includes(d) ? 'on' : ''}" data-act="hlpDay" data-d="${d}" data-c="${c.id}">${DAYN[d]}</button>`).join('')}</div><span class="tiny">${esc(habitDaysText({ days: HAS_DAYS }))}. Tap habits to add or remove them.</span>
    <div class="tabs">${cats.map(x => `<button class="tab ${HLP.cat === x ? 'on' : ''}" data-act="hlpCat" data-v="${esc(x)}" data-c="${c.id}">${esc(x)}</button>`).join('')}</div>
    <div class="stack-sm">${pool.filter(h => h.cat === HLP.cat).map(h => { const on = c.habits.some(x => x.label.toLowerCase() === h.name.toLowerCase()); return `<button class="check ${on ? 'on' : ''}" data-act="hlpToggle" data-c="${c.id}" data-n="${esc(h.name)}"><span class="box">${on ? IC.tick : ''}</span><span class="grow"><b style="display:block">${esc(h.name)}</b><span class="tiny">${esc(h.desc || '')}</span></span></button>`; }).join('')}</div>
    <button class="btn ghost block" data-act="clientHabits" data-c="${c.id}">Done</button>`); };
Object.assign(ACTS, {
  clientHabits: el => SHEETS.clientHabits(el), habitLibPick: el => SHEETS.habitLibPick(el),
  hlpCat: el => { HLP.cat = el.dataset.v; SHEETS.habitLibPick(el); },
  hlpDay: el => { const d = +el.dataset.d; HAS_DAYS = HAS_DAYS.includes(d) ? HAS_DAYS.filter(x => x !== d) : [...HAS_DAYS, d].sort(); if (!HAS_DAYS.length) HAS_DAYS = [d]; SHEETS.habitLibPick(el); },
  hlpToggle: el => { const c = DB.client(el.dataset.c), n = el.dataset.n, i = c.habits.findIndex(h => h.label.toLowerCase() === n.toLowerCase()); if (i >= 0) c.habits.splice(i, 1); else c.habits.push({ id: uid(), label: n, days: HAS_DAYS.length === 7 ? undefined : HAS_DAYS.slice() }); save(); stay({}); SHEETS.habitLibPick(el); },
  chRemove: el => { const c = DB.client(el.dataset.c); c.habits = c.habits.filter(h => h.id !== el.dataset.h); save(); stay({}); SHEETS.clientHabits(el); },
  sheetHabitDays: el => SHEETS.habitDays(el)
});
FORMS.chCustom = (f, d) => { const c = DB.client(f.dataset.c), days = readDays(d), label = d.label.trim(); if (!days.length) return toast('Pick at least one day.');
  if (c.habits.some(h => h.label.toLowerCase() === label.toLowerCase())) return toast(`${first(c.name)} already has that habit.`);
  c.habits.push({ id: uid(), label, days: days.length === 7 ? undefined : days });
  if (d.lib && !habitPool().some(h => h.name.toLowerCase() === label.toLowerCase())) S.habitLib.push({ id: uid(), cat: 'My habits', name: label, desc: '', by: 'coach' });
  save(); stay({}); toast(d.lib ? `Added for ${first(c.name)} and saved to your library` : `Added for ${first(c.name)} only`); SHEETS.clientHabits({ dataset: { c: c.id } }); };
// After editing a habit's days from the habits sheet, go back to it.
{ const _hd = FORMS.habitDays; FORMS.habitDays = (f, d) => { _hd(f, d); if (f.dataset.back) SHEETS.clientHabits({ dataset: { c: f.dataset.c } }); }; }
{ const _hds = SHEETS.habitDays; SHEETS.habitDays = el => { _hds(el); if (el.dataset.back) { const fm = document.querySelector('form[data-form=habitDays]'); if (fm) fm.dataset.back = '1'; } }; }
// Habits button on the client's to-do card (Overview tab).
{ const _ct2 = coachTodoCard; coachTodoCard = function (c) { return _ct2(c).replace(`<button class="btn ghost sm" data-act="packPick"`, `<button class="btn ghost sm" data-act="clientHabits" data-c="${c.id}">${IC.tick} Habits (${c.habits.length})</button><button class="btn ghost sm" data-act="packPick"`); }; }
