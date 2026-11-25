import os
APP = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '../../dist/index.html'))
import asyncio
from playwright.async_api import async_playwright
URL = APP
async def main():
    errs=[]; log=[]
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':400,'height':860})
        pg.on('pageerror',lambda e: errs.append('PAGEERROR '+str(e)))
        pg.on('console',lambda m: errs.append('CONSOLE '+m.text) if m.type=='error' and 'net::' not in m.text and 'Failed to fetch' not in m.text else None)
        await pg.goto(URL); await pg.wait_for_timeout(700)
        E=lambda js: pg.evaluate("()=>{"+js+"}")
        await E("ses.role='client';ses.clientId=S.clients[0].id;go('fuel')")
        n0=await E("return S.food.length")
        # food search + add with grams
        await pg.click('button[data-act=fsOpen][data-meal=Lunch]:not([data-tab])')
        await pg.fill('#fq','chicken'); await pg.wait_for_timeout(200)
        await pg.click('#foodlist button[data-act=fdOpen] >> nth=0'); await pg.wait_for_timeout(150)
        await pg.fill('#fdamt','2'); await pg.wait_for_timeout(100)
        tot=await pg.inner_text('#fdtot'); log.append('detail totals: '+tot.replace('\n',' ')[:80])
        await pg.click('button[data-act=fdAdd]'); await pg.wait_for_timeout(200)
        n1=await E("return S.food.length"); log.append(f'food added: {n1-n0}')
        # barcode manual -> offline -> add form
        await pg.click('button[data-act=fsOpen][data-tab=scan] >> nth=0'); await pg.wait_for_timeout(150)
        await pg.fill('form[data-form=barcode] input[name=code]','5012345678900'); await pg.click('form[data-form=barcode] button'); await pg.wait_for_timeout(2500)
        has=await pg.locator('form[data-form=barcodeAdd]').count(); log.append(f'barcode add form shown: {has}')
        if has:
            await pg.fill('form[data-form=barcodeAdd] input[name=name]','Test protein yoghurt'); await pg.fill('form[data-form=barcodeAdd] input[name=brand]','Tesco')
            await pg.fill('form[data-form=barcodeAdd] input[name=g]','200'); await pg.fill('form[data-form=barcodeAdd] input[name=kcal]','60'); await pg.fill('form[data-form=barcodeAdd] input[name=p]','10'); await pg.fill('form[data-form=barcodeAdd] input[name=sug]','4.5'); await pg.fill('form[data-form=barcodeAdd] input[name=salt]','0.1')
            await pg.click('form[data-form=barcodeAdd] button[type=submit]'); await pg.wait_for_timeout(200)
            await pg.click('button[data-act=fdUnit][data-v=g]'); await pg.wait_for_timeout(150)
            await pg.fill('#fdamt','150'); await pg.wait_for_timeout(100)
            log.append('grams detail: '+(await pg.inner_text('#fdtot')).replace('\n',' ')[:90])
            await pg.click('button[data-act=fdAdd]'); await pg.wait_for_timeout(200)
            log.append('last entry: '+str(await E("const e=S.food[S.food.length-1];return [e.name,e.serving,e.kcal,e.p,e.sug,e.qty]")))
            # second lookup should hit cache
            await E("ACTS.fsOpen({dataset:{tab:'scan'}})"); await pg.fill('form[data-form=barcode] input[name=code]','5012345678900'); await pg.click('form[data-form=barcode] button'); await pg.wait_for_timeout(300)
            log.append('cached lookup opens detail: '+str(await pg.locator('#fdtot').count()))
            await E("closeSheet()")
        # edit food, save meal, copy meal
        await E("go('fuel')"); await pg.click('button[data-act=editFood] >> nth=0'); await pg.fill('form[data-form=editFood] input[name=qty]','1.5'); await pg.click('form[data-form=editFood] button[type=submit]'); await pg.wait_for_timeout(150)
        await pg.click('button[data-act=saveMealSheet] >> nth=0'); await pg.fill('form[data-form=saveMeal] input[name=name]','Test meal'); await pg.click('form[data-form=saveMeal] button'); await pg.wait_for_timeout(150)
        log.append('my meals: '+str(await E("return S.myMeals.filter(m=>m.owner===ses.clientId).map(m=>m.name+':'+m.items.length)")))
        await pg.click('button[data-act=copyMealSheet] >> nth=0'); await pg.click('form[data-form=copyMealTo] button'); await pg.wait_for_timeout(150)
        # my meals tab log
        await E("fsStart({tab:'meals',meal:'Snacks'})"); await pg.click('button[data-act=logMyMeal] >> nth=0'); await pg.wait_for_timeout(150)
        # quick add
        await E("fsStart({tab:'quick'})"); await pg.fill('form[data-form=quickFood] input[name=name]','Chippy tea'); await pg.fill('form[data-form=quickFood] input[name=kcal]','1100'); await pg.click('form[data-form=quickFood] button[type=submit]'); await pg.wait_for_timeout(150)
        # planned
        if await pg.locator('button[data-act=logPlanned]').count(): await pg.click('button[data-act=logPlanned] >> nth=0'); log.append('logged planned meal')
        # fasting
        await pg.click('button[data-act=sheetFast]'); await pg.click('button[data-act=fastStart][data-h="16"]'); await pg.wait_for_timeout(100); log.append('fast running: '+str(await pg.locator('#fastclock').count()))
        await pg.click('button[data-act=finishDay]'); await pg.wait_for_timeout(150); log.append('finish sheet: '+(await pg.inner_text('#sheet'))[:160].replace('\n',' | ')); await E("closeSheet()")
        # food note
        await pg.fill('textarea[data-foodnote]','Had a takeaway'); await pg.wait_for_timeout(500)
        # recipe flow
        await E("go('recipes')"); await pg.click('button[data-act=recipeNew]'); await pg.wait_for_timeout(150)
        await pg.fill('input[data-rb=name]','Overnight oats batch'); await pg.click('button[data-act=fsOpen][data-mode=recipe]'); await pg.fill('#fq','oats'); await pg.wait_for_timeout(150); await pg.click('#foodlist button[data-act=fdOpen] >> nth=0'); await pg.fill('#fdamt','4'); await pg.click('button[data-act=fdAdd]'); await pg.wait_for_timeout(150)
        log.append('recipe: '+str(await E("const r=S.recipes[0];return [r.name,r.items.length,recipePer(r).kcal]")))
        await pg.click('button[data-act=recipeLog]'); await pg.click('button[data-act=fdAdd]'); await pg.wait_for_timeout(150)
        # grocery
        await E("go('grocery')"); await pg.click('button[data-act=groTick] >> nth=0'); await pg.wait_for_timeout(100); log.append('grocery ticked: '+str(await pg.locator('.check.on').count()))
        # challenge (client)
        await E("go('challenge',{id:S.challenges[0].id})"); 
        # timer
        await E("go('timer')"); await pg.click('button[data-act=tmPreset][data-k=tabata]'); await pg.click('#tmgo'); await pg.wait_for_timeout(2300); log.append('timer: '+(await pg.inner_text('#tclock')).replace('\n',' ')); await pg.click('#tmgo')
        # coach side
        await E("ses.role='coach';ses.clientId=null;go('mealplans')")
        await pg.click('button[data-act=planNew]'); await pg.wait_for_timeout(150)
        await pg.click('button[data-act=fsOpen][data-mode=plan] >> nth=0'); await pg.fill('#fq','tuna'); await pg.wait_for_timeout(150); await pg.click('#foodlist button[data-act=fdOpen] >> nth=0'); await pg.click('button[data-act=fdAdd]'); await pg.wait_for_timeout(150)
        await pg.click('button[data-act=mpAssign] >> nth=1'); await pg.click('button[data-act=mpCopyDay]')
        log.append('plan: '+str(await E("const p=S.mealPlans[0];return [p.name,p.days.site.Breakfast.length,p.days.rest.Breakfast.length,S.clients.filter(c=>c.mealPlanId===p.id).length]")))
        # challenge create
        await E("go('challenges')"); await pg.click('button[data-act=chEdit]'); await pg.fill('form[data-form=challenge5] input[name=name]','Test step-off'); await pg.click('form[data-form=challenge5] button[type=submit]'); await pg.wait_for_timeout(200)
        log.append('challenges: '+str(await E("return S.challenges.length+' '+S.posts.slice(-1)[0].text.slice(0,40)")))
        # habit assign
        await E("go('habits')"); await pg.click('button[data-act=sheetHabitAssign] >> nth=0'); await pg.click('button[data-act=habitAssign] >> nth=1'); await pg.wait_for_timeout(100); log.append('habits on client2: '+str(await E("return S.clients[1].habits.map(h=>h.label)")))
        await E("closeSheet();go('clienttable')"); await pg.click('button[data-act=sheetTagSet]'); await E("closeSheet()")
        # demo video
        await E("go('exvideos')"); await pg.wait_for_timeout(200)
        # automations render
        await E("go('automations')"); log.append('journey cards: '+str(await pg.locator('textarea[data-autotext]').count()))
        await b.close()
    print('\n'.join(log)); print('ERRORS',len(errs)); [print(' ',e) for e in errs[:30]]
asyncio.run(main())
