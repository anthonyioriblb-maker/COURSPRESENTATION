// Variables globales
let currentSlideIndex = 0;
let currentStepIndex = 0;
let slides = null;
let totalSlides = 0;

// Titres des slides du Chapitre 11 - Fractions partie 2
const slideTitles = [
    "Chapitre 11 : Les fractions - Partie 2",                                   // Slide 1
    "I. Fraction d'une quantité",                                                // Slide 2
    "II. Additionner et soustraire — 1) Règle 1 — Même dénominateur",           // Slide 3
    "2) Règle 2 — Dénominateurs différents"                                      // Slide 4
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
// ANIMATION 1 : 1/4 + 5/6 (Slide 4)
// ====================================================
let step1 = 0;
const steps1 = ['s1_multiples', 's1_convert', 's1_result'];
const infos1 = [
    'Étape 1 : On liste les multiples de 4 et de 6 pour trouver le plus petit commun.',
    'Étape 2 : On convertit chaque fraction au dénominateur 12.',
    'Étape 3 : Même dénominateur → on additionne les numérateurs. Résultat : <strong style="color:#2ecc71;">13/12</strong>'
];

function nextStep1() {
    if (step1 < steps1.length) {
        document.getElementById('stepInfo1').innerHTML = infos1[step1];
        document.getElementById(steps1[step1]).classList.add('visible');
        step1++;
        if (step1 === steps1.length) document.getElementById('btnNext1').disabled = true;
    }
}

function resetStep1() {
    step1 = 0;
    document.getElementById('btnNext1').disabled = false;
    document.getElementById('stepInfo1').innerHTML = 'Cliquez sur "Étape suivante" pour démarrer';
    steps1.forEach(id => document.getElementById(id).classList.remove('visible'));
}

// ====================================================
// ANIMATION 2 : 14/6 - 11/9 (Slide 4)
// ====================================================
let step2 = 0;
const steps2 = ['s2_multiples', 's2_convert', 's2_diff', 's2_simplif'];
const infos2 = [
    'Étape 1 : On liste les multiples de 6 et de 9 pour trouver le plus petit commun.',
    'Étape 2 : On convertit chaque fraction au dénominateur 18. (14×3=42, 11×2=22)',
    'Étape 3 : Même dénominateur → on soustrait les numérateurs.',
    'Étape 4 : On simplifie 20/18 en divisant par 2. Résultat : <strong style="color:#2ecc71;">10/9</strong>'
];

function nextStep2() {
    if (step2 < steps2.length) {
        document.getElementById('stepInfo2').innerHTML = infos2[step2];
        document.getElementById(steps2[step2]).classList.add('visible');
        step2++;
        if (step2 === steps2.length) document.getElementById('btnNext2').disabled = true;
    }
}

function resetStep2() {
    step2 = 0;
    document.getElementById('btnNext2').disabled = false;
    document.getElementById('stepInfo2').innerHTML = 'Cliquez sur "Étape suivante" pour démarrer';
    steps2.forEach(id => document.getElementById(id).classList.remove('visible'));
}
