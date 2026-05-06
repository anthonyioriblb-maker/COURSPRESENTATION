# Règles pour les cours en mode présentation

**Référence absolue** : Chapitre 11 Proportionnalité 4ᵉ (`4/Chapitre11_Proportionnalite/`)
- Source du contenu : `C:\Users\antho\Documents\GitHub\MathsIORI\4°\chapitre11 - Proportionnalite\cours.html`
- Présentation cible : `C:\Users\antho\Documents\GitHub\COURSPRESENTATION\4\Chapitre11_Proportionnalite\Chapitre_11_proportionnalite_presentation.html` + `script-proportionnalite.js`

> Lire **toujours** ces deux fichiers avant de produire une nouvelle présentation, ils sont le modèle exact à reproduire.

---

## Règle n°1 — Aucune initiative

La présentation contient **exactement** le même contenu que le cours : mêmes phrases, mêmes définitions, mêmes valeurs, mêmes exemples, mêmes SVG, mêmes animations interactives, mêmes couleurs.
- Pas de reformulation, pas de simplification, pas d'ajout d'explications, pas de remplacement de valeurs, pas de modification d'images ou de SVG.
- Si doute sur quelque chose → poser une question, ne **jamais** improviser.

---

## Règle n°2 — Découpage en slides

**Une slide par titre.** Chaque nouveau titre (`h2`, `h3`, `h4`) démarre une nouvelle slide, **sauf le premier sous-titre qui suit immédiatement son parent (sans contenu intercalaire)** : dans ce cas seulement il partage la slide de son parent.

> Si du contenu (intro, exemple, définition…) se glisse entre le `h2` et son premier `h3`, alors le `h2` reste seul sur sa slide avec ce contenu intercalaire, et le `h3` démarre une nouvelle slide. Idem entre `h3` et premier `h4`.

Exemple concret (Chapitre 11) :
| Slide | Titres présents | Source dans le cours |
|---|---|---|
| 1 | `h1` Titre du chapitre | h1 |
| 2 | `h2` I. + `h3` 1) | h2 + son premier h3 |
| 3 | `h3` 2) | h3 suivant seul |
| 4 | `h3` 3) | h3 suivant seul |
| 5 | `h2` II. + intro | h2 (sans son h3, car l'intro est entre les deux) |
| 6 | `h3` 1) | h3 seul |
| 7 | `h3` 2) | h3 seul |
| 8 | `h2` III. + `h3` 1) | h2 + premier h3 |
| 9-10 | `h3` 2), 3) | h3 seuls |
| 11 | `h3` 4) + `h4` a) | h3 + premier h4 |
| 12 | `h4` b) | h4 seul |
| 13 | `h3` 5) | h3 seul |

Les titres reprennent le **même libellé** que dans le cours, avec une numérotation préfixée :
- `h2` → `I.`, `II.`, `III.` (chiffres romains)
- `h3` → `1)`, `2)`, `3)` (réinitialisé à chaque nouveau `h2`)
- `h4` → `a)`, `b)`, ... (numérotation conservée du cours)

---

## Règle n°3 — Apparition étape par étape

Dans chaque slide, le contenu apparaît **phrase par phrase** ou **bloc par bloc** lorsque l'utilisateur appuie sur la flèche droite ou Espace.

> ⚠️ **OBLIGATION ABSOLUE** : chaque phrase est dans son propre `<div class="step">`. Toujours. Sans exception. Ne jamais regrouper deux phrases dans un même step, même si elles semblent liées. C'est la règle la plus importante de toute la présentation.

Mécanique :
- Chaque phrase / bloc logique distinct = `<div class="step">…</div>`
  - **Définition** : chaque phrase = un step séparé. Ne jamais mettre deux phrases dans le même step, même si elles sont liées.
  - **Exemple** : énoncé = un step, tableau = un step, calculs = un step, conclusion = un step
  - **Méthode** : intro = un step, puis **chaque item de liste = un step séparé** (utiliser `<ol start="N">` pour conserver la numérotation)
  - **Propriété** : intro = un step, puis chaque règle/puce = un step séparé
  - **Remarque** : si deux phrases distinctes, les séparer en deux steps
  - **Exercice** : énoncé = un step, puis chaque question/puce = un step séparé
  - **Règle absolue** : un `<br><br>` ou un `<br>` entre deux phrases = signal qu'il faut deux steps distincts
- Pour faire apparaître **un mot précis** dans une phrase déjà visible (typiquement un résultat numérique en vert), utiliser `<span class="step-inline" style="color:green;"><strong>X</strong></span>`.
- Le JS construit la liste des `.step` puis ajoute `.step-inline` enfants à la suite via `buildStepsArray`.

CSS minimal à mettre en `<style>` du HTML (en complément de `../../styles.css`) :
```css
.step-inline { opacity: 0; transition: opacity 0.5s; }
.step-inline.visible { opacity: 1; }
tr.step { display: table-row !important; opacity: 0; transition: opacity 0.5s; }
tr.step.visible { opacity: 1; }
.anim-fullbleed { display: block; width: 100%; }
```

