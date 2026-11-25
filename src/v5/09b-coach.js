
/* =====================================================================
   09b: Trainerize gaps. Challenges (leaderboard and threshold), habit
   library with folders, auto client tags, client comparison table,
   journey auto-messages, interval timer, exercise demo videos.
   ===================================================================== */
const CH_RULES = [['session', 'Workout completed', 10], ['cardio', 'Cardio logged', 5], ['steps', '10,000+ steps day', 5], ['food', 'Day of food logged', 3], ['habits', 'All habits ticked', 3], ['water', 'Water target hit', 2], ['checkin', 'Check-in sent', 10]];
const HABIT_LIB = [
  ['Nutrition', 'Hit your protein target', 'Protein is what keeps the muscle while the fat comes off. Close the gap with a shake or a tin of tuna.'],
  ['Nutrition', 'Prep tomorrow\'s lunch tonight', 'Ten minutes the night before beats a £7 meal deal and a sausage roll.'],
  ['Nutrition', 'Zero-calorie drinks only', 'Swap energy drinks and full-fat fizzy for the zero versions. Easy win.'],
  ['Nutrition', 'No alcohol on work nights', 'Better sleep, better recovery, better mornings on site.'],
  ['Nutrition', 'Eat slowly, stop at 80% full', 'Put the fork down between mouthfuls. Stop when you could still eat a bit more.'],
  ['Portion guides', 'Palm of protein every meal', 'One to two palms of lean protein on every plate.'],
  ['Portion guides', 'Fist of veg twice a day', 'Frozen veg counts and keeps for weeks.'],
  ['Portion guides', 'Cupped hand of carbs', 'One to two cupped hands of rice, spuds or pasta per meal on site days.'],
  ['Movement', '10,000 steps', 'Site days usually cover it. Rest days, get a walk in.'],
  ['Movement', '10-minute walk after dinner', 'Helps digestion and adds steps without thinking about it.'],
  ['Movement', '5 minutes of mobility', 'Hips and lower back, especially after a day on the tools.'],
  ['Mindfulness', 'Two minutes of breathing', 'In for four, hold for four, out for six. Before bed or in the van.'],
  ['Mindfulness', 'Write down one win', 'One line at the end of the day. Builds momentum.'],
  ['Sleep', '7+ hours of sleep', 'Work back from your alarm. 5am start means lights out by 10.'],
  ['Sleep', 'Phone down 30 minutes before bed', 'Charge it across the room.'],
  ['Sleep', 'Same wake-up time every day', 'Weekends included, give or take an hour.'],
  ['Hydration', '3 litres of water', 'Big bottle in the van. Refill at every break.'],
  ['Hydration', 'Pint of water first thing', 'Before the first brew of the day.']
];
AUTOMATIONS.push(
  { id: 'day3', grp: 'journey', name: 'Day 3 check-in', when: '3 days after they start', text: '{name}, three days in. How are you finding the app? Any questions on the training or food, ask here.' },
  { id: 'day7', grp: 'journey', name: 'First week done', when: '7 days after they start', text: 'One week down, {name}. That\'s the hardest one. Monday\'s check-in is where we start adjusting things for you.' },
  { id: 'day14', grp: 'journey', name: 'Two weeks in', when: '14 days after they start', text: 'Two weeks in, {name}. Habits are starting to stick now. Keep stacking the weeks.' },
  { id: 'firstmeal', grp: 'journey', name: 'First meal tracked', when: 'They log food for the first time', text: 'First meal logged, nice one {name}. Scan the barcodes on packs to save time. It\'s the quickest way to log.' },
  { id: 'firstworkout', grp: 'journey', name: 'First workout done', when: 'They finish their first session', text: 'First session in the bag, {name}. That\'s the start. Same again next time.' },
  { id: 'birthday', grp: 'journey', name: 'Birthday', when: 'On their birthday (set it on their Profile tab)', text: 'Happy birthday {name}. Enjoy the day, cake included. We go again tomorrow.' }
);
function migrate5b() {
  S.challenges = S.challenges || []; S.habitLib = S.habitLib || []; S.settings.tags = S.settings.tags || { trainLow: 50, trainHigh: 85, nutLow: 2, nutHigh: 5, away: 7, noMsg: 7, noReply: 7 };
  AUTOMATIONS.forEach(a => { if (!S.settings.auto[a.id]) S.settings.auto[a.id] = { on: true, text: a.text }; });
  if (S.settings.demo && !S.v5ChSeeded) { S.v5ChSeeded = true;
    S.challenges.push({ id: uid(), name: 'December graft-off (example)', kind: 'leaderboard', start: addDays(today(), -6), end: addDays(today(), 21), target: 0, desc: 'Points for every session, cardio, logged food day and check-in. Top of the board on the last day wins.', prize: 'Bragging rights and a shout-out in the group', who: 'all', rules: Object.fromEntries(CH_RULES.map(r => [r[0], r[2]])), ts: Date.now() });
    S.challenges.push({ id: uid(), name: '12 sessions before Christmas (example)', kind: 'threshold', start: addDays(today(), -6), end: addDays(today(), 28), target: 120, desc: 'Everyone who reaches 120 points finishes. Only workouts count.', prize: 'Finisher badge', who: 'all', rules: { session: 10 }, ts: Date.now() }); }
}

