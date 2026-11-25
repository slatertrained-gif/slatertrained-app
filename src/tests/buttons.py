"""Presses every button on every screen (and every button inside the pop-ups those
buttons open) and reports: buttons with no handler, links to screens that don't
exist, forms with no handler, pop-ups with no close button, and any errors."""
import os, sys, json, asyncio
APP = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '../../dist/index.html'))
from playwright.async_api import async_playwright
SKIP = {'logout', 'resetDemo', 'resetAll', 'removeExamples', 'wipe', 'scanLive', 'exitViewAs', 'clearAll', 'restore'}
JS_AUDIT = r"""(skip) => {
  const role = ses.role, bad = [];
  const scan = (root, where) => {
    root.querySelectorAll('[data-act]').forEach(el => { const a = el.dataset.act; if (!ACTS[a]) bad.push(`${where}: button "${(el.innerText||el.getAttribute('aria-label')||'').trim().slice(0,40)}" data-act="${a}" has no handler`); });
    root.querySelectorAll('[data-go]').forEach(el => { const g = el.dataset.go; if (!VIEWS[role][g] && !(VIEWS.common||{})[g]) bad.push(`${where}: link "${(el.innerText||'').trim().slice(0,40)}" goes to missing screen "${g}"`); });
    root.querySelectorAll('form[data-form]').forEach(el => { if (!FORMS[el.dataset.form]) bad.push(`${where}: form "${el.dataset.form}" has no handler`); });
    root.querySelectorAll('form:not([data-form])').forEach(el => bad.push(`${where}: form with no data-form`));
  };
  scan(document.querySelector('#app'), 'screen');
  const sheet = document.querySelector('#sheet .sheet'); if (sheet) { scan(sheet, 'popup'); if (!sheet.querySelector('[data-act=closeSheet]')) bad.push('popup "' + (sheet.querySelector('h2')||{}).textContent + '" has no X button'); }
  return bad;
}"""
FILL_SUBMIT = r"""(spec) => { const [sel, k] = spec.split(' >> '); const f = document.querySelectorAll(sel)[+k]; if (!f) return;
  f.querySelectorAll('input,select,textarea').forEach(i => { if (i.value || i.type === 'hidden' || i.type === 'file') return;
    if (i.type === 'checkbox' || i.type === 'radio') return; if (i.tagName === 'SELECT') { if (i.options.length > 1 && i.required) i.selectedIndex = 1; return; }
    i.value = i.type === 'number' ? '3' : i.type === 'date' ? today() : i.type === 'email' ? 'test@example.com' : i.type === 'url' ? 'https://example.com' : i.type === 'time' ? '09:00' : (i.inputMode === 'numeric' || i.pattern ? '5012345678900' : 'Test'); });
  if (f.querySelector('input[type=radio]') && !f.querySelector('input[type=radio]:checked')) f.querySelector('input[type=radio]').checked = true;
  f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })); }"""
