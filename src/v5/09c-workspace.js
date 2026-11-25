
/* =====================================================================
   09c: Workspace (the Notion part). Nested pages built from blocks
   (headings, lists, to-dos, toggles, quotes, callouts, dividers,
   images, links, sub-pages) with "/" commands and markdown shortcuts;
   databases with table, board, calendar and gallery views, properties,
   filters and sorts; templates; favourites, search, trash; and pages
   shared with clients (their roadmap) inside the client app.
   ===================================================================== */
const BT = [['p', 'Text', 'Plain writing', 'list'], ['h1', 'Heading 1', 'Big section heading', 'page'], ['h2', 'Heading 2', 'Medium heading', 'page'], ['h3', 'Heading 3', 'Small heading', 'page'], ['todo', 'To-do', 'Tick box', 'tick'], ['ul', 'Bulleted list', 'Simple list', 'list'], ['ol', 'Numbered list', '1, 2, 3', 'list'], ['toggle', 'Toggle', 'Hide detail inside', 'down'], ['quote', 'Quote', 'Pull something out', 'chat'], ['callout', 'Callout', 'Orange box that stands out', 'bolt'], ['div', 'Divider', 'A line across', 'more'], ['img', 'Image', 'Upload a photo', 'cam'], ['link', 'Link or video', 'YouTube, Loom, Drive, a website', 'play'], ['page', 'Sub-page', 'A page inside this page', 'page'], ['db', 'Database', 'A table you can view as a board or calendar', 'db']];
const TEXTY = ['p', 'h1', 'h2', 'h3', 'todo', 'ul', 'ol', 'toggle', 'quote', 'callout'];
const PROP_TYPES = [['text', 'Text'], ['number', 'Number'], ['select', 'Select'], ['status', 'Status'], ['date', 'Date'], ['check', 'Checkbox'], ['client', 'Client'], ['url', 'Link']];
const OPT_C = ['#2A2A2E', '#3B2213', '#12261A', '#2B2310', '#2E1513', '#14202E', '#24182E'];
const OPT_T = ['#D9D4CB', '#F4955A', '#5CC37E', '#EDB740', '#EC5F55', '#7FB2E5', '#C39BE8'];
const PG_ICONS = ['page', 'book', 'clip', 'fuel', 'train', 'chart', 'users', 'star', 'target', 'bolt', 'cal', 'heart', 'trophy', 'mega', 'db', 'pin'];
const COVERS = ['', '#EE7A34', '#3B2213', '#12261A', '#14202E', '#2B2310', '#202024'];
const TXT_C = [['', 'Default'], ['or', 'Orange'], ['gd', 'Green'], ['wn', 'Yellow'], ['bd', 'Red'], ['mu', 'Grey']];
const B = (t, x = '', o = {}) => ({ id: uid(), t, x, ...o });
let SLASH = null, WSQ = '';

function migrate5c() {
  S.pages = S.pages || [];
  if (S.settings.demo && !S.v5WsSeeded) { S.v5WsSeeded = true;
    const hq = wsNew({ title: 'SlaterTrained HQ', icon: 'star', cover: '#EE7A34', blocks: [B('callout', 'Everything for running the business, in one place. Example content: edit it, delete it, or start from a template.'), B('h2', 'This week'), B('todo', 'Film 3 reels (see Content planner)'), B('todo', 'Follow up every lead in "Messaged"', { ch: true }), B('todo', 'Review Monday check-ins by Tuesday night'), B('h2', 'Pages')] });
    const leads = tplLeads(hq.id), content = tplContent(hq.id), sop = tplSop(hq.id);
    hq.blocks.push(B('page', '', { pid: leads.id }), B('page', '', { pid: content.id }), B('page', '', { pid: sop.id }));
    const jack = S.clients[0]; if (jack) tplRoadmap(jack, null);
  }
}
function wsNew(o) { const p = { id: uid(), parent: o.parent || null, title: o.title || '', icon: o.icon || 'page', cover: o.cover || '', kind: o.kind || 'page', blocks: o.blocks || [B('p')], db: o.db || null, rowOf: o.rowOf || null, props: o.props || {}, share: o.share || [], fav: false, trashed: false, ts: Date.now(), edited: Date.now(), by: 'coach', ticks: {} }; S.pages.push(p); return p; }
function wsDb(o) { const db = wsNew({ ...o, kind: 'db', blocks: [] }); db.db = { props: [{ id: 'title', name: o.titleName || 'Name', type: 'title' }, ...(o.props || []).map(([name, type, opts]) => ({ id: 'p' + uid(), name, type, opts: (opts || []).map((v, i) => ({ v, c: i % OPT_C.length })) }))], views: [], cur: null };
  (o.views || [['table', 'Table']]).forEach(([type, name, by]) => { const pr = by ? db.db.props.find(p => p.name === by) : null; db.db.views.push({ id: 'v' + uid(), name, type, group: type === 'board' ? pr?.id : null, date: type === 'cal' ? pr?.id : null, sort: null, filter: null }); });
  db.db.cur = db.db.views[0].id; return db; }
const propBy = (db, name) => db.db.props.find(p => p.name === name);
function wsRow(db, title, vals = {}) { const props = {}; Object.entries(vals).forEach(([n, v]) => { const p = propBy(db, n); if (p) props[p.id] = v; }); return wsNew({ title, rowOf: db.id, props, blocks: [B('p')] }); }

/* ---------- templates ---------- */
function tplLeads(parent) { const db = wsDb({ parent, title: 'Leads tracker', icon: 'users', props: [['Status', 'status', ['New', 'Messaged', 'Call booked', 'Won', 'Lost']], ['Source', 'select', ['Instagram', 'TikTok', 'Referral', 'Ads', 'Other']], ['Trade', 'text'], ['Call date', 'date'], ['Value £', 'number'], ['Instagram', 'url']], views: [['board', 'Pipeline', 'Status'], ['table', 'All leads'], ['cal', 'Calls', 'Call date']] });
  if (S.settings.demo) { wsRow(db, 'Example lead: Kyle (sparky)', { Status: 'Messaged', Source: 'Instagram', Trade: 'Electrician', 'Value £': 997 }); wsRow(db, 'Example lead: Ollie (plasterer)', { Status: 'Call booked', Source: 'TikTok', Trade: 'Plasterer', 'Call date': addDays(today(), 2), 'Value £': 1497 }); wsRow(db, 'Example lead: Sam (joiner)', { Status: 'New', Source: 'Referral', Trade: 'Carpenter' }); wsRow(db, 'Example lead: Ash (scaffolder)', { Status: 'Won', Source: 'Instagram', Trade: 'Labourer', 'Value £': 2397 }); }
  return db; }
function tplContent(parent) { const db = wsDb({ parent, title: 'Content planner', icon: 'mega', props: [['Status', 'status', ['Idea', 'Scripted', 'Filmed', 'Edited', 'Posted']], ['Format', 'select', ['Reel', 'Carousel', 'Story', 'YouTube']], ['Post date', 'date'], ['Hook', 'text']], views: [['board', 'Board', 'Status'], ['cal', 'Calendar', 'Post date'], ['table', 'Table']] });
  if (S.settings.demo) { wsRow(db, 'Example: Site-day vs rest-day macros', { Status: 'Scripted', Format: 'Reel', 'Post date': addDays(today(), 1), Hook: 'Your rest day shouldn\'t look like your site day' }); wsRow(db, 'Example: Meal deal swaps', { Status: 'Idea', Format: 'Carousel', Hook: '5 meal deals under 500 kcal' }); wsRow(db, 'Example: Client transformation', { Status: 'Filmed', Format: 'Reel', 'Post date': addDays(today(), 4) }); wsRow(db, 'Example: 30-minute van workout', { Status: 'Posted', Format: 'Reel', 'Post date': addDays(today(), -3) }); }
  return db; }
function tplSop(parent) { return wsNew({ parent, title: 'New client onboarding SOP', icon: 'clip', blocks: [B('callout', 'Run this for every new client. Tick as you go.'), B('h2', 'Day 0: they sign'), B('todo', 'Add them in Clients, pick plan and billing'), B('todo', 'Send the welcome message and onboarding form'), B('todo', 'Book the kick-off call'), B('h2', 'Day 1–3: build'), B('todo', 'Set site-day and rest-day targets'), B('todo', 'Assign programme and meal plan'), B('todo', 'Create their roadmap from the template and share it'), B('h2', 'Week 1'), B('todo', 'Check they\'ve logged food and a session'), B('todo', 'First Monday check-in reviewed'), B('toggle', 'What to say on the kick-off call', { body: 'Goal, why, shift pattern, kit, food likes and dislikes, and what a win looks like at 12 weeks.' })] }); }
function tplJournal(parent) { const db = wsDb({ parent, title: 'Journal', icon: 'book', props: [['Date', 'date'], ['Energy', 'number'], ['Mood', 'select', ['Flying', 'Good', 'Average', 'Rough']]], views: [['table', 'Entries'], ['cal', 'Calendar', 'Date']] }); return db; }
function tplRoadmap(c, parent) { const f = first(c.name);
  const pg = wsNew({ parent, title: `${f}'s roadmap`, icon: 'target', cover: '#3B2213', share: [c.id], blocks: [B('callout', `Everything you need, ${f}, in one place. Tick things off as you go.`), B('h2', 'Your goal'), B('p', c.goal ? `Goal: ${c.goal}` : 'We\'ll write your goal in here after the kick-off call.'), B('h2', 'Your first four weeks'), B('todo', 'Fill in your onboarding form'), B('todo', 'Log your food every day, even the bad days'), B('todo', 'Get every session in (the 30-minute version counts)'), B('todo', 'Send your Monday check-in'), B('h2', 'Your plan')] });
  const gym = wsNew({ parent: pg.id, title: 'Gym blueprint', icon: 'train', share: [], blocks: [B('p', 'How your week is set out, and what to do if you miss a day.'), B('ul', 'Train on the days in your Train tab'), B('ul', 'Short on time? Hit the 30-minute version'), B('ul', 'Add a rep or a bit of weight each week')] });
  const meals = wsNew({ parent: pg.id, title: '3-ingredient meals', icon: 'fuel', share: [], blocks: [B('p', 'Protein + carb + veg. Pick one from each.'), B('ul', 'Chicken breast, rice pouch, frozen veg'), B('ul', 'Tuna, wholemeal wrap, bag of salad'), B('ul', '5% mince, potatoes, broccoli')] });
  pg.blocks.push(B('page', '', { pid: gym.id }), B('page', '', { pid: meals.id })); return pg; }
