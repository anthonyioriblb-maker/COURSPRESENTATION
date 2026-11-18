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


def exercices(chemin):
    soup = BeautifulSoup(lire(chemin), 'html.parser')
    blocs = soup.select('div.exercice')
    res = []
    for b in blocs:
        integrer_images(b, os.path.dirname(chemin))
        t = b.select_one('.exercice-titre')
        titre = t.get_text(' ', strip=True) if t else ''
        if t:
            t.decompose()
        res.append((titre, b.decode_contents().strip()))
    titre_page = soup.h1.get_text(' ', strip=True) if soup.h1 else os.path.basename(chemin)
    return soup, titre_page, res


def main():
    if len(sys.argv) != 4:
        print(__doc__); sys.exit(1)
    sujet, corr, sortie = map(os.path.abspath, sys.argv[1:])
    s_soup, titre, ex_s = exercices(sujet)
    c_soup, _, ex_c = exercices(corr)
    if len(ex_s) != len(ex_c):
        print('Attention : %d exercices dans le sujet, %d dans la correction.' % (len(ex_s), len(ex_c)))

    mi_css = os.path.join(os.path.dirname(RACINE), 'MathsIORI', 'styles.css')
    css_maths = regles_css(lire(mi_css), ['.frac', '.fraction', '.numerateur', '.denominateur',
                                          '.sqrt', '.angle', '.couleur-speciale']) if os.path.exists(mi_css) else ''
    css_page = styles_page(s_soup) + '\n' + styles_page(c_soup)

    prof = os.path.relpath(RACINE, os.path.dirname(sortie)).replace(os.sep, '/')

    diapos = []
    menu = []
    for i, (t, contenu) in enumerate(ex_s):
        corr_html = ex_c[i][1] if i < len(ex_c) else '<p>Pas de correction.</p>'
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
.slide { text-align: left; font-size: 1.05em; }
.slide.titre-feuille { text-align: center; }
.slide.titre-feuille h1 { font-size: 2.2em; margin: 30px 0 10px; }
.slide h2 { font-size: 1.25em; text-decoration: none; color: #c2185b; border-bottom: 3px solid #eba8cc; padding-bottom: 6px; margin: 0 0 14px; text-align: left; }
.enonce, .enonce *, .correction-box, .correction-box * { color: #111; }
.enonce .faux, .correction-box .faux { color: #c0392b; } .enonce .vrai, .correction-box .vrai { color: #1e8449; }
.correction-box .correction-titre { color: #2e7d32; }
.fig svg { width: 420px; max-width: 100%%; height: auto; }
.enonce img, .correction-box img { max-width: 100%%; }
.enonce { background: #ffe6f0; border-left: 6px solid #eba8cc; padding: 10px 16px; border-radius: 8px; }
.zone-ecriture { height: 62vh; margin-top: 12px; border: 2px dashed #ddd; border-radius: 8px; position: relative; }
.zone-ecriture::before { content: 'Zone de correction'; position: absolute; top: 6px; right: 12px; color: #bbb; font-size: .8em; }
.correction-box { background: #e8f5e9; border-left: 6px solid #43a047; padding: 14px 20px; border-radius: 8px; margin-top: 18px; }
.correction-box[hidden] { display: none; }
.correction-titre { font-weight: bold; color: #2e7d32; margin-bottom: 6px; }
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
  majCorr();
  document.getElementById('numEx').textContent = cur ? 'Exercice ' + cur + ' / ' + (slides.length - 1) : '';
  document.getElementById('prevBtn').disabled = cur === 0;
}
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
