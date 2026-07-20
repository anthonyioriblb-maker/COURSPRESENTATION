// Variables globales
let currentSlideIndex = 0;
let currentStepIndex = 0;
let slides = null;
let totalSlides = 0;

// Titres des slides du Chapitre 12
const slideTitles = [
    "Chapitre 12 : La symétrie axiale",                               // Slide 1
    "I. Figures symétriques — 1) Figures symétriques",                // Slide 2
    "I. 2) Axe de symétrie d'une figure",                             // Slide 3
    "II. Construction du symétrique d'un point",                      // Slide 4
    "II. 1) Construction avec l'équerre et le compas",                // Slide 5
    "II. 2) Construction avec le compas seulement",                   // Slide 6
    "III. Construction du symétrique d'une figure",                   // Slide 7
    "III. 1) Symétrique d'un polygone",                               // Slide 8
    "III. 2) Symétrique d'un cercle",                                 // Slide 9
    "IV. Propriétés de la symétrie axiale"                            // Slide 10
];

// Construit la liste à plat des étapes
function buildStepsArray(slide) {
    const steps = [];
    slide.querySelectorAll('.step').forEach(step => {
        steps.push(step);
        step.querySelectorAll('.step-inline').forEach(inline => {
            steps.push(inline);
        });
    });
    return steps;
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;

    const totalSlidesElement = document.getElementById('totalSlides');
    if (totalSlidesElement) {
        totalSlidesElement.textContent = totalSlides;
    }

    // Init animations
    eqResetAnimation();
    csResetAnimation();

    updateSlide();
});

// ====================================================
// NAVIGATION
// ====================================================

function initSlideMenu() {
    const slideList = document.getElementById('slideList');
    if (!slideList) return;

    slideList.innerHTML = '';
    slideTitles.forEach((title, index) => {
        const slideItem = document.createElement('div');
        slideItem.className = 'slide-item';
        if (index === currentSlideIndex) {
            slideItem.classList.add('current');
        }
        slideItem.innerHTML = `
            <div class="slide-number">Slide ${index + 1}</div>
            <div class="slide-title">${title}</div>
        `;
        slideItem.onclick = () => goToSlide(index);
        slideList.appendChild(slideItem);
    });
}

function openMenu() {
    initSlideMenu();
    const menu = document.getElementById('slideMenu');
    if (menu) menu.classList.add('active');
}

function closeMenu() {
    const menu = document.getElementById('slideMenu');
    if (menu) menu.classList.remove('active');
}

function openHelp() {
    const help = document.getElementById('helpOverlay');
    if (help) help.classList.add('active');
}

function closeHelp() {
    const help = document.getElementById('helpOverlay');
    if (help) help.classList.remove('active');
}

function goToSlide(index) {
    currentSlideIndex = index;
    currentStepIndex = 0;
    updateSlide();
    closeMenu();
}

function resetSlide() {
    currentStepIndex = 0;
    updateSlide();
}

function updateSlide() {
    if (!slides || slides.length === 0) return;

    slides.forEach((slide, index) => {
        slide.classList.remove('active');
        if (index === currentSlideIndex) slide.classList.add('active');
    });

    const currentSlide = slides[currentSlideIndex];
    const steps = buildStepsArray(currentSlide);
    const totalSteps = steps.length;

    steps.forEach((step, index) => {
        if (index < currentStepIndex) {
            step.classList.add('visible');
        } else {
            step.classList.remove('visible');
        }
    });

    const currentSlideElement = document.getElementById('currentSlide');
    if (currentSlideElement) {
        currentSlideElement.textContent = currentSlideIndex + 1;
    }

    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
        prevBtn.disabled = currentSlideIndex === 0 && currentStepIndex === 0;
    }

    const stepIndicator = document.getElementById('stepIndicator');
    if (stepIndicator) {
        if (totalSteps > 0 && currentStepIndex < totalSteps) {
            stepIndicator.textContent = `Étape ${currentStepIndex}/${totalSteps}`;
            stepIndicator.classList.remove('hidden');
        } else {
            stepIndicator.classList.add('hidden');
        }
    }

    const contentDiv = document.querySelector('.content');
    if (currentStepIndex === 0 && contentDiv) {
        setTimeout(() => {
            contentDiv.scrollTo({ top: 0, behavior: 'smooth' });
        }, 50);
    } else if (currentStepIndex > 0) {
        setTimeout(() => {
            const visibleSteps = currentSlide.querySelectorAll('.step.visible');
            if (visibleSteps.length > 0) {
                const lastVisibleStep = visibleSteps[visibleSteps.length - 1];
                lastVisibleStep.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });
            }
        }, 650);
    }
}

