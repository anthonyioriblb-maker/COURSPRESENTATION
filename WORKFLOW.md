# Workflow — Présentations cours (tous niveaux)

> Fichier de référence opérationnelle. Complète CLAUDE.md (qui reste la règle absolue).
> Dernière mise à jour : 2026-06-30

---

## 0. Avant tout : toujours lire en début de session

1. `COURSPRESENTATION/CLAUDE.md` — règles absolues
2. Ce fichier — workflow et pièges déjà rencontrés
3. Le `cours.html` source du chapitre ciblé
4. (si la présentation existe déjà) l'archiver avant de toucher quoi que ce soit

---

## 1. Chemins des ressources

| Ressource | Chemin |
|---|---|
| Cours source (niveau X, chapitre N) | `MathsIORI/X°/chapitreNN - Nom/cours.html` |
| Images du cours | `MathsIORI/X°/chapitreNN - Nom/images/` |
| Animations iframe du cours | `MathsIORI/X°/chapitreNN - Nom/animations/animation-*.html` |
| Présentation cible | `COURSPRESENTATION/X/ChapitreN_Nom/Chapitre_N_nom_presentation.html` |
| Script JS | `COURSPRESENTATION/X/ChapitreN_Nom/script-nom.js` |
| Archive présentation | `GitHub/Archives/COURSPRESENTATION/X/ChapitreN_Nom/Chapitre_N_nom_presentation_YYYY-MM-DD.html` |
| Archive JS | `GitHub/Archives/COURSPRESENTATION/X/ChapitreN_Nom/script-nom_YYYY-MM-DD.js` |
| Modèle de référence HTML | `COURSPRESENTATION/4/Chapitre11_Proportionnalite/Chapitre_11_proportionnalite_presentation.html` |
| Modèle de référence JS | `COURSPRESENTATION/4/Chapitre11_Proportionnalite/script-proportionnalite.js` |

---

## 2. Ressources à copier dans le dossier de la présentation

### Images
- Copier depuis `MathsIORI/X°/chapitreNN - Nom/images/*.png` → dans `COURSPRESENTATION/X/ChapitreN_Nom/images/`
- Référencer avec `src="images/nom-image.png"`
- **Convention : toujours un sous-dossier `images/` dans le dossier du chapitre**

### Animations iframe
- Copier depuis `MathsIORI/X°/chapitreNN - Nom/animation-*.html` → dans `COURSPRESENTATION/X/ChapitreN_Nom/animations/`
- Utiliser `<iframe src="animations/animation-xxx.html" ...>` avec les **mêmes dimensions** que dans le cours
- Conserver `?v=N` si présent dans le src original
- **Convention : toujours un sous-dossier `animations/` — ne jamais intégrer les animations directement dans le HTML de la présentation**

### Nommage des dossiers
- Format : `ChapitreN_Nom` — **jamais d'espaces, d'accents, de tirets, ni de "Images"**
- Exemples corrects : `Chapitre1_Nombres_Entiers`, `Chapitre7_Notion_de_Fonction`, `Chapitre10_Puissances`
- Exemples incorrects : `Chapitre1_Images`, `Chapitre8_Probabilité`, `Chapitre10-Puissances`, `Chapitre7_notion de fonction`

### Structure type d'un dossier chapitre
```
X/ChapitreN_Nom/
├── Chapitre_N_nom_presentation.html
├── script-nom.js
├── images/          ← PNG/JPEG/MP4 du cours
└── animations/      ← animation-*.html du cours
```

### Commande bash type (adapter les chemins)
```bash
SRC="MathsIORI/X°/chapitreNN - Nom"
DST="COURSPRESENTATION/X/ChapitreN_Nom"
mkdir -p "$DST/images" "$DST/animations"
cp "$SRC/images/"*.png "$DST/images/"
cp "$SRC/animations/"*.html "$DST/animations/"
```

---

## 3. Découpage en slides (rappel rapide)

- **Slide 1** : h1 seul
- **h2 sans h3 immédiat** → slide seule avec tout son contenu
- **h2 + premier h3 sans contenu intercalaire** → partagent une même slide
- **Chaque h3 suivant** → slide seule
- **h3 + premier h4 sans contenu intercalaire** → partagent une slide
- **Chaque h4 suivant** → slide seule

> « Contenu intercalaire » = n'importe quel élément (texte, div, image...) entre le h2 et son h3.

---

## 4. Règle des steps (rappel rapide)