const TEMPLATES = [['roadmap', 'Client roadmap', 'Goal, first four weeks, gym blueprint and meals. Shared with the client.', 'target'], ['leads', 'Leads tracker', 'Pipeline board from first message to won.', 'users'], ['content', 'Content planner', 'Ideas to posted, on a board and a calendar.', 'mega'], ['sop', 'Onboarding SOP', 'Checklist for every new client.', 'clip'], ['journal', 'Journal', 'Daily entries with energy and mood.', 'book'], ['blank', 'Blank page', 'Start from nothing.', 'page'], ['blankdb', 'Blank database', 'Your own table, board or calendar.', 'db']];

/* ---------- access ---------- */
const pgById = id => S.pages.find(p => p.id === id);
const alive = p => { let x = p, n = 0; while (x && n++ < 40) { if (x.trashed) return false; x = pgById(x.parent || x.rowOf); } return true; };
const kids = id => S.pages.filter(p => p.parent === id && !p.rowOf && !p.trashed);
const rowsOf = db => S.pages.filter(p => p.rowOf === db.id && !p.trashed);
function sharedWith(p, cid) { let x = p, n = 0; while (x && n++ < 40) { if (x.share === 'all' || (Array.isArray(x.share) && x.share.includes(cid))) return true; x = pgById(x.parent || x.rowOf); } return false; }
const canSee = p => p && alive(p) && (ses.role === 'coach' || sharedWith(p, ses.clientId));
const canEdit = () => ses.role === 'coach';
const pgIcon = (p, size = '') => `<span class="pgicon ${size}">${IC[p.icon] || IC.page}</span>`;
const pgTitle = p => p.title || 'Untitled';
const crumbs = p => { const out = []; let x = pgById(p.parent || p.rowOf), n = 0; while (x && n++ < 20) { if (ses.role === 'client' && !sharedWith(x, ses.clientId)) break; out.unshift(x); x = pgById(x.parent || x.rowOf); } return out; };
const touch = p => { p.edited = Date.now(); };

/* ---------- workspace home ---------- */
function viewWs() {
  const all = S.pages.filter(p => alive(p) && !p.rowOf && !p.tpl), top = all.filter(p => !p.parent), favs = all.filter(p => p.fav), recent = all.slice().sort((a, b) => b.edited - a.edited).slice(0, 6), shared = all.filter(p => p.share === 'all' || (p.share || []).length), tpls = S.pages.filter(p => p.tpl && !p.trashed);
  const q = WSQ.toLowerCase().trim(), hits = q ? S.pages.filter(p => alive(p) && (pgTitle(p).toLowerCase().includes(q) || (p.blocks || []).some(b => (b.x + ' ' + (b.body || '')).toLowerCase().includes(q)))).slice(0, 20) : [];
  const card = p => `<button class="card tap pgcard" data-go="page" data-p="${P({ id: p.id })}">${p.cover ? `<i class="pgcov" style="background:${p.cover}"></i>` : ''}<div class="row nowrap" style="gap:10px">${pgIcon(p)}<b class="trunc grow">${esc(pgTitle(p))}</b></div><span class="tiny">${p.kind === 'db' ? rowsOf(p).length + ' rows · ' : ''}${kids(p.id).length ? kids(p.id).length + ' pages · ' : ''}edited ${ago(iso(new Date(p.edited)))}</span></button>`;
  const tree = (p, d = 0) => `<div class="treerow" style="padding-left:${d * 18}px"><button class="tree" data-go="page" data-p="${P({ id: p.id })}">${pgIcon(p, 'sm')}<span class="trunc">${esc(pgTitle(p))}</span>${p.share === 'all' || (p.share || []).length ? `<span class="tiny" title="Shared">${IC.share}</span>` : ''}</button></div>${d < 3 ? kids(p.id).map(k => tree(k, d + 1)).join('') : ''}`;
  return shell('Workspace', 'Coach HQ', `${pageHead('Your Notion, built in', 'Workspace', 'Pages, checklists, SOPs, leads, content plans and client roadmaps. Type / on any line for blocks.', `<button class="btn" data-act="wsTplSheet">${IC.plus} New</button>`)}
    <input class="in" id="wsq" data-wsq placeholder="Search every page and note" value="${esc(WSQ)}">
    ${q ? `<section class="card"><div class="list">${hits.map(p => `<button class="li tap" data-go="page" data-p="${P({ id: p.id })}" style="background:none;border-left:0;border-right:0;border-bottom:0;color:var(--text);width:100%;text-align:left">${pgIcon(p, 'sm')}<span class="grow trunc">${esc(pgTitle(p))}</span><span class="tiny">${p.rowOf ? esc(pgTitle(pgById(p.rowOf))) : ''}</span></button>`).join('') || '<div class="empty small">Nothing matches.</div>'}</div></section>` : `
    ${favs.length ? `<div class="eyebrow">Favourites</div><div class="grid">${favs.map(card).join('')}</div>` : ''}
    <div class="eyebrow">Recently edited</div><div class="grid">${recent.map(card).join('') || '<div class="card"><div class="empty small">No pages yet. Start from a template.</div></div>'}</div>
    <div class="grid-2"><section class="card"><div class="row between"><h3>All pages</h3><button class="btn ghost sm" data-act="wsNewPage">${IC.plus} Page</button></div><div class="treebox">${top.map(p => tree(p)).join('') || '<span class="tiny">Nothing yet.</span>'}</div></section>
      <section class="card"><h3>Start from a template</h3><div class="stack-sm">${TEMPLATES.map(([k, n, d, i]) => `<button class="li tap tplrow" data-act="wsTpl" data-k="${k}"><span class="pgicon sm">${IC[i]}</span><span class="grow"><b style="display:block">${n}</b><span class="tiny">${d}</span></span>${IC.fwd}</button>`).join('')}${tpls.map(p => `<button class="li tap tplrow" data-act="wsUseTpl" data-id="${p.id}">${pgIcon(p, 'sm')}<span class="grow"><b style="display:block">${esc(pgTitle(p))}</b><span class="tiny">Your template</span></span>${IC.fwd}</button>`).join('')}</div></section></div>
    ${shared.length ? `<div class="eyebrow">Shared with clients</div><div class="grid">${shared.map(card).join('')}</div>` : ''}
    <button class="btn ghost" data-go="wstrash">${IC.trash} Trash (${S.pages.filter(p => p.trashed).length})</button>`}`, { nav: 'ws' });
}
function viewWsTrash() {
  const t = S.pages.filter(p => p.trashed);
  return shell('Trash', 'Workspace', `${pageHead('Workspace', 'Trash', 'Deleted pages stay here until you empty them.')}<section class="card"><div class="list">${t.map(p => `<div class="li">${pgIcon(p, 'sm')}<span class="grow trunc">${esc(pgTitle(p))}</span><button class="btn ghost sm" data-act="wsRestore" data-id="${p.id}">Restore</button><button class="btn danger sm" data-act="wsPurge" data-id="${p.id}">Delete forever</button></div>`).join('') || '<div class="empty small">Trash is empty.</div>'}</div></section>`, { back: true, nav: 'ws' });
}

