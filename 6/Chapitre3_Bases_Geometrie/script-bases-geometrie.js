// Tableau des titres des slides
const slideTitles = [
    "Chapitre 3 : Les bases de géométrie",
    "I. Rappels",
    "II. Points alignés et droites",
    "III. Position relative de deux droites — 1) Définitions",
    "III. Position relative de deux droites — 2) Angles formés par deux droites"
];

let currentSlideIndex = 0;
let currentStepIndex = 0;

function getSlides() {
    return document.querySelectorAll('.slide');
}

// Étapes d'une slide, triées par data-order quand il est présent (sinon ordre du document)
function stepsOf(slide) {
    return Array.from(slide.querySelectorAll('.step'))
        .map((el, i) => ({ el, i, o: el.dataset.order !== undefined ? +el.dataset.order : i }))
        .sort((a, b) => a.o - b.o || a.i - b.i)
        .map(x => x.el);
}

function updateSlideDisplay() {
    const slides = getSlides();
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlideIndex);
    });
    updateSteps();
    updateIndicators();
    scrollToCurrentStep();
}

function updateSteps() {
    const currentSlide = getSlides()[currentSlideIndex];
    const steps = stepsOf(currentSlide);
    steps.forEach((step, index) => {
        step.classList.toggle('visible', index < currentStepIndex);
    });
}

function scrollToCurrentStep() {
    const contentDiv = document.querySelector('.content');
    if (!contentDiv) return;
    if (currentStepIndex === 0) {
        setTimeout(() => {
            contentDiv.scrollTo({ top: 0, behavior: 'smooth' });
        }, 50);
    } else {
        setTimeout(() => {
            const currentSlide = getSlides()[currentSlideIndex];
            const visibleSteps = stepsOf(currentSlide).filter(s => s.classList.contains('visible'));
            if (visibleSteps.length > 0) {
                visibleSteps[visibleSteps.length - 1].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });
            }
        }, 350);
    }
}

function updateIndicators() {
    document.getElementById('currentSlide').textContent = currentSlideIndex + 1;
    document.getElementById('totalSlides').textContent = getSlides().length;
    document.getElementById('prevBtn').disabled = (currentSlideIndex === 0 && currentStepIndex === 0);
    updateStepIndicator();
}

function updateStepIndicator() {
    const currentSlide = getSlides()[currentSlideIndex];
    const steps = stepsOf(currentSlide);
    const indicator = document.getElementById('stepIndicator');
    if (steps.length > 1 && currentStepIndex < steps.length) {
        indicator.textContent = `Étape ${currentStepIndex}/${steps.length}`;
        indicator.classList.remove('hidden');
    } else {
        indicator.classList.add('hidden');
    }
}

// Navigation unique : gère à la fois l'avancée étape par étape à l'intérieur
// d'une slide et le passage à la slide suivante/précédente une fois toutes
// les étapes affichées (même logique pour les boutons et le clavier).
function changeSlide(direction) {
    const slides = getSlides();
    const currentSlide = slides[currentSlideIndex];
    const totalSteps = stepsOf(currentSlide).length;

    if (direction === 1) {
        if (currentStepIndex < totalSteps) {
            currentStepIndex++;
            updateSlideDisplay();
        } else if (currentSlideIndex < slides.length - 1) {
            currentSlideIndex++;
            currentStepIndex = 0;
            updateSlideDisplay();
        }
    } else {
        if (currentStepIndex > 0) {
            currentStepIndex--;
            updateSlideDisplay();
        } else if (currentSlideIndex > 0) {
            currentSlideIndex--;
            currentStepIndex = stepsOf(slides[currentSlideIndex]).length;
            updateSlideDisplay();
        }
    }
}

function resetSlide() {
    currentStepIndex = 0;
    updateSlideDisplay();
}

function openMenu() {
    const menu = document.getElementById('slideMenu');
    menu.classList.add('active');
    const slideList = document.getElementById('slideList');
    slideList.innerHTML = '';
    slideTitles.forEach((title, index) => {
        const li = document.createElement('button');
        li.className = 'menu-item';
        if (index === currentSlideIndex) li.classList.add('active');
        li.textContent = `${index + 1}. ${title}`;
        li.onclick = () => {
            currentSlideIndex = index;
            currentStepIndex = 0;
            updateSlideDisplay();
            closeMenu();
        };
        slideList.appendChild(li);
    });
}

function closeMenu() {
    document.getElementById('slideMenu').classList.remove('active');
}

function openHelp() {
    document.getElementById('helpOverlay').classList.add('active');
}

function closeHelp() {
    document.getElementById('helpOverlay').classList.remove('active');
}

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
    } else if (e.key === 'Escape') {
        closeMenu();
        closeHelp();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    updateSlideDisplay();
});
