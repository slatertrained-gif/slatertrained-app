import os, asyncio, itertools, random
APP = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '../../dist/index.html'))
from playwright.async_api import async_playwright
# The website's calculate(), copied from st-macro-calc.liquid, to check the app gives identical numbers.
WEB = r"""(D)=>{var jobMult={plumber:1.04,sparky:1.02,builder:1.05,roofer:1.07,labourer:1.08,machinist:1.00,plasterer:1.04,scaffolder:1.09,other:1.02};
var act=parseFloat(D.activity),jm=jobMult[D.job]||1.02,stepsM=parseFloat(D.steps)||1.05,bmr=10*D.weight+6.25*D.height-5*D.age+5,tdee=Math.round(bmr*act*jm*stepsM),protein=Math.round(D.weight*2),calories,carbs,fat;
if(D.goal==='cut'){calories=tdee-400;fat=Math.round(D.weight*0.9);}else if(D.goal==='bulk'){calories=tdee+400;fat=Math.round(D.weight*1.0);}else if(D.goal==='recomp'){calories=tdee-150;fat=Math.round(D.weight*0.9);}else{calories=tdee;fat=Math.round(D.weight*1.0);}
carbs=Math.round((calories-protein*4-fat*9)/4);if(carbs<50)carbs=50;var water=act>=1.75?3.5:3.0;return [calories,protein,carbs,fat,water];}"""
async def main():
    errs, log = [], []
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--no-sandbox']); pg = await b.new_page(viewport={'width': 390, 'height': 844})
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(APP); await pg.wait_for_timeout(700)
        random.seed(1); bad = 0; n = 0
        for _ in range(400):
            D = {'weight': round(random.uniform(55, 140), 1), 'height': random.randint(150, 205), 'age': random.randint(16, 70), 'job': random.choice(['plumber','sparky','builder','roofer','labourer','machinist','plasterer','scaffolder','other']), 'activity': random.choice(['1.3','1.4','1.5','1.6','1.7']), 'steps': random.choice(['1.0','1.05','1.1','1.15','1.2']), 'goal': random.choice(['cut','recomp','bulk','maintain'])}
            w = await pg.evaluate(WEB, D); a = await pg.evaluate("D=>{const r=tradieCalc(D);return [r.calories,r.p,r.c,r.f,r.water]}", D); n += 1
            if w != a: bad += 1; log.append(f'MISMATCH {D} web {w} app {a}')
        log.append(f'maths check: {n - bad}/{n} identical to the website')
        # client walks through the wizard
        await pg.evaluate("()=>{ses.role='client';ses.clientId=S.clients[0].id;go('tools')}"); await pg.click('[data-go=calc]'); await pg.wait_for_timeout(150)
        await pg.fill('[data-mc=name]', ''); await pg.click('[data-act=mcNext]'); log.append('empty stats blocked: ' + (await pg.inner_text('.mcerr')))
        await pg.fill('[data-mc=name]', 'Jake'); await pg.fill('[data-mc=age]', '24'); await pg.fill('[data-mc=weightRaw]', '85')
        await pg.click('[data-act=mcUnit][data-v=ft]'); await pg.select_option('[data-mc=ft]', '5'); await pg.select_option('[data-mc=inch]', '10')
        await pg.click('[data-act=mcNext]')
        for k, v in [('job','builder'),('activity','1.5'),('training','4'),('steps','1.1'),('goal','cut'),('diet','average'),('sleep','average'),('struggle','protein')]:
            if k == 'activity':
                await pg.click('[data-act=mcNext]'); await pg.wait_for_timeout(30); log.append('unpicked step blocked: ' + (await pg.inner_text('.mcerr')))
            await pg.click(f'[data-act=mcPick][data-k={k}][data-v="{v}"]'); await pg.click('[data-act=mcNext]'); await pg.wait_for_timeout(30)
        res = await pg.inner_text('.mcres'); log.append('client results: ' + res.replace('\n', ' | ')[:140])
        w = await pg.evaluate(WEB, {'weight': 85, 'height': round(70 * 2.54), 'age': 24, 'job': 'builder', 'activity': '1.5', 'steps': '1.1', 'goal': 'cut'}); log.append(f'website gives: {w}')
        await pg.screenshot(path='/tmp/mcres.png', full_page=False)
        await pg.click('[data-act=mcSend]'); log.append('message sent: ' + (await pg.evaluate("()=>S.messages.filter(m=>m.clientId===ses.clientId).slice(-1)[0].text"))[:120])
        # coach runs it for a client and sets split targets
        await pg.evaluate("()=>{ses.role='coach';ses.clientId=null;go('client',{id:S.clients[1].id,tab:'nutrition'})}"); await pg.wait_for_timeout(100)
        await pg.click('[data-go=calc]'); await pg.wait_for_timeout(100); log.append('coach prefill: ' + str(await pg.evaluate("()=>MC.D.name+' '+MC.D.age+' '+MC.D.weightRaw+' '+MC.D.cm+' '+MC.D.job")))
        await pg.click('[data-act=mcNext]')
        for k, v in [('job','plumber'),('activity','1.5'),('training','3'),('steps','1.1'),('goal','maintain'),('diet','decent'),('sleep','good'),('struggle','time')]:
            if not await pg.locator(f'[data-act=mcPick][data-k={k}].sel').count(): await pg.click(f'[data-act=mcPick][data-k={k}][data-v="{v}"]')
            await pg.click('[data-act=mcNext]'); await pg.wait_for_timeout(30)
        await pg.click('[data-act=mcMode][data-v=split]'); await pg.click('[data-act=mcSet]'); await pg.wait_for_timeout(100)
        log.append('targets set: ' + str(await pg.evaluate("()=>{const c=S.clients[1];return [c.targets.site,c.targets.rest,ses.view]}")))
        log.append('weekly avg check (5 site/2 rest): ' + str(await pg.evaluate("()=>{const c=S.clients[1];return Math.round((5*c.targets.site.kcal+2*c.targets.rest.kcal)/7)+' vs '+MC.res.kcal}")))
        await b.close()
    print('\n'.join(log)); print('ERR', errs)
asyncio.run(main())
