// Tableau des titres des slides
const slideTitles = [
    "Chapitre 1 : Les nombres entiers",
    "I. Numération décimale",
    "II. Comparer des nombres entiers",
    "III. Repérage sur une demi-droite graduée"
];

let currentSlideIndex = 0;
let currentStepIndex = 0;

function getSlides() {
    return document.querySelectorAll('.slide');
}

function updateSlideDisplay() {
    const slides = getSlides();
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlideIndex);
    });
    updateSteps();
    updateIndicators();
}

function updateSteps() {
    const currentSlide = getSlides()[currentSlideIndex];
    const steps = currentSlide.querySelectorAll('.step');
    steps.forEach((step, index) => {
        step.classList.toggle('visible', index < currentStepIndex);
    });
}

function updateIndicators() {
    document.getElementById('currentSlide').textContent = currentSlideIndex + 1;
    document.getElementById('totalSlides').textContent = getSlides().length;
    document.getElementById('prevBtn').disabled = currentSlideIndex === 0;
    updateStepIndicator();
}

function updateStepIndicator() {
    const currentSlide = getSlides()[currentSlideIndex];
    const steps = currentSlide.querySelectorAll('.step');
    const indicator = document.getElementById('stepIndicator');
    if (steps.length > 1) {
        indicator.textContent = `Étape ${currentStepIndex}/${steps.length}`;
        indicator.classList.remove('hidden');
    } else {
        indicator.classList.add('hidden');
    }
}

function changeSlide(direction) {
    const slides = getSlides();
    const newIndex = currentSlideIndex + direction;
    if (newIndex >= 0 && newIndex < slides.length) {
        currentSlideIndex = newIndex;
        currentStepIndex = 0;
        updateSlideDisplay();
    }
}

function nextStep() {
    const currentSlide = getSlides()[currentSlideIndex];
    const steps = currentSlide.querySelectorAll('.step');
    if (currentStepIndex < steps.length) {
        currentStepIndex++;
        updateSteps();
        updateStepIndicator();
    } else {
        changeSlide(1);
    }
}

function prevStep() {
    if (currentStepIndex > 0) {
        currentStepIndex--;
    } else {
        changeSlide(-1);
        const currentSlide = getSlides()[currentSlideIndex];
        currentStepIndex = currentSlide.querySelectorAll('.step').length;
    }
    updateSlideDisplay();
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
    if (e.key === 'ArrowRight' || e.key === ' ') nextStep();
    else if (e.key === 'ArrowLeft') prevStep();
    else if (e.key === 'm' || e.key === 'M') openMenu();
    else if (e.key === 'r' || e.key === 'R') resetSlide();
    else if (e.key === 'h' || e.key === 'H' || e.key === '?') openHelp();
    else if (e.key === 'Escape') {
        closeMenu();
        closeHelp();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    updateSlideDisplay();
});
