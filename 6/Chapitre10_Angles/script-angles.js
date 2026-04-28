let currentSlideIndex = 0;
let currentStepIndex = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;

const slideTitles = [
    "Chapitre 10 : Les angles",
    "I. Vocabulaire",
    "II. Mesure d'un angle — 1) Mesure en degrés",
    "II. Mesure d'un angle — 2) Nature des angles",
    "II. Mesure d'un angle — 3) Tracer un angle de mesure donnée",
    "III. Angles supplémentaires",
    "IV. Angles adjacents",
    "V. Angles opposés par le sommet",
    "VI. La bissectrice — 1) Définition",
    "VI. La bissectrice — 2) Tracer la bissectrice au rapporteur"
];

document.getElementById('totalSlides').textContent = totalSlides;

function getSteps(slide) {
    return Array.from(slide.querySelectorAll('.step')).filter(el =>
        !el.closest('.animation-container')
    );
}

function initSlideMenu() {
    const slideList = document.getElementById('slideList');
    slideList.innerHTML = '';
    slideTitles.forEach((title, index) => {
        const slideItem = document.createElement('div');
        slideItem.className = 'slide-item';
        if (index === currentSlideIndex) slideItem.classList.add('current');
        slideItem.innerHTML = `<div class="slide-number">Slide ${index + 1}</div><div class="slide-title">${title}</div>`;
        slideItem.onclick = () => goToSlide(index);
        slideList.appendChild(slideItem);
    });
}

function openMenu() { initSlideMenu(); document.getElementById('slideMenu').classList.add('active'); }
function closeMenu() { document.getElementById('slideMenu').classList.remove('active'); }
function openHelp() { document.getElementById('helpOverlay').classList.add('active'); }
function closeHelp() { document.getElementById('helpOverlay').classList.remove('active'); }

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
    slides.forEach((slide, index) => {
        slide.classList.remove('active');
        if (index === currentSlideIndex) slide.classList.add('active');
    });

    const steps = getSteps(slides[currentSlideIndex]);
    steps.forEach((step, index) => {
        if (index < currentStepIndex) step.classList.add('visible');
        else step.classList.remove('visible');
    });

    document.getElementById('currentSlide').textContent = currentSlideIndex + 1;
    document.getElementById('prevBtn').disabled = currentSlideIndex === 0 && currentStepIndex === 0;

    const stepIndicator = document.getElementById('stepIndicator');
    if (steps.length > 0) {
        stepIndicator.textContent = `Étape ${currentStepIndex}/${steps.length}`;
        stepIndicator.classList.remove('hidden');
    } else {
        stepIndicator.classList.add('hidden');
    }

    const contentDiv = document.querySelector('.content');
    if (currentStepIndex === 0 && contentDiv) {
        setTimeout(() => { contentDiv.scrollTo({ top: 0, behavior: 'smooth' }); }, 50);
    } else if (currentStepIndex > 0) {
        setTimeout(() => {
            const visibleSteps = slides[currentSlideIndex].querySelectorAll('.step.visible');
            if (visibleSteps.length > 0) {
                visibleSteps[visibleSteps.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            }
        }, 650);
    }
}

function changeSlide(direction) {
    const steps = getSteps(slides[currentSlideIndex]);
    if (direction === 1) {
        if (currentStepIndex < steps.length) {
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
            currentStepIndex = getSteps(slides[currentSlideIndex]).length;
            updateSlide();
        }
    }
}

document.addEventListener('keydown', (e) => {
    if (document.getElementById('slideMenu').classList.contains('active')) { if (e.key === 'Escape') closeMenu(); return; }
    if (document.getElementById('helpOverlay').classList.contains('active')) { if (e.key === 'Escape') closeHelp(); return; }
    if (e.key === 'ArrowUp' || e.key === ' ') { e.preventDefault(); changeSlide(1); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); changeSlide(-1); }
    else if (e.key === 'm' || e.key === 'M') openMenu();
    else if (e.key === 'r' || e.key === 'R') resetSlide();
    else if (e.key === 'h' || e.key === 'H' || e.key === '?') openHelp();
    else if (e.key === 'Escape') { closeMenu(); closeHelp(); }
});

document.getElementById('slideMenu').addEventListener('click', (e) => { if (e.target.id === 'slideMenu') closeMenu(); });
document.getElementById('helpOverlay').addEventListener('click', (e) => { if (e.target.id === 'helpOverlay') closeHelp(); });

updateSlide();