/* ---------- client side: pages shared with me ---------- */
function viewDocs() {
  const cid = ses.clientId, roots = S.pages.filter(p => alive(p) && !p.rowOf && (p.share === 'all' || (Array.isArray(p.share) && p.share.includes(cid))));
  return shell('From your coach', 'Your roadmap', `${pageHead('From ' + S.settings.coachName, 'Your roadmap', 'Plans, checklists and guides shared with you. Tick things off as you go.')}
    <div class="grid">${roots.map(p => { const todos = (p.blocks || []).filter(b => b.t === 'todo'), done = todos.filter(b => isTicked(p, b)).length;
      return `<button class="card tap stripe pgcard" data-go="page" data-p="${P({ id: p.id, _back: 'docs' })}">${p.cover ? `<i class="pgcov" style="background:${p.cover}"></i>` : ''}<div class="row nowrap" style="gap:10px">${pgIcon(p)}<b class="trunc grow">${esc(pgTitle(p))}</b></div>${todos.length ? `<div class="bar ${done === todos.length ? 'good' : ''}"><i style="width:${done / todos.length * 100}%"></i></div><span class="tiny num">${done} of ${todos.length} done</span>` : `<span class="tiny">Updated ${ago(iso(new Date(p.edited)))}</span>`}</button>`; }).join('') || `<div class="card"><div class="empty small">${IC.page}<span>Nothing shared yet. Your coach will put your roadmap here.</span></div></div>`}</div>`, { nav: 'docs' });
}
function isTicked(p, b) { if (ses.role === 'coach' || (Array.isArray(p.share) && p.share.length === 1)) return !!b.ch; return ((p.ticks || {})[ses.clientId] || []).includes(b.id); }

/* ---------- page view ---------- */
function viewPage() {
  const p = pgById(ses.p.id); if (!p || !canSee(p)) return back();
  const ed = canEdit(), cr = crumbs(p), dbp = p.rowOf ? pgById(p.rowOf) : null;
  const head = `<div class="crumbs">${ed ? `<button data-go="ws">Workspace</button>` : `<button data-go="docs">Your roadmap</button>`}${cr.map(x => `<span>/</span><button data-go="page" data-p="${P({ id: x.id })}">${esc(pgTitle(x))}</button>`).join('')}</div>
    ${p.cover ? `<div class="pgcover" style="background:${p.cover}"></div>` : ''}
    <div class="pghead">${ed ? `<button class="pgicon lg" data-act="pgIconSheet" data-id="${p.id}" aria-label="Change icon">${IC[p.icon] || IC.page}</button>` : pgIcon(p, 'lg')}
      ${ed ? `<h1 class="pgtitle" contenteditable="true" data-ptitle="${p.id}" data-ph="Untitled" spellcheck="true">${esc(p.title)}</h1>` : `<h1 class="pgtitle">${esc(pgTitle(p))}</h1>`}
      ${ed ? `<div class="row pgacts"><button class="iconbtn sm ${p.fav ? 'or' : ''}" data-act="pgFav" data-id="${p.id}" aria-label="Favourite">${IC.star}</button><button class="btn ghost sm" data-act="pgShareSheet" data-id="${p.id}">${IC.share} ${p.share === 'all' ? 'All clients' : (p.share || []).length ? (p.share.length === 1 ? esc(first(DB.client(p.share[0])?.name || '')) : p.share.length + ' clients') : 'Share'}</button><button class="iconbtn sm" data-act="pgMenu" data-id="${p.id}" aria-label="Page options">${IC.more}</button></div>` : ''}</div>
    <span class="tiny">Edited ${ago(iso(new Date(p.edited)))}${ed ? ' · type / for blocks, # for headings, [] for to-dos, - for bullets' : ''}</span>`;
  const props = dbp ? `<section class="propbox">${dbp.db.props.filter(x => x.type !== 'title').map(pr => `<div class="proprow"><span class="tiny">${esc(pr.name)}</span>${cellHTML(dbp, p, pr, ed, 'prop')}</div>`).join('')}</section>` : '';
  const body = p.kind === 'db' ? dbHTML(p, ed) : `<div class="pgbody" id="pgbody" data-page="${p.id}">${blocksHTML(p, ed)}</div>${ed ? `<button class="addblk" data-act="blkAddEnd" data-id="${p.id}">${IC.plus} Add a block</button>` : ''}${ed ? '' : subPagesHTML(p)}`;
  return shell(pgTitle(p), dbp ? pgTitle(dbp) : ed ? 'Workspace' : 'Your roadmap', `<article class="pagewrap">${head}${props}${body}</article>`, { back: true, nav: ed ? 'ws' : 'docs' });
}
function subPagesHTML(p) { const k = kids(p.id).filter(x => !(p.blocks || []).some(b => b.t === 'page' && b.pid === x.id)); return k.length ? `<div class="eyebrow">Inside this page</div><div class="stack-sm">${k.map(x => `<button class="blkpage" data-go="page" data-p="${P({ id: x.id })}">${pgIcon(x, 'sm')}<span>${esc(pgTitle(x))}</span></button>`).join('')}</div>` : ''; }
function blocksHTML(p, ed) {
  let n = 0; const ce = ed ? 'contenteditable="true"' : '';
  return (p.blocks || []).map((b, i) => { n = b.t === 'ol' ? n + 1 : 0; const col = b.col ? ' tc-' + b.col : '';
    const txt = (cls = '') => `<div class="bt ${cls}${col}" ${ce} data-bt="${b.id}" data-ph="${i === 0 && p.blocks.length === 1 ? "Type '/' for blocks, or just start writing" : b.t === 'p' ? '' : BT.find(x => x[0] === b.t)[1]}" spellcheck="true">${esc(b.x)}</div>`;
    const grip = ed ? `<button class="grip" data-act="blkMenu" data-pid="${p.id}" data-bid="${b.id}" aria-label="Block options" tabindex="-1">${IC.grip}</button>` : '';
    let inner = '';
    switch (b.t) {
      case 'todo': inner = `<button class="tick ${isTicked(p, b) ? 'on' : ''}" data-act="blkTick" data-pid="${p.id}" data-bid="${b.id}" aria-label="Tick">${isTicked(p, b) ? IC.tick : ''}</button>${txt(isTicked(p, b) ? 'struck' : '')}`; break;
      case 'ul': inner = `<span class="bul">•</span>${txt()}`; break;
      case 'ol': inner = `<span class="bul num">${n}.</span>${txt()}`; break;
      case 'toggle': inner = `<button class="tgl ${b.open ? 'on' : ''}" data-act="blkToggle" data-pid="${p.id}" data-bid="${b.id}" aria-label="Open">${IC.fwd}</button><div class="grow" style="min-width:0">${txt('tglhead')}${b.open ? `<div class="bt tglbody" ${ce} data-btb="${b.id}" data-ph="Write what's inside">${esc(b.body || '')}</div>` : ''}</div>`; break;
      case 'callout': inner = `<div class="callout blkcall"><span class="cic">${IC.bolt}</span>${txt()}</div>`; break;
      case 'quote': inner = `<div class="blkquote">${txt()}</div>`; break;
      case 'div': inner = '<hr class="blkhr">'; break;
      case 'img': inner = b.img ? `<figure class="blkimg"><img src="${imgSrc(b.img)}" alt="${esc(b.x)}">${ed || b.x ? `<figcaption class="bt" ${ce} data-bt="${b.id}" data-ph="Add a caption">${esc(b.x)}</figcaption>` : ''}</figure>` : ed ? `<label class="blkempty">${IC.cam}<span>Upload an image</span><input type="file" accept="image/*" hidden data-blkimg="${b.id}" data-pid="${p.id}"></label>` : ''; break;
      case 'link': { const u = b.url || ''; let host = ''; try { host = u ? new URL(u).hostname.replace('www.', '') : ''; } catch (e) {} const vid = /youtu|loom|vimeo|instagram|tiktok/.test(host);
        inner = u ? `<a class="blklink" href="${esc(u)}" target="_blank" rel="noopener"><span class="pgicon sm">${vid ? IC.play : IC.fwd}</span><span class="grow" style="min-width:0"><b class="trunc" style="display:block">${esc(b.x || (vid ? 'Watch the video' : host))}</b><span class="tiny trunc" style="display:block">${esc(host)}</span></span></a>${ed ? `<button class="iconbtn sm" data-act="blkLinkEdit" data-pid="${p.id}" data-bid="${b.id}" aria-label="Edit link">${IC.edit}</button>` : ''}` : ed ? `<form class="row nowrap grow" data-form="blkLink" data-pid="${p.id}" data-bid="${b.id}"><input class="in sm grow" name="url" type="url" placeholder="Paste a link (YouTube, Loom, Drive, a website)" required><button class="btn sm" type="submit">Add</button></form>` : ''; break; }
      case 'page': { const sp = pgById(b.pid); inner = sp && !sp.trashed && canSee(sp) ? `<button class="blkpage" data-go="page" data-p="${P({ id: sp.id })}">${pgIcon(sp, 'sm')}<span>${esc(pgTitle(sp))}</span>${sp.kind === 'db' ? `<span class="tiny">${rowsOf(sp).length} rows</span>` : ''}</button>` : ed ? '<span class="tiny">Page removed</span>' : ''; break; }
      default: inner = txt();
    }
    return inner ? `<div class="blk b-${b.t}" data-bid="${b.id}">${grip}${inner}</div>` : '';
  }).join('');
}
function renderPgBody(p, focusId, pos = 'end') { const el = $('#pgbody'); if (!el) return stay({}); el.innerHTML = blocksHTML(p, canEdit()); if (focusId) focusBlock(focusId, pos); }
function focusBlock(id, pos = 'end') { const el = document.querySelector(`[data-bt="${id}"]`); if (!el) return; el.focus(); setCaret(el, pos === 'end' ? el.textContent.length : pos === 'start' ? 0 : pos); }
function caretOff(el) { const s = getSelection(); if (!s.rangeCount) return 0; const r = s.getRangeAt(0), pre = r.cloneRange(); pre.selectNodeContents(el); pre.setEnd(r.endContainer, r.endOffset); return pre.toString().length; }
function setCaret(el, off) { const r = document.createRange(), s = getSelection(); let left = off, node = null; const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); while (w.nextNode()) { const t = w.currentNode; if (left <= t.length) { node = t; break; } left -= t.length; }
  if (node) r.setStart(node, Math.max(0, left)); else { r.selectNodeContents(el); r.collapse(false); } r.collapse(true); s.removeAllRanges(); s.addRange(r); }
