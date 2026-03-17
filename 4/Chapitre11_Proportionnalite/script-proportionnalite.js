// Variables globales
let currentSlideIndex = 0;
let currentStepIndex = 0;
let slides = null;
let totalSlides = 0;

// Titres des slides du Chapitre 11
const slideTitles = [
    "Chapitre 11 : Proportionnalité",                             // Slide 1
    "I. Reconnaître — Dans un tableau",                           // Slide 2
    "I. Sur un graphique",                                        // Slide 3
    "I. Dans une formule",                                        // Slide 4
    "II. Remplir — Première méthode : coefficient",               // Slide 5
    "II. Diagramme coefficient (schéma interactif)",              // Slide 6
    "II. Deuxième méthode : produit en croix",                    // Slide 7
    "III. Applications — Appliquer un taux de pourcentage",       // Slide 8
    "III. Calculer un pourcentage",                               // Slide 9
    "III. Augmentations et remises",                              // Slide 10
    "III. Vitesse — a) Vitesse moyenne",                          // Slide 11
    "III. Vitesse — b) Conversion des unités",                    // Slide 12
    "III. Échelle"                                                // Slide 13
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

    initGraphique();
    initPilules();
    initCroix();

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

    const contentDiv = document.querySelector('.content');

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
// ANIMATION 1 : Graphique (Slide 3)
// ====================================================
let ptsOk = false, lineOk = false, inAnim = false;

function initGraphique() {
    document.querySelectorAll('.pt').forEach(el => el.style.opacity = '0');

    const droite = document.getElementById('droite');
    if (droite) {
        droite.style.strokeDasharray = '500';
        droite.style.strokeDashoffset = '500';
    }
    const lbl = document.getElementById('graph-eq-lbl');
    const ori = document.getElementById('lbl-origine');
    if (lbl) lbl.style.opacity = '0';
    if (ori) ori.style.opacity = '0';

    ptsOk = false; lineOk = false; inAnim = false;
}

function showPoints() {
    if (ptsOk || inAnim) return;
    inAnim = true;
    document.getElementById('btnShowPts').disabled = true;
    const pts = document.querySelectorAll('.pt');
    pts.forEach((pt, i) => {
        setTimeout(() => {
            pt.style.transition = 'opacity 0.4s';
            pt.style.opacity = '1';
            if (i === pts.length - 1) {
                setTimeout(() => {
                    ptsOk = true; inAnim = false;
                    const btn = document.getElementById('btnDrawLine');
                    btn.disabled = false;
                    btn.style.background = '#2980b9';
                    btn.style.cursor = 'pointer';
                }, 500);
            }
        }, i * 700);
    });
}

function drawLine() {
    if (!ptsOk || lineOk || inAnim) return;
    inAnim = true;
    document.getElementById('btnDrawLine').disabled = true;
    const d = document.getElementById('droite');
    if (d) {
        setTimeout(() => {
            d.style.transition = 'stroke-dashoffset 1.8s ease-out';
            d.style.strokeDashoffset = '0';
            setTimeout(() => {
                lineOk = true; inAnim = false;
                const lbl = document.getElementById('graph-eq-lbl');
                const ori = document.getElementById('lbl-origine');
                lbl.style.transition = 'opacity 0.5s'; lbl.style.opacity = '1';
                ori.style.transition = 'opacity 0.5s'; ori.style.opacity = '1';
            }, 1900);
        }, 30);
    }
}

function resetGraph() {
    ptsOk = false; lineOk = false; inAnim = false;
    document.querySelectorAll('.pt').forEach(el => { el.style.transition='none'; el.style.opacity='0'; });
    const d = document.getElementById('droite');
    if (d) { d.style.transition='none'; d.style.strokeDashoffset='500'; }
    ['graph-eq-lbl','lbl-origine'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.style.transition='none'; el.style.opacity='0'; }
    });
    const btnShow = document.getElementById('btnShowPts');
    if (btnShow) btnShow.disabled = false;
    const btn = document.getElementById('btnDrawLine');
    if (btn) { btn.disabled = true; btn.style.background='#95a5a6'; btn.style.cursor='not-allowed'; }
}

// ====================================================
// ANIMATION 2 : Coefficient de proportionnalité (Slide 5)
// ====================================================
function initPilules() {
    ['arcD1','arcU1','arcD2','arcU2'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const len = Math.round(el.getTotalLength()) + 5;
        el.style.strokeDasharray  = len;
        el.style.strokeDashoffset = len;
    });
    ['lblD1','lblU1','lblD2','lblU2','ptrD1','ptrU1','ptrD2','ptrU2','calculs1','calculs2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.opacity = '0';
    });
}

