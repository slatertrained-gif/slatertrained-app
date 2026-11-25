"""Phone-size check, with the real fonts, that text fits inside its button, tile,
pill or heading on every screen and in the main pop-ups."""
import os, sys, asyncio
sys.path.insert(0, os.path.dirname(__file__))
from realfonts import use_real_fonts
APP = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '../../dist/index.html'))
from playwright.async_api import async_playwright
CHECK = r"""() => { const out = [], seen = new Set();
  const els = document.querySelectorAll('#app button, #app .tile, #app .pill, #app h1, #app h2, #app h3, #app .btn, #app .equation div, #sheet .sheet button, #sheet .sheet .tile, #sheet .sheet h2, #sheet .sheet .pill');
  for (const el of els) { if (el.closest('.tabs,.scroll,.board,.mcbar,.fstabs,.dbtwrap,.calg,.crumbs,.tablewrap')) continue; const r = el.getBoundingClientRect(); if (!r.width) continue;
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let bad = false;
    while (w.nextNode()) { const t = w.currentNode; if (!t.textContent.trim() || (t.parentElement && t.parentElement.closest('.trunc'))) continue; const rg = document.createRange(); rg.selectNodeContents(t); for (const q of rg.getClientRects()) { if (q.right > r.right + 1.5 || q.left < r.left - 1.5) bad = true; } }
    if (r.right > innerWidth + 1) bad = true;
    if (bad) { const k = (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 50); if (!seen.has(k)) { seen.add(k); out.push(`"${k}" (${el.className || el.tagName})`); } } }
  return out; }"""
EXTRA = ["fsStart({tab:'scan'})", "fsStart({tab:'search'});FD={n:N({name:'Coop Sardines in Tomato Sauce',serving:'1 portion (100 g)',kcal:163,p:17,c:1,f:10}),amt:120,unit:'g'};fdRender()", "SHEETS.quick&&SHEETS.quick()",
         "MC=null;go('calc',{fresh:1});MC.step=9;stay({})", "MC.D={...MC.D,name:'Rob',age:33,weightRaw:81,cm:180,job:'builder',activity:'1.5',training:'2',steps:'1.1',goal:'cut',diet:'average',sleep:'average',struggle:'consistency'};MC.step=1;ACTS.mcNext();for(let i=0;i<8;i++)ACTS.mcNext();"]
async def main():
    found = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--no-sandbox'])
        for w in [390, 360]:
            pg = await b.new_page(viewport={'width': w, 'height': 844}, is_mobile=True, has_touch=True)
            await use_real_fonts(pg); await pg.goto(APP); await pg.wait_for_timeout(900)
            await pg.evaluate("()=>document.fonts.ready")
            for role in ['client', 'coach']:
                views = await pg.evaluate("r=>{ses.role=r;ses.clientId=r==='client'?S.clients[0].id:null;return Object.keys(VIEWS[r])}", role)
                for v in views:
                    if v in ('entry', 'pin'): continue
                    try: await pg.evaluate(f"()=>{{closeSheet();ses.role='{role}';if('{role}'==='client')ses.clientId=S.clients[0].id;go('{v}',{{id:(S.clients[0]||{{}}).id}})}}")
                    except Exception: continue
                    await pg.wait_for_timeout(40)
                    for x in await pg.evaluate(CHECK): found.setdefault(x, set()).add(f'{role}:{v}@{w}')
                if role == 'client':
                    for js in EXTRA:
                        await pg.evaluate("()=>{ses.role='client';ses.clientId=S.clients[0].id;go('fuel');" + js + "}"); await pg.wait_for_timeout(60)
                        for x in await pg.evaluate(CHECK): found.setdefault(x, set()).add(f'extra:{js[:20]}@{w}')
            await pg.close()
        await b.close()
    for k, v in sorted(found.items()): print(k, '←', ', '.join(sorted(v))[:110])
    print(len(found), 'text overflow issues')
asyncio.run(main())