const curPage = () => pgById($('#pgbody')?.dataset.page);
const blkOf = (p, id) => p.blocks.find(b => b.id === id);

/* ---------- slash menu ---------- */
function slashShow(el, b) { const q = b.x.slice(1).toLowerCase(), items = BT.filter(t => !q || t[1].toLowerCase().includes(q) || t[0].startsWith(q));
  if (!items.length) return slashHide(); SLASH = { bid: b.id, items, i: Math.min(SLASH && SLASH.bid === b.id ? SLASH.i : 0, items.length - 1) };
  let m = $('#slash'); if (!m) { m = document.createElement('div'); m.id = 'slash'; m.className = 'slash'; document.body.appendChild(m); }
  const r = el.getBoundingClientRect(), below = window.innerHeight - r.bottom > 300; m.style.left = Math.min(r.left, window.innerWidth - 280) + 'px'; m.style.top = (below ? r.bottom + 6 : Math.max(8, r.top - 306)) + 'px';
  m.innerHTML = `<div class="tiny" style="padding:6px 10px">Blocks</div>${items.map((t, k) => `<button class="${k === SLASH.i ? 'on' : ''}" data-act="slashPick" data-t="${t[0]}"><span class="pgicon sm">${IC[t[3]]}</span><span class="grow"><b style="display:block">${t[1]}</b><span class="tiny">${t[2]}</span></span></button>`).join('')}`;
  m.querySelector('.on')?.scrollIntoView({ block: 'nearest' }); }
function slashHide() { SLASH = null; $('#slash')?.remove(); }
function applyType(p, b, t) { const i = p.blocks.indexOf(b); b.x = b.x.startsWith('/') ? '' : b.x;
  if (t === 'page' || t === 'db') { const sp = t === 'db' ? wsDb({ parent: p.id, title: 'Untitled database', icon: 'db', props: [['Status', 'status', ['To do', 'Doing', 'Done']], ['Date', 'date']], views: [['table', 'Table'], ['board', 'Board', 'Status']] }) : wsNew({ parent: p.id, title: '' }); Object.assign(b, { t: 'page', pid: sp.id, x: '' }); touch(p); save(); slashHide(); return go('page', { id: sp.id, _back: 'page', _backP: { id: p.id } }); }
  b.t = t; if (t === 'div') { p.blocks.splice(i + 1, 0, B('p')); touch(p); save(); slashHide(); return renderPgBody(p, p.blocks[i + 1].id, 'start'); }
  touch(p); save(); slashHide(); renderPgBody(p, TEXTY.includes(t) ? b.id : null, 'end'); }

/* ---------- databases ---------- */
const curView = db => db.db.views.find(v => v.id === db.db.cur) || db.db.views[0];
const optOf = (pr, v) => (pr.opts || []).find(o => o.v === v);
const pill = (pr, v) => { const o = optOf(pr, v); return v ? `<span class="opt" style="background:${OPT_C[o ? o.c : 0]};color:${OPT_T[o ? o.c : 0]}">${esc(v)}</span>` : ''; };
function cellText(pr, r) { const v = pr.type === 'title' ? r.title : r.props[pr.id]; if (v == null || v === '') return ''; if (pr.type === 'select' || pr.type === 'status') return pill(pr, v); if (pr.type === 'date') return esc(fmt(v)); if (pr.type === 'check') return v ? IC.tick : ''; if (pr.type === 'client') return esc(DB.client(v)?.name || ''); if (pr.type === 'url') return `<a href="${esc(v)}" target="_blank" rel="noopener">${esc(String(v).replace(/^https?:\/\/(www\.)?/, '').slice(0, 30))}</a>`; return esc(v); }
function cellHTML(db, r, pr, ed, where = 'cell') {
  if (!ed) return `<span class="cellro">${cellText(pr, r) || '<span class="tiny">—</span>'}</span>`;
  const v = pr.type === 'title' ? r.title : r.props[pr.id] ?? '', k = `data-cell="${r.id}|${pr.id}"`;
  switch (pr.type) {
    case 'title': return `<div class="row nowrap" style="gap:4px"><input class="cin tin" ${k} value="${esc(v)}" placeholder="Untitled"><button class="iconbtn sm" data-go="page" data-p="${P({ id: r.id, _back: 'page', _backP: { id: db.id } })}" aria-label="Open">${IC.fwd}</button></div>`;
    case 'number': return `<input class="cin num" type="number" step="any" ${k} value="${esc(v)}">`;
    case 'date': return `<input class="cin" type="date" ${k} value="${esc(v)}">`;
    case 'check': return `<input type="checkbox" ${k} ${v ? 'checked' : ''} aria-label="${esc(pr.name)}">`;
    case 'select': case 'status': return `<select class="cin csel" ${k} ${v ? `style="background:${OPT_C[optOf(pr, v)?.c || 0]};color:${OPT_T[optOf(pr, v)?.c || 0]}"` : ''}><option value="">—</option>${(pr.opts || []).map(o => `<option ${o.v === v ? 'selected' : ''}>${esc(o.v)}</option>`).join('')}</select>`;
    case 'client': return `<select class="cin" ${k}><option value="">—</option>${opt(S.clients, v, c => [c.id, c.name])}</select>`;
    case 'url': return `<input class="cin" type="url" ${k} value="${esc(v)}" placeholder="https://">`;
    default: return `<input class="cin" ${k} value="${esc(v)}">`;
  }
}
function viewRows(db, v) {
  let rows = rowsOf(db); const q = (ses.p.dq || '').toLowerCase();
  if (q) rows = rows.filter(r => (r.title + ' ' + Object.values(r.props).join(' ')).toLowerCase().includes(q));
  if (v.filter && v.filter.p) { const pr = db.db.props.find(x => x.id === v.filter.p); if (pr) rows = rows.filter(r => pr.type === 'check' ? !!r.props[pr.id] === (v.filter.v === 'yes') : (r.props[pr.id] || '') === v.filter.v); }
  if (v.sort && v.sort.p) { const pr = db.db.props.find(x => x.id === v.sort.p), get = r => pr.type === 'title' ? r.title : r.props[pr.id] ?? ''; rows.sort((a, b) => { const x = get(a), y = get(b), c = pr.type === 'number' ? (+x || 0) - (+y || 0) : (pr.type === 'select' || pr.type === 'status') ? (pr.opts.findIndex(o => o.v === x) - pr.opts.findIndex(o => o.v === y)) : String(x).localeCompare(String(y)); return v.sort.dir === 'desc' ? -c : c; }); }
  else rows.sort((a, b) => a.ts - b.ts);
  return rows;
}
function dbHTML(db, ed) {
  const v = curView(db), rows = viewRows(db, v), props = db.db.props;
  const bar = `<div class="dbbar"><div class="tabs">${db.db.views.map(x => `<button class="tab ${x.id === v.id ? 'on' : ''}" data-act="dbView" data-id="${db.id}" data-v="${x.id}">${IC[{ table: 'table', board: 'db', cal: 'cal', gallery: 'page' }[x.type]]} ${esc(x.name)}</button>`).join('')}${ed ? `<button class="tab" data-act="dbViewNew" data-id="${db.id}">${IC.plus} View</button>` : ''}</div>
    <div class="row nowrap"><input class="in sm" id="dbq" data-q="dq" placeholder="Search" value="${esc(ses.p.dq || '')}" style="max-width:180px">${ed ? `<button class="iconbtn sm" data-act="dbViewSet" data-id="${db.id}" aria-label="View settings">${IC.cog}</button><button class="btn sm" data-act="dbRowNew" data-id="${db.id}">${IC.plus} New</button>` : ''}</div></div>
    ${v.filter && v.filter.p ? `<span class="tiny">Filtered: ${esc(props.find(x => x.id === v.filter.p)?.name || '')} is ${esc(v.filter.v)}</span>` : ''}`;
  let body = '';
  if (v.type === 'board') { const g = props.find(x => x.id === v.group) || props.find(x => x.type === 'status' || x.type === 'select');
    if (!g) body = '<div class="empty small">Add a Select or Status property to group the board by.</div>';
    else { const cols = [...g.opts.map(o => o.v), '']; body = `<div class="board">${cols.map(cv => { const it = rows.filter(r => (r.props[g.id] || '') === cv); if (!cv && !it.length) return ''; return `<div class="bcol" data-drop="${db.id}|${g.id}|${esc(cv)}"><div class="bhead">${cv ? pill(g, cv) : '<span class="opt">No ' + esc(g.name.toLowerCase()) + '</span>'}<span class="tiny num">${it.length}</span></div>
      ${it.map(r => `<div class="bcard" draggable="${ed}" data-drag="${r.id}" data-go="page" data-p="${P({ id: r.id, _back: 'page', _backP: { id: db.id } })}"><b>${esc(pgTitle(r))}</b>${props.filter(x => x.id !== g.id && x.type !== 'title' && r.props[x.id] != null && r.props[x.id] !== '').slice(0, 3).map(x => `<span class="tiny">${['select', 'status', 'check'].includes(x.type) ? '' : esc(x.name) + ': '}${cellText(x, r)}</span>`).join('')}</div>`).join('')}
      ${ed ? `<button class="bnew" data-act="dbRowNew" data-id="${db.id}" data-gp="${g.id}" data-gv="${esc(cv)}">${IC.plus} New</button>` : ''}</div>`; }).join('')}</div>`; } }
  else if (v.type === 'cal') { const dp = props.find(x => x.id === v.date) || props.find(x => x.type === 'date');
    if (!dp) body = '<div class="empty small">Add a Date property to use the calendar.</div>';
    else { const m = ses.p.cm || today().slice(0, 7), d1 = m + '-01', start = mondayOf(d1), ml = new Date(+m.slice(0, 4), +m.slice(5, 7), 0).getDate(), cells = Math.ceil((daysBetween(start, d1) + ml) / 7) * 7, mm = (k) => { const d = new Date(+m.slice(0, 4), +m.slice(5, 7) - 1 + k, 1); return iso(d).slice(0, 7); };
      body = `<div class="row between"><button class="iconbtn sm" data-act="setP" data-k="cm" data-v="${mm(-1)}" aria-label="Previous month">${IC.back}</button><b>${D(d1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</b><button class="iconbtn sm" data-act="setP" data-k="cm" data-v="${mm(1)}" aria-label="Next month">${IC.fwd}</button></div>
      <div class="calg"><div class="calh">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(x => `<span>${x}</span>`).join('')}</div><div class="calb">${[...Array(cells)].map((_, i) => { const d = addDays(start, i), it = rows.filter(r => r.props[dp.id] === d);
        return `<div class="calc ${d.slice(0, 7) !== m ? 'out' : ''} ${d === today() ? 'now' : ''}"><div class="row between"><span class="tiny num">${+d.slice(8)}</span>${ed ? `<button class="calplus" data-act="dbRowNew" data-id="${db.id}" data-dp="${dp.id}" data-dv="${d}" aria-label="New on ${fmt(d)}">${IC.plus}</button>` : ''}</div>${it.map(r => `<button class="calit" data-go="page" data-p="${P({ id: r.id, _back: 'page', _backP: { id: db.id } })}">${esc(pgTitle(r))}</button>`).join('')}</div>`; }).join('')}</div></div>
      ${rows.filter(r => !r.props[dp.id]).length ? `<span class="tiny">${rows.filter(r => !r.props[dp.id]).length} with no ${esc(dp.name.toLowerCase())} set</span>` : ''}`; } }
  else if (v.type === 'gallery') body = `<div class="grid">${rows.map(r => `<button class="card tap" data-go="page" data-p="${P({ id: r.id, _back: 'page', _backP: { id: db.id } })}"><b>${esc(pgTitle(r))}</b>${props.filter(x => x.type !== 'title' && r.props[x.id]).map(x => `<span class="tiny">${esc(x.name)}: ${cellText(x, r)}</span>`).join('')}<span class="tiny trunc">${esc((r.blocks || []).map(b => b.x).join(' ').slice(0, 90))}</span></button>`).join('') || '<div class="empty small">No rows yet.</div>'}</div>`;
  else body = `<div class="scroll dbtwrap"><table class="dbt"><thead><tr>${props.map(pr => `<th>${ed ? `<button data-act="dbPropSheet" data-id="${db.id}" data-p="${pr.id}">${esc(pr.name)}</button>` : esc(pr.name)}</th>`).join('')}${ed ? `<th><button data-act="dbPropSheet" data-id="${db.id}" aria-label="Add property">${IC.plus}</button></th>` : ''}</tr></thead>
    <tbody>${rows.map(r => `<tr>${props.map(pr => `<td class="${pr.type === 'title' ? 'tcell' : ''}">${cellHTML(db, r, pr, ed)}</td>`).join('')}${ed ? '<td></td>' : ''}</tr>`).join('')}</tbody></table>${!rows.length ? '<div class="empty small">No rows yet.</div>' : ''}</div>${ed ? `<button class="addblk" data-act="dbRowNew" data-id="${db.id}">${IC.plus} New row</button>` : ''}`;
  return `<section class="dbwrap">${bar}${body}</section>`;
}

