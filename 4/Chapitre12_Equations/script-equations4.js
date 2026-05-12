// ============================================================
//  Chapitre 12 – Les équations  |  Contrôleur de présentation
// ============================================================

let currentSlideIndex = 0;
let currentStepIndex  = 0;
const slides      = document.querySelectorAll('.slide');
const totalSlides = slides.length;

const slideTitles = [
    "Chapitre 12 : Les Équations",
    "I. Qu'est-ce qu'une équation ?",
    "II. Vérifier si un nombre est solution",
    "III. Résoudre une équation — 1) Les règles de résolution",
    "III. Résoudre une équation — 2) Équations du type ax + b = cx + d",
    "III. Résoudre une équation — 3) Outil de vérification interactif",
    "IV. Mettre un problème en équation",
    "IV. Mettre un problème en équation — 1) Exemples de mise en équation simple",
    "IV. Mettre un problème en équation — 2) Problème avec plusieurs inconnues"
];

document.getElementById('totalSlides').textContent = totalSlides;

/* ── Menu ── */
function initSlideMenu() {
    const slideList = document.getElementById('slideList');
    slideList.innerHTML = '';
    slideTitles.forEach((title, index) => {
        const item = document.createElement('div');
        item.className = 'slide-item';
        if (index === currentSlideIndex) item.classList.add('current');
        item.innerHTML = `<div class="slide-number">Slide ${index + 1}</div><div class="slide-title">${title}</div>`;
        item.onclick = () => goToSlide(index);
        slideList.appendChild(item);
    });
}

function openMenu()  { initSlideMenu(); document.getElementById('slideMenu').classList.add('active'); }
function closeMenu() { document.getElementById('slideMenu').classList.remove('active'); }
function openHelp()  { document.getElementById('helpOverlay').classList.add('active'); }
function closeHelp() { document.getElementById('helpOverlay').classList.remove('active'); }

function goToSlide(index) { currentSlideIndex = index; currentStepIndex = 0; updateSlide(); closeMenu(); }
function resetSlide()     { currentStepIndex = 0; updateSlide(); }

