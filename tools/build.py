import os, shutil, hashlib
S='/tmp/claude-0/-home-claude/3c964dd8-8879-5543-b180-e8a6d4259db9/scratchpad'
R=os.path.dirname(os.path.abspath(__file__))
head=open(f'{R}/src/head.html').read()
js=''.join(open(f'{R}/src/{f}').read()+'\n' for f in ['names.js','nosology.js','micro.js','sims.js','sims2.js','imgdata.js','imaging.js'])
eng=open(f'{R}/src/engine.js').read()
def page(three, orbit, pack):
    return (head + f'\n<script src="{three}"></script>\n<script src="{orbit}"></script>\n'
            f'<script>window.PACK_URL={pack!r};\n{js}</script>\n<script>\n{eng}</script>\n')
CDN3='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
CDNO='https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js'
os.makedirs(f'{R}/dist/artifact',exist_ok=True); os.makedirs(f'{R}/dist/test',exist_ok=True)
open(f'{R}/dist/artifact/index.html','w').write(page(CDN3,CDNO,'pack'))
for f,t in [('pack.bin','pack.wasm'),('pack.json','pack.json')]: shutil.copy(f'{S}/real/{f}',f'{R}/dist/artifact/{t}'); shutil.copy(f'{S}/real/{f}',f'{R}/dist/test/{t}')
t=page('three.min.js','OrbitControls.js','pack')
open(f'{R}/dist/test/index.html','w').write('<!doctype html><html lang="ka"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'+t+'</body></html>')
shutil.copy(f'{S}/three/build/three.min.js',f'{R}/dist/test/'); shutil.copy(f'{S}/three/examples/js/controls/OrbitControls.js',f'{R}/dist/test/')
print('ok', os.path.getsize(f'{R}/dist/artifact/index.html'))