/* ---------- sheets ---------- */
Object.assign(SHEETS, {
  wsTpl: () => openSheet(`${sheetHead('Workspace', 'Start something new')}<div class="stack-sm">${TEMPLATES.map(([k, n, d, i]) => `<button class="li tap tplrow" data-act="wsTpl" data-k="${k}"><span class="pgicon sm">${IC[i]}</span><span class="grow"><b style="display:block">${n}</b><span class="tiny">${d}</span></span>${IC.fwd}</button>`).join('')}</div>`),
  pgMenu: el => { const p = pgById(el.dataset.id); openSheet(`${sheetHead(pgTitle(p), 'Page options')}<div class="stack-sm">
    <div class="eyebrow">Cover</div><div class="row">${COVERS.map(c => `<button class="swatch ${p.cover === c ? 'on' : ''}" style="background:${c || 'var(--card-2)'}" data-act="pgCover" data-id="${p.id}" data-v="${c}" aria-label="${c ? 'Cover colour' : 'No cover'}">${c ? '' : IC.x}</button>`).join('')}</div>
    <button class="btn ghost" data-act="pgDup" data-id="${p.id}">${IC.copy} Duplicate</button>
    <button class="btn ghost" data-act="pgMoveSheet" data-id="${p.id}">${IC.fwd} Move to…</button>
    ${p.rowOf ? '' : `<button class="btn ghost" data-act="pgTpl" data-id="${p.id}">${IC.star} ${p.tpl ? 'Stop using as a template' : 'Save as a template'}</button>`}
    ${p.kind === 'db' ? '' : `<button class="btn ghost" data-act="pgCopyText" data-id="${p.id}">${IC.copy} Copy as text</button>`}
    <button class="btn danger" data-act="pgTrash" data-id="${p.id}">${IC.trash} Move to trash</button></div>`); },
  pgShare: el => { const p = pgById(el.dataset.id), all = p.share === 'all';
    openSheet(`${sheetHead(pgTitle(p), 'Share with clients')}<p class="small sub">Clients see shared pages (and everything inside them) under <b>Your roadmap</b> in their app. They can read and tick to-dos, not edit.</p>
      <button class="check ${all ? 'on' : ''}" data-act="pgShare" data-id="${p.id}" data-c="all"><span class="box">${all ? IC.tick : ''}</span><span class="grow"><b>All clients</b></span></button>
      <div class="stack-sm">${DB.active().map(c => { const on = !all && (p.share || []).includes(c.id); return `<button class="check ${on ? 'on' : ''}" data-act="pgShare" data-id="${p.id}" data-c="${c.id}" ${all ? 'disabled' : ''}><span class="box">${on ? IC.tick : ''}</span><span class="grow">${esc(c.name)}</span></button>`; }).join('')}</div>`); },
  pgIcon: el => { const p = pgById(el.dataset.id); openSheet(`${sheetHead(pgTitle(p), 'Icon')}<div class="iconpick">${PG_ICONS.map(i => `<button class="${p.icon === i ? 'on' : ''}" data-act="pgIconSet" data-id="${p.id}" data-v="${i}" aria-label="${i}">${IC[i]}</button>`).join('')}</div>`); },
  pgMove: el => { const p = pgById(el.dataset.id), bad = new Set([p.id]); let grew = true; while (grew) { grew = false; S.pages.forEach(x => { if (!bad.has(x.id) && bad.has(x.parent)) { bad.add(x.id); grew = true; } }); }
    const opts = S.pages.filter(x => alive(x) && !x.rowOf && x.kind !== 'db' && !bad.has(x.id));
    openSheet(`${sheetHead(pgTitle(p), 'Move to')}<div class="stack-sm"><button class="li tap tplrow" data-act="pgMove" data-id="${p.id}" data-to="">${IC.home}<span class="grow">Top level</span></button>${opts.map(x => `<button class="li tap tplrow" data-act="pgMove" data-id="${p.id}" data-to="${x.id}">${pgIcon(x, 'sm')}<span class="grow trunc">${esc(pgTitle(x))}</span></button>`).join('')}</div>`); },
  blkMenu: el => { const p = pgById(el.dataset.pid), b = blkOf(p, el.dataset.bid), i = p.blocks.indexOf(b);
    openSheet(`${sheetHead(BT.find(x => x[0] === b.t)?.[1] || 'Block', 'Block options')}
      ${TEXTY.includes(b.t) ? `<div class="eyebrow">Turn into</div><div class="tabs wrap">${BT.filter(x => TEXTY.includes(x[0])).map(x => `<button class="tab ${b.t === x[0] ? 'on' : ''}" data-act="blkTurn" data-pid="${p.id}" data-bid="${b.id}" data-t="${x[0]}">${x[1]}</button>`).join('')}</div>
      <div class="eyebrow">Colour</div><div class="tabs wrap">${TXT_C.map(([k, l]) => `<button class="tab ${(b.col || '') === k ? 'on' : ''} tc-${k}" data-act="blkCol" data-pid="${p.id}" data-bid="${b.id}" data-v="${k}">${l}</button>`).join('')}</div>` : ''}
      <div class="row"><button class="btn ghost sm" data-act="blkMove" data-pid="${p.id}" data-bid="${b.id}" data-v="-1" ${i === 0 ? 'disabled' : ''}>${IC.up} Move up</button><button class="btn ghost sm" data-act="blkMove" data-pid="${p.id}" data-bid="${b.id}" data-v="1" ${i === p.blocks.length - 1 ? 'disabled' : ''}>${IC.down} Move down</button><button class="btn ghost sm" data-act="blkDup" data-pid="${p.id}" data-bid="${b.id}">${IC.copy} Duplicate</button><button class="btn ghost sm" data-act="blkBelow" data-pid="${p.id}" data-bid="${b.id}">${IC.plus} Block below</button></div>
      <button class="btn danger block" data-act="blkDel" data-pid="${p.id}" data-bid="${b.id}">${IC.trash} Delete block</button>`); },
  dbProp: el => { const db = pgById(el.dataset.id), pr = db.db.props.find(x => x.id === el.dataset.p);
    openSheet(`${sheetHead(pgTitle(db), pr ? 'Edit property' : 'New property')}<form class="stack-sm" data-form="dbProp" data-id="${db.id}" data-p="${pr ? pr.id : ''}"><label class="f">Name<input class="in" name="name" required value="${esc(pr ? pr.name : '')}"></label>
      ${pr && pr.type === 'title' ? '' : `<label class="f">Type<select class="in" name="type">${opt(PROP_TYPES, pr ? pr.type : 'text', t => t)}</select></label><label class="f">Options (for Select and Status, comma separated)<input class="in" name="opts" value="${esc(pr && pr.opts ? pr.opts.map(o => o.v).join(', ') : '')}" placeholder="e.g. To do, Doing, Done"></label>`}
      <button class="btn block" type="submit">Save</button></form>${pr && pr.type !== 'title' ? `<button class="btn danger" data-act="dbPropDel" data-id="${db.id}" data-p="${pr.id}">Delete property</button>` : ''}`); },
  dbViewNew: el => { const db = pgById(el.dataset.id); openSheet(`${sheetHead(pgTitle(db), 'New view')}<form class="stack-sm" data-form="dbViewNew" data-id="${db.id}"><div class="qa">${[['table', 'Table'], ['board', 'Board'], ['cal', 'Calendar'], ['gallery', 'Gallery']].map(([k, l], i) => `<label class="qaopt"><input type="radio" name="type" value="${k}" ${i === 0 ? 'checked' : ''}><span>${IC[{ table: 'table', board: 'db', cal: 'cal', gallery: 'page' }[k]]}${l}</span></label>`).join('')}</div><label class="f">Name<input class="in" name="name" placeholder="e.g. This week"></label><button class="btn block" type="submit">Add view</button></form>`); },
  dbViewSet: el => { const db = pgById(el.dataset.id), v = curView(db), props = db.db.props, sel = props.filter(p => p.type === 'select' || p.type === 'status'), dates = props.filter(p => p.type === 'date'), fp = props.find(x => x.id === v.filter?.p);
    openSheet(`${sheetHead(pgTitle(db), 'View: ' + v.name)}<form class="stack-sm" data-form="dbViewSet" data-id="${db.id}"><label class="f">Name<input class="in" name="name" value="${esc(v.name)}"></label>
      ${v.type === 'board' ? `<label class="f">Group by<select class="in" name="group">${opt(sel, v.group, p => [p.id, p.name])}</select></label>` : ''}${v.type === 'cal' ? `<label class="f">Date property<select class="in" name="date">${opt(dates, v.date, p => [p.id, p.name])}</select></label>` : ''}
      <div class="fields"><label class="f">Sort by<select class="in" name="sp"><option value="">Created</option>${opt(props, v.sort?.p, p => [p.id, p.name])}</select></label><label class="f">Direction<select class="in" name="sd">${opt([['asc', 'Ascending'], ['desc', 'Descending']], v.sort?.dir, x => x)}</select></label></div>
      <div class="fields"><label class="f">Filter: property<select class="in" name="fp"><option value="">No filter</option>${opt(props.filter(p => ['select', 'status', 'check', 'client'].includes(p.type)), v.filter?.p, p => [p.id, p.name])}</select></label><label class="f">is<input class="in" name="fv" list="fvl" value="${esc(v.filter?.v || '')}" placeholder="${fp && fp.type === 'check' ? 'yes or no' : 'value'}"><datalist id="fvl">${props.filter(p => p.opts).flatMap(p => p.opts.map(o => `<option value="${esc(o.v)}">`)).join('')}<option value="yes"><option value="no"></datalist></label></div>
      <button class="btn block" type="submit">Save view</button></form>${db.db.views.length > 1 ? `<button class="btn danger" data-act="dbViewDel" data-id="${db.id}">Delete this view</button>` : ''}`); },
  blkLinkEdit: el => { const p = pgById(el.dataset.pid), b = blkOf(p, el.dataset.bid); openSheet(`${sheetHead('Link', 'Edit link')}<form class="stack-sm" data-form="blkLinkEdit" data-pid="${p.id}" data-bid="${b.id}"><label class="f">Link<input class="in" type="url" name="url" required value="${esc(b.url || '')}"></label><label class="f">Label<input class="in" name="x" value="${esc(b.x || '')}" placeholder="e.g. Squat technique video"></label><button class="btn block" type="submit">Save</button></form>`); },
  wsRoadmap: () => openSheet(`${sheetHead('Client roadmap', 'Who is it for?')}<p class="small sub">Builds their roadmap with a gym blueprint and meal page inside, and shares it with them straight away.</p><div class="stack-sm">${DB.active().map(c => `<button class="li tap tplrow" data-act="wsRoadmapFor" data-c="${c.id}"><div class="avatar">${esc(initials(c.name))}</div><span class="grow">${esc(c.name)}</span>${IC.fwd}</button>`).join('')}</div>`)
});
function dupPage(p, parent, rowOf) { const n = { ...JSON.parse(JSON.stringify(p)), id: uid(), parent, rowOf: rowOf || null, ts: Date.now(), edited: Date.now(), fav: false, tpl: false, share: [] }; n.blocks = (n.blocks || []).map(b => ({ ...b, id: uid() })); S.pages.push(n);
  const map = {}; S.pages.filter(k => k.parent === p.id && !k.rowOf && !k.trashed).forEach(k => { map[k.id] = dupPage(k, n.id).id; }); n.blocks.forEach(b => { if (b.t === 'page' && map[b.pid]) b.pid = map[b.pid]; });
  if (p.kind === 'db') rowsOf(p).forEach(r => dupPage(r, null, n.id)); return n; }