| Élément | Découpage |
|---|---|
| Définition | 1 step par phrase (signal : `<br>` ou `<br><br>`) |
| Propriété / Important | intro = 1 step, puis 1 step par puce/règle |
| Exemple | énoncé = 1 step, tableau = 1 step, calculs = 1 step, conclusion = 1 step |
| Méthode | intro = 1 step, puis 1 step par item de liste |
| Exercice | intro = 1 step, puis 1 step par question |
| Image seule | 1 step |
| Iframe animation | 1 step |
| Ligne de calcul | 1 step par ligne d'égalité (dans calcul-detail) |
| `<br>` entre 2 phrases | → toujours 2 steps distincts |

Pour les listes `<ol>` réparties en plusieurs steps : utiliser `<ol start="N">` pour conserver la numérotation.

---

## 5. Script JS

- Copier mot pour mot `script-proportionnalite.js`
- **Modifier uniquement** :
  - `slideTitles` (un titre par slide, dans l'ordre)
  - Les fonctions d'animations spécifiques (init…, show…, reset…, sync…)
  - Dans `DOMContentLoaded` : appeler les init des animations du chapitre (ou juste `updateSlide()` si tout est en iframe)
- Tout le reste (navigation, clavier, menu, aide) = identique mot pour mot

---

## 6. Chapitres réalisés — inventaire

| Niveau | Chapitre | Dossier présentation | Slides | Particularités |
|---|---|---|---|---|
| 6e | 1 — Les nombres entiers | `6/Chapitre1_Nombres_Entiers/` | 4 | Images + 4 iframes animation |
| 6e | 10 — Les angles | `6/Chapitre10_Angles/` | ? | — |
| 6e | 11 — Fractions partie 2 | `6/Chapitre11_Fractions_partie2/` | ? | — |
| 6e | 12 — Symétrie axiale | `6/Chapitre12_Symetrie_axiale/` | ? | — |
| 6e | 1 — Nombres entiers (Images) | `6/Chapitre1_Images/` | 4 | **ancienne version archivée 2026-06-30** |
| 4e | 11 — Proportionnalité | `4/Chapitre11_Proportionnalite/` | 13 | **Modèle de référence** — SVG animés, pilules, produit en croix |
| 4e | 9 — Translation | `4/Chapitre9_Translation/` | ? | 3 iframes animation compas |
| *(autres)* | *(voir dossiers 3/, 4/, 5/, 6/)* | — | — | — |

> Mettre à jour ce tableau après chaque nouveau chapitre produit.

---

## 7. Checklist avant livraison

- [ ] Archive faite dans `GitHub/Archives/COURSPRESENTATION/X/ChapitreN_Nom/` (HTML + JS, date dans le nom)
- [ ] `cours.html` source lu en entier
- [ ] Aucun contenu ajouté / reformulé / supprimé
- [ ] Chaque phrase dans son propre `<div class="step">`
- [ ] Images copiées dans `images/`, référencées `src="images/nom.png"`
- [ ] Iframes copiées, dimensions identiques au cours, `?v=N` conservé
- [ ] SVG/animations JS recopiés à l'identique (IDs, coords, couleurs)
- [ ] `slideTitles` dans le JS = nombre exact de slides
- [ ] `totalSlides` dans le HTML = nombre exact de slides
- [ ] Squelette contrôles conforme au modèle (prevBtn, btn-reset, progress, btn-menu, nextBtn)
- [ ] `href="../../styles.css"` (deux niveaux depuis `X/ChapitreN_Nom/`)
- [ ] Classes CSS uniquement parmi celles définies dans `styles.css`
- [ ] Numérotation h2/h3 en dur dans la présentation (pas de CSS counter ici)
- [ ] Pas de numérotation en dur dans `cours.html` (CSS counter dans MathsIORI)

---

## 8. Pièges fréquents (vécus)

1. **Classe CSS absente de styles.css** → texte minuscule. Vérifier avant d'utiliser `.property`, `.exercice`, etc.
2. **`max-width` en px sur un wrapper de `.calcul-detail`** → texte coupé. Utiliser `max-width:100%`.
3. **Préfixes en dur dans cours.html** → doublon à l'affichage ("III. III. Construction…"). Ne jamais écrire "I. " dans MathsIORI.
4. **Iframes oubliées** → les remplacer par du texte statique est une violation de la règle n°1.
5. **Archive oubliée avant modif** → impossible de revenir en arrière (vécu mai 2026).
6. **Images dans le dossier racine de la présentation** → toujours les mettre dans `images/` et utiliser `src="images/nom.png"`.
7. **Animations compas** → voir règles détaillées dans CLAUDE.md §6 (compassPivot, jamais compassMove pour un pivot).
