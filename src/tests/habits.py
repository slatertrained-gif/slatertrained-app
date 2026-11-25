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
        await E("ses.role='coach';go('client',{id:S.clients[1].id})")
        lib0=await E("return S.habitLib.length")
        await pg.click('button[data-act=clientHabits]'); await pg.wait_for_timeout(100)
        await pg.click('button[data-act=habitLibPick]'); await pg.click('button[data-act=hlpDay][data-d="6"]'); await pg.click('button[data-act=hlpDay][data-d="0"]')
        await pg.click('button[data-act=hlpCat] >> nth=2'); await pg.click('button[data-act=hlpToggle] >> nth=0'); await pg.wait_for_timeout(100)
        await pg.screenshot(path='/tmp/libpick.png')
        await pg.click('#sheet button[data-act=clientHabits]')
        await pg.fill('form[data-form=chCustom] input[name=label]','No energy drinks before 12'); await pg.click('form[data-form=chCustom] button[data-act=dayPick][data-v=wkd]'); await pg.click('form[data-form=chCustom] button[type=submit]'); await pg.wait_for_timeout(100)
        await pg.fill('form[data-form=chCustom] input[name=label]','Stretch after work'); await pg.check('form[data-form=chCustom] input[name=lib]'); await pg.click('form[data-form=chCustom] button[type=submit]'); await pg.wait_for_timeout(100)
        log.append('client habits: '+str(await E("return S.clients[1].habits.map(h=>h.label+' ['+habitDaysText(h)+']')")))
        log.append('library grew by: '+str(await E("return S.habitLib.length")-lib0)+' '+str(await E("return S.habitLib.map(h=>h.cat+'/'+h.name)")))
        await pg.click('button[data-act=sheetHabitDays][data-back] >> nth=0'); await pg.click('form[data-form=habitDays] button[type=submit]'); await pg.wait_for_timeout(150)
        log.append('back on habits sheet: '+str(await pg.locator('form[data-form=chCustom]').count()))
        await pg.screenshot(path='/tmp/habits.png')
        await b.close()
    print('\n'.join(log)); print('ERR',errs)
asyncio.run(main())
