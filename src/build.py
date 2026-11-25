"""Build the app.

    python3 src/build.py 5.4

Joins src/base-build4.html (builds 1-4, pulled from the published page) with the
build 5 files in src/v5/, stamps the version under the footer, and writes:
  - index.html at the repo root  (GitHub Pages copy: manifest + service worker)
  - dist/index.html              (copy for the Claude artifact link, no manifest)
  - dist/app.js                  (the script on its own, for `node --check`)
"""
import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
VERSION = sys.argv[1] if len(sys.argv) > 1 else 'dev'
JS = ['09a-nutrition.js', '09b-coach.js', '09c-workspace.js', '09d-todo.js', '09f-exlib.js', '09e-packs.js', '09z-register.js']

s = open(os.path.join(SRC, 'base-build4.html')).read()
css = open(os.path.join(SRC, 'v5', '09-v5.css')).read()
js = ''.join(open(os.path.join(SRC, 'v5', f)).read() for f in JS)
i = s.find('</style>', 63982) + len('</style>')
s = s[:i] + '\n' + css + s[i:]
j = s.rfind('</script>')
s = s[:j] + js + '\n' + s[j:]

old = '<span class="st-mark">SLATER<b>TRAINED</b></span><i></i></div>`'
assert old in s
s = s.replace(old, f'<span class="st-mark">SLATER<b>TRAINED</b></span><i></i></div><div class="appver">v{VERSION}</div>`', 1)
s = s.replace('</style>', '.appver{text-align:center;font-size:11px;color:var(--faint);margin:-6px 0 14px;letter-spacing:.04em}</style>', 1)

os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
open(os.path.join(ROOT, 'dist', 'index.html'), 'w').write(s)
k = s.find('<script>', i) + 8
open(os.path.join(ROOT, 'dist', 'app.js'), 'w').write(s[k:s.rfind('</script>')])

p = s.replace('<meta name="theme-color" content="#0B0B0C">', '<meta name="theme-color" content="#0B0B0C"><link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon-192.png">', 1)
reg = "<script>try{if('serviceWorker' in navigator&&location.protocol==='https:'&&window.top===window.self)navigator.serviceWorker.register('sw.js').catch(()=>{})}catch(e){}</script>\n"
b = p.rfind('</body>'); p = p[:b] + reg + p[b:]
open(os.path.join(ROOT, 'index.html'), 'w').write(p)
print(f'built v{VERSION}: index.html {len(p)} bytes')
