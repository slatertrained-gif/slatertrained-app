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
        await pg.goto(APP); await pg.wait_for_timeout(800)
        E=lambda js: pg.evaluate("()=>{"+js+"}")
        log.append('exercises: '+str(await E("return [S.exercises.length, new Set(S.exercises.map(e=>e.id)).size, new Set(S.exercises.map(e=>e.name.toLowerCase())).size]")))
        await E("ses.role='coach';go('library')"); await pg.fill('#lq','incline dumbbell'); await pg.wait_for_timeout(400)
        log.append('search incline dumbbell: '+await pg.inner_text('.content .tiny >> nth=0'))
        await pg.click('button[data-act=exOpen] >> nth=0'); await pg.fill('form[data-form=exEdit] input[name=url]','https://youtu.be/dQw4w9WgXcQ'); await pg.click('form[data-form=exEdit] button[type=submit]'); await pg.wait_for_timeout(150)
        log.append('youtube embed: '+str(await pg.locator('.vidbox iframe').count()))
        await pg.set_input_files('input[data-exvidup]', files=[{'name':'demo.mp4','mimeType':'video/mp4','buffer':b'\x00\x00\x00\x18ftypmp42'+b'\x00'*2000}]); await pg.wait_for_timeout(800)
        log.append('uploaded vid id: '+str(await E("return !!S.exercises.find(e=>e.vid)"))+' video el: '+str(await pg.locator('#exvid').count()))
        await E("closeSheet()")
        # habit days on client profile
        await E("go('client',{id:S.clients[0].id,tab:'nutrition'})")
        await E("const c=S.clients[0];SHEETS.habitDays({dataset:{c:c.id,h:c.habits[0].id}})"); await pg.click('button[data-act=dayPick][data-v=wkd]'); await pg.click('form[data-form=habitDays] button[type=submit]'); await pg.wait_for_timeout(100)
        log.append('habit days: '+str(await E("const h=S.clients[0].habits[0];return [h.label,h.days,habitDaysText(h)]")))
        log.append('habits on Sat/Mon: '+str(await E("const c=S.clients[0];return [habitsOn(c,'2026-11-28').length,habitsOn(c,'2026-11-30').length]")))
        # pack apply to new client via invite
        await E("go('packs')"); log.append('packs: '+str(await pg.locator('.content .card.tap').count()))
        await pg.click('.content .card.tap >> nth=0'); await pg.wait_for_timeout(100)
        await pg.click('button[data-act=packHabit]:not([data-i])'); await pg.fill('form[data-form=packHabit] input[name=label]','Mobility 10 mins'); await pg.click('button[data-act=dayPick][data-v=wke]'); await pg.click('form[data-form=packHabit] button[type=submit]'); await pg.wait_for_timeout(100)
        await pg.click('button[data-act=packTask]:not([data-i])'); await pg.fill('form[data-form=packTask] input[name=title]','Send me your gym timetable'); await pg.fill('form[data-form=packTask] input[name=dueIn]','3'); await pg.click('form[data-form=packTask] button[type=submit]'); await pg.wait_for_timeout(100)
        # simulate invite form
        await E("FORMS.invite(document.createElement('form'),{name:'Test Lad',email:'t@x.com',phone:'',trade:TRADES[0].name,plan:S.settings.plans[0].id,billing:'Monthly',goal:'cut',units:'kg',start:today(),tags:'',goalWeight:'',sex:'m',age:'',height:'',weight:'',tpl:''})"); await pg.wait_for_timeout(300)
        log.append('pack sheet after invite: '+str(await pg.locator('button[data-act=packApply]').count()))
        await pg.click('button[data-act=packApply] >> nth=0'); await pg.wait_for_timeout(200)
        log.append('applied: '+str(await E("const c=S.clients[S.clients.length-1];return {prog:!!c.programmeId,meal:!!c.mealPlanId,habits:c.habits.map(h=>h.label+':'+habitDaysText(h)),tasks:S.tasks.filter(t=>t.clientId===c.id).map(t=>t.title+(t.due?' due '+t.due:'')),roadmap:S.pages.some(p=>p.share&&p.share[0]===c.id),msg:S.messages.filter(m=>m.clientId===c.id).length}")))
        await E("ses.role='client';ses.clientId=S.clients[S.clients.length-1].id;go('today')"); await pg.wait_for_timeout(200)
        log.append('new client todo: '+str(await pg.locator('.todo').count()))
        await pg.evaluate("()=>document.querySelector('.todocard').scrollIntoView()"); await pg.screenshot(path='/tmp/newclient.png')
        await b.close()
    print('\n'.join(log)); print('ERR',errs)
asyncio.run(main())