function purge(id) { S.pages.filter(x => x.parent === id || x.rowOf === id).forEach(x => purge(x.id)); const p = pgById(id); (p?.blocks || []).forEach(b => b.img && idb.del(b.img)); S.pages = S.pages.filter(x => x.id !== id); }

Object.assign(ACTS, {
  wsTplSheet: () => SHEETS.wsTpl(),
  wsNewPage: () => { const p = wsNew({ title: '' }); save(); go('page', { id: p.id, _back: 'ws' }); setTimeout(() => $('[data-ptitle]')?.focus(), 30); },
  wsTpl: el => { const k = el.dataset.k; if (k === 'roadmap') return SHEETS.wsRoadmap(); let p;
    if (k === 'leads') p = tplLeads(null); else if (k === 'content') p = tplContent(null); else if (k === 'sop') p = tplSop(null); else if (k === 'journal') p = tplJournal(null); else if (k === 'blankdb') p = wsDb({ title: 'Untitled database', icon: 'db', props: [['Status', 'status', ['To do', 'Doing', 'Done']], ['Date', 'date']], views: [['table', 'Table'], ['board', 'Board', 'Status']] }); else p = wsNew({ title: '' });
    if (k === 'leads' || k === 'content') rowsOf(p).forEach(r => { r.trashed = true; }); S.pages = S.pages.filter(x => !(x.rowOf === p.id && x.trashed));
    save(); closeSheet(); go('page', { id: p.id, _back: 'ws' }); },
  wsRoadmapFor: el => { const c = DB.client(el.dataset.c), p = tplRoadmap(c, null); save(); closeSheet(); toast(`Roadmap made and shared with ${first(c.name)}`); go('page', { id: p.id, _back: 'ws' }); },
  wsUseTpl: el => { const t = pgById(el.dataset.id), n = dupPage(t, null); n.title = t.title + ' (new)'; save(); go('page', { id: n.id, _back: 'ws' }); },
  wsRestore: el => { pgById(el.dataset.id).trashed = false; save(); toast('Restored'); stay({}); },
  wsPurge: el => twoTap(el, 'Tap again', () => { purge(el.dataset.id); save(); stay({}); }),
  pgFav: el => { const p = pgById(el.dataset.id); p.fav = !p.fav; save(); toast(p.fav ? 'Added to favourites' : 'Removed from favourites'); stay({}); },
  pgMenu: el => SHEETS.pgMenu(el), pgShareSheet: el => SHEETS.pgShare(el), pgIconSheet: el => SHEETS.pgIcon(el), pgMoveSheet: el => SHEETS.pgMove(el),
  pgShare: el => { const p = pgById(el.dataset.id), c = el.dataset.c; if (c === 'all') p.share = p.share === 'all' ? [] : 'all'; else { const s = Array.isArray(p.share) ? p.share : []; p.share = s.includes(c) ? s.filter(x => x !== c) : [...s, c]; } touch(p); save(); stay({}); SHEETS.pgShare(el); },
  pgIconSet: el => { const p = pgById(el.dataset.id); p.icon = el.dataset.v; touch(p); save(); closeSheet(); stay({}); },
  pgCover: el => { const p = pgById(el.dataset.id); p.cover = el.dataset.v; touch(p); save(); closeSheet(); stay({}); },
  pgDup: el => { const p = pgById(el.dataset.id), n = dupPage(p, p.parent, p.rowOf); n.title = pgTitle(p) + ' (copy)'; save(); closeSheet(); toast('Duplicated'); go('page', { id: n.id, _back: 'ws' }); },
  pgMove: el => { const p = pgById(el.dataset.id); p.parent = el.dataset.to || null; if (p.rowOf) p.rowOf = null; touch(p); save(); closeSheet(); toast('Moved'); stay({}); },
  pgTpl: el => { const p = pgById(el.dataset.id); p.tpl = !p.tpl; save(); closeSheet(); toast(p.tpl ? 'Saved as a template. Find it under New.' : 'No longer a template'); stay({}); },
  pgTrash: el => twoTap(el, 'Tap again to delete', () => { const p = pgById(el.dataset.id); p.trashed = true; save(); closeSheet(); toast('Moved to trash'); go(p.rowOf ? 'page' : 'ws', p.rowOf ? { id: p.rowOf } : {}); }),
  pgCopyText: async el => { const p = pgById(el.dataset.id); let n = 0; const t = [pgTitle(p), ''].concat(p.blocks.map(b => { n = b.t === 'ol' ? n + 1 : 0; return { h1: '# ', h2: '## ', h3: '### ', ul: '- ', ol: n + '. ', todo: b.ch ? '[x] ' : '[ ] ', quote: '> ', callout: '> ', toggle: '> ' }[b.t] || '' ; }).map((pre, i) => { const b = p.blocks[i]; return b.t === 'div' ? '---' : b.t === 'link' ? (b.url || '') : b.t === 'page' ? pgTitle(pgById(b.pid) || {}) : pre + b.x + (b.t === 'toggle' && b.body ? '\n  ' + b.body : ''); })).join('\n');
    try { await navigator.clipboard.writeText(t); toast('Copied'); } catch (e) { toast('Couldn\'t copy here.'); } closeSheet(); },
  blkMenu: el => SHEETS.blkMenu(el), blkLinkEdit: el => SHEETS.blkLinkEdit(el),
  blkTick: el => { const p = pgById(el.dataset.pid), b = blkOf(p, el.dataset.bid);
    if (ses.role === 'coach' || (Array.isArray(p.share) && p.share.length === 1)) b.ch = !b.ch; else { const t = (p.ticks = p.ticks || {})[ses.clientId] = (p.ticks[ses.clientId] || []); const i = t.indexOf(b.id); if (i >= 0) t.splice(i, 1); else t.push(b.id); }
    save(); const y = window.scrollY; if ($('#pgbody')) { $('#pgbody').innerHTML = blocksHTML(p, canEdit()); window.scrollTo(0, y); } else stay({}); },
  blkToggle: el => { const p = pgById(el.dataset.pid), b = blkOf(p, el.dataset.bid); b.open = !b.open; if (canEdit()) save(); $('#pgbody').innerHTML = blocksHTML(p, canEdit()); },
  blkAddEnd: el => { const p = pgById(el.dataset.id), last = p.blocks[p.blocks.length - 1]; if (last && last.t === 'p' && !last.x) return focusBlock(last.id); const b = B('p'); p.blocks.push(b); touch(p); save(); renderPgBody(p, b.id); },
  blkTurn: el => { const p = pgById(el.dataset.pid), b = blkOf(p, el.dataset.bid); b.t = el.dataset.t; touch(p); save(); closeSheet(); renderPgBody(p, b.id); },
  blkCol: el => { const p = pgById(el.dataset.pid), b = blkOf(p, el.dataset.bid); b.col = el.dataset.v; touch(p); save(); closeSheet(); renderPgBody(p); },
  blkMove: el => { const p = pgById(el.dataset.pid), i = p.blocks.findIndex(b => b.id === el.dataset.bid), j = i + +el.dataset.v; if (j < 0 || j >= p.blocks.length) return; [p.blocks[i], p.blocks[j]] = [p.blocks[j], p.blocks[i]]; touch(p); save(); closeSheet(); renderPgBody(p); },
  blkDup: el => { const p = pgById(el.dataset.pid), i = p.blocks.findIndex(b => b.id === el.dataset.bid), b = { ...p.blocks[i], id: uid() }; if (b.t === 'page') { const sp = pgById(b.pid); if (sp) b.pid = dupPage(sp, p.id).id; } p.blocks.splice(i + 1, 0, b); touch(p); save(); closeSheet(); renderPgBody(p); },
  blkBelow: el => { const p = pgById(el.dataset.pid), i = p.blocks.findIndex(b => b.id === el.dataset.bid), b = B('p'); p.blocks.splice(i + 1, 0, b); touch(p); save(); closeSheet(); renderPgBody(p, b.id); },
  blkDel: el => { const p = pgById(el.dataset.pid), b = blkOf(p, el.dataset.bid); if (b.t === 'page') { const sp = pgById(b.pid); if (sp) sp.trashed = true; } if (b.img) idb.del(b.img); p.blocks = p.blocks.filter(x => x.id !== b.id); if (!p.blocks.length) p.blocks.push(B('p')); touch(p); save(); closeSheet(); renderPgBody(p); },
  slashPick: el => { const p = curPage(), b = p && blkOf(p, SLASH?.bid); if (!b) return slashHide(); applyType(p, b, el.dataset.t); },
  dbView: el => { const db = pgById(el.dataset.id); db.db.cur = el.dataset.v; save(); stay({}); },
  dbViewNew: el => SHEETS.dbViewNew(el), dbViewSet: el => SHEETS.dbViewSet(el), dbPropSheet: el => SHEETS.dbProp(el),
  dbViewDel: el => { const db = pgById(el.dataset.id); db.db.views = db.db.views.filter(v => v.id !== db.db.cur); db.db.cur = db.db.views[0].id; save(); closeSheet(); stay({}); },
  dbPropDel: el => twoTap(el, 'Tap again to delete', () => { const db = pgById(el.dataset.id); db.db.props = db.db.props.filter(p => p.id !== el.dataset.p); rowsOf(db).forEach(r => delete r.props[el.dataset.p]); db.db.views.forEach(v => { if (v.group === el.dataset.p) v.group = null; if (v.date === el.dataset.p) v.date = null; if (v.sort?.p === el.dataset.p) v.sort = null; if (v.filter?.p === el.dataset.p) v.filter = null; }); save(); closeSheet(); stay({}); }),
  dbRowNew: el => { const db = pgById(el.dataset.id), r = wsNew({ title: '', rowOf: db.id }); if (el.dataset.gp) r.props[el.dataset.gp] = el.dataset.gv || ''; if (el.dataset.dp) r.props[el.dataset.dp] = el.dataset.dv; touch(db); save(); const v = curView(db);
    if (v.type === 'table') { stay({}); setTimeout(() => { const ins = document.querySelectorAll(`[data-cell^="${r.id}|title"]`); ins[0]?.focus(); }, 30); } else go('page', { id: r.id, _back: 'page', _backP: { id: db.id } }); }
});
Object.assign(FORMS, {
  blkLink: (f, d) => { const p = pgById(f.dataset.pid), b = blkOf(p, f.dataset.bid); b.url = d.url.trim(); touch(p); save(); renderPgBody(p); },
  blkLinkEdit: (f, d) => { const p = pgById(f.dataset.pid), b = blkOf(p, f.dataset.bid); b.url = d.url.trim(); b.x = d.x.trim(); touch(p); save(); closeSheet(); renderPgBody(p); },
  dbProp: (f, d) => { const db = pgById(f.dataset.id), ex = db.db.props.find(x => x.id === f.dataset.p), opts = (d.opts || '').split(',').map(s => s.trim()).filter(Boolean);
    const keep = o => ({ v: o, c: (ex?.opts || []).find(x => x.v === o)?.c ?? (opts.indexOf(o) % OPT_C.length) });
    if (ex) { ex.name = d.name.trim(); if (ex.type !== 'title') { ex.type = d.type; ex.opts = ['select', 'status'].includes(d.type) ? opts.map(keep) : undefined; } }
    else db.db.props.push({ id: 'p' + uid(), name: d.name.trim(), type: d.type, opts: ['select', 'status'].includes(d.type) ? opts.map(keep) : undefined });
    touch(db); save(); closeSheet(); stay({}); },
  dbViewNew: (f, d) => { const db = pgById(f.dataset.id), sel = db.db.props.find(p => p.type === 'status' || p.type === 'select'), dt = db.db.props.find(p => p.type === 'date'), v = { id: 'v' + uid(), name: d.name.trim() || { table: 'Table', board: 'Board', cal: 'Calendar', gallery: 'Gallery' }[d.type], type: d.type, group: sel?.id || null, date: dt?.id || null, sort: null, filter: null };
    db.db.views.push(v); db.db.cur = v.id; save(); closeSheet(); stay({}); },
  dbViewSet: (f, d) => { const db = pgById(f.dataset.id), v = curView(db); v.name = d.name.trim() || v.name; if (d.group) v.group = d.group; if (d.date) v.date = d.date; v.sort = d.sp ? { p: d.sp, dir: d.sd } : null; v.filter = d.fp && d.fv ? { p: d.fp, v: d.fv.trim() } : null; save(); closeSheet(); stay({}); }
});