---

## Règle n°4 — Animations interactives identiques

Tous les SVG, boutons, fonctions d'animation présents dans le cours sont **recopiés à l'identique** dans la présentation : mêmes IDs, mêmes coordonnées, mêmes couleurs, même JS. Aucune simplification.

Les animations qui doivent se synchroniser avec l'avancement des steps (ex. les pilules de coefficient slide 6) utilisent des **steps invisibles déclencheurs** :
```html
<div class="step pilule-trigger" data-pid="1" style="height:0;overflow:hidden;margin:0;padding:0;"></div>
```
… puis dans `updateSlide`, on compte le nombre de `.pilule-trigger.visible` et on appelle `syncPiluleAnim(n)`.

Les animations indépendantes (graphique, produit en croix) gardent leurs boutons interactifs et fonctionnent pareil que dans le cours.

---

## Règle n°5 — Architecture des fichiers

```
COURSPRESENTATION/
├── styles.css                          ← feuille commune
├── <niveau>/                           ← 3, 4, 5, 6
│   └── Chapitre<N>_<Nom>/
│       ├── Chapitre_<N>_<nom>_presentation.html
│       └── script-<nom>.js
└── archives/
    └── <niveau>/
        └── <date>_<motif>/
            └── Chapitre<N>_<Nom>/
```

Chemin du CSS dans le HTML : `<link rel="stylesheet" href="../../styles.css">` (deux niveaux à remonter depuis `<niveau>/Chapitre…/`).

---

## Règle n°6 — Squelette HTML obligatoire

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Chapitre N - Nom</title>
    <link rel="stylesheet" href="../../styles.css">
    <style>
        /* CSS minimal de la règle 3 */
    </style>
</head>
<body>
    <div class="container">
        <div class="content">

            <div class="slide active">
                <h1>Chapitre N : Nom</h1>
            </div>

            <div class="slide">
                <h2>I. ...</h2>
                <h3>1) ...</h3>
                <div class="definition">
                    <div class="step">…</div>
                </div>
                <div class="example">
                    <div class="step">…</div>
                </div>
            </div>

            <!-- … autres slides … -->

        </div>

        <div class="controls">
            <div class="controls-left">
                <button id="prevBtn" onclick="changeSlide(-1)">← Précédent</button>
                <button class="btn-reset" onclick="resetSlide()">⟲</button>
            </div>
            <div class="progress">
                <span><span id="currentSlide">1</span> / <span id="totalSlides">N</span></span>
                <span class="step-indicator" id="stepIndicator"></span>
            </div>
            <div class="controls-right">
                <button class="btn-menu" onclick="openMenu()">📋 Menu</button>
                <button class="btn-menu" onclick="openHelp()">❓ Aide</button>
                <button id="nextBtn" onclick="changeSlide(1)">Suivant →</button>
            </div>
        </div>
    </div>

    <div class="slide-menu" id="slideMenu">
        <div class="menu-content">
            <h2>Sélectionner une diapositive</h2>
            <div class="slide-list" id="slideList"></div>
            <button class="close-menu" onclick="closeMenu()">Fermer</button>
        </div>
    </div>

    <div class="help-overlay" id="helpOverlay">
        <div class="help-content">
            <h2>Raccourcis clavier</h2>
            <ul>
                <li><kbd>→</kbd> ou <kbd>Espace</kbd> : Étape/Slide suivante</li>
                <li><kbd>←</kbd> : Étape/Slide précédente</li>
                <li><kbd>M</kbd> : Ouvrir le menu des slides</li>
                <li><kbd>R</kbd> : Réinitialiser la slide actuelle</li>
                <li><kbd>H</kbd> ou <kbd>?</kbd> : Afficher cette aide</li>
                <li><kbd>Échap</kbd> : Fermer les menus</li>
            </ul>
            <button class="close-menu" onclick="closeHelp()">Fermer</button>
        </div>
    </div>

    <script src="script-<nom>.js"></script>
