#!/usr/bin/env python3
"""Génère une présentation d'exercices (un exercice par diapo, correction sur bouton, stylo)
à partir d'une feuille d'exercices MathsIORI et de sa correction.

Usage :
    python3 outils/generer_exercices.py <sujet.html> <correction.html> <sortie.html>

- La feuille et sa correction doivent avoir leurs exercices dans des <div class="exercice">,
  dans le même ordre, avec un titre <div class="exercice-titre">.
- Le fichier produit est autonome (images intégrées) et marche hors ligne ; il charge
  styles.css et stylo.js de COURSPRESENTATION par chemin relatif.
- À relancer chaque fois que la feuille ou sa correction change.
"""
import sys, os, re, base64, mimetypes, html
from bs4 import BeautifulSoup

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # COURSPRESENTATION


def lire(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def regles_css(css, mots):
    """Règles de premier niveau (hors @media) dont le sélecteur contient un des mots."""
    out, i, n = [], 0, len(css)
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    n = len(css)
    while i < n:
        j = css.find('{', i)
        if j < 0:
            break
        sel = css[i:j].strip()
        depth, k = 1, j + 1
        while k < n and depth:
            if css[k] == '{': depth += 1
            elif css[k] == '}': depth -= 1
            k += 1
        bloc = css[j:k]
        if not sel.startswith('@') and any(m in sel for m in mots):
            out.append(sel + ' ' + bloc)
        i = k
    return '\n'.join(out)


def styles_page(soup):
    """<style> de la page, sans les règles d'impression ni @page."""
    css = '\n'.join(s.get_text() for s in soup.find_all('style'))
    css = re.sub(r'@page\s*\{[^}]*\}', '', css)
    # retire les blocs @media print { ... }
    while True:
        m = re.search(r'@media\s+print\s*\{', css)
        if not m:
            break
        depth, k = 1, m.end()
        while k < len(css) and depth:
            if css[k] == '{': depth += 1
            elif css[k] == '}': depth -= 1
            k += 1
        css = css[:m.start()] + css[k:]
    return css


def limiter_css(css):
    """Ne garde du CSS de la page que ce qui concerne le contenu des exercices :
    les règles de mise en page (body, html, .container, .page, h1, .home-button…) sont
    retirées, et chaque sélecteur est préfixé par .slide pour ne pas toucher à la présentation."""
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    out, i, n = [], 0, len(css)
    while i < n:
        j = css.find('{', i)
        if j < 0:
            break
        sel = css[i:j].strip()
        depth, k = 1, j + 1
        while k < n and depth:
            if css[k] == '{': depth += 1
            elif css[k] == '}': depth -= 1
            k += 1
        bloc = css[j:k]
        i = k
        if sel.startswith('@'):
            if sel.startswith('@media') and 'print' not in sel:
                out.append(sel + ' {' + limiter_css(bloc[1:-1]) + '}')
            elif sel.startswith(('@font-face', '@keyframes')):
                out.append(sel + ' ' + bloc)
            continue
        garde = []
        for x in sel.split(','):
            x = x.strip()
            premier = re.split(r'[\s>+~:]', x, 1)[0]
            if premier in ('html', 'body', '*', ':root', '.container', '.page', 'h1', '.home-button',
                           '.subtitle', '.toolbar', '.lien-corrige', '.content', '.controls') or x.startswith(':root'):
                continue
            garde.append('.slide ' + x)
        if garde:
            out.append(', '.join(garde) + ' ' + bloc)
    return '\n'.join(out)


def integrer_images(bloc, dossier):
    for img in bloc.find_all('img'):
        src = img.get('src', '')
        if not src or src.startswith('data:') or re.match(r'https?:', src):
            continue
        chemin = os.path.normpath(os.path.join(dossier, src))
        if os.path.exists(chemin):
            mime = mimetypes.guess_type(chemin)[0] or 'image/png'
            with open(chemin, 'rb') as f:
                img['src'] = 'data:%s;base64,%s' % (mime, base64.b64encode(f.read()).decode())


RE_TITRE = re.compile(r'^\s*exercice\s*(\d+)', re.I)
A_RETIRER = ['.home-button', '.lien-corrige', 'script', 'button', '.no-print', '.toolbar']


def est_titre(el):
    if not getattr(el, 'name', None):
        return False
    if 'exercice-titre' in (el.get('class') or []):
        return True
    return el.name in ('h2', 'h3', 'h4') and bool(RE_TITRE.match(el.get_text(' ', strip=True)))


def contient_titre(el):
    return getattr(el, 'name', None) and (est_titre(el) or any(est_titre(d) for d in el.find_all(True)))


def exercices(chemin):
    """Découpe une feuille en exercices. Reconnaît :
    - <div class="exercice"> avec <div class="exercice-titre"> ou un <h2> « Exercice N » dedans ;
    - un bloc quelconque (div.bloc…) qui ne contient qu'un titre « Exercice N » ;
    - un titre « Exercice N » suivi de ses éléments frères, jusqu'au titre suivant.
    Ce qui précède le premier exercice (figure commune…) est renvoyé à part (préambule).
    Renvoie (soup, titre_page, préambule_html, [(numéro, titre, html), ...])."""
    soup = BeautifulSoup(lire(chemin), 'html.parser')
    sous_titre = soup.select_one('.subtitle')
    sous_titre = sous_titre.get_text(' ', strip=True) if sous_titre else ''
    for sel in A_RETIRER + ['.subtitle']:
        for el in soup.select(sel):
            el.decompose()
    integrer_images(soup, os.path.dirname(chemin))
    titres = [t for t in soup.find_all(True) if est_titre(t)]
    # un titre dans un titre (h2 dans .exercice-titre…) : garder l'extérieur
    titres = [t for t in titres if not any(est_titre(p) for p in t.parents)]
    def nb_titres(el):
        return sum(1 for d in el.find_all(True) if est_titre(d) and not any(est_titre(q) for q in d.parents))

    # 1er passage (arbre intact) : le bloc de chaque exercice
    blocs = []
    for t in titres:
        bloc, p = None, t.parent
        while p is not None and p.name not in ('body', '[document]') and nb_titres(p) == 1:
            bloc, p = p, p.parent
        blocs.append(bloc)
    # préambule : ce qui précède le premier exercice, à son niveau (figure commune…)
    preambule = ''
    if titres:
        ancre = blocs[0] or titres[0]
        avant = []
        for fr in ancre.previous_siblings:
            if getattr(fr, 'name', None) in ('h1', 'style', 'link', 'meta', 'title', 'header'):
                break
            if getattr(fr, 'name', None) and fr.get_text(strip=True) or getattr(fr, 'name', None) in ('svg', 'img', 'figure'):
                avant.insert(0, str(fr))
        preambule = ''.join(avant).strip()
    # 2e passage : contenu de chaque exercice
    res = []
    for t, bloc in zip(titres, blocs):
        num = RE_TITRE.match(t.get_text(' ', strip=True))
        num = int(num.group(1)) if num else len(res) + 1
        titre = t.get_text(' ', strip=True).rstrip(' :')
        if bloc is not None:
            morceaux = [str(c) for c in bloc.contents if c is not t]
        else:
            morceaux = []
            for fr in t.next_siblings:
                if contient_titre(fr):
                    break
                morceaux.append(str(fr))
        res.append((num, titre, ''.join(morceaux).strip()))
    titre_page = soup.h1.get_text(' ', strip=True) if soup.h1 else os.path.basename(chemin)
    if sous_titre:
        titre_page += ' – ' + sous_titre
    return soup, titre_page, preambule, res


def main():
    if len(sys.argv) != 4:
        print(__doc__); sys.exit(1)
    sujet, corr, sortie = map(os.path.abspath, sys.argv[1:])
    s_soup, titre, preambule, ex_s = exercices(sujet)
    c_soup, _, _, ex_c = exercices(corr)
    corr_par_num = {n: h for n, _, h in ex_c}
    if sorted(n for n, _, _ in ex_s) != sorted(n for n, _, _ in ex_c):
        print('Attention : exercices %s dans le sujet, %s dans la correction.' % ([n for n, _, _ in ex_s], [n for n, _, _ in ex_c]))

    mi_css = os.path.join(os.path.dirname(RACINE), 'MathsIORI', 'styles.css')
    css_maths = regles_css(lire(mi_css), ['.frac', '.fraction', '.numerateur', '.denominateur',
                                          '.sqrt', '.angle', '.couleur-speciale']) if os.path.exists(mi_css) else ''
    css_page = limiter_css(styles_page(s_soup)) + '\n' + limiter_css(styles_page(c_soup))

    prof = os.path.relpath(RACINE, os.path.dirname(sortie)).replace(os.sep, '/')

    diapos = []
    menu = []
    for i, (num, t, contenu) in enumerate(ex_s):
        corr_html = corr_par_num.get(num, '<p>Pas de correction pour cet exercice.</p>')
        if preambule:
            contenu = '<div class="preambule">%s</div>' % preambule + contenu
        diapos.append(
            '<div class="slide" data-titre="%s">\n<h2>%s</h2>\n<div class="enonce">%s</div>\n<div class="zone-ecriture"></div>\n'
            '<div class="correction-box" hidden>\n<div class="correction-titre">Correction</div>\n%s\n</div>\n</div>'
            % (html.escape(t, quote=True), html.escape(t), contenu, corr_html))
        menu.append('<button onclick="allerA(%d)">%s</button>' % (i + 1, html.escape(t)))

    page = '''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>%(titre)s</title>
<link rel="stylesheet" href="%(prof)s/styles.css">
<style>
/* --- Règles mathématiques reprises de MathsIORI/styles.css --- */
%(css_maths)s
/* --- Styles propres à la feuille --- */
%(css_page)s
/* --- Présentation des exercices --- */
/* pas d'effet de soulèvement au survol : il faisait trembler le menu des exercices */
button:hover { transform: none !important; }
.container { width: 100%%; height: 100vh; border-radius: 0; }
.content { padding: 12px 30px 16px; }
.controls { padding: 4px 10px; gap: 10px; }
.controls-left, .controls-right { gap: 6px; }
.controls button { padding: 4px 12px; font-size: .85em; border-radius: 7px; }
.controls #styloBar.integre button { width: 26px; height: 26px; font-size: 14px; padding: 0; border-radius: 6px; }
.controls #styloBar.integre .pastille { width: 14px; height: 14px; }
.controls #styloBar.integre .trait { width: 16px; }
.controls #styloBar.integre hr { height: 18px; }
.slide { text-align: left; font-size: 1.05em; }
.slide.titre-feuille { text-align: center; }
.slide.titre-feuille h1 { font-size: 2.2em; margin: 30px 0 10px; }
.slide h2 { font-size: 1.25em; text-decoration: none; color: #c2185b; border-bottom: 3px solid #eba8cc; padding-bottom: 6px; margin: 0 0 14px; text-align: left; }
.enonce, .enonce *, .correction-box, .correction-box * { color: #111; }
.enonce .faux, .correction-box .faux { color: #c0392b; } .enonce .vrai, .correction-box .vrai { color: #1e8449; }
.correction-box .correction-titre { color: #2e7d32; }
.enonce { font-size: .82em; cursor: zoom-in; transition: font-size .2s; }
.enonce.grand { font-size: 1.3em; cursor: zoom-out; }
.enonce .fig svg { width: 300px; }
.enonce.grand .fig svg { width: 560px; }
.fig svg { width: 420px; max-width: 100%%; height: auto; }
.enonce img, .correction-box img { max-width: 100%%; }
.enonce { background: #ffe6f0; border-left: 6px solid #eba8cc; padding: 10px 16px; border-radius: 8px; }
.zone-ecriture { min-height: 300px; margin-top: 12px; border: 2px dashed #ddd; border-radius: 8px; position: relative; }
.zone-ecriture::before { content: 'Zone de correction'; position: absolute; top: 6px; right: 12px; color: #bbb; font-size: .8em; }
.correction-box { scroll-margin-top: 12px; font-size: 40px; background: #e8f5e9; border-left: 6px solid #43a047; padding: 14px 20px; border-radius: 8px; margin-top: 18px; }
.correction-box[hidden] { display: none; }
.correction-titre { font-weight: bold; color: #2e7d32; margin-bottom: 6px; }
.correction-box { overflow-x: auto; }
.correction-box table { font-size: .6em; }
.correction-box svg, .correction-box img { max-width: 100%%; height: auto; }
.enonce p, .correction-box p { margin: 6px 0; }
.liste-ex { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; margin-top: 30px; }
.liste-ex button, #menuEx button { font-size: 1em; }
#btnCorr.ouvert { background: #43a047; }
#menuEx { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: none; align-items: center; justify-content: center; z-index: 3000; }
#menuEx.ouvert { display: flex; }
#menuEx .boite { background: #fff; border-radius: 14px; padding: 20px 26px; display: flex; flex-direction: column; gap: 10px; min-width: 320px; }
</style>
</head>
<body>
<div class="container">
  <div class="content">
    <div class="slide titre-feuille active">
      <h1>%(titre)s</h1>
      <div class="liste-ex">%(menu)s</div>
    </div>
%(diapos)s
  </div>
  <div class="controls">
    <div class="controls-left">
      <button class="btn-menu" onclick="ouvrirMenu()">☰ Exercices</button>
      <button id="btnCorr" onclick="basculerCorrection()">✅ Correction</button>
    </div>
    <div class="progress"><span id="numEx"></span></div>
    <div class="controls-right">
      <button id="prevBtn" onclick="changer(-1)">◀ Précédent</button>
      <button onclick="changer(1)">Suivant ▶</button>
    </div>
  </div>
</div>
<div id="menuEx" onclick="if(event.target===this)fermerMenu()"><div class="boite">%(menu)s<button onclick="fermerMenu()">Fermer</button></div></div>
<script>
var slides = document.querySelectorAll('.slide'), cur = 0;
function afficher(n) {
  cur = Math.max(0, Math.min(slides.length - 1, n));
  slides.forEach(function (s, i) { s.classList.toggle('active', i === cur); });
  document.querySelector('.content').scrollTop = 0;
  majCorr(); ajusterZone();
  document.getElementById('numEx').textContent = cur ? 'Exercice ' + cur + ' / ' + (slides.length - 1) : '';
  document.getElementById('prevBtn').disabled = cur === 0;
}
// La zone d'écriture remplit la place qui reste sous l'énoncé
function ajusterZone() {
  var z = slides[cur].querySelector('.zone-ecriture'); if (!z) return;
  var c = document.querySelector('.content');
  z.style.height = Math.floor(Math.max(300, c.clientHeight - (z.getBoundingClientRect().top - c.getBoundingClientRect().top) - 40)) + 'px';
}
window.addEventListener('resize', ajusterZone);
function changer(d) { afficher(cur + d); }
function allerA(n) { fermerMenu(); afficher(n); }
function boiteCorr() { return slides[cur].querySelector('.correction-box'); }
function majCorr() {
  var b = boiteCorr(), btn = document.getElementById('btnCorr');
  btn.disabled = !b;
  btn.classList.toggle('ouvert', !!b && !b.hidden);
  btn.textContent = (b && !b.hidden) ? '🙈 Masquer la correction' : '✅ Correction';
}
function basculerCorrection() {
  var b = boiteCorr(); if (!b) return;
  b.hidden = !b.hidden; majCorr();
  if (!b.hidden) b.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function ouvrirMenu() { document.getElementById('menuEx').classList.add('ouvert'); }
function fermerMenu() { document.getElementById('menuEx').classList.remove('ouvert'); }
document.querySelectorAll('.enonce').forEach(function (el) {
  el.title = 'Cliquer pour agrandir / réduire';
  el.addEventListener('click', function () { el.classList.toggle('grand'); setTimeout(ajusterZone, 250); });
});
document.addEventListener('keydown', function (e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); changer(1); }
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); changer(-1); }
  else if (e.key === 'c' || e.key === 'C') basculerCorrection();
  else if (e.key === 'm' || e.key === 'M') ouvrirMenu();
  else if (e.key === 'Escape') fermerMenu();
});
afficher(0);
</script>
<script src="%(prof)s/stylo.js"></script>
</body>
</html>
''' % {'titre': html.escape(titre), 'prof': prof, 'css_maths': css_maths, 'css_page': css_page,
       'menu': ''.join(menu), 'diapos': '\n'.join(diapos)}
    os.makedirs(os.path.dirname(sortie), exist_ok=True)
    with open(sortie, 'w', encoding='utf-8') as f:
        f.write(page)
    print('OK : %d exercices -> %s' % (len(ex_s), sortie))


if __name__ == '__main__':
    main()