/* ---------- challenges ---------- */
function chScore(ch, c) {
  const inR = d => d >= ch.start && d <= ch.end && d <= today(), R = ch.rules || {}, out = {};
  out.session = S.logs.filter(l => l.clientId === c.id && inR(l.date)).length;
  out.cardio = S.cardio.filter(l => l.clientId === c.id && inR(l.date)).length;
  const days = S.daily.filter(d => d.clientId === c.id && inR(d.date));
  out.steps = days.filter(d => (d.steps || 0) >= 10000).length;
  out.food = new Set(S.food.filter(f => f.clientId === c.id && inR(f.date)).map(f => f.date)).size;
  out.habits = days.filter(d => habitsOn(c, d.date).length && habitsOn(c, d.date).every(h => d.habits.includes(h.id))).length;
  out.water = days.filter(d => (d.water || 0) >= S.settings.waterTarget).length;
  out.checkin = S.checkins.filter(k => k.clientId === c.id && inR(k.date)).length;
  out.total = sum(Object.keys(R), k => (out[k] || 0) * (+R[k] || 0)); return out;
}
const chPeople = ch => (ch.who === 'all' ? DB.active() : DB.active().filter(c => ch.who.includes(c.id)));
const chState = ch => today() < ch.start ? 'Starts ' + fmt(ch.start) : today() > ch.end ? 'Finished' : `${daysBetween(today(), ch.end)} days left`;
function viewChallenges() {
  const coach = ses.role === 'coach', list = S.challenges.filter(ch => coach || chPeople(ch).some(c => c.id === ses.clientId)).sort((a, b) => b.start.localeCompare(a.start));
  return shell('Challenges', coach ? 'Coach HQ' : 'Community', `${pageHead('Compete with the lads', 'Challenges', coach ? 'Leaderboard challenges rank everyone. Threshold challenges let everyone who reaches the target finish. You choose what earns points.' : 'Points come from showing up. Check the board.', coach ? `<button class="btn" data-act="chEdit">${IC.plus} New challenge</button>` : '')}
    <div class="grid">${list.map(ch => { const ppl = chPeople(ch).map(c => ({ c, s: chScore(ch, c).total })).sort((a, b) => b.s - a.s), mine = !coach && ppl.find(x => x.c.id === ses.clientId), pos = mine ? ppl.indexOf(mine) + 1 : 0;
      return `<button class="card tap ${today() <= ch.end ? 'stripe' : ''}" data-go="challenge" data-p="${P({ id: ch.id })}"><div class="row between"><span class="eyebrow">${ch.kind === 'threshold' ? 'Threshold' : 'Leaderboard'}</span><span class="pill ${today() > ch.end ? 'mute' : 'or'}">${chState(ch)}</span></div><h3>${esc(ch.name)}</h3>
        ${mine ? (ch.kind === 'threshold' ? `<div class="bar ${mine.s >= ch.target ? 'good' : ''}"><i style="width:${Math.min(100, mine.s / ch.target * 100)}%"></i></div><span class="small num">${mine.s} / ${ch.target} points</span>` : `<span class="small num">You're ${pos}${['th', 'st', 'nd', 'rd'][pos % 10 > 3 || [11, 12, 13].includes(pos % 100) ? 0 : pos % 10]} of ${ppl.length} · ${mine.s} pts</span>`) : `<span class="small sub">${ppl.length} taking part${ppl[0] && ppl[0].s ? ` · leading: ${esc(first(ppl[0].c.name))} (${ppl[0].s})` : ''}</span>`}</button>`; }).join('') || '<div class="card"><div class="empty small">No challenges yet.</div></div>'}</div>`, { nav: 'challenges' });
}
function viewChallenge() {
  const ch = S.challenges.find(x => x.id === ses.p.id); if (!ch) return back(); const coach = ses.role === 'coach';
  const ppl = chPeople(ch).map(c => ({ c, s: chScore(ch, c) })).sort((a, b) => b.s.total - a.s.total), mine = ppl.find(x => x.c.id === ses.clientId);
  const rules = CH_RULES.filter(r => +ch.rules[r[0]]);
  return shell(ch.name, 'Challenge', `${pageHead(`${ch.kind === 'threshold' ? 'Threshold' : 'Leaderboard'} · ${fmt(ch.start)} to ${fmt(ch.end)}`, ch.name, esc(ch.desc || ''), coach ? `<button class="btn ghost" data-act="chEdit" data-id="${ch.id}">${IC.edit} Edit</button>` : '')}
    <div class="row"><span class="pill ${today() > ch.end ? 'mute' : 'or'}">${chState(ch)}</span>${ch.prize ? `<span class="pill mute">${IC.trophy}${esc(ch.prize)}</span>` : ''}${ch.kind === 'threshold' ? `<span class="pill mute num">Target ${ch.target} pts</span>` : ''}</div>
    ${mine ? `<section class="card hero"><div class="eyebrow">Your points</div><span class="big num" style="font-size:44px;font-family:Syne,sans-serif">${mine.s.total}</span>${ch.kind === 'threshold' ? `<div class="bar ${mine.s.total >= ch.target ? 'good' : ''}"><i style="width:${Math.min(100, mine.s.total / ch.target * 100)}%"></i></div><span class="small">${mine.s.total >= ch.target ? 'Finished. Good graft.' : `${ch.target - mine.s.total} points to go`}</span>` : ''}
      <div class="list">${rules.map(([k, l]) => `<div class="li"><span class="grow small">${l} <span class="tiny num">× ${mine.s[k]}</span></span><b class="num small">${mine.s[k] * ch.rules[k]}</b></div>`).join('')}</div></section>` : ''}
    <section class="card"><h3>${ch.kind === 'threshold' ? 'Progress' : 'Leaderboard'}</h3><div class="list">${ppl.map((x, i) => { const me2 = x.c.id === ses.clientId, done = ch.kind === 'threshold' && x.s.total >= ch.target;
      return `<div class="li ${me2 ? 'mine' : ''}"><span class="wnum num sm">${i + 1}</span><div class="avatar">${esc(initials(x.c.name))}</div><span class="grow"><b class="trunc" style="display:block">${esc(coach ? x.c.name : first(x.c.name))}${me2 ? ' (you)' : ''}</b>${ch.kind === 'threshold' ? `<div class="bar ${done ? 'good' : ''}" style="margin-top:6px"><i style="width:${Math.min(100, x.s.total / ch.target * 100)}%"></i></div>` : ''}</span><b class="num">${x.s.total}</b>${done ? `<span class="pill good">${IC.tick}</span>` : ''}</div>`; }).join('') || '<div class="empty small">Nobody in this one yet.</div>'}</div></section>
    <section class="card"><h3>How to earn points</h3><div class="list">${rules.map(([k, l]) => `<div class="li"><span class="grow small">${l}</span><b class="num small">${ch.rules[k]} pts</b></div>`).join('')}</div></section>`, { back: true, nav: 'challenges' });
}
SHEETS.chEdit = el => { const ch = S.challenges.find(x => x.id === el.dataset.id) || { kind: 'leaderboard', start: today(), end: addDays(today(), 28), target: 100, rules: Object.fromEntries(CH_RULES.map(r => [r[0], r[2]])), who: 'all', name: '', desc: '', prize: '' };
  openSheet(`${sheetHead('Challenge', ch.id ? 'Edit challenge' : 'New challenge')}<form class="stack-sm" data-form="challenge5" data-id="${ch.id || ''}">
    <div class="seg">${[['leaderboard', 'Leaderboard'], ['threshold', 'Threshold']].map(([k, l]) => `<label class="segopt"><input type="radio" name="kind" value="${k}" ${ch.kind === k ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>
    <label class="f">Name<input class="in" name="name" required value="${esc(ch.name)}" placeholder="e.g. January step-off"></label>
    <label class="f">What it's about<textarea class="in" name="desc">${esc(ch.desc)}</textarea></label>
    <div class="fields"><label class="f">Starts<input class="in" type="date" name="start" value="${ch.start}" required></label><label class="f">Ends<input class="in" type="date" name="end" value="${ch.end}" required></label><label class="f">Target points (threshold)<input class="in num" type="number" name="target" value="${ch.target || ''}"></label></div>
    <label class="f">Prize or reward<input class="in" name="prize" value="${esc(ch.prize)}" placeholder="Optional"></label>
    <div class="eyebrow">Points for each</div><div class="fields">${CH_RULES.map(([k, l]) => `<label class="f">${l}<input class="in sm num" type="number" min="0" name="r_${k}" value="${ch.rules[k] || 0}"></label>`).join('')}</div>
    <div class="eyebrow">Who's in</div><label class="row small" style="gap:8px"><input type="checkbox" name="all" ${ch.who === 'all' ? 'checked' : ''}> Every active client</label>
    <div class="stack-sm">${DB.active().map(c => `<label class="row small" style="gap:8px"><input type="checkbox" name="c_${c.id}" ${ch.who !== 'all' && ch.who.includes(c.id) ? 'checked' : ''}> ${esc(c.name)}</label>`).join('')}</div>
    <button class="btn block" type="submit">${ch.id ? 'Save' : 'Create and announce it'}</button></form>${ch.id ? `<button class="btn danger" data-act="chDel" data-id="${ch.id}">Delete challenge</button>` : ''}`); };
FORMS.challenge5 = (f, d) => { const ex = S.challenges.find(x => x.id === f.dataset.id), rules = {}; CH_RULES.forEach(([k]) => { const v = +d['r_' + k]; if (v) rules[k] = v; });
  if (!Object.keys(rules).length) return toast('Give at least one thing some points.'); if (d.end < d.start) return toast('The end date is before the start.');
  const who = d.all ? 'all' : DB.active().filter(c => d['c_' + c.id]).map(c => c.id), ch = Object.assign(ex || { id: uid(), ts: Date.now() }, { kind: d.kind, name: d.name.trim(), desc: d.desc.trim(), start: d.start, end: d.end, target: +d.target || 100, prize: d.prize.trim(), rules, who });
  if (!ex) { S.challenges.push(ch); if (S.posts) S.posts.push({ id: uid(), from: 'coach', text: `New challenge: ${ch.name}. ${ch.desc} Runs ${fmt(ch.start)} to ${fmt(ch.end)}.${ch.prize ? ' Prize: ' + ch.prize + '.' : ''}`, ts: Date.now(), likes: [], pinned: false }); }
  save(); closeSheet(); toast(ex ? 'Challenge saved' : 'Challenge created and posted to the group'); ex ? stay({}) : go('challenge', { id: ch.id, _back: 'challenges' }); };

/* ---------- habit library ---------- */
const habitPool = () => [...HABIT_LIB.map(([cat, name, desc]) => ({ id: 'h_' + name, cat, name, desc, by: 'st' })), ...S.habitLib];
function viewHabits() {
  const pool = habitPool(), cats = [...new Set(pool.map(h => h.cat))], cat = ses.p.hc || cats[0];
  return shell('Habit library', 'Coach HQ', `${pageHead('Master library', 'Habits', 'Pick a habit and assign it. It lands on their Today screen with a tick box and counts toward their On-plan score.', `<button class="btn" data-act="sheetHabitNew">${IC.plus} New habit</button>`)}
    <div class="tabs">${cats.map(x => `<button class="tab ${cat === x ? 'on' : ''}" data-act="setP" data-k="hc" data-v="${esc(x)}">${esc(x)} <span class="num">${pool.filter(h => h.cat === x).length}</span></button>`).join('')}</div>
    <section class="card"><div class="list">${pool.filter(h => h.cat === cat).map(h => { const n = S.clients.filter(c => c.habits.some(x => x.label === h.name)).length;
      return `<div class="li" style="align-items:flex-start"><span class="grow"><b style="display:block">${esc(h.name)}</b><span class="small sub">${esc(h.desc)}</span>${n ? `<span class="tiny" style="display:block">${n} client${n > 1 ? 's' : ''} on it</span>` : ''}</span><button class="btn sm" data-act="sheetHabitAssign" data-n="${esc(h.name)}">Assign</button>${h.by !== 'st' ? `<button class="iconbtn sm" data-act="habitDel" data-id="${h.id}" aria-label="Delete">${IC.trash}</button>` : ''}</div>`; }).join('')}</div></section>`, { nav: 'habits' });
}
Object.assign(ACTS, {
  sheetHabitAssign: el => { const n = el.dataset.n; openSheet(`${sheetHead('Assign habit', n)}<div class="stack-sm">${DB.active().map(c => { const on = c.habits.some(h => h.label === n); return `<button class="check ${on ? 'on' : ''}" data-act="habitAssign" data-n="${esc(n)}" data-c="${c.id}"><span class="box">${on ? IC.tick : ''}</span><span class="grow">${esc(c.name)}</span><span class="tiny num">${c.habits.length} habits</span></button>`; }).join('')}</div>`); },
  habitAssign: el => { const c = DB.client(el.dataset.c), n = el.dataset.n, i = c.habits.findIndex(h => h.label === n); if (i >= 0) c.habits.splice(i, 1); else c.habits.push({ id: uid(), label: n }); save(); toast(i >= 0 ? `Removed from ${first(c.name)}` : `Assigned to ${first(c.name)}`); ACTS.sheetHabitAssign(el); },
  sheetHabitNew: () => openSheet(`${sheetHead('Habit library', 'New habit')}<form class="stack" data-form="habitNew"><label class="f">Habit<input class="in" name="name" required maxlength="50" placeholder="e.g. Fruit with every lunch"></label><label class="f">Folder<input class="in" name="cat" list="hcats" value="${esc(ses.p.hc || 'Nutrition')}" required><datalist id="hcats">${[...new Set(habitPool().map(h => h.cat))].map(c => `<option value="${esc(c)}">`).join('')}</datalist></label><label class="f">Why it matters<textarea class="in" name="desc"></textarea></label><button class="btn block" type="submit">Add to library</button></form>`),
  habitDel: el => twoTap(el, IC.tick, () => { S.habitLib = S.habitLib.filter(h => h.id !== el.dataset.id); save(); stay({}); }),
  chEdit: el => SHEETS.chEdit(el),
  chDel: el => twoTap(el, 'Tap again to delete', () => { S.challenges = S.challenges.filter(x => x.id !== el.dataset.id); save(); go('challenges'); })
});
FORMS.habitNew = (f, d) => { S.habitLib.push({ id: uid(), cat: d.cat.trim(), name: d.name.trim(), desc: d.desc.trim(), by: 'coach' }); save(); closeSheet(); stay({ hc: d.cat.trim() }); toast('Habit added'); };

/* ---------- auto client tags + comparison table ---------- */
function nutDays(c, days = 7) { let n = 0; for (let i = 0; i < days; i++) { const d = addDays(today(), -i), t = dayTotals(c.id, d), tg = targetsFor(c, d); if (t.n && Math.abs(t.kcal - tg.kcal) <= tg.kcal * 0.1) n++; } return n; }
function autoTags(c) {
  const T = S.settings.tags, cp = compliance(c), out = [], th = S.messages.filter(m => m.clientId === c.id), lastCoach = Math.max(0, ...th.filter(m => m.from === 'coach' && !m.auto).map(m => m.ts)), lastClient = Math.max(0, ...th.filter(m => m.from !== 'coach').map(m => m.ts)), nd = nutDays(c);
  if (cp.planned) { if (cp.train < T.trainLow) out.push(['Low training', 'bad']); else if (cp.train >= T.trainHigh) out.push(['High training', 'good']); }
  if (nd <= T.nutLow) out.push(['Low nutrition', 'bad']); else if (nd >= T.nutHigh) out.push(['High nutrition', 'good']);
  if (awayDays(c) >= T.away) out.push(['Not signed in', 'bad']);
  if (Date.now() - lastCoach > T.noMsg * 864e5) out.push(['Not messaged', 'warn']);
  if (Date.now() - lastClient > T.noReply * 864e5) out.push(['Not responded', 'warn']);
  if (checkinDue(c.id) && dow(today()) !== 1 && daysBetween(c.start, today()) >= 7) out.push(['Missed check-in', 'warn']);
  return out;
}
function viewClientTable() {
  const tab = ses.p.tt || 'summary', tf = ses.p.tf || '', tabs = [['summary', 'Summary'], ['training', 'Training'], ['nutrition', 'Nutrition'], ['weight', 'Weight'], ['payment', 'Payment'], ['engagement', 'Engagement']];
  let rows = DB.active().map(c => ({ c, tags: autoTags(c) })); const allTags = [...new Set(rows.flatMap(r => r.tags.map(t => t[0])))]; if (tf) rows = rows.filter(r => r.tags.some(t => t[0] === tf));
  const col = { summary: [['Week', r => weekNo(r.c)], ['On-plan', r => compliance(r.c).all + '%'], ['Status', r => `<span class="pill ${status(r.c).k}">${esc(status(r.c).t)}</span>`], ['Tags', r => r.tags.map(t => `<span class="pill ${t[1]}">${t[0]}</span>`).join(' ') || '—']],
    training: [['Sessions 7d', r => { const x = compliance(r.c); return `${x.done}/${x.planned || '—'}`; }], ['Training', r => compliance(r.c).train + '%'], ['Last session', r => { const l = DB.logsOf(r.c.id)[0]; return l ? fmt(l.date) : '—'; }], ['Cardio 7d', r => sum(S.cardio.filter(x => x.clientId === r.c.id && x.date >= addDays(today(), -6)), x => x.mins) + ' min']],
    nutrition: [['Days logged 7d', r => new Set(S.food.filter(f => f.clientId === r.c.id && f.date >= addDays(today(), -6)).map(f => f.date)).size], ['On calories 7d', r => nutDays(r.c) + '/7'], ['Avg kcal', r => { const ds = [...Array(7)].map((_, i) => dayTotals(r.c.id, addDays(today(), -i))).filter(t => t.n); return ds.length ? Math.round(sum(ds, t => t.kcal) / ds.length) : '—'; }], ['Avg protein', r => { const ds = [...Array(7)].map((_, i) => dayTotals(r.c.id, addDays(today(), -i))).filter(t => t.n); return ds.length ? Math.round(sum(ds, t => t.p) / ds.length) + 'g' : '—'; }]],
    weight: [['Start', r => { const d = DB.dailyOf(r.c.id).find(x => x.weight); return d ? kgTo(d.weight, r.c.units) : '—'; }], ['Latest', r => { const w = latestKg(r.c); return w ? kgTo(w, r.c.units) : '—'; }], ['Change', r => { const d = DB.dailyOf(r.c.id).filter(x => x.weight); if (d.length < 2) return '—'; const ch = d[d.length - 1].weight - d[0].weight; return `${ch > 0 ? '+' : ''}${kgTo(ch, r.c.units)}`; }], ['Last weigh-in', r => { const d = DB.dailyOf(r.c.id).filter(x => x.weight).pop(); return d ? fmt(d.date) : '—'; }]],
    payment: [['Plan', r => esc(DB.plan(r.c).name)], ['Billing', r => esc(r.c.billing || '—')], ['Next due', r => { const b = billing(r.c); return b.nextDue ? fmt(b.nextDue) : 'Paid up'; }], ['Overdue', r => billing(r.c).overdue ? '<span class="pill bad">Overdue</span>' : '—']],
    engagement: [['Last on', r => ago(iso(new Date(lastOnTs(r.c))))], ['Unread', r => DB.unread(r.c.id, 'coach') || '—'], ['Points 30d', r => points(r.c.id, addDays(today(), -29))], ['Rank', r => esc(rankOf(points(r.c.id)).rank.name)]] }[tab];
  return shell('Client table', 'Coach HQ', `${pageHead('Everyone at a glance', 'Client table', 'Compare every active client side by side. Tags update themselves from their activity.', `<button class="btn ghost" data-act="sheetTagSet">${IC.cog} Tag rules</button>`)}
    <div class="tabs">${tabs.map(([k, l]) => `<button class="tab ${tab === k ? 'on' : ''}" data-act="setP" data-k="tt" data-v="${k}">${l}</button>`).join('')}</div>
    ${allTags.length ? `<div class="row" style="gap:6px"><span class="tiny">Filter:</span><button class="tab ${tf ? '' : 'on'}" data-act="setP" data-k="tf" data-v="">All</button>${allTags.map(t => `<button class="tab ${tf === t ? 'on' : ''}" data-act="setP" data-k="tf" data-v="${esc(t)}">${t} <span class="num">${DB.active().filter(c => autoTags(c).some(x => x[0] === t)).length}</span></button>`).join('')}</div>` : ''}
    <section class="card"><div class="scroll"><table class="ctable stack"><thead><tr><th>Client</th>${col.map(x => `<th>${x[0]}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr><td><button class="linkbtn" data-go="client" data-p="${P({ id: r.c.id })}">${esc(r.c.name)}</button></td>${col.map(x => `<td data-l="${x[0]}" class="num">${x[1](r)}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${col.length + 1}"><div class="empty small">No clients match.</div></td></tr>`}</tbody></table></div></section>`, { nav: 'clienttable' });
}
SHEETS.tagSet = () => { const T = S.settings.tags; openSheet(`${sheetHead('Auto client tags', 'Tag rules')}<div class="fields">${[['trainLow', 'Low training below (%)'], ['trainHigh', 'High training from (%)'], ['nutLow', 'Low nutrition: days on target at most'], ['nutHigh', 'High nutrition: days on target from'], ['away', 'Not signed in after (days)'], ['noMsg', 'Not messaged by you in (days)'], ['noReply', 'Not responded in (days)']].map(([k, l]) => `<label class="f">${l}<input class="in num" type="number" data-tagset="${k}" value="${T[k]}"></label>`).join('')}</div><p class="tiny">Training compliance is sessions done against sessions planned over the last 7 days. Nutrition counts days within 10% of their calorie target.</p><button class="btn block" data-act="closeSheet">Done</button>`); };
ACTS.sheetTagSet = () => SHEETS.tagSet();

/* ---------- journey automations ---------- */
{ const _ra = runAutomations; runAutomations = function () { let n = _ra() || 0;
  DB.active().forEach(c => { const age = daysBetween(c.start, today());
    [3, 7, 14].forEach(k => { if (age >= k && age < k + 3) n += autoSend(c, 'day' + k, {}, `day${k}:${c.id}`); });
    if (S.food.some(f => f.clientId === c.id)) n += autoSend(c, 'firstmeal', {}, `firstmeal:${c.id}`);
    if (S.logs.some(l => l.clientId === c.id)) n += autoSend(c, 'firstworkout', {}, `firstworkout:${c.id}`);
    if (c.dob && c.dob.slice(5) === today().slice(5)) n += autoSend(c, 'birthday', {}, `birthday:${c.id}:${today().slice(0, 4)}`); });
  if (n) save(); return n; }; }
if (typeof viewAutomations === 'function') { const _va = viewAutomations; viewAutomations = function () { const h = _va(), card = a => { const s = S.settings.auto[a.id]; return `<section class="card ${s.on ? 'stripe' : ''}"><div class="row between nowrap"><div><h3>${a.name}</h3><span class="small sub">${a.when}</span></div><button class="seg" data-act="autoToggle" data-id="${a.id}" aria-label="Toggle ${a.name}" style="padding:3px"><span class="${s.on ? 'pill solid' : 'pill mute'}">${s.on ? 'On' : 'Off'}</span></button></div><textarea class="in" style="min-height:96px" data-autotext="${a.id}" aria-label="Message for ${a.name}">${esc(s.text)}</textarea></section>`; };
  const extra = `<div class="eyebrow">Their first fortnight (new in build 5)</div><p class="small sub">Each sends once per client. Set birthdays on the client's Profile tab.</p>${AUTOMATIONS.filter(a => a.grp === 'journey').map(card).join('')}`;
  const i = h.lastIndexOf('<div class="footer">'); return i > 0 ? h.slice(0, i) + extra + h.slice(i) : h + extra; }; VIEWS.coach.automations = viewAutomations; }
if (typeof clientProfile === 'function') { const _cp = clientProfile; clientProfile = function (c) { return `<section class="card"><div class="row between"><h3>Birthday</h3><span class="tiny">Used for the birthday auto-message</span></div><input class="in sm" type="date" data-dob="${c.id}" value="${esc(c.dob || '')}" style="max-width:220px"></section>` + _cp(c); }; }

/* ---------- interval timer ---------- */
const TPRESETS = [['tabata', 'Tabata', { work: 20, rest: 10, rounds: 8 }], ['emom', 'EMOM 10', { work: 60, rest: 0, rounds: 10 }], ['circuit', 'Circuit 40/20', { work: 40, rest: 20, rounds: 10 }], ['finisher', 'Finisher 30/30', { work: 30, rest: 30, rounds: 6 }]];
let TM = { work: 20, rest: 10, rounds: 8, prep: 10, run: false, phase: 'ready', left: 0, round: 0, t: null, ac: null };
function viewTimer() {
  return shell('Interval timer', 'Tools', `${pageHead('Tools', 'Interval timer', 'Tabata, EMOM, circuits and finishers. Beeps on every change so you can keep your eyes on the work.')}
    <section class="card hero timercard"><div class="tclock" id="tclock">${timerFace()}</div>
      <div class="row" style="justify-content:center"><button class="btn" data-act="tmGo" id="tmgo">${TM.run ? 'Pause' : TM.phase === 'ready' || TM.phase === 'done' ? IC.play + ' Start' : IC.play + ' Resume'}</button><button class="btn ghost" data-act="tmReset">Reset</button></div></section>
    <div class="tabs">${TPRESETS.map(([k, l, o]) => `<button class="tab ${TM.work === o.work && TM.rest === o.rest && TM.rounds === o.rounds ? 'on' : ''}" data-act="tmPreset" data-k="${k}">${l}</button>`).join('')}</div>
    <section class="card"><div class="fields q4">${[['work', 'Work (s)'], ['rest', 'Rest (s)'], ['rounds', 'Rounds'], ['prep', 'Get ready (s)']].map(([k, l]) => `<label class="f">${l}<input class="in num" type="number" min="0" data-tm="${k}" value="${TM[k]}"></label>`).join('')}</div><span class="tiny num">Total time ${Math.floor((TM.prep + TM.rounds * (TM.work + TM.rest) - TM.rest) / 60)}m ${(TM.prep + TM.rounds * (TM.work + TM.rest) - TM.rest) % 60}s</span></section>`, { back: !!ses.p._back, nav: ses.role === 'coach' ? 'cmore' : 'tools' });
}
function timerFace() { const ph = { ready: 'Ready', prep: 'Get ready', work: 'Work', rest: 'Rest', done: 'Done' }[TM.phase], tot = TM.phase === 'work' ? TM.work : TM.phase === 'rest' ? TM.rest : TM.phase === 'prep' ? TM.prep : 1, pc = TM.phase === 'ready' ? 0 : TM.phase === 'done' ? 1 : 1 - TM.left / tot;
  return `${ring(pc, 210, 14, `<span class="tph ${TM.phase}">${ph}</span><b class="num tnum">${TM.phase === 'ready' ? TM.work : TM.phase === 'done' ? '✓' : TM.left}</b><span class="tiny num">Round ${Math.max(1, TM.round)} of ${TM.rounds}</span>`, TM.phase === 'rest' ? 'var(--good)' : TM.phase === 'prep' ? 'var(--warn)' : 'var(--orange)')}`; }
function beep(f = 880, d = 0.15) { try { TM.ac = TM.ac || new (window.AudioContext || window.webkitAudioContext)(); const o = TM.ac.createOscillator(), g = TM.ac.createGain(); o.frequency.value = f; o.connect(g); g.connect(TM.ac.destination); g.gain.setValueAtTime(0.3, TM.ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001, TM.ac.currentTime + d); o.start(); o.stop(TM.ac.currentTime + d); } catch (e) {} }
function tmTick() {
  if (!$('#tclock')) { clearInterval(TM.t); TM.run = false; return; }
  TM.left--; if (TM.left <= 3 && TM.left > 0) beep(660, 0.08);
  if (TM.left <= 0) {
    if (TM.phase === 'prep' || TM.phase === 'rest') { TM.phase = 'work'; TM.round++; TM.left = TM.work; beep(1046, 0.3); }
    else if (TM.phase === 'work') { if (TM.round >= TM.rounds) { TM.phase = 'done'; TM.run = false; clearInterval(TM.t); beep(1318, 0.6); const b = $('#tmgo'); if (b) b.innerHTML = IC.play + ' Start'; } else if (TM.rest > 0) { TM.phase = 'rest'; TM.left = TM.rest; beep(523, 0.3); } else { TM.round++; TM.left = TM.work; beep(1046, 0.3); } }
  }
  const c = $('#tclock'); if (c) c.innerHTML = timerFace();
}
Object.assign(ACTS, {
  tmGo: el => { if (TM.run) { TM.run = false; clearInterval(TM.t); el.innerHTML = IC.play + ' Resume'; return; } beep(880, 0.05);
    if (TM.phase === 'ready' || TM.phase === 'done') { TM.round = 0; if (TM.prep > 0) { TM.phase = 'prep'; TM.left = TM.prep; } else { TM.phase = 'work'; TM.round = 1; TM.left = TM.work; } }
    TM.run = true; clearInterval(TM.t); TM.t = setInterval(tmTick, 1000); el.innerHTML = 'Pause'; const c = $('#tclock'); if (c) c.innerHTML = timerFace(); },
  tmReset: () => { clearInterval(TM.t); Object.assign(TM, { run: false, phase: 'ready', left: 0, round: 0 }); stay({}); },
  tmPreset: el => { const o = TPRESETS.find(p => p[0] === el.dataset.k)[2]; clearInterval(TM.t); Object.assign(TM, o, { run: false, phase: 'ready', round: 0 }); stay({}); }
});

/* ---------- exercise demo videos ---------- */
function viewExVideos() {
  const q = (ses.p.q || '').toLowerCase(), list = S.exercises.filter(e => !q || (e.name + e.muscle).toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name)), n = S.exercises.filter(e => e.video).length;
  return shell('Demo videos', 'Coach HQ', `${pageHead('Exercises', 'Demo videos', `${n} of ${S.exercises.length} exercises have a demo. Paste a YouTube, Instagram, Loom or Google Drive link. Clients see a Watch demo button in their session.`)}
    <input class="in" id="exq" data-q="q" placeholder="Search exercises" value="${esc(ses.p.q || '')}">
    <section class="card"><div class="list">${list.map(e => `<div class="li"><span class="grow" style="min-width:0"><b class="trunc" style="display:block">${esc(e.name)}</b><span class="tiny">${esc(e.muscle)} · ${esc(e.equip)}</span></span><input class="in sm vidin" type="url" data-exvid="${e.id}" value="${esc(e.video || '')}" placeholder="https://…" aria-label="Demo link for ${esc(e.name)}">${e.video ? `<a class="iconbtn sm or" href="${esc(e.video)}" target="_blank" rel="noopener" aria-label="Open demo">${IC.play}</a>` : ''}</div>`).join('')}</div></section>`, { nav: 'exvideos' });
}
if (typeof viewSession === 'function') { const _vs = viewSession; VIEWS.client.session = function () { const h = _vs(); if (!h) return h; try { const d = findDay(me(), ses.p.dayId), vids = d ? d.exercises.map(e => DB.ex(e.exId)).filter(hasDemo) : [];
  if (!vids.length) return h; const card = `<section class="card"><h3>${IC.play} Watch the demos</h3><div class="list">${[...new Map(vids.map(v => [v.id, v])).values()].map(v => `<button class="li tap fooditem" data-act="exDemo" data-id="${v.id}"><span class="grow">${esc(v.name)}</span><span class="pill or">${IC.play} Watch</span></button>`).join('')}</div></section>`;
  const i = h.lastIndexOf('<div class="footer">'); return i > 0 ? h.slice(0, i) + card + h.slice(i) : h; } catch (e) { return h; } }; }

document.addEventListener('input', e => { const t = e.target, ds = t.dataset; if (!ds) return;
  if (ds.tm) { TM[ds.tm] = Math.max(0, +t.value || 0); if (ds.tm === 'rounds') TM.rounds = Math.max(1, TM.rounds); if (!TM.run) { TM.phase = 'ready'; const c = $('#tclock'); if (c) c.innerHTML = timerFace(); } return; }
  if (ds.exvid) { const x = DB.ex(ds.exvid); x.video = t.value.trim(); lazySave(); return; }
  if (ds.tagset) { S.settings.tags[ds.tagset] = +t.value || 0; lazySave(); return; }
  if (ds.autotext) { S.settings.auto[ds.autotext].text = t.value; lazySave(); return; }
  if (ds.dob) { DB.client(ds.dob).dob = t.value; lazySave(); return; }
});
