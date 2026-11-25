
/* =====================================================================
   09d: To-do list (v5.4). The coach sets tasks per client: one-off with
   an optional due date, every day, weekdays only, or chosen days. The
   client's Today screen shows one list for the day: today's workout,
   one-off workouts, habits, check-in and forms due, and the coach's
   tasks, with a progress bar. The coach sees and manages it on the
   client's Overview tab.
   ===================================================================== */
const TASK_LINKS = [['', 'Nothing, just a tick box'], ['progress', 'Progress (photos, weight)'], ['learn', 'Learn (modules)'], ['calls', 'Calls (book a call)'], ['fuel', 'Fuel (food diary)'], ['train', 'Train'], ['checkin', 'Check-in'], ['docs', 'Their roadmap'], ['messages', 'Messages']];
const TASK_PRESETS = [['Take your progress photos', 'progress', 'weekly'], ['Weigh in first thing', 'progress', 'daily'], ['Meal prep for the week', 'fuel', 'weekly'], ['Watch the next module', 'learn', 'once'], ['Book your next call', 'calls', 'once'], ['Read your roadmap', 'docs', 'once']];
const DAYN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function migrate5d() { S.tasks = S.tasks || [];
  if (S.settings.demo && !S.v5TaskSeeded && S.clients[0]) { S.v5TaskSeeded = true; const c = S.clients[0].id;
    S.tasks.push({ id: uid(), clientId: c, title: 'Take your progress photos (example)', note: 'Front, side, back. Same light, same spot.', link: 'progress', repeat: 'days', days: [0], due: '', done: {}, ts: Date.now() },
      { id: uid(), clientId: c, title: 'Meal prep tomorrow\'s lunch (example)', note: '', link: 'fuel', repeat: 'days', days: [0, 1, 2, 3, 4], due: '', done: {}, ts: Date.now() },
      { id: uid(), clientId: c, title: 'Book your next call (example)', note: '', link: 'calls', repeat: 'once', days: [], due: addDays(today(), 2), done: {}, ts: Date.now() }); } }
// When does a task show, and what is today's tick stored under?
const taskKey = (t, date) => t.repeat === 'once' ? 'once' : date;
const taskOn = (t, date) => t.repeat === 'once' ? (!t.done.once || t.done.once === date) && (!t.start || t.start <= date) : t.days.includes(dow(date));
const taskDone = (t, date) => !!t.done[taskKey(t, date)];
const repeatText = t => t.repeat === 'once' ? (t.due ? 'Due ' + (t.due === today() ? 'today' : fmt(t.due)) : 'One-off') : t.days.length === 7 ? 'Every day' : t.days.join() === '1,2,3,4,5' ? 'Weekdays' : t.days.map(d => DAYN[d]).join(', ');
function todoItems(c, date = today()) {
  const out = [], plan = todaysPlan(c, date), logged = DB.logsOf(c.id).find(l => l.date === date), dd = DB.day(c.id, date) || { habits: [] };
  if (plan.day || logged) out.push({ k: 'workout', icon: 'train', title: logged ? `${logged.dayName} logged` : plan.day.name, sub: logged ? 'Workout done' : `Workout · ${plan.day.exercises.length} exercises`, done: !!logged, go: logged ? ['summary', { id: logged.id, _back: 'today' }] : ['session', { dayId: plan.day.id, _back: 'today' }] });
  (c.extras || []).filter(x => !x.done).forEach(x => out.push({ k: 'extra', icon: 'train', title: x.name, sub: 'Extra workout', done: false, go: ['session', { dayId: x.id, _back: 'today' }] }));
  if (checkinDue(c.id)) out.push({ k: 'checkin', icon: 'clip', title: 'Send your Monday check-in', sub: 'About 3 minutes', done: false, go: ['checkin', { _back: 'today' }] });
  habitsOn(c, date).forEach(h => out.push({ k: 'habit', icon: 'tick', title: h.label, sub: 'Habit', done: dd.habits.includes(h.id), act: 'habit', h: h.id }));
  S.tasks.filter(t => t.clientId === c.id && taskOn(t, date)).forEach(t => out.push({ k: 'task', icon: 'pin', title: t.title, sub: [t.note, t.repeat === 'once' && t.due && t.due < date && !taskDone(t, date) ? 'Overdue' : repeatText(t)].filter(Boolean).join(' · '), late: t.repeat === 'once' && t.due && t.due < date, done: taskDone(t, date), act: 'taskTick', id: t.id, go: t.link ? [t.link, { _back: 'today' }] : null }));
  return out;
}
function todoCard(c) {
  const it = todoItems(c), done = it.filter(x => x.done).length; if (!it.length) return '';
  return `<section class="card todocard"><div class="row between nowrap"><div class="head" style="gap:3px"><div class="eyebrow">From ${esc(S.settings.coachName)}</div><h3>Your to-do list</h3></div><b class="num todocount">${done}<span>/${it.length}</span></b></div>
    <div class="bar ${done === it.length ? 'good' : ''}"><i style="width:${done / it.length * 100}%"></i></div>
    <div class="todolist">${it.map(x => `<div class="todo ${x.done ? 'done' : ''}">
      ${x.act ? `<button class="tick ${x.done ? 'on' : ''}" data-act="${x.act}" ${x.h ? `data-h="${x.h}"` : ''} ${x.id ? `data-id="${x.id}"` : ''} aria-label="${x.done ? 'Untick' : 'Tick'} ${esc(x.title)}">${x.done ? IC.tick : ''}</button>` : `<span class="tick ${x.done ? 'on' : ''}" aria-hidden="true">${x.done ? IC.tick : IC[x.icon] || ''}</span>`}
      ${x.go ? `<button class="todomain" data-go="${x.go[0]}" data-p="${P(x.go[1])}">` : '<span class="todomain">'}<b>${esc(x.title)}</b><span class="tiny ${x.late && !x.done ? 'late' : ''}">${esc(x.sub)}</span>${x.go ? '</button>' : '</span>'}
      ${x.go && !x.done ? `<span class="todogo">${IC.fwd}</span>` : ''}</div>`).join('')}</div>
    ${done === it.length ? '<span class="small" style="color:var(--good)">All done for today. That\'s the standard.</span>' : ''}</section>`;
}
{ const _vt = VIEWS.client.today; VIEWS.client.today = function () { const h = _vt(), c = me(), tc = targetsCard(c), i = h.indexOf(tc), card = todoCard(c); return i >= 0 ? h.slice(0, i) + card + h.slice(i) : h + card; }; }

