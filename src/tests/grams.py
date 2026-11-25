import os
APP = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '../../dist/index.html'))
import asyncio
from playwright.async_api import async_playwright
async def main():
    errs=[]
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':390,'height':844},device_scale_factor=2)
        pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.route('https://world.openfoodfacts.org/api/**', lambda r: r.fulfill(status=200, content_type='application/json', headers={'access-control-allow-origin':'*'}, body='{"status":1,"product":{"product_name":"Sardines in Tomato Sauce","brands":"Coop","serving_size":"1 portion (100 g)","serving_quantity":100,"nutriments":{"energy-kcal_100g":163,"proteins_100g":17,"carbohydrates_100g":1,"fat_100g":10,"sugars_100g":1.4,"saturated-fat_100g":2.8,"salt_100g":0.9,"fiber_100g":0}}}'))
        await pg.goto(APP); await pg.wait_for_timeout(700)
        await pg.evaluate("()=>{ses.role='client';ses.clientId=S.clients[0].id;go('fuel');fsStart({tab:'scan',meal:'Breakfast'})}")
        await pg.fill('form[data-form=barcode] input[name=code]','5000128180511'); await pg.click('form[data-form=barcode] button'); await pg.wait_for_timeout(500)
        await pg.click('button[data-act=fdUnit][data-v=g]'); await pg.wait_for_timeout(150)
        await pg.fill('#fdamt','120'); await pg.wait_for_timeout(100)
        print('sum:', await pg.inner_text('#fdsum'), '| tot:', (await pg.inner_text('#fdtot')).replace('\n',' ')[:60])
        await pg.screenshot(path='/tmp/grams.png')
        await pg.click('button[data-act=fdAdd]'); await pg.wait_for_timeout(150)
        print('entry:', await pg.evaluate("()=>{const e=S.food[S.food.length-1];return [e.serving,e.qty,e.kcal,e.p]}"))
        await pg.evaluate("()=>ACTS.editFood({dataset:{id:S.food[S.food.length-1].id}})"); await pg.wait_for_timeout(100)
        await pg.fill('form[data-form=editFood] input[name=grams]','90'); await pg.click('form[data-form=editFood] button[type=submit]'); await pg.wait_for_timeout(100)
        print('edited:', await pg.evaluate("()=>{const e=S.food[S.food.length-1];return [e.serving,e.qty,Math.round(e.kcal*e.qty)]}"))
        # library food with grams in serving text
        await pg.evaluate("()=>fsStart({meal:'Lunch'})"); await pg.fill('#fq','chicken breast'); await pg.wait_for_timeout(150)
        await pg.click('#foodlist button[data-act=fdOpen] >> nth=0'); await pg.wait_for_timeout(100)
        print('library has grams toggle:', await pg.locator('button[data-act=fdUnit]').count(), await pg.evaluate("()=>FD.n.serving"))
        await b.close()
    print('ERR',errs)
asyncio.run(main())
