"""Serve Syne and DM Sans locally in tests (the test machine can't reach Google
Fonts). Without this the tests use a narrower fallback font and miss text that
doesn't fit on a real phone."""
import os
F = os.path.join(os.path.dirname(__file__), 'fonts')
CSS = ''.join(f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{w};font-display:block;src:url(https://fonts.gstatic.com/local/{f})format('woff2')}}"
              for fam, w, f in [('Syne', 700, 'syne-latin-700-normal.woff2'), ('Syne', 800, 'syne-latin-800-normal.woff2'), ('DM Sans', 400, 'dm-sans-latin-400-normal.woff2'), ('DM Sans', 500, 'dm-sans-latin-500-normal.woff2'), ('DM Sans', 700, 'dm-sans-latin-700-normal.woff2')])
async def use_real_fonts(page):
    await page.route('https://fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    await page.route('https://fonts.gstatic.com/local/**', lambda r: r.fulfill(status=200, content_type='font/woff2', body=open(os.path.join(F, r.request.url.rsplit('/', 1)[1]), 'rb').read()))