function showPilules() {
    const btn = document.getElementById('btnPilules');
    if (btn) btn.disabled = true;

    const seq = [
        { arc:'arcD1', ptr:'ptrD1', lbl:'lblD1' },
        { arc:'arcU1', ptr:'ptrU1', lbl:'lblU1' },
        { arc:'arcD2', ptr:'ptrD2', lbl:'lblD2' },
        { arc:'arcU2', ptr:'ptrU2', lbl:'lblU2' }
    ];
    seq.forEach(({ arc, ptr, lbl }, i) => {
        const t = 50 + i * 1200;
        setTimeout(() => {
            const a = document.getElementById(arc);
            if (a) { a.style.transition = 'stroke-dashoffset 0.8s ease-out'; a.style.strokeDashoffset = '0'; }
        }, t);
        setTimeout(() => {
            const p = document.getElementById(ptr);
            if (p) { p.style.transition = 'opacity 0.15s'; p.style.opacity = '1'; }
        }, t + 820);
        setTimeout(() => {
            const l = document.getElementById(lbl);
            if (l) { l.style.transition = 'opacity 0.4s'; l.style.opacity = '1'; }
        }, t + 980);
    });

    setTimeout(() => {
        const c1 = document.getElementById('calculs1');
        if (c1) { c1.style.transition = 'opacity 0.5s'; c1.style.opacity = '1'; }
    }, 50 + 1*1200 + 980 + 400);

    setTimeout(() => {
        const c2 = document.getElementById('calculs2');
        if (c2) { c2.style.transition = 'opacity 0.5s'; c2.style.opacity = '1'; }
    }, 50 + 3*1200 + 980 + 400);
}

function resetPilules() {
    const btn = document.getElementById('btnPilules');
    if (btn) btn.disabled = false;
    ['lblD1','lblU1','lblD2','lblU2','ptrD1','ptrU1','ptrD2','ptrU2','calculs1','calculs2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.style.transition='none'; el.style.opacity='0'; }
    });
    ['arcD1','arcU1','arcD2','arcU2'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const len = Math.round(el.getTotalLength()) + 5;
        el.style.transition = 'none';
        el.style.strokeDashoffset = len;
    });
}

// ====================================================
// ANIMATION 3 : Produit en croix (Slide 6)
// ====================================================
function initCroix() {
    ['cA1','cA2','cB1','cB2'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const dx = el.getAttribute('x2') - el.getAttribute('x1');
        const dy = el.getAttribute('y2') - el.getAttribute('y1');
        const len = Math.round(Math.sqrt(dx*dx + dy*dy)) + 5;
        el.style.strokeDasharray  = len;
        el.style.strokeDashoffset = len;
    });
    ['fA1','fA2','fB1','fB2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.opacity = '0';
    });
    ['pA1','pA2','pB1','pB2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.opacity = '0';
    });
}

function showCroix() {
    const btn = document.getElementById('btnCroix');
    if (btn) btn.disabled = true;

    const pairs = [['cA1','pA1'],['cA2','pA2'],['cB1','pB1'],['cB2','pB2']];
    pairs.forEach(([lid, pid], i) => {
        setTimeout(() => {
            const l = document.getElementById(lid);
            if (l) { l.style.transition = 'stroke-dashoffset 0.6s ease-out'; l.style.strokeDashoffset = '0'; }
        }, i * 300);
        setTimeout(() => {
            const p = document.getElementById(pid);
            if (p) { p.style.transition = 'opacity 0.15s'; p.style.opacity = '1'; }
        }, i * 300 + 620);
    });

    setTimeout(() => {
        ['fA1','fA2','fB1','fB2'].forEach((id, i) => {
            setTimeout(() => {
                const el = document.getElementById(id);
                if (el) { el.style.transition = 'opacity 0.4s'; el.style.opacity = '1'; }
            }, i * 250);
        });
    }, 1600);
}

function resetCroix() {
    const btn = document.getElementById('btnCroix');
    if (btn) btn.disabled = false;
    ['cA1','cA2','cB1','cB2'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const dx = el.getAttribute('x2') - el.getAttribute('x1');
        const dy = el.getAttribute('y2') - el.getAttribute('y1');
        const len = Math.round(Math.sqrt(dx*dx + dy*dy)) + 5;
        el.style.transition = 'none';
        el.style.strokeDashoffset = len;
    });
    ['pA1','pA2','pB1','pB2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.style.transition='none'; el.style.opacity='0'; }
    });
    ['fA1','fA2','fB1','fB2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.style.transition='none'; el.style.opacity='0'; }
    });
}
