# Build a compact mesh pack for the realistic preview from BodyParts3D (CC BY 4.0)
import json, gzip, struct, re, os, ctypes, numpy as np
S = os.path.dirname(os.path.abspath(__file__))
A = json.load(open(f'{S}/human-atlas/public/models/atlas.json'))
chunks = {}
def chunk(i):
    if i not in chunks:
        chunks[i] = gzip.open(f'{S}/human-atlas/public/models/body-{i}.bin.gz').read()
    return chunks[i]

def atlas_mesh(p):
    b = chunk(p['chunk']); n = p['vertexCount']; m = p['indexCount']
    pos = np.frombuffer(b, np.float32, n * 3, p['positions']).reshape(-1, 3).copy()
    idx = np.frombuffer(b, np.uint32, m, p['indices']).copy()
    return pos, idx

lib = ctypes.CDLL(f'{S}/libmeshopt.so')
lib.meshopt_simplify.restype = ctypes.c_size_t
lib.meshopt_simplify.argtypes = [ctypes.c_void_p, ctypes.c_void_p, ctypes.c_size_t, ctypes.c_void_p,
                                 ctypes.c_size_t, ctypes.c_size_t, ctypes.c_size_t, ctypes.c_float,
                                 ctypes.c_uint, ctypes.c_void_p]

