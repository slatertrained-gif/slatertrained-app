import os, asyncio
APP = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '../../dist/index.html'))
from playwright.async_api import async_playwright
async def swipe(cdp, x0, y0, x1, y1, steps=8, ms=160):
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x0, 'y': y0}]})
    for i in range(1, steps + 1):
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x0 + (x1 - x0) * i / steps, 'y': y0 + (y1 - y0) * i / steps}]}); await asyncio.sleep(ms / steps / 1000)
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
async def main():
    errs, log = [], []
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--no-sandbox'])
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e))); cdp = await ctx.new_cdp_session(pg)
        await pg.goto(APP); await pg.wait_for_timeout(700)
        open_ = lambda: pg.locator('#sheet .sheet').count()
        await pg.evaluate("()=>{ses.role='client';ses.clientId=S.clients[0].id;go('fuel');fsStart({tab:'scan'})}"); await pg.wait_for_timeout(300)
        box = await pg.locator('#sheet .sheet').bounding_box()
        await swipe(cdp, 195, box['y'] + 12, 195, box['y'] + 30); await pg.wait_for_timeout(400); log.append(f'small drag keeps scanner open: {await open_()}')
        await swipe(cdp, 195, box['y'] + 12, 195, box['y'] + 300); await pg.wait_for_timeout(400); log.append(f'big swipe down closes scanner: {await open_() == 0}')
        await pg.evaluate("()=>fsStart({tab:'search'})"); await pg.wait_for_timeout(200); box = await pg.locator('#sheet .sheet').bounding_box()
        await swipe(cdp, 195, box['y'] + 400, 195, box['y'] + 700); await pg.wait_for_timeout(400); log.append(f'swipe down from list at top closes: {await open_() == 0}')
        await pg.evaluate("()=>fsStart({tab:'search'})"); await pg.wait_for_timeout(200)
        await pg.evaluate("()=>{document.querySelector('#sheet .sheet').scrollTop=300}"); box = await pg.locator('#sheet .sheet').bounding_box()
        await swipe(cdp, 195, 600, 195, 800); await pg.wait_for_timeout(400); log.append(f'scrolled list: swipe down scrolls, stays open: {await open_()}')
        await swipe(cdp, 195, box['y'] + 10, 195, box['y'] + 320); await pg.wait_for_timeout(400); log.append(f'...but dragging the handle closes it: {await open_() == 0}')
        await pg.evaluate("()=>go('recipes',{_back:'fuel'})"); await pg.wait_for_timeout(200)
        await swipe(cdp, 8, 400, 260, 410); await pg.wait_for_timeout(450); log.append(f'edge swipe goes back: {await pg.evaluate("()=>ses.view")}')
        await pg.evaluate("()=>fsStart({tab:'search'})"); await pg.wait_for_timeout(150); await pg.click('#sheet [data-act=closeSheet] >> nth=-1'); log.append(f'X still closes: {await open_() == 0}')
        await b.close()
    print('\n'.join(log)); print('ERR', errs)
asyncio.run(main())