/* ---------- editor events ---------- */
document.addEventListener('input', e => { const t = e.target, ds = t.dataset; if (!ds) return;
  if (ds.wsq !== undefined) { WSQ = t.value; clearTimeout(viewWs._t); viewWs._t = setTimeout(() => { stay({}); const el = $('#wsq'); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, 250); return; }
  if (ds.ptitle) { const p = pgById(ds.ptitle); p.title = t.textContent.replace(/\n/g, ' '); touch(p); lazySave(); return; }
  if (ds.btb) { const p = curPage(), b = p && blkOf(p, ds.btb); if (b) { b.body = t.textContent; touch(p); lazySave(); } return; }
  if (ds.bt) { const p = curPage(), b = p && blkOf(p, ds.bt); if (!b) return; b.x = t.textContent; touch(p); lazySave();
    const md = [[/^#\s/, 'h1'], [/^##\s/, 'h2'], [/^###\s/, 'h3'], [/^[-*]\s/, 'ul'], [/^1[.)]\s/, 'ol'], [/^\[\s?\]\s/, 'todo'], [/^>\s/, 'quote'], [/^!\s/, 'callout']];
    if (b.t === 'p' || b.t === 'ul') { for (const [re, ty] of md) { const m = b.x.match(re); if (m && ty !== b.t) { b.x = b.x.slice(m[0].length); b.t = ty; save(); return renderPgBody(p, b.id, 'start'); } } }
    if (b.x === '---' && b.t === 'p') return applyType(p, b, 'div');
    if (b.x.startsWith('/') && !/\s/.test(b.x) && b.x.length < 20) slashShow(t, b); else if (SLASH) slashHide(); return; }
  if (ds.cell) { const [rid, pid] = ds.cell.split('|'), r = pgById(rid); if (!r) return; const v = t.type === 'checkbox' ? t.checked : t.value; if (pid === 'title') r.title = v; else r.props[pid] = t.type === 'number' ? (v === '' ? '' : +v) : v; touch(r); if (r.rowOf) touch(pgById(r.rowOf));
    if (t.tagName === 'SELECT' || t.type === 'checkbox' || t.type === 'date') { save(); if (t.classList.contains('csel')) { const db = pgById(r.rowOf), pr = db.db.props.find(x => x.id === pid), o = optOf(pr, v); t.style.background = v ? OPT_C[o?.c || 0] : ''; t.style.color = v ? OPT_T[o?.c || 0] : ''; } } else lazySave(); return; }
});
document.addEventListener('keydown', e => { const t = e.target; if (!t || !t.dataset) return;
  if (t.dataset.ptitle && e.key === 'Enter') { e.preventDefault(); const p = pgById(t.dataset.ptitle); if (p.kind === 'db') return t.blur(); const f = p.blocks.find(b => TEXTY.includes(b.t)); if (f) focusBlock(f.id, 'start'); else { const b = B('p'); p.blocks.unshift(b); save(); renderPgBody(p, b.id); } return; }
  if (t.dataset.btb && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); document.execCommand('insertText', false, '\n'); return; }
  const id = t.dataset.bt; if (!id) return; const p = curPage(); if (!p) return; const b = blkOf(p, id), i = p.blocks.indexOf(b);
  if (SLASH && SLASH.bid === id) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); SLASH.i = (SLASH.i + (e.key === 'ArrowDown' ? 1 : -1) + SLASH.items.length) % SLASH.items.length; return slashShow(t, b); } if (e.key === 'Enter') { e.preventDefault(); return applyType(p, b, SLASH.items[SLASH.i][0]); } if (e.key === 'Escape') { e.preventDefault(); return slashHide(); } }
  if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); document.execCommand('insertText', false, '\n'); return; }
  if (e.key === 'Enter') { e.preventDefault(); if (b.t === 'img') { const nb = B('p'); p.blocks.splice(i + 1, 0, nb); save(); return renderPgBody(p, nb.id, 'start'); }
    const off = caretOff(t), txt = t.textContent, list = ['ul', 'ol', 'todo'].includes(b.t);
    if (list && !txt) { b.t = 'p'; save(); return renderPgBody(p, b.id, 'start'); }
    b.x = txt.slice(0, off); const nb = B(list ? b.t : 'p', txt.slice(off)); p.blocks.splice(i + 1, 0, nb); touch(p); save(); return renderPgBody(p, nb.id, 'start'); }
  if (e.key === 'Backspace') { const s = getSelection(); if (!s.isCollapsed || caretOff(t) !== 0) return;
    if (b.t !== 'p' && TEXTY.includes(b.t)) { e.preventDefault(); b.t = 'p'; save(); return renderPgBody(p, b.id, 'start'); }
    const prev = p.blocks[i - 1]; if (!prev) return; e.preventDefault();
    if (TEXTY.includes(prev.t)) { const at = prev.x.length; prev.x += t.textContent; p.blocks.splice(i, 1); touch(p); save(); return renderPgBody(p, prev.id, at); }
    if (!t.textContent) { p.blocks.splice(i, 1); touch(p); save(); return renderPgBody(p, prev.id); }
    return; }
  if (e.key === 'ArrowUp' && caretOff(t) === 0) { const prev = p.blocks.slice(0, i).reverse().find(x => TEXTY.includes(x.t)); if (prev) { e.preventDefault(); focusBlock(prev.id); } }
  if (e.key === 'ArrowDown' && caretOff(t) === t.textContent.length) { const nx = p.blocks.slice(i + 1).find(x => TEXTY.includes(x.t)); if (nx) { e.preventDefault(); focusBlock(nx.id, 'start'); } }
});
document.addEventListener('paste', e => { const t = e.target; if (!t || !t.closest) return; const el = t.closest('[data-bt],[data-btb],[data-ptitle]'); if (!el) return; e.preventDefault();
  const txt = (e.clipboardData || window.clipboardData).getData('text/plain') || ''; const p = curPage();
  if (el.dataset.bt && p && txt.includes('\n') && txt.split('\n').filter(Boolean).length > 1) { const b = blkOf(p, el.dataset.bt), i = p.blocks.indexOf(b), lines = txt.split(/\r?\n/).filter(l => l.trim()); const off = caretOff(el), before = b.x.slice(0, off), after = b.x.slice(off);
    b.x = before + lines[0]; const add = lines.slice(1).map(l => { const m = l.match(/^\s*([-*•]|\d+[.)]|\[\s?x?\])\s+/i); return m ? B(/\d/.test(m[1]) ? 'ol' : m[1].startsWith('[') ? 'todo' : 'ul', l.slice(m[0].length)) : B('p', l); }); add[add.length - 1].x += after; p.blocks.splice(i + 1, 0, ...add); touch(p); save(); return renderPgBody(p, add[add.length - 1].id); }
  document.execCommand('insertText', false, el.dataset.ptitle ? txt.replace(/\n/g, ' ') : txt); });