def simplify(pos, idx, ratio=0.35, err=0.004):
    pos = np.ascontiguousarray(pos, np.float32); idx = np.ascontiguousarray(idx, np.uint32)
    out = np.zeros_like(idx); e = ctypes.c_float()
    tgt = max(int(len(idx) * ratio) // 3 * 3, 36)
    k = lib.meshopt_simplify(out.ctypes.data, idx.ctypes.data, len(idx), pos.ctypes.data, len(pos), 12,
                             tgt, err, 0, ctypes.byref(e))
    out = out[:k]
    used, inv = np.unique(out, return_inverse=True)
    return pos[used], inv.astype(np.uint32)

def load_obj(path):
    V = []; F = []
    for l in open(path):
        if l.startswith('v '):
            V.append([float(x) for x in l.split()[1:4]])
        elif l.startswith('f '):
            f = [int(x.split('/')[0]) - 1 for x in l.split()[1:]]
            for i in range(1, len(f) - 1):
                F += [f[0], f[i], f[i + 1]]
    V = np.array(V, np.float64)
    # BP3D mm Z-up -> atlas metres Y-up (calibrated on cerebellum/medulla: same mapping as human-atlas)
    P = np.stack([V[:, 0] / 1000, V[:, 2] / 1000 + 0.0781383, -V[:, 1] / 1000 - 0.1], 1).astype(np.float32)
    F = np.array(F, np.uint32)  # (x, z, -y) is a proper rotation: winding unchanged
    # weld duplicate vertices so simplification works
    q = np.round(P * 1e6).astype(np.int64)
    _, first, inv = np.unique(q, axis=0, return_index=True, return_inverse=True)
    return P[first], inv.reshape(-1)[F].astype(np.uint32)

parts = []
def add(name, grp, pos, idx, fma=None):
    tri = idx.reshape(-1, 3); tri = tri[(tri[:, 0] != tri[:, 1]) & (tri[:, 1] != tri[:, 2]) & (tri[:, 0] != tri[:, 2])]
    parts.append(dict(name=name, grp=grp, fma=fma, pos=pos.astype(np.float32), idx=tri.reshape(-1).astype(np.uint32)))

MUSC = r'deltoid|abductor pollicis brevis|opponens pollicis|flexor pollicis brevis|dorsal interossei of|palmar interossei|lumbricals of (left|right) hand|abductor digiti minimi of (left|right) hand|extensor carpi radialis|^(left|right) extensor digitorum$|brachioradialis|extensor carpi ulnaris|flexor carpi ulnaris|biceps brachii|triceps brachii|tibialis anterior|extensor digitorum longus|extensor hallucis longus|gastrocnemius|soleus|rectus femoris|vastus|biceps femoris|semitendinosus|gluteus maximus|platysma'
BRAIN_DEEP = r'thalam|caudate|putamen|pallidus|amygdala|hippocamp|internal capsule|fornix|commissure|corpus callosum|septum|hypothalam|mammillary|geniculate|colliculus|habenula|stria|tuber|lamina|interpeduncular|aqueduct|central canal|white matter'
BONE_EXCL = r'tooth|gingiva|cartilage|disk|fibularis|tibialis|iliotibial|subscapularis|levator|muscle|hyoid'
for p in A['parts']:
    n = p['name']; ln = n.lower(); sysn = p['system']
    if sysn == 'nervous':
        if re.search(r'tentorium|falx|dura', ln):
            continue
        if re.search(r'cerebellum', ln): g = 'cerebellum'
        elif re.search(r'pons|medulla oblongata|midbrain|peduncle', ln): g = 'stem'
        elif re.search(BRAIN_DEEP, ln): g = 'deep'
        elif re.search(r'nerve|chiasm|optic tract|ganglion', ln): g = 'cranial'
        else: g = 'cortex'
        pos, idx = atlas_mesh(p); add(n, g, pos, idx, p['conceptId'])
    elif sysn == 'skeletal' and re.search(r'tibialis anterior|fibularis longus|fibularis brevis', ln):
        pos, idx = atlas_mesh(p); pos, idx = simplify(pos, idx, 0.5, 0.006); add(n, 'muscle', pos, idx, p['conceptId'])
    elif sysn == 'skeletal' and not re.search(BONE_EXCL, ln):
        pos, idx = atlas_mesh(p)
        pos, idx = simplify(pos, idx, 0.3, 0.01)
        add(n, 'bone', pos, idx, p['conceptId'])
    elif sysn == 'cardiac' and re.search(r'ventricle|interventricular foramen|cerebral aqueduct', ln) and p['bounds'][0][1] > 1.4:
        pos, idx = atlas_mesh(p); add(n, 'ventricle', pos, idx, p['conceptId'])
    elif sysn == 'arterial' and p['bounds'][0][1] > 1.42 and re.search(r'cerebral|cerebellar|basilar|carotid|vertebral|communicating|choroidal|callos|frontal|parietal|temporal|angular|calcarine|occipital|insular|sphenoid|opercular|central|precentral|prefrontal|orbitofrontal|pontine|labyrinth', ln):
        pos, idx = atlas_mesh(p); pos, idx = simplify(pos, idx, 0.6, 0.004); add(n, 'artery', pos, idx, p['conceptId'])
    elif sysn == 'muscular' and re.search(MUSC, ln):
        pos, idx = atlas_mesh(p); pos, idx = simplify(pos, idx, 0.5, 0.006); add(n, 'muscle', pos, idx, p['conceptId'])
    elif re.search(r'intervertebral disk of fifth lumbar|intervertebral disk of fourth lumbar', ln):
        pos, idx = atlas_mesh(p); add(n, 'disc', pos, idx, p['conceptId'])
    elif n == 'Skin':
        pos, idx = atlas_mesh(p); pos, idx = simplify(pos, idx, 0.12, 0.02); add(n, 'skin', pos, idx, p['conceptId'])

have = set(p['id'] for p in A['parts'])
atlas_names = set(p['name'].lower() for p in A['parts'])
seen_rep = set(l.split('_')[1] for l in open(f'{S}/ocase_all.txt').read().split('\n') if l and l.split('_')[0] in have)
for line in open(f'{S}/ocase_nerves.txt'):
    line = line.strip()
    if not line: continue
    fj, bp, fma, name = line[:-4].split('_', 3)
    if fj in have or 'plexus of right lateral ventricle' in name or 'pterygoid plexus' in name or 'Caudate' in name:
        continue
    if bp in seen_rep or name.lower() in atlas_names: continue          # same representation duplicated
    seen_rep.add(bp)
    f = f'{S}/obj/{fj}.obj'
    if not os.path.exists(f) or os.path.getsize(f) < 500: continue
    pos, idx = load_obj(f)
    ln = name.lower()
    if 'spinal cord' in ln or 'cauda' in ln: g = 'cord'
    elif re.search(r'cervical nerve|thoracic nerve|brachial|median|ulnar|radial|\baxillary|musculocutaneous|interosseous|digital|pectoral|subscapular|thoracodorsal|long thoracic|subclavian|intercost|phrenic|supraclavicular|auricular nerve$|great auricular|lesser occipital|transverse cervical|ansa', ln) and 'facial' not in ln and 'posterior auricular' not in ln:
        g = 'spinal'
    else: g = 'cranial'
    pos, idx = simplify(pos, idx, 0.3 if g=='cranial' else 0.45, 0.004)
    add(name, g, pos, idx, fma)
    # BodyParts3D models only the LEFT upper-limb / cervical nerves: mirror them to the right side
    if g == 'spinal' and ('left' in ln or 'of radial' in ln or 'median nerve to middle' in ln or 'phrenic' in ln):
        mp = pos.copy(); mp[:, 0] *= -1
        mi = idx.reshape(-1, 3)[:, ::-1].reshape(-1).copy()
        add(name.replace('left', 'right').replace('Left', 'Right') + ' (mirrored)', g, mp, mi, fma)

# pack: uint16 quantised positions (per-part bbox) + uint16 indices
blobs=[]; off=0; man=[]
for p in parts:
    P=p['pos'].astype(np.float64); mn=P.min(0); mx=P.max(0); rng=np.maximum(mx-mn,1e-6)
    q=np.round((P-mn)/rng*65535).astype(np.uint16)
    assert len(P)<65536, p['name']
    pb=q.tobytes(); ib=p['idx'].astype(np.uint16).tobytes()
    c=P.mean(0)
    man.append(dict(n=p['name'],g=p['grp'],f=p['fma'],o=off,v=len(P),i=len(p['idx']),mn=[round(x,6) for x in mn],mx=[round(x,6) for x in mx],c=[round(x,4) for x in c]))
    blobs+=[pb,ib]; off+=len(pb)+len(ib)
os.makedirs(f'{S}/real',exist_ok=True)
open(f'{S}/real/pack.bin','wb').write(b''.join(blobs))
json.dump(man,open(f'{S}/real/pack.json','w'),separators=(',',':'),ensure_ascii=False)
import collections
c=collections.Counter(); v=collections.Counter()
for p in parts: c[p['grp']]+=1; v[p['grp']]+=len(p['idx'])//3
print(dict(c)); print(dict(v)); print('MB',off/1e6)
