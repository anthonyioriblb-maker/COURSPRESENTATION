#!/usr/bin/env python3
"""Génère les présentations de TOUTES les feuilles d'exercices en ligne sur MathsIORI
(chapitres disponibles, exercices actifs, avec leur correction), puis met à jour les liens
« 📝 » des cartes de chapitre dans index.html.

Usage : python3 outils/generer_tous_exercices.py
"""
import os, re, glob, json, subprocess, sys, unicodedata

CP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MI = os.path.join(os.path.dirname(CP), 'MathsIORI')
GEN = os.path.join(CP, 'outils', 'generer_exercices.py')


def slug(t):
    t = unicodedata.normalize('NFKD', t).encode('ascii', 'ignore').decode()
    return re.sub(r'[^A-Za-z0-9]+', '_', t).strip('_')


def liens_index():
    """{(niveau, num): dossier du chapitre} d'après les liens de index.html"""
    s = open(os.path.join(CP, 'index.html'), encoding='utf-8').read()
    out = {}
    for m in re.finditer(r'num:\s*(\d+),\s*titre:\s*"[^"]*",\s*lien:\s*"(\d)/([^/"]+)/', s):
        out[(m.group(2), int(m.group(1)))] = m.group(3)
    return out


def feuilles():
    for n in ['3', '4', '5', '6']:
        f = glob.glob(os.path.join(MI, n + '°', 'classe-*.html'))[0]
        s = open(f, encoding='utf-8').read()
        for m in re.finditer(r'chapitre(\d+):\s*\{(.*?)\n            \}', s, re.S):
            corps = m.group(2)
            if not re.search(r'disponible:\s*true', corps):
                continue
            e = re.search(r'exercices:\s*\{\s*actif:\s*true,\s*items:\s*\[(.*?)\]\s*\}', corps, re.S)
            if not e:
                continue
            items = re.findall(r'titre:\s*"([^"]*)".*?fichier:\s*"([^"]*)"', e.group(1), re.S)
            sujets = [(t, fi) for t, fi in items if 'correction' not in t.lower() and 'correction' not in fi.lower()]
            corrs = [(t, fi) for t, fi in items if (t, fi) not in sujets]
            for t, fi in sujets:
                # la correction : même titre + « correction », sinon celle qui suit le sujet
                c = next((cf for ct, cf in corrs if t.lower() in ct.lower()), None)
                if c is None:
                    i = items.index((t, fi))
                    c = next((cf for ct, cf in items[i + 1:] if (ct, cf) in corrs), None)
                if c and fi.endswith('.html') and c.endswith('.html'):
                    yield n, int(m.group(1)), t, os.path.join(MI, n + '°', fi), os.path.join(MI, n + '°', c)


def main():
    dossiers = liens_index()
    par_chapitre = {}
    for n, k, titre, sujet, corr in feuilles():
        dos = dossiers.get((n, k))
        if not dos:
            print('!! pas de chapitre %s e ch.%d dans index.html : %s' % (n, k, titre)); continue
        nom = os.path.splitext(os.path.basename(sujet))[0]
        if nom.lower() in ('exercice', 'exercices', 'exercice1', 'exercice2', 'exercice3'):
            nom = slug(titre)
        sortie = os.path.join(CP, n, dos, 'exercices', nom + '.html')
        r = subprocess.run([sys.executable, GEN, sujet, corr, sortie], capture_output=True, text=True)
        print('%se ch.%d %-45s %s' % (n, k, titre[:45], (r.stdout + r.stderr).strip().replace(CP + '/', '')))
        if r.returncode == 0:
            par_chapitre.setdefault((n, k), []).append((titre, '%s/%s/exercices/%s.html' % (n, dos, nom)))
    # index.html : clé « exercices » de chaque carte concernée
    p = os.path.join(CP, 'index.html')
    s = open(p, encoding='utf-8').read()
    for (n, k), lst in par_chapitre.items():
        m = re.search(r'(num:\s*%d,\s*titre:\s*"[^"]*",\s*lien:\s*"%s/[^"]*")(,\s*exercices:\s*\[.*?\])?' % (k, n), s, re.S)
        if not m:
            continue
        bloc = ',\n            exercices: [\n' + ',\n'.join(
            '                { titre: %s, lien: %s }' % (json.dumps(t, ensure_ascii=False), json.dumps(l, ensure_ascii=False)) for t, l in lst) + '\n            ]'
        s = s[:m.start()] + m.group(1) + bloc + s[m.end():]
    open(p, 'w', encoding='utf-8').write(s)
    print('index.html mis à jour (%d chapitres)' % len(par_chapitre))


if __name__ == '__main__':
    main()
