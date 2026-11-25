import os
APP = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '../../dist/index.html'))
import asyncio
from playwright.async_api import async_playwright
async def main():
    errs=[]; log=[]
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
        pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto(APP); await pg.wait_for_timeout(700)
        E=lambda js: pg.evaluate("()=>{"+js+"}")
        # coach adds a task to client 0 and client 1
        await E("ses.role='coach';go('client',{id:S.clients[0].id})")
        await pg.click('button[data-act=sheetTask]:not([data-id])')
        await pg.click('button[data-act=taskPreset] >> nth=2')
        await pg.check('input[data-taskrep][value=daily]')
        await pg.check('form[data-form=task] input[name^=c_] >> nth=0')
        await pg.click('form[data-form=task] button[type=submit]'); await pg.wait_for_timeout(150)
        log.append('tasks: '+str(await E("return S.tasks.map(t=>[DB.client(t.clientId).name.split(' ')[0],t.title,repeatText(t)])")))
        # client view
        await E("ses.role='client';ses.clientId=S.clients[0].id;go('today')"); await pg.wait_for_timeout(200)
        log.append('todo items: '+str(await pg.locator('.todo').count())+' count: '+(await pg.inner_text('.todocount')))
        before=await E("return todoItems(me()).map(x=>x.done)")
        await pg.click('.todocard button[data-act=taskTick] >> nth=0'); await pg.wait_for_timeout(100)
        await pg.click('.todocard button[data-act=habit] >> nth=0'); await pg.wait_for_timeout(100)
        log.append('before '+str(before)+' after '+str(await E("return todoItems(me()).map(x=>x.done)")))
        log.append('after ticks: '+(await pg.inner_text('.todocount')))
        await pg.evaluate("()=>document.querySelector('.todocard').scrollIntoView()"); await pg.screenshot(path='/tmp/todo.png')
        # coach sees
        await E("ses.role='coach';go('client',{id:S.clients[0].id})"); log.append('coach card: '+(await pg.inner_text('.card.stripe >> nth=0'))[:160].replace('\n',' | '))
        # edit + delete
        await pg.click('button[data-act=sheetTask][data-id] >> nth=0'); await pg.check('input[data-taskrep][value=days]'); await pg.check('input[name=d6]'); await pg.click('form[data-form=task] button[type=submit]'); await pg.wait_for_timeout(100)
        await pg.click('button[data-act=sheetTask][data-id] >> nth=0'); await pg.click('button[data-act=taskDel]'); await pg.click('button[data-act=taskDel]'); await pg.wait_for_timeout(100)
        log.append('tasks after delete: '+str(await E("return S.tasks.length")))
        await b.close()
    print('\n'.join(log)); print('ERR',errs)
asyncio.run(main())
