import re
def css(f):
    s=open(f).read(); a=s.index('<style>'); b=s.index('</style>'); return s[a+7:b]
def rootvars(f):
    s=open(f).read(); b=s[s.index('</helmet>'):]
    m=re.search(r'<div class="([^"]*)" style="([^"]*)"',b)
    return dict(re.findall(r'(--[\w-]+):\s*([^;]+)',m.group(2)))
D=css('/tmp/res/D-Domain.html'); T=css('/tmp/res/T-Domain.html'); P=css('/tmp/res/P-Domain.html')

def parse(text):
    # returns list of (prelude, body) at top level; body for @media is raw inner text
    out=[];i=0;n=len(text)
    while i<n:
        j=text.find('{',i)
        if j<0: break
        pre=text[i:j].strip()
        depth=1;k=j+1
        while depth and k<n:
            if text[k]=='{': depth+=1
            elif text[k]=='}': depth-=1
            k+=1
        out.append((re.sub(r'/\*.*?\*/','',pre,flags=re.S).strip(),text[j+1:k-1]))
        i=k
    return out
GLOBAL=re.compile(r'^(body|::selection|footer|button,a,img|img$|a$|a:hover|\.nav\b|\.fl\b|\.fl:hover|\.fmail|\.esc\b|\.hline|\.hl-top|\.mjbd|header|\.foot\b|\.scr\b|html|\.pmb|\.pmm|\.pmo|\.wrap\b|\.navy ::selection)')
def keep(sel):
    parts=[p.strip() for p in sel.split(',')]
    return not all(GLOBAL.match(p) for p in parts)
def prefix(sel):
    out=[]
    for p in sel.split(','):
        p=p.strip()
        if GLOBAL.match(p): continue
        if p.startswith(('.shl ','.ctl ')) or p in ('.shl','.ctl'): out.append('.dpg '+p)
        else: out.append('.dpg '+p)
    return ','.join(out)
def emit(rules,indent=''):
    lines=[]
    for pre,body in rules:
        if not pre: continue
        if pre.startswith('@font-face'): continue
        if pre.startswith('@keyframes'): lines.append(indent+pre+'{'+body+'}'); continue
        if pre.startswith('@media'):
            inner=emit(parse(body),indent+'  ')
            if inner: lines.append(indent+pre.replace('600px','640px')+'{\n'+inner+'\n'+indent+'}')
            continue
        if pre.startswith('@font-face') or not keep(pre): continue
        lines.append(indent+prefix(pre)+'{'+body.strip()+'}')
    return '\n'.join(lines)

Dlines=D.split('\n'); Tset=set(T.split('\n'))
d_only=[l for l in Dlines if l not in Tset and not l.startswith('/*') and '.mjbd' not in l]
d_common='\n'.join(l for l in Dlines if l in Tset)
Text='\n'.join(l for l in T.split('\n') if l not in set(Dlines))
Pext='\n'.join(l for l in P.split('\n') if l not in set(Dlines))
rD,rT,rP=rootvars('/tmp/res/D-Domain.html'),rootvars('/tmp/res/T-Domain.html'),rootvars('/tmp/res/P-Domain.html')
skipv=re.compile(r'^--(g[a-z]{1,3}|bd[a-z]?|bds|bdl|pho|pop|poy|pz|pbl|pbg|psb|phh|plh|btc|btl|btr|fcol|fg1|fg2|lkT)$')
keepg={'--g1','--g2'}
def vblock(d): return ';'.join(f'{k}:{v}' for k,v in d.items() if (k in keepg or not skipv.match(k)))
out=['/* ==========================================================================',
' DOMAIN PAGE (/domains/<name>). Generated once from the locked boards D3 / T3 / P3 by tools/gen-domain-css.py,',
' then edited by hand below the "hand-written" line. Everything is scoped to .dpg.',
' ========================================================================== */',
'.dpg{'+vblock(rD)+'}',
'@media (min-width:641px) and (max-width:1024px){.dpg{'+vblock({k:v for k,v in rT.items() if rD.get(k)!=v})+'}}',
'@media (max-width:640px){.dpg{'+vblock({k:v for k,v in rP.items() if rD.get(k)!=v})+'}}',
'/* --- shared (all sizes) --- */',
emit(parse(d_common)),
'/* --- desktop-only refinements (D3 re-lock, 2026-11-20) --- */',
'@media (min-width:1025px){\n'+emit(parse('\n'.join(d_only)),'  ')+'\n}',
'/* --- tablet (T3) --- */',
emit(parse(Text)),
'/* --- phone (P3) --- */',
emit(parse(Pext)),
]
OUT=open(__import__('sys').argv[1] if len(__import__('sys').argv)>1 else 'src/styles/v2-domain.css','w').write(('\n'.join(out)+'\n').replace('/_blob/f6a2fb1dd1dea2f1f820bf8c4fb7ee42','/assets/svg/atom.svg').replace('/_blob/a6944aeb0ae0c00b2c371bbe63ee9e05','/assets/graphics/escrow-mask.png'))