function changeSlide(direction) {
    if (!slides || slides.length === 0) return;

    const currentSlide = slides[currentSlideIndex];
    const steps = buildStepsArray(currentSlide);
    const totalSteps = steps.length;

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
            const prevSteps = buildStepsArray(slides[currentSlideIndex]);
            currentStepIndex = prevSteps.length;
            updateSlide();
        }
    }
}

document.addEventListener('keydown', (e) => {
    const slideMenu = document.getElementById('slideMenu');
    const helpOverlay = document.getElementById('helpOverlay');

    if (slideMenu && slideMenu.classList.contains('active')) {
        if (e.key === 'Escape') closeMenu();
        return;
    }

    if (helpOverlay && helpOverlay.classList.contains('active')) {
        if (e.key === 'Escape' || e.key === 'h' || e.key === 'H' || e.key === '?') closeHelp();
        return;
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === ' ') {
        e.preventDefault();
        changeSlide(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        changeSlide(-1);
    } else if (e.key === 'm' || e.key === 'M') {
        openMenu();
    } else if (e.key === 'r' || e.key === 'R') {
        resetSlide();
    } else if (e.key === 'h' || e.key === 'H' || e.key === '?') {
        openHelp();
    }
});

document.addEventListener('click', (e) => {
    const slideMenu = document.getElementById('slideMenu');
    if (slideMenu && e.target.id === 'slideMenu') closeMenu();

    const helpOverlay = document.getElementById('helpOverlay');
    if (helpOverlay && e.target.id === 'helpOverlay') closeHelp();
});

// ====================================================
// UTILITAIRE
// ====================================================
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ====================================================
// ANIMATION 1 : ÉQUERRE + COMPAS (Slide 5)
// ====================================================
const EQ_I  = {x:400, y:200};
const EQ_M  = {x:200, y:300};
const EQ_Mp = {x:600, y:100};
const EQ_RADIUS = 223.6;
const EQ_angM  = Math.atan2(EQ_M.y  - EQ_I.y, EQ_M.x  - EQ_I.x);
const EQ_angMp = Math.atan2(EQ_Mp.y - EQ_I.y, EQ_Mp.x - EQ_I.x);
const EQ_START = {x:346, y:93};
const EQ_END   = {x:400, y:200};
const EQ_ANGLE = 63.4;

let eqCurrentStep = 0;

const eqStepTexts = [
    'Cliquez sur « Étape suivante » pour voir la construction étape par étape.',
    '<strong style="color:#2980b9;font-size:20px;">1.</strong> Je place un côté de l\'équerre le long de (d) et je fais glisser jusqu\'à ce que l\'autre côté passe par M.',
    '<strong style="color:#e74c3c;font-size:20px;">2.</strong> Je trace la perpendiculaire à (d) passant par M. Elle coupe (d) en O.',
    '<strong style="color:#555;font-size:20px;">3.</strong> Je marque le pied O. L\'équerre a servi, je la range.',
    '<strong style="color:#27ae60;font-size:20px;">4.</strong> J\'ouvre le compas à l\'écartement OM (pointe en O, mine en M).',
    '<strong style="color:#27ae60;font-size:20px;">5.</strong> Je trace l\'arc de l\'autre côté de (d) en conservant le même écartement : j\'obtiens M\' avec OM\' = OM.',
    '<strong style="color:#27ae60;font-size:20px;">6.</strong> M\' est le symétrique de M par rapport à (d). ✓'
];

const eqEl = id => document.getElementById('eq_' + id);

async function eqSlideSquare(from, to, duration) {
    const N = 50;
    for (let i = 0; i <= N; i++) {
        const t = i / N;
        const x = from.x + (to.x - from.x) * t;
        const y = from.y + (to.y - from.y) * t;
        eqEl('setSquare').setAttribute('transform',
            `translate(${x},${y}) rotate(${EQ_ANGLE})`);
        await sleep(duration / N);
    }
}

function eqSetCompass(tip, pen) {
    const hx = (tip.x + pen.x) / 2, hy = (tip.y + pen.y) / 2;
    eqEl('compassHinge').setAttribute('cx', hx);
    eqEl('compassHinge').setAttribute('cy', hy);
    eqEl('compassPointBranch').setAttribute('x1', hx);
    eqEl('compassPointBranch').setAttribute('y1', hy);
    eqEl('compassPointBranch').setAttribute('x2', tip.x);
    eqEl('compassPointBranch').setAttribute('y2', tip.y);
    eqEl('compassPointTip').setAttribute('cx', tip.x);
    eqEl('compassPointTip').setAttribute('cy', tip.y);
    eqEl('compassPencilBranch').setAttribute('x1', hx);
    eqEl('compassPencilBranch').setAttribute('y1', hy);
    eqEl('compassPencilBranch').setAttribute('x2', pen.x);
    eqEl('compassPencilBranch').setAttribute('y2', pen.y);
    const ang = Math.atan2(pen.y - hy, pen.x - hx) * 180 / Math.PI + 90;
    eqEl('compassPencilBody').setAttribute('transform',
        `translate(${pen.x},${pen.y - 15}) rotate(${ang})`);
    eqEl('compassPencilTip').setAttribute('transform',
        `translate(${pen.x - 5},${pen.y}) rotate(${ang} 5 0)`);
    eqEl('compassPencilPoint').setAttribute('cx', pen.x);
    eqEl('compassPencilPoint').setAttribute('cy', pen.y);
}

async function eqCompassPivot(tip, radius, a1, a2, duration) {
    const N = 50;
    for (let i = 0; i <= N; i++) {
        const t = i / N;
        const angle = a1 + (a2 - a1) * t;
        eqSetCompass(tip, {
            x: tip.x + radius * Math.cos(angle),
            y: tip.y + radius * Math.sin(angle)
        });
        await sleep(duration / N);
    }
}

async function eqCompassOpen(tip, target, duration) {
    const N = 30;
    for (let i = 0; i <= N; i++) {
        const t = i / N;
        eqSetCompass(tip, {
            x: tip.x + (target.x - tip.x) * t,
            y: tip.y + (target.y - tip.y) * t
        });
        await sleep(duration / N);
    }
}

async function eqCompassMove(t1, p1, t2, p2, duration) {
    const N = 40;
    for (let i = 0; i <= N; i++) {
        const t = i / N;
        eqSetCompass(
            {x: t1.x + (t2.x - t1.x) * t, y: t1.y + (t2.y - t1.y) * t},
            {x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t}
        );
        await sleep(duration / N);
    }
}

async function eqCompassSweep(tip, radius, a1, a2, duration) {
    const N = 80;
    let path = '';
    for (let i = 0; i <= N; i++) {
        const t = i / N;
        const angle = a1 + (a2 - a1) * t;
        const pen = {
            x: tip.x + radius * Math.cos(angle),
            y: tip.y + radius * Math.sin(angle)
        };
        if (i === 0) path = `M ${pen.x.toFixed(1)} ${pen.y.toFixed(1)}`;
        else         path += ` L ${pen.x.toFixed(1)} ${pen.y.toFixed(1)}`;
        eqSetCompass(tip, pen);
        eqEl('arcCompas').setAttribute('d', path);
        eqEl('arcCompas').style.opacity = '1';
        await sleep(duration / N);
    }
}

async function eqNextStep() {
    const txt = eqEl('stepText');
    const btn = eqEl('nextBtn');
    if (eqCurrentStep >= 6) return;
    btn.disabled = true;

    if (eqCurrentStep === 0) {
        txt.innerHTML = eqStepTexts[1];
        eqEl('setSquare').setAttribute('transform',
            `translate(${EQ_START.x},${EQ_START.y}) rotate(${EQ_ANGLE})`);
        eqEl('setSquare').style.opacity = '1';
        await sleep(600);
        await eqSlideSquare(EQ_START, EQ_END, 2200);
        await sleep(800);
        eqCurrentStep = 1;
    }
    else if (eqCurrentStep === 1) {
        txt.innerHTML = eqStepTexts[2];
        eqEl('perpLine').style.opacity = '1';
        await sleep(1200);
        eqCurrentStep = 2;
    }
    else if (eqCurrentStep === 2) {
        txt.innerHTML = eqStepTexts[3];
        eqEl('setSquare').style.opacity = '0';
        await sleep(700);
        eqEl('squareO').style.opacity = '1';
        eqEl('labelO').style.opacity  = '1';
        await sleep(600);
        eqCurrentStep = 3;
    }
    else if (eqCurrentStep === 3) {
        txt.innerHTML = eqStepTexts[4];
        eqSetCompass(EQ_I, EQ_I);
        eqEl('compass').style.opacity = '1';
        await sleep(400);
        await eqCompassOpen(EQ_I, EQ_M, 1400);
        await sleep(800);
        eqCurrentStep = 4;
    }
    else if (eqCurrentStep === 4) {
        txt.innerHTML = eqStepTexts[5];
        const half  = 0.28;
        const aStart = EQ_angMp - half;
        const aEnd   = EQ_angMp + half;
        await eqCompassPivot(EQ_I, EQ_RADIUS, EQ_angM, aStart, 1200);
        await sleep(300);
        await eqCompassSweep(EQ_I, EQ_RADIUS, aStart, aEnd, 1400);
        await sleep(800);
        eqCurrentStep = 5;
    }
    else if (eqCurrentStep === 5) {
        txt.innerHTML = eqStepTexts[6];
        txt.style.background      = '#c8e6c9';
        txt.style.borderLeftColor = '#4caf50';
        txt.style.color           = '#2e7d32';
        eqEl('compass').style.opacity = '0';
        await sleep(400);
        eqEl('pointMp').style.opacity = '1';
        await sleep(600);
        eqEl('marks').style.opacity = '1';
        await sleep(400);
        eqCurrentStep = 6;
        btn.textContent = '✓ Terminé';
    }

    btn.disabled = false;
}

function eqResetAnimation() {
    const ids = ['setSquare','perpLine','squareO','labelO',
                 'arcCompas','marks','pointMp','compass'];
    ids.forEach(id => {
        const el = eqEl(id);
        if (el) el.style.opacity = '0';
    });
    const arc = eqEl('arcCompas');
    if (arc) arc.setAttribute('d', '');
    const sq = eqEl('setSquare');
    if (sq) sq.setAttribute('transform',
        `translate(${EQ_START.x},${EQ_START.y}) rotate(${EQ_ANGLE})`);

    const txt = eqEl('stepText');
    if (txt) {
        txt.innerHTML             = eqStepTexts[0];
        txt.style.background      = '#e3f2fd';
        txt.style.borderLeftColor = '#2196f3';
        txt.style.color           = '#1565c0';
    }
    const btn = eqEl('nextBtn');
    if (btn) {
        btn.textContent = '▶ Étape suivante';
        btn.disabled    = false;
    }
    eqCurrentStep = 0;
}

// ====================================================
// ANIMATION 2 : COMPAS SEUL (Slide 6)
// ====================================================
const CS_A  = {x:342, y:84};
const CS_B  = {x:481, y:361};
const CS_M  = {x:200, y:300};
const CS_Mp = {x:600, y:100};

const CS_R_A = Math.hypot(CS_M.x - CS_A.x, CS_M.y - CS_A.y);
const CS_R_B = Math.hypot(CS_M.x - CS_B.x, CS_M.y - CS_B.y);

const CS_angA_M  = Math.atan2(CS_M.y  - CS_A.y, CS_M.x  - CS_A.x);
const CS_angA_Mp = Math.atan2(CS_Mp.y - CS_A.y, CS_Mp.x - CS_A.x);
const CS_angB_M  = Math.atan2(CS_M.y  - CS_B.y, CS_M.x  - CS_B.x);
const CS_angB_Mp = Math.atan2(CS_Mp.y - CS_B.y, CS_Mp.x - CS_B.x);

let csCurrentStep = 0;

const csStepTexts = [
    'Cliquez sur « Étape suivante » pour voir la construction étape par étape.',
    '<strong style="color:#555;font-size:20px;">1.</strong> Je place deux points A et B sur la droite (d).',
    '<strong style="color:#e74c3c;font-size:20px;">2.</strong> Je trace un arc de cercle de <strong>centre A</strong> passant par M.',
    '<strong style="color:#27ae60;font-size:20px;">3.</strong> Je trace un arc de cercle de <strong>centre B</strong> passant par M.',
    '<strong style="color:#27ae60;font-size:20px;">4.</strong> Les deux arcs se coupent en M\'. M\' est le symétrique de M par rapport à (d). ✓'
];

const csEl = id => document.getElementById('cs_' + id);

function csSetCompass(tip, pen) {
    const hx = (tip.x + pen.x) / 2, hy = (tip.y + pen.y) / 2;
    csEl('compassHinge').setAttribute('cx', hx);
    csEl('compassHinge').setAttribute('cy', hy);
    csEl('compassPointBranch').setAttribute('x1', hx);
    csEl('compassPointBranch').setAttribute('y1', hy);
    csEl('compassPointBranch').setAttribute('x2', tip.x);
    csEl('compassPointBranch').setAttribute('y2', tip.y);
    csEl('compassPointTip').setAttribute('cx', tip.x);
    csEl('compassPointTip').setAttribute('cy', tip.y);
    csEl('compassPencilBranch').setAttribute('x1', hx);
    csEl('compassPencilBranch').setAttribute('y1', hy);
    csEl('compassPencilBranch').setAttribute('x2', pen.x);
    csEl('compassPencilBranch').setAttribute('y2', pen.y);
    const ang = Math.atan2(pen.y - hy, pen.x - hx) * 180 / Math.PI + 90;
    csEl('compassPencilBody').setAttribute('transform',
        `translate(${pen.x},${pen.y - 15}) rotate(${ang})`);
    csEl('compassPencilTip').setAttribute('transform',
        `translate(${pen.x - 5},${pen.y}) rotate(${ang} 5 0)`);
    csEl('compassPencilPoint').setAttribute('cx', pen.x);
    csEl('compassPencilPoint').setAttribute('cy', pen.y);
}

async function csCompassPivot(tip, radius, a1, a2, duration) {
    const N = 50;
    for (let i = 0; i <= N; i++) {
        const t = i / N;
        const angle = a1 + (a2 - a1) * t;
        csSetCompass(tip, {
            x: tip.x + radius * Math.cos(angle),
            y: tip.y + radius * Math.sin(angle)
        });
        await sleep(duration / N);
    }
}

async function csCompassOpen(tip, target, duration) {
    const N = 30;
    for (let i = 0; i <= N; i++) {
        const t = i / N;
        csSetCompass(tip, {
            x: tip.x + (target.x - tip.x) * t,
            y: tip.y + (target.y - tip.y) * t
        });
        await sleep(duration / N);
    }
}

async function csCompassMove(t1, p1, t2, p2, duration) {
    const N = 40;
    for (let i = 0; i <= N; i++) {
        const t = i / N;
        csSetCompass(
            {x: t1.x + (t2.x - t1.x) * t, y: t1.y + (t2.y - t1.y) * t},
            {x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t}
        );
        await sleep(duration / N);
    }
}

async function csCompassSweep(arcId, tip, radius, a1, a2, duration) {
    const N = 70;
    let path = '';
    for (let i = 0; i <= N; i++) {
        const t = i / N;
        const angle = a1 + (a2 - a1) * t;
        const pen = {
            x: tip.x + radius * Math.cos(angle),
            y: tip.y + radius * Math.sin(angle)
        };
        if (i === 0) path = `M ${pen.x.toFixed(1)} ${pen.y.toFixed(1)}`;
        else         path += ` L ${pen.x.toFixed(1)} ${pen.y.toFixed(1)}`;
        csSetCompass(tip, pen);
        csEl(arcId).setAttribute('d', path);
        csEl(arcId).style.opacity = '1';
        await sleep(duration / N);
    }
}

async function csNextStep() {
    const txt = csEl('stepText');
    const btn = csEl('nextBtn');
    if (csCurrentStep >= 4) return;
    btn.disabled = true;

    if (csCurrentStep === 0) {
        txt.innerHTML = csStepTexts[1];
        csEl('ptA').style.opacity = '1';
        csEl('ptB').style.opacity = '1';
        await sleep(1200);
        csCurrentStep = 1;
    }
    else if (csCurrentStep === 1) {
        txt.innerHTML = csStepTexts[2];
        csSetCompass(CS_A, CS_A);
        csEl('compass').style.opacity = '1';
        await sleep(400);
        await csCompassOpen(CS_A, CS_M, 1200);   // prise de l'écartement AM
        await sleep(700);
        const half_A  = 0.30;
        const aA_start = CS_angA_Mp - half_A;
        const aA_end   = CS_angA_Mp + half_A;
        await csCompassPivot(CS_A, CS_R_A, CS_angA_M, aA_start, 1000);
        await sleep(300);
        await csCompassSweep('arc1', CS_A, CS_R_A, aA_start, aA_end, 1400);
        await sleep(800);
        csCurrentStep = 2;
    }
    else if (csCurrentStep === 2) {
        txt.innerHTML = csStepTexts[3];

        // 1. Déplacer le compas de A vers B, écartement CS_R_A constant
        //    (même direction que la fin de l'arc A — compas jamais refermé)
        const csAngEndA = CS_angA_Mp + 0.30;
        const csDxA = Math.cos(csAngEndA), csDyA = Math.sin(csAngEndA);
        const csN_t = 40;
        for (let i = 0; i <= csN_t; i++) {
            const t = i / csN_t;
            const tip = { x: CS_A.x + (CS_B.x - CS_A.x) * t, y: CS_A.y + (CS_B.y - CS_A.y) * t };
            csSetCompass(tip, { x: tip.x + CS_R_A * csDxA, y: tip.y + CS_R_A * csDyA });
            await sleep(1000 / csN_t);
        }
        await sleep(300);

        // 2. En B, prendre l'écartement BM : mine glisse de sa direction courante vers M
        const csPenAtB = { x: CS_B.x + CS_R_A * csDxA, y: CS_B.y + CS_R_A * csDyA };
        await csCompassMove(CS_B, csPenAtB, CS_B, CS_M, 800);
        await sleep(500);
        const half_B  = 0.30;
        const aB_start = CS_angB_Mp - half_B;
        const aB_end   = CS_angB_Mp + half_B;
        await csCompassPivot(CS_B, CS_R_B, CS_angB_M, aB_start, 1000);
        await sleep(300);
        await csCompassSweep('arc2', CS_B, CS_R_B, aB_start, aB_end, 1400);
        await sleep(800);
        csCurrentStep = 3;
    }
    else if (csCurrentStep === 3) {
        txt.innerHTML = csStepTexts[4];
        txt.style.background      = '#c8e6c9';
        txt.style.borderLeftColor = '#4caf50';
        txt.style.color           = '#2e7d32';
        csEl('compass').style.opacity = '0';
        await sleep(400);
        csEl('pointMp').style.opacity = '1';
        await sleep(400);
        csCurrentStep = 4;
        btn.textContent = '✓ Terminé';
    }

    btn.disabled = false;
}

function csResetAnimation() {
    const ids = ['ptA','ptB','arc1','arc2','pointMp','compass'];
    ids.forEach(id => {
        const el = csEl(id);
        if (el) el.style.opacity = '0';
    });
    ['arc1','arc2'].forEach(id => {
        const el = csEl(id);
        if (el) el.setAttribute('d', '');
    });

    const txt = csEl('stepText');
    if (txt) {
        txt.innerHTML             = csStepTexts[0];
        txt.style.background      = '#e3f2fd';
        txt.style.borderLeftColor = '#2196f3';
        txt.style.color           = '#1565c0';
    }
    const btn = csEl('nextBtn');
    if (btn) {
        btn.textContent = '▶ Étape suivante';
        btn.disabled    = false;
    }
    csCurrentStep = 0;
}
