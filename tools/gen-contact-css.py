# One-off generator for src/styles/v2-contact.css from the locked contact boards (D4 / T4 / P4), same method as
# tools/gen-domain-css.py. Kept for reference; the CSS file is edited by hand below its "hand-written" line.
import re, sys
exec(open('tools/gen-domain-css.py').read().split("Dlines=D.split")[0].replace("D=css('/tmp/res/D-Domain.html'); T=css('/tmp/res/T-Domain.html'); P=css('/tmp/res/P-Domain.html')", ""))
D = css('/tmp/res/D-Contact.html'); P = css('/tmp/res/P-Contact.html')
Dl = D.split('\n')
cut = [i for i, l in enumerate(Dl) if l.startswith('header.mjnav .hl-top')][0]
shared = '\n'.join(Dl[:cut + 1])
TABLET = '''@media (min-width:641px) and (max-width:1024px){
.toast.tfl{white-space:normal !important;width:330px;max-width:calc(100% - 24px);text-align:left;line-height:1.45;align-items:center}
.ferr2{white-space:normal !important;text-align:center}
.toast{right:24px !important;max-width:calc(100vw - 48px)}
}
@media (min-width:641px) and (max-width:900px){
.duo{grid-template-columns:39% minmax(0,1fr) !important;gap:28px !important}
.silk{margin-left:-32px !important}
.navy{padding:23px !important}
.intro{font-size:17.5px !important}
#ctitle{font-size:46px !important}
.sgrid{grid-template-columns:repeat(3,minmax(0,1fr)) !important;gap:14px !important}
.step h3{white-space:normal !important;font-size:17.5px !important}
.step p{font-size:15.5px !important}
.cards .step{padding:22px 22px !important}
}'''
Pext = '\n'.join(l for l in P.split('\n') if l not in set(Dl))
rP = rootvars('/tmp/res/P-Contact.html'); rD = rootvars('/tmp/res/D-Contact.html')
pv = {k: v for k, v in rP.items() if k in ('--ptt', '--phfs', '--pis', '--pdg', '--pnp', '--pst', '--psl', '--psg', '--pcp', '--psp', '--sns')}
keepD = {k: v for k, v in rD.items() if not re.match(r'^--(g[a-z]{1,4}|cg1|csn)$', k)}
out = ['/* ==========================================================================',
       ' CONTACT PAGE (/contact). Generated once from the locked boards D4 / T4 / P4 by tools/gen-contact-css.py,',
       ' then edited by hand below the "hand-written" line. Everything is scoped to .cpg.',
       ' ========================================================================== */',
       '.cpg{' + ';'.join(f'{k}:{v}' for k, v in keepD.items()) + '}',
       '@media (max-width:640px){.cpg{' + ';'.join(f'{k}:{v}' for k, v in pv.items()) + '}}',
       emit(parse(shared)).replace('.dpg', '.cpg'),
       '/* desktop-only (D4 re-lock): no silk column, step numbers like the landing */',
       '@media (min-width:1025px){\n  .cpg .silk{display:none !important}\n  .cpg .step .snum{font-size:21px !important;color:#7F8BA6 !important}\n}',
       '.cpg .toast-i,.cpg .toast-x{flex:none !important}',
       '.cpg .intro{font-weight:300 !important;-webkit-text-stroke:.25px currentColor;color:#1E1E1C !important}',
       '.cpg .navy{--g1:.18}',
       emit(parse(TABLET)).replace('.dpg', '.cpg'),
       emit(parse(Pext)).replace('.dpg', '.cpg')]
s = '\n'.join(out) + '\n'
s = s.replace('/_blob/f6a2fb1dd1dea2f1f820bf8c4fb7ee42', '/assets/svg/atom.svg').replace('/_blob/a6944aeb0ae0c00b2c371bbe63ee9e05', '/assets/graphics/escrow-mask.png').replace('/_blob/914edb66aa873194bf67068210b405f4', '/assets/graphics/silk.jpg')
open(sys.argv[1] if len(sys.argv) > 1 else 'src/styles/v2-contact.css', 'w').write(s)