/* ---------- coach side: on the client's Overview tab ---------- */
function coachTodoCard(c) {
  const it = todoItems(c), done = it.filter(x => x.done).length, tasks = S.tasks.filter(t => t.clientId === c.id);
  return `<section class="card stripe"><div class="row between"><div class="head" style="gap:3px"><h3>To-do list</h3><span class="small sub">Today: ${done} of ${it.length} done. Workouts, habits and check-ins are added automatically.</span></div><button class="btn sm" data-act="sheetTask" data-c="${c.id}">${IC.plus} Add task</button></div>
    <div class="list">${tasks.map(t => { const on = taskOn(t, today()), d = taskDone(t, today()); return `<div class="li"><span class="tick ${d ? 'on' : ''}" aria-hidden="true">${d ? IC.tick : ''}</span><span class="grow" style="min-width:0"><b class="trunc" style="display:block">${esc(t.title)}</b><span class="tiny">${esc(repeatText(t))}${t.repeat === 'once' && t.done.once ? ' · done ' + fmt(t.done.once) : on ? (d ? ' · done today' : ' · not done yet today') : ' · not on today'}${t.link ? ' · opens ' + esc((TASK_LINKS.find(l => l[0] === t.link) || [, ''])[1].split(' (')[0]) : ''}</span></span><button class="iconbtn sm" data-act="sheetTask" data-c="${c.id}" data-id="${t.id}" aria-label="Edit ${esc(t.title)}">${IC.edit}</button></div>`; }).join('') || '<span class="tiny">No tasks yet. Add things like progress photos, meal prep or watching a module.</span>'}</div></section>`;
}
{ const _co = clientOverview; clientOverview = function (c, ...a) { return coachTodoCard(c) + _co(c, ...a); }; }