/* ── Mise à jour de la slide ── */
function updateSlide() {
    const contentDiv = document.querySelector('.content');

    slides.forEach((slide, index) => {
        slide.classList.remove('active');
        if (index === currentSlideIndex) slide.classList.add('active');
    });

    const steps      = slides[currentSlideIndex].querySelectorAll('.step');
    const totalSteps = steps.length;

    steps.forEach((step, index) => {
        if (index < currentStepIndex) step.classList.add('visible');
        else                          step.classList.remove('visible');
    });

    document.getElementById('currentSlide').textContent = currentSlideIndex + 1;
    document.getElementById('prevBtn').disabled = (currentSlideIndex === 0 && currentStepIndex === 0);
    document.getElementById('nextBtn').disabled  = (currentSlideIndex === totalSlides - 1 && currentStepIndex >= totalSteps);

    const stepIndicator = document.getElementById('stepIndicator');
    if (totalSteps > 0 && currentStepIndex < totalSteps) {
        stepIndicator.textContent = `Étape ${currentStepIndex} / ${totalSteps}`;
    } else {
        stepIndicator.textContent = '';
    }

    if (currentStepIndex === 0) {
        setTimeout(() => { contentDiv.scrollTo({ top: 0, behavior: 'smooth' }); }, 50);
    } else if (currentStepIndex > 0) {
        setTimeout(() => {
            const visibleSteps = slides[currentSlideIndex].querySelectorAll('.step.visible');
            if (visibleSteps.length > 0) {
                visibleSteps[visibleSteps.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 650);
    }
}

/* ── Navigation ── */
function changeSlide(direction) {
    const currentSlide = slides[currentSlideIndex];
    const steps        = currentSlide.querySelectorAll('.step');
    const totalSteps   = steps.length;

    if (direction === 1) {
        if (currentStepIndex < totalSteps) {
            currentStepIndex++;
            updateSlide();
        } else if (currentSlideIndex < totalSlides - 1) {
            currentSlideIndex++;
            currentStepIndex = 0;
            updateSlide();
        }
    } else {
        if (currentStepIndex > 0) {
            currentStepIndex--;
            updateSlide();
        } else if (currentSlideIndex > 0) {
            currentSlideIndex--;
            const prevSteps = slides[currentSlideIndex].querySelectorAll('.step');
            currentStepIndex = prevSteps.length;
            updateSlide();
        }
    }
}

/* ── Clavier ── */
document.addEventListener('keydown', (e) => {
    if (document.getElementById('slideMenu').classList.contains('active')) {
        if (e.key === 'Escape') closeMenu();
        return;
    }
    if (document.getElementById('helpOverlay').classList.contains('active')) {
        if (e.key === 'Escape' || e.key === 'h' || e.key === 'H' || e.key === '?') closeHelp();
        return;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === ' ') {
        e.preventDefault(); changeSlide(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault(); changeSlide(-1);
    } else if (e.key === 'm' || e.key === 'M') {
        openMenu();
    } else if (e.key === 'r' || e.key === 'R') {
        resetSlide();
    } else if (e.key === 'h' || e.key === 'H' || e.key === '?') {
        openHelp();
    }
});

document.getElementById('slideMenu').addEventListener('click',   (e) => { if (e.target.id === 'slideMenu')   closeMenu(); });
document.getElementById('helpOverlay').addEventListener('click', (e) => { if (e.target.id === 'helpOverlay') closeHelp(); });

/* ── Init ── */
updateSlide();

// ============================================================
//  Animations interactives – Chapitre 12 Équations
// ============================================================

/* ——— Vérification II ——— */
function showVerif1() {
    document.getElementById('verifBox1').style.opacity = '1';
    document.getElementById('btnVerif1').disabled = true;
    document.getElementById('btnVerif1').style.background = '#95a5a6';
}
function resetVerif1() {
    document.getElementById('verifBox1').style.opacity = '0';
    document.getElementById('btnVerif1').disabled = false;
    document.getElementById('btnVerif1').style.background = '#e74c3c';
}

/* ——— Exemple 3 : pas à pas contrôlé par l'utilisateur ——— */
let s3currentStep = 0;
const s3totalSteps = 5;

function nextStep3() {
    if (s3currentStep >= s3totalSteps) return;
    s3currentStep++;
    const el = document.getElementById('s3step' + s3currentStep);
    const btnContainer = document.getElementById('s3btnContainer');
    if (el) {
        el.style.display = 'block';
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.4s';
        // Déplacer le bouton juste après cette nouvelle étape
        el.after(btnContainer);
        setTimeout(() => {
            el.style.opacity = '1';
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
    }
    document.getElementById('s3counter').textContent = 'Étape ' + s3currentStep + ' / ' + s3totalSteps;
    if (s3currentStep >= s3totalSteps) {
        document.getElementById('btnNext3').disabled = true;
        document.getElementById('btnNext3').style.background = '#95a5a6';
        document.getElementById('btnNext3').style.cursor = 'default';
    }
}

function resetSolve3() {
    s3currentStep = 0;
    for (let i = 1; i <= s3totalSteps; i++) {
        const el = document.getElementById('s3step' + i);
        if (el) el.style.display = 'none';
    }
    // Remettre le bouton au début (avant s3step0)
    const s3step0 = document.getElementById('s3step0');
    const btnContainer = document.getElementById('s3btnContainer');
    s3step0.before(btnContainer);
    document.getElementById('s3counter').textContent = 'Étape 0 / ' + s3totalSteps;
    document.getElementById('btnNext3').disabled = false;
    document.getElementById('btnNext3').style.background = '#27ae60';
    document.getElementById('btnNext3').style.cursor = 'pointer';
}

/* ——— Exemple 4 : pas à pas contrôlé par l'utilisateur ——— */
let s4currentStep = 0;
const s4totalSteps = 7;

function nextStep4() {
    if (s4currentStep >= s4totalSteps) return;
    s4currentStep++;
    const el = document.getElementById('s4step' + s4currentStep);
    const btnContainer = document.getElementById('s4btnContainer');
    if (el) {
        el.style.display = 'block';
        el.style.opacity = '0';
        el.style.transition = 'opacity 0.4s';
        // Déplacer le bouton juste après cette nouvelle étape
        el.after(btnContainer);
        setTimeout(() => {
            el.style.opacity = '1';
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
    }
    document.getElementById('s4counter').textContent = 'Étape ' + s4currentStep + ' / ' + s4totalSteps;
    if (s4currentStep >= s4totalSteps) {
        document.getElementById('btnNext4').disabled = true;
        document.getElementById('btnNext4').style.background = '#95a5a6';
        document.getElementById('btnNext4').style.cursor = 'default';
    }
}

function resetSolve4() {
    s4currentStep = 0;
    for (let i = 1; i <= s4totalSteps; i++) {
        const el = document.getElementById('s4step' + i);
        if (el) el.style.display = 'none';
    }
    // Remettre le bouton au début (avant s4step0)
    const s4step0 = document.getElementById('s4step0');
    const btnContainer = document.getElementById('s4btnContainer');
    s4step0.before(btnContainer);
    document.getElementById('s4counter').textContent = 'Étape 0 / ' + s4totalSteps;
    document.getElementById('btnNext4').disabled = false;
    document.getElementById('btnNext4').style.background = '#27ae60';
    document.getElementById('btnNext4').style.cursor = 'pointer';
}

/* ——— Outil de vérification ——— */
function verifSolution() {
    let a = parseFloat(document.getElementById('coefA').value) || 0;
    let b = parseFloat(document.getElementById('coefB').value) || 0;
    let c = parseFloat(document.getElementById('coefC').value) || 0;
    let d = parseFloat(document.getElementById('coefD').value) || 0;
    let num = parseFloat(document.getElementById('solNum').value);
    let den = parseFloat(document.getElementById('solDen').value) || 1;
    if (den === 0) {
        alert('Le dénominateur ne peut pas être 0 !');
        return;
    }
    let x = num / den;
    let xLabel = (den === 1) ? num : num + '/' + den;
    let mg = a * x + b;
    let md = c * x + d;
    let div = document.getElementById('verifResult');
    div.style.display = 'block';
    let diff = Math.abs(mg - md);
    if (diff < 1e-9) {
        div.style.background = '#dff5e7';
        div.style.color = '#1a7a3c';
        div.style.border = '1px solid #1a7a3c';
        div.innerHTML = '✔ Correct ! x = ' + xLabel + ' est bien solution.<br>'
            + 'Membre de gauche = ' + mg.toFixed(4).replace(/\.?0+$/, '')
            + ' = Membre de droite = ' + md.toFixed(4).replace(/\.?0+$/, '');
    } else {
        div.style.background = '#fce8e8';
        div.style.color = '#c0392b';
        div.style.border = '1px solid #c0392b';
        div.innerHTML = '✘ Incorrect. Pour x = ' + xLabel
            + ', membre de gauche = ' + mg.toFixed(4).replace(/\.?0+$/, '')
            + ' ≠ membre de droite = ' + md.toFixed(4).replace(/\.?0+$/, '') + '.';
    }
}

/* ——— Cartes (cas 1/2/3) ——— */
function showCas(n) {
    ['cas1', 'cas2', 'cas3'].forEach(id => document.getElementById(id).style.display = 'none');
    document.getElementById('cas' + n).style.display = 'block';
}