</body>
</html>
```

---

## Règle n°7 — Squelette du script JS

Toujours présent, structure identique d'un chapitre à l'autre. À copier depuis `4/Chapitre11_Proportionnalite/script-proportionnalite.js` puis adapter :
- `slideTitles` (un titre par slide, dans l'ordre)
- Les fonctions d'animations spécifiques (`init...`, `show...`, `reset...`, `sync...`)
- Tout le reste (navigation, raccourcis clavier, menu, aide) reste **identique mot pour mot**.

---

## Règle n°8 — Avant toute modification : archiver

Avant de modifier un dossier de chapitre existant, le copier dans :
```
archives/<niveau>/<YYYY-MM-DD>_<motif-court>/<dossier-chapitre>/
```
Exemple : `archives/4/2026-04-28_avant-refacto-fidelite/Chapitre11_Proportionnalite/`.

---

## Règle n°9 — Workflow type pour produire une nouvelle présentation

1. Lire le fichier source `MathsIORI/<niveau>°/chapitre<N> - <Nom>/cours.html`.
2. Si une présentation existe déjà → l'archiver d'abord.
3. Créer le dossier `COURSPRESENTATION/<niveau>/Chapitre<N>_<Nom>/`.
4. Découper le contenu en slides selon la **règle n°2**.
5. Copier-coller le contenu de chaque section, en encapsulant chaque phrase/bloc dans un `<div class="step">` (règle n°3).
6. Recopier à l'identique les SVG / animations / boutons / fonctions JS (règle n°4).
7. Créer le `script-<nom>.js` à partir du modèle, mettre à jour `slideTitles` et porter les animations spécifiques.
8. Vérifier visuellement que rien n'a été ajouté/retiré par rapport au cours.

---

## Règle n°10 — Classes CSS disponibles dans styles.css

Les classes de boîtes suivantes sont définies dans `styles.css` avec `font-size: 2.5em`, fond coloré et bordure gauche. Utiliser **uniquement** ces classes — ne jamais en inventer une nouvelle sans l'ajouter en même temps dans `styles.css` :

| Classe | Fond | Bordure | Texte | Usage |
|---|---|---|---|---|
| `.definition` | bleu clair `#d4ebf7` | bleu `#2980b9` | bleu | Définitions |
| `.example` | vert clair `#e8f8f0` | vert `#27ae60` | noir | Exemples |
| `.important` | jaune `#fff3b8` | orange `#f39c12` | bleu | Points importants |
| `.remarque` | gris clair `#e8e8e8` | gris `#555` | noir | Remarques |
| `.method` | gris `#c8c8c8` | noir `#000` | noir | Méthodes |
| `.calcul-detail` | gris `#f0f0f0` | gris `#7f8c8d` | noir | Détails de calcul |
| `.property` | jaune `#fff3b8` | orange `#e67e22` | bleu | Propriétés |
| `.exercice` | rose `#fce4ec` | rose foncé `#c2185b` | noir | Exercices |

> **Erreur courante (Chapitre 12, mai 2026)** : la classe `.property` avait été utilisée dans le HTML sans être définie dans le CSS → texte minuscule. Toujours vérifier que la classe HTML existe bien dans `styles.css`.

---

## Erreurs fréquentes à éviter (retours d'expérience)

> Ces erreurs ont été rencontrées sur de vraies présentations — les corriger systématiquement à la création.

**1. Classe CSS utilisée dans le HTML mais absente de `styles.css`**
→ Le texte apparaît minuscule (taille navigateur par défaut au lieu de `2.5em`).
→ **Vérifier toujours** que chaque classe de boîte utilisée (`property`, `exercice`, etc.) est bien définie dans `styles.css` avec `font-size: 2.5em` et ses couleurs.

**2. `max-width` en pixels sur un conteneur de boîtes `calcul-detail`**
→ Exemple : `<div style="max-width:580px;">` autour de boîtes `.calcul-detail` qui ont déjà `font-size: 2.5em` → le texte déborde et se coupe à la ligne.
→ **Toujours utiliser `max-width:100%`** (jamais de valeur fixe en px) pour les conteneurs qui wrappent des boîtes CSS.

**3. Couleur du texte dans `.property`**
→ La boîte `.property` doit avoir `color: blue` (comme `.definition` et `.important`), pas `color: black`.

**4. Bouton "Étape suivante" dans les animations pas-à-pas**
→ Quand une animation révèle plusieurs `calcul-detail` successifs (ex. résolution d'équation), le bouton doit se déplacer physiquement dans le DOM après chaque nouvelle étape, sinon il disparaît hors écran.
→ Patron à suivre :
  - Donner un `id` au conteneur du bouton (ex. `s3btnContainer`) et à chaque étape (ex. `s3step0`, `s3step1`…)
  - Dans `nextStepX()` : après avoir affiché l'étape, appeler `el.after(btnContainer)` pour déplacer le bouton juste après
  - Scroller vers la nouvelle étape avec `el.scrollIntoView({ behavior: 'smooth', block: 'center' })` (center = étape visible au milieu, bouton visible en dessous)
  - Dans `resetSolveX()` : remettre le bouton avant la première étape avec `step0.before(btnContainer)`

**5. Numéros de liste `<ol>` coupés par la bordure gauche des boîtes**
→ Les `<ol>` n'avaient pas de `padding-left` suffisant → les numéros (1. 2. 3.) disparaissaient derrière la bordure.
→ Le CSS définit maintenant `padding-left: 80px` pour `ul` ET `ol`. Ne jamais réduire cette valeur.

---

## Ce qu'il ne faut JAMAIS faire

- Ajouter du contenu qui n'est pas dans le cours (exemples, définitions, transitions, slides de récap, "à retenir"…).
- Reformuler ou raccourcir des phrases.
- Remplacer un SVG par une version simplifiée.
- Changer les couleurs ou la typographie.
- Ajouter des slides de plan / sommaire / conclusion qui ne sont pas dans le cours.
- Modifier la numérotation des sections par rapport au cours.
- Oublier d'archiver avant modification.