document.addEventListener('focusout', e => { if (e.target?.dataset?.bt && SLASH) setTimeout(() => { if (!document.activeElement?.dataset?.bt) slashHide(); }, 200); });
document.addEventListener('change', e => { const t = e.target; if (t.dataset && t.dataset.blkimg && t.files && t.files[0]) { const p = pgById(t.dataset.pid), b = blkOf(p, t.dataset.blkimg); readImage(t.files[0], 1400, 'image/jpeg', url => { const id = uid(); idb.put(id, url); b.img = id; touch(p); save(); renderPgBody(p); }); } });
/* board drag and drop (desktop) */
document.addEventListener('dragstart', e => { const c = e.target.closest?.('[data-drag]'); if (c) { e.dataTransfer.setData('text/plain', c.dataset.drag); c.classList.add('dragging'); } });
document.addEventListener('dragend', e => e.target.classList?.remove('dragging'));
document.addEventListener('dragover', e => { const col = e.target.closest?.('[data-drop]'); if (col) { e.preventDefault(); col.classList.add('over'); } });
document.addEventListener('dragleave', e => e.target.closest?.('[data-drop]')?.classList.remove('over'));
document.addEventListener('drop', e => { const col = e.target.closest?.('[data-drop]'); if (!col) return; e.preventDefault(); const rid = e.dataTransfer.getData('text/plain'), [, pid, v] = col.dataset.drop.split('|'), r = pgById(rid); if (!r) return; r.props[pid] = v; touch(r); save(); stay({}); });
