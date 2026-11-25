import os
APP = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '../../dist/index.html'))
import asyncio, json, sys
from playwright.async_api import async_playwright
URL = APP
COACH=['dash','packs','cmore','clients','clienttable','mealplans','recipes','challenges','habits','exvideos','ws','wstrash','automations','programmes','foodlib','community','settings','library']
CLIENT=['today','fuel','nutrition','recipes','myplan','grocery','challenges','docs','menu','tools','timer','train','progress','workouts']
async def run(width):
    errs=[]
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':width,'height':900})
        pg.on('pageerror',lambda e: errs.append('PAGEERROR '+str(e)))
        pg.on('console',lambda m: errs.append('CONSOLE '+m.text) if m.type=='error' and 'ERR_FILE_NOT_FOUND' not in m.text and 'net::' not in m.text else None)
        await pg.goto(URL); await pg.wait_for_timeout(800)
        async def check(label):
            r=await pg.evaluate("""()=>{const t=document.body.innerText;return {und:/\\bundefined\\b|\\bNaN\\b|\\[object Object\\]/.test(t)?(t.match(/.{0,40}(undefined|NaN|\\[object Object\\]).{0,40}/)||[''])[0]:'',ov:document.documentElement.scrollWidth>window.innerWidth+1?document.documentElement.scrollWidth:0,empty:!document.querySelector('#app').innerHTML.trim()}}""")
            if r['und'] or r['ov'] or r['empty']: errs.append(f'{label}: {r}')
        # coach
        await pg.evaluate("()=>{ses.role='coach';ses.clientId=null;go('dash')}"); await pg.wait_for_timeout(300)
        for v in COACH:
            await pg.evaluate(f"()=>go('{v}')"); await pg.wait_for_timeout(150); await check('coach:'+v)
        # detail views
        for js,lab in [("go('mealplan',{id:S.mealPlans[0].id})",'mealplan'),("go('mealplan',{id:S.mealPlans[0].id,day:'rest'})",'mealplan-rest'),("go('recipe',{id:S.recipes[0].id})",'recipe'),("go('challenge',{id:S.challenges[0].id})",'challenge'),("go('challenge',{id:S.challenges[1].id})",'challenge2'),("go('nutrition',{cid:S.clients[0].id})",'nutrition-coach'),("go('client',{id:S.clients[0].id,tab:'nutrition'})",'client-nut'),("go('client',{id:S.clients[0].id,tab:'profile'})",'client-prof')]+[(f"go('clienttable',{{tt:'{t}'}})",'ct-'+t) for t in ['summary','training','nutrition','weight','payment','engagement']]:
            await pg.evaluate("()=>"+js); await pg.wait_for_timeout(150); await check('coach:'+lab)
        pages=await pg.evaluate("()=>S.pages.map(p=>p.id)")
        for pid in pages:
            await pg.evaluate(f"()=>go('page',{{id:'{pid}'}})"); await pg.wait_for_timeout(80); await check('page:'+pid)
        # db views
        dbs=await pg.evaluate("()=>S.pages.filter(p=>p.kind==='db').map(p=>[p.id,p.db.views.map(v=>v.id)])")
        for did,vs in dbs:
            for vid in vs:
                await pg.evaluate(f"()=>{{const d=S.pages.find(p=>p.id==='{did}');d.db.cur='{vid}';go('page',{{id:'{did}'}})}}"); await pg.wait_for_timeout(80); await check('db:'+vid)
        # client
        await pg.evaluate("()=>{ses.role='client';ses.clientId=S.clients[0].id;go('today')}"); await pg.wait_for_timeout(300)
        for v in CLIENT:
            await pg.evaluate(f"()=>go('{v}')"); await pg.wait_for_timeout(150); await check('client:'+v)
        await pg.evaluate("()=>go('fuel',{date:addDays(today(),-1)})"); await check('client:fuel-yday')
        sh=await pg.evaluate("()=>S.pages.filter(p=>sharedWith(p,ses.clientId)).map(p=>p.id)")
        for pid in sh:
            await pg.evaluate(f"()=>go('page',{{id:'{pid}'}})"); await pg.wait_for_timeout(80); await check('cpage:'+pid)
        for v in ['nutrition','challenges','docs']:
            await pg.evaluate(f"()=>{{ses.clientId=S.clients[1].id;go('{v}')}}"); await check('client2:'+v)
        await pg.screenshot(path=f'/tmp/last_{width}.png')
        await b.close()
    return errs
async def main():
    for w in [400,1320]:
        e=await run(w); print(w,'errors:',len(e)); [print('  ',x) for x in e[:40]]
asyncio.run(main())