SHEETS.task = el => { const c = DB.client(el.dataset.c), t = S.tasks.find(x => x.id === el.dataset.id) || { title: '', note: '', link: '', repeat: 'once', days: [1, 2, 3, 4, 5], due: '' };
  const rep = t.repeat === 'once' ? 'once' : t.days.length === 7 ? 'daily' : t.days.join() === '1,2,3,4,5' ? 'weekdays' : 'days';
  openSheet(`${sheetHead(c.name, t.id ? 'Edit task' : 'New task')}
    ${t.id ? '' : `<div class="eyebrow">Quick picks</div><div class="tabs wrap">${TASK_PRESETS.map(([n, l, r]) => `<button class="tab" data-act="taskPreset" data-n="${esc(n)}" data-l="${l}" data-r="${r}">${esc(n)}</button>`).join('')}</div>`}
    <form class="stack-sm" data-form="task" data-c="${c.id}" data-id="${t.id || ''}">
      <label class="f">Task<input class="in" name="title" id="tasktitle" required maxlength="80" value="${esc(t.title)}" placeholder="e.g. Take your progress photos"></label>
      <label class="f">Note (optional)<input class="in" name="note" maxlength="120" value="${esc(t.note)}" placeholder="e.g. Front, side, back in the same light"></label>
      <div class="eyebrow">How often</div>
      <div class="seg repseg">${[['once', 'Once'], ['daily', 'Every day'], ['weekdays', 'Weekdays'], ['days', 'Pick days']].map(([k, l]) => `<label class="segopt"><input type="radio" name="rep" value="${k}" ${rep === k ? 'checked' : ''} data-taskrep><span>${l}</span></label>`).join('')}</div>
      <div id="taskdays" ${rep === 'days' ? '' : 'hidden'}><div class="row" style="gap:6px">${[1, 2, 3, 4, 5, 6, 0].map(d => `<label class="segopt dayopt"><input type="checkbox" name="d${d}" ${t.days.includes(d) ? 'checked' : ''}><span>${DAYN[d]}</span></label>`).join('')}</div></div>
      <label class="f" id="taskdue" ${rep === 'once' ? '' : 'hidden'}>Due date (optional)<input class="in" type="date" name="due" value="${esc(t.due || '')}"></label>
      <label class="f">When they tap it, open<select class="in" name="link" id="tasklink">${opt(TASK_LINKS, t.link, x => x)}</select></label>
      ${t.id ? '' : `<div class="eyebrow">Also give it to</div><div class="stack-sm">${DB.active().filter(x => x.id !== c.id).map(x => `<label class="row small" style="gap:8px"><input type="checkbox" name="c_${x.id}"> ${esc(x.name)}</label>`).join('') || '<span class="tiny">No other active clients.</span>'}</div>`}
      <button class="btn block" type="submit">${t.id ? 'Save task' : 'Add to their to-do list'}</button></form>
    ${t.id ? `<button class="btn danger" data-act="taskDel" data-id="${t.id}">Delete task</button>` : ''}`); };
Object.assign(ACTS, {
  sheetTask: el => SHEETS.task(el),
  taskPreset: el => { $('#tasktitle').value = el.dataset.n; $('#tasklink').value = el.dataset.l; const r = el.dataset.r === 'weekly' ? 'days' : el.dataset.r; const inp = document.querySelector(`[data-taskrep][value="${r}"]`); if (inp) { inp.checked = true; inp.dispatchEvent(new Event('input', { bubbles: true })); }
    if (el.dataset.r === 'weekly') document.querySelectorAll('#taskdays input').forEach(x => { x.checked = x.name === 'd0'; }); },
  taskTick: el => { const t = S.tasks.find(x => x.id === el.dataset.id), k = taskKey(t, today()), c = me(); if (t.done[k]) delete t.done[k]; else { t.done[k] = today(); toast('Ticked off'); } save(); stay({}); },
  taskDel: el => twoTap(el, 'Tap again to delete', () => { S.tasks = S.tasks.filter(x => x.id !== el.dataset.id); save(); closeSheet(); toast('Task deleted'); stay({}); })
});
FORMS.task = (f, d) => {
  const days = d.rep === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : d.rep === 'weekdays' ? [1, 2, 3, 4, 5] : d.rep === 'days' ? [0, 1, 2, 3, 4, 5, 6].filter(x => d['d' + x]) : [];
  if (d.rep === 'days' && !days.length) return toast('Pick at least one day.');
  const base = { title: d.title.trim(), note: (d.note || '').trim(), link: d.link || '', repeat: d.rep === 'once' ? 'once' : 'days', days, due: d.rep === 'once' ? (d.due || '') : '' };
  const ex = S.tasks.find(x => x.id === f.dataset.id);
  if (ex) Object.assign(ex, base);
  else { const ids = [f.dataset.c, ...DB.active().filter(x => d['c_' + x.id]).map(x => x.id)]; ids.forEach(cid => S.tasks.push({ id: uid(), clientId: cid, ...base, done: {}, start: today(), ts: Date.now() })); }
  save(); closeSheet(); toast(ex ? 'Task saved' : 'Added to their to-do list'); stay({});
};
document.addEventListener('input', e => { const t = e.target; if (t.dataset && t.dataset.taskrep !== undefined && t.checked) { const dd = $('#taskdays'), du = $('#taskdue'); if (dd) dd.hidden = t.value !== 'days'; if (du) du.hidden = t.value !== 'once'; } });
