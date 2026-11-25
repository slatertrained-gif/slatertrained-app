import os
APP = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '../../dist/index.html'))
import asyncio
from playwright.async_api import async_playwright
async def main():
    errs=[]; log=[]
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':1320,'height':900})
        pg.on('pageerror',lambda e: errs.append('PAGEERROR '+str(e)))
        pg.on('console',lambda m: errs.append('CONSOLE '+m.text) if m.type=='error' and 'net::' not in m.text else None)
        await pg.goto(APP); await pg.wait_for_timeout(700)
        E=lambda js: pg.evaluate("()=>{"+js+"}")
        await E("ses.role='coach';go('automations')"); log.append('journey cards: '+str(await pg.locator('textarea[data-autotext]').count()))
        await E("go('ws')"); await pg.click('button[data-act=wsNewPage]'); await pg.wait_for_timeout(200)
        await pg.keyboard.type('Gym SOP'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
        await pg.keyboard.type('# Warm up'); await pg.wait_for_timeout(100)
        await pg.keyboard.press('Enter'); await pg.keyboard.type('[] Foam roll'); await pg.keyboard.press('Enter'); await pg.keyboard.type('Stretch hips'); await pg.keyboard.press('Enter'); await pg.keyboard.press('Enter')
        await pg.keyboard.type('- bullet one'); await pg.keyboard.press('Enter'); await pg.keyboard.type('bullet two')
        await pg.keyboard.press('Enter'); await pg.keyboard.press('Backspace'); await pg.wait_for_timeout(50)
        await pg.keyboard.type('/call'); await pg.wait_for_timeout(150); log.append('slash open: '+str(await pg.locator('#slash').count()))
        await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100); await pg.keyboard.type('Remember water')
        await pg.keyboard.press('Enter'); await pg.keyboard.type('/div'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(100)
        await pg.keyboard.type('Merged'); await pg.keyboard.press('Home'); await pg.keyboard.press('Backspace'); await pg.wait_for_timeout(100)
        log.append('blocks: '+str(await E("const p=S.pages.find(x=>x.title==='Gym SOP');return p.blocks.map(b=>b.t+':'+b.x)")))
        # sub-page via slash
        await pg.keyboard.press('End'); await pg.keyboard.press('Enter'); await pg.keyboard.type('/sub'); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(250)
        log.append('now on: '+str(await E("return [ses.view, (S.pages.find(p=>p.id===ses.p.id)||{}).parent ? 'child' : 'top']")))
        await pg.keyboard.type('Leg day'); await E("back()"); await pg.wait_for_timeout(150)
        log.append('page link block: '+str(await pg.locator('.blkpage').count()))
        # toggle
        await E("const p=S.pages.find(x=>x.title==='Gym SOP');p.blocks.push(B('toggle','More info'));save();stay({})"); await pg.click('button[data-act=blkToggle]'); await pg.wait_for_timeout(100); log.append('toggle body: '+str(await pg.locator('[data-btb]').count()))
        # block menu move & delete
        await pg.hover('.blk >> nth=1'); await pg.click('.blk >> nth=1 >> button.grip'); await pg.click('button[data-act=blkMove][data-v="-1"]'); await pg.wait_for_timeout(100)
        # share with client
        await pg.click('button[data-act=pgShareSheet]'); await pg.click('button[data-act=pgShare] >> nth=1'); await E("closeSheet()")
        # database: leads, table view, edit cell, add prop, add row, view new
        await E("const d=S.pages.find(p=>p.title==='Leads tracker');d.db.cur=d.db.views[1].id;go('page',{id:d.id})"); await pg.wait_for_timeout(150)
        await pg.click('button[data-act=dbRowNew] >> nth=0'); await pg.wait_for_timeout(150); await pg.keyboard.type('New lead Dave')
        await pg.select_option('select[data-cell$="|'+await E("const d=S.pages.find(p=>p.title==='Leads tracker');return propBy(d,'Status').id")+'"] >> nth=-1','Won'); await pg.wait_for_timeout(500)
        log.append('rows: '+str(await E("const d=S.pages.find(p=>p.title==='Leads tracker');return rowsOf(d).map(r=>r.title+'/'+r.props[propBy(d,'Status').id]).slice(-2)")))
        await pg.click('button[data-act=dbPropSheet]:not([data-p])'); await pg.fill('form[data-form=dbProp] input[name=name]','Phone'); await pg.click('form[data-form=dbProp] button[type=submit]'); await pg.wait_for_timeout(100)
        await pg.click('button[data-act=dbViewNew]'); await pg.click('label.qaopt >> nth=3'); await pg.click('form[data-form=dbViewNew] button[type=submit]'); await pg.wait_for_timeout(100)
        await pg.click('button[data-act=dbViewSet]'); await pg.fill('form[data-form=dbViewSet] input[name=fv]','Won'); await pg.select_option('form[data-form=dbViewSet] select[name=fp]', index=1); await pg.click('form[data-form=dbViewSet] button[type=submit]'); await pg.wait_for_timeout(100)
        log.append('gallery cards (filter Won): '+str(await pg.locator('.dbwrap .grid .card').count()))
        # calendar new
        await E("const d=S.pages.find(p=>p.title==='Leads tracker');d.db.cur=d.db.views[2].id;stay({})"); await pg.click('button.calplus >> nth=10'); await pg.wait_for_timeout(150); log.append('cal new -> '+await E("return ses.view"))
        await E("back()")
        # templates
        await E("go('ws')"); await pg.click('button[data-act=wsTpl][data-k=roadmap]'); await pg.click('button[data-act=wsRoadmapFor] >> nth=1'); await pg.wait_for_timeout(150)
        await pg.click('button[data-act=pgMenu]'); await pg.click('button[data-act=pgTpl]'); await pg.wait_for_timeout(100)
        await E("go('ws')"); await pg.fill('#wsq','foam'); await pg.wait_for_timeout(500); log.append('search hits: '+str(await pg.locator('.content .list .li').count()))
        # trash and restore
        await E("WSQ='';const p=S.pages.find(x=>x.title==='Gym SOP');go('page',{id:p.id})"); await pg.click('button[data-act=pgMenu]'); await pg.click('button[data-act=pgTrash]'); await pg.click('button[data-act=pgTrash]'); await pg.wait_for_timeout(100)
        await E("go('wstrash')"); await pg.click('button[data-act=wsRestore] >> nth=0')
        # client sees shared
        await E("ses.role='client';ses.clientId=S.clients[0].id;go('docs')"); log.append('client docs cards: '+str(await pg.locator('.pgcard').count()))
        await pg.click('.pgcard >> nth=0'); await pg.wait_for_timeout(150); await pg.click('button[data-act=blkTick] >> nth=0'); await pg.wait_for_timeout(100)
        log.append('client editable? '+str(await pg.locator('[contenteditable=true]').count())+' ticked: '+str(await pg.locator('.tick.on').count()))
        await E("ses.clientId=S.clients[1].id;go('docs')"); log.append('client2 docs: '+str(await pg.locator('.pgcard').count()))
        await pg.screenshot(path='/tmp/client_docs.png')
        await b.close()
    print('\n'.join(log)); print('ERRORS',len(errs)); [print(' ',e) for e in errs[:30]]
asyncio.run(main())
