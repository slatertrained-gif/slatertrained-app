"""Phone-size check that every button can actually be tapped: scrolls each one into
view and checks nothing else is sitting on top of it, and that it's big enough."""
import os, asyncio
APP = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '../../dist/index.html'))
from playwright.async_api import async_playwright
CHECK = r"""() => { const out = [];
  const els = [...document.querySelectorAll('#app button, #app a[href], #app [data-go], #app label:has(input[type=file]), #sheet .sheet button, #sheet .sheet label:has(input[type=file])')].filter(e => e.offsetParent !== null || e.getClientRects().length);
  for (const el of els) { el.scrollIntoView({ block: 'center', inline: 'center' }); const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    const cx = Math.min(innerWidth - 2, Math.max(1, r.left + r.width / 2)), cy = Math.min(innerHeight - 2, Math.max(1, r.top + r.height / 2)), hit = document.elementFromPoint(cx, cy);
    const name = (el.innerText || el.getAttribute('aria-label') || el.dataset.act || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    if (hit && !el.contains(hit) && !hit.contains(el)) { const sc = el.closest('.scroll,.tabs,.board,.fstabs,[style*="overflow"]'); if (!sc) out.push(`covered: "${name}" (under ${hit.className || hit.tagName})`); }
    if ((r.height < 30 || r.width < 30) && !el.closest('.dbt,.crumbs,.calc') && !el.classList.contains('grip')) out.push(`small: "${name}" ${Math.round(r.width)}x${Math.round(r.height)}`);
  } return out; }"""
async def main():
    found = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--no-sandbox'])
        pg = await b.new_page(viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True)
        await pg.goto(APP); await pg.wait_for_timeout(700)
        for role in ['client', 'coach']:
            views = await pg.evaluate("r=>{ses.role=r;ses.clientId=r==='client'?S.clients[0].id:null;return Object.keys(VIEWS[r])}", role)
            for v in views:
                if v in ('entry', 'pin', 'session', 'summary', 'wbuild', 'thread', 'client', 'challenge', 'mealplan', 'recipe', 'page', 'pack'): continue
                await pg.evaluate(f"()=>{{closeSheet();ses.role='{role}';if('{role}'==='client')ses.clientId=S.clients[0].id;go('{v}')}}"); await pg.wait_for_timeout(60)
                for x in await pg.evaluate(CHECK): found.setdefault(x, set()).add(f'{role}:{v}')
        await b.close()
    for k, v in sorted(found.items()): print(k, '←', ', '.join(sorted(v))[:120])
    print(len(found), 'issues')
asyncio.run(main())