async def main():
    issues, errs, clicks = set(), [], 0
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--no-sandbox'])
        for role, width in [('coach', 1320), ('client', 400)]:
            pg = await b.new_page(viewport={'width': width, 'height': 900})
            cur = {'where': ''}
            pg.on('pageerror', lambda e: errs.append(f"{cur['where']}: {e}"))
            await pg.goto(APP); await pg.wait_for_timeout(700)
            await pg.evaluate("r=>{ses.role=r;ses.clientId=r==='client'?S.clients[0].id:null;go(r==='client'?'today':'dash')}", role)
            views = await pg.evaluate("r=>Object.keys(VIEWS[r])", role)
            params = {'client': {'id': '$C0'}, 'challenge': {'id': '$CH'}, 'mealplan': {'id': '$MP'}, 'recipe': {'id': '$RC'}, 'page': {'id': '$PG'}, 'pack': {'id': '$PK'}, 'nutrition': {'cid': '$C0'}, 'session': {'dayId': '$DAY'}, 'summary': {'id': '$LOG'}, 'wbuild': {'id': '$WB'}, 'thread': {'id': '$C0'}}
            for v in views:
                if v in ('entry', 'pin'): continue
                prm = json.dumps(params.get(v, {}))
                goto = f"""()=>{{closeSheet();const m={{'$C0':S.clients[0].id,'$CH':(S.challenges[0]||{{}}).id,'$MP':(S.mealPlans[0]||{{}}).id,'$RC':(S.recipes[0]||{{}}).id,'$PG':(S.pages.find(p=>!p.trashed&&(ses.role==='coach'||sharedWith(p,ses.clientId)))||{{}}).id,'$PK':(S.packs[0]||{{}}).id,'$DAY':((DB.prog(S.clients[0].programmeId)||{{days:[{{}}]}}).days[0]||{{}}).id,'$LOG':(S.logs.find(l=>l.clientId===S.clients[0].id)||{{}}).id,'$WB':(S.programmes.find(x=>x.isPreset)||{{}}).id}};const p=JSON.parse('{prm}');for(const k in p)p[k]=m[p[k]]||p[k];ses.role='{role}';if('{role}'==='client')ses.clientId=S.clients[0].id;go('{v}',p)}}"""
                cur['where'] = f'{role}:{v}'
                try: await pg.evaluate(goto)
                except Exception as e: errs.append(f'{role}:{v} would not open: {str(e)[:200]}'); continue
                for x in await pg.evaluate(JS_AUDIT, list(SKIP)): issues.add(f'{role}:{v} {x}')
                nf = await pg.evaluate("()=>document.querySelectorAll('#app form[data-form]').length")
                for k in range(nf):
                    await pg.evaluate(goto); cur['where'] = f'{role}:{v} form#{k}'
                    await pg.evaluate(FILL_SUBMIT, f'#app form[data-form] >> {k}'); await pg.wait_for_timeout(30); clicks += 1
                n = await pg.evaluate("()=>document.querySelectorAll('#app [data-act], #app [data-go]').length")
                for i in range(n):
                    await pg.evaluate(goto)
                    info = await pg.evaluate(f"""(skip)=>{{const el=document.querySelectorAll('#app [data-act], #app [data-go]')[{i}]; if(!el) return null; const a=el.dataset.act; if(skip.includes(a)) return 'skip'; el.click(); return a||('go:'+el.dataset.go);}}""", list(SKIP))
                    if not info or info == 'skip': continue
                    clicks += 1; cur['where'] = f'{role}:{v} → {info}'
                    await pg.wait_for_timeout(30)
                    for x in await pg.evaluate(JS_AUDIT, list(SKIP)): issues.add(f'{role}:{v} → {info}: {x}')
                    nf2 = await pg.evaluate("()=>document.querySelectorAll('#sheet form[data-form]').length")
                    for k in range(nf2):
                        if k:
                            await pg.evaluate(goto); await pg.evaluate(f"""()=>{{const el=document.querySelectorAll('#app [data-act], #app [data-go]')[{i}]; el && el.click();}}"""); await pg.wait_for_timeout(20)
                        cur['where'] = f'{role}:{v} → {info} form#{k}'
                        await pg.evaluate(FILL_SUBMIT, f'#sheet form[data-form] >> {k}'); await pg.wait_for_timeout(30); clicks += 1
                    await pg.evaluate(goto); await pg.evaluate(f"""()=>{{const el=document.querySelectorAll('#app [data-act], #app [data-go]')[{i}]; el && el.click();}}"""); await pg.wait_for_timeout(20)
                    # one level into any pop-up that opened
                    m = await pg.evaluate("()=>document.querySelectorAll('#sheet .sheet [data-act]:not([data-act=closeSheet]), #sheet .sheet [data-go]').length")
                    for j in range(min(m, 25)):
                        if j: 
                            await pg.evaluate(goto); await pg.evaluate(f"""()=>{{const el=document.querySelectorAll('#app [data-act], #app [data-go]')[{i}]; el && el.click();}}"""); await pg.wait_for_timeout(20)
                        sub = await pg.evaluate(f"""(skip)=>{{const el=document.querySelectorAll('#sheet .sheet [data-act]:not([data-act=closeSheet]), #sheet .sheet [data-go]')[{j}]; if(!el) return null; const a=el.dataset.act; if(skip.includes(a)) return 'skip'; el.click(); return a||('go:'+el.dataset.go);}}""", list(SKIP))
                        if not sub or sub == 'skip': continue
                        clicks += 1; cur['where'] = f'{role}:{v} → {info} → {sub}'
                        await pg.wait_for_timeout(20)
                        for x in await pg.evaluate(JS_AUDIT, list(SKIP)): issues.add(f'{role}:{v} → {info} → {sub}: {x}')
            await pg.close()
        await b.close()
    print(f'{clicks} buttons pressed'); print(f'{len(issues)} problems:'); [print(' ', x) for x in sorted(issues)]
    print(f'{len(errs)} errors:'); [print(' ', x) for x in sorted(set(errs))[:80]]
asyncio.run(main())
