let currentSlideIndex = 0;
let currentStepIndex = 0;
let slides = null;
let totalSlides = 0;

const slideTitles = [
    "Théorème de Thalès",
    "I. Produit en croix",
    "II. Théorème de Thalès",
    "Exemples d'application",
    "III. Réciproque",
    "IV. Contraposée",
    "V. Agrandissement et réduction"
];

document.addEventListener('DOMContentLoaded', function() {
    slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;
    const totalSlidesElement = document.getElementById('totalSlides');
    if (totalSlidesElement) totalSlidesElement.textContent = totalSlides;
    updateSlide();
});

function initSlideMenu() {
    const slideList = document.getElementById('slideList');
    if (!slideList) return;
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

function openMenu() { initSlideMenu(); const m = document.getElementById('slideMenu'); if (m) m.classList.add('active'); }
function closeMenu() { const m = document.getElementById('slideMenu'); if (m) m.classList.remove('active'); }
function openHelp() { const h = document.getElementById('helpOverlay'); if (h) h.classList.add('active'); }
function closeHelp() { const h = document.getElementById('helpOverlay'); if (h) h.classList.remove('active'); }

function goToSlide(index) { currentSlideIndex = index; currentStepIndex = 0; updateSlide(); closeMenu(); }
function resetSlide() { currentStepIndex = 0; updateSlide(); }

function updateSlide() {
    if (!slides || slides.length === 0) return;
    const contentDiv = document.querySelector('.content');
    slides.forEach((slide, index) => {
        slide.classList.remove('active');
        if (index === currentSlideIndex) slide.classList.add('active');
    });
    const currentSlide = slides[currentSlideIndex];
    const steps = currentSlide.querySelectorAll('.step');
    const totalSteps = steps.length;
    steps.forEach((step, index) => {
        if (index < currentStepIndex) step.classList.add('visible');
        else step.classList.remove('visible');
    });
    const currentSlideElement = document.getElementById('currentSlide');
    if (currentSlideElement) currentSlideElement.textContent = currentSlideIndex + 1;
    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) prevBtn.disabled = currentSlideIndex === 0 && currentStepIndex === 0;
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
        setTimeout(() => { contentDiv.scrollTo({ top: 0, behavior: 'smooth' }); }, 50);
    } else if (currentStepIndex > 0) {
        setTimeout(() => {
            const visibleSteps = currentSlide.querySelectorAll('.step.visible');
            if (visibleSteps.length > 0) {
                visibleSteps[visibleSteps.length - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 650);
    }
}

function changeSlide(direction) {
    if (!slides || slides.length === 0) return;
    const currentSlide = slides[currentSlideIndex];
    const steps = currentSlide.querySelectorAll('.step');
    const totalSteps = steps.length;
    if (direction === 1) {
        if (currentStepIndex < totalSteps) { currentStepIndex++; updateSlide(); }
        else if (currentSlideIndex < totalSlides - 1) { currentSlideIndex++; currentStepIndex = 0; updateSlide(); }
    } else {
        if (currentStepIndex > 0) { currentStepIndex--; updateSlide(); }
        else if (currentSlideIndex > 0) {
            currentSlideIndex--;
            const prevSteps = slides[currentSlideIndex].querySelectorAll('.step');
            currentStepIndex = prevSteps.length;
            updateSlide();
        }
    }
}

document.addEventListener('keydown', (e) => {
    const slideMenu = document.getElementById('slideMenu');
    const helpOverlay = document.getElementById('helpOverlay');
    if (slideMenu && slideMenu.classList.contains('active')) { if (e.key === 'Escape') closeMenu(); return; }
    if (helpOverlay && helpOverlay.classList.contains('active')) { if (e.key === 'Escape' || e.key === 'h' || e.key === 'H' || e.key === '?') closeHelp(); return; }
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === ' ') { e.preventDefault(); changeSlide(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); changeSlide(-1); }
    else if (e.key === 'm' || e.key === 'M') openMenu();
    else if (e.key === 'r' || e.key === 'R') resetSlide();
    else if (e.key === 'h' || e.key === 'H' || e.key === '?') openHelp();
});

document.addEventListener('click', (e) => {
    const slideMenu = document.getElementById('slideMenu');
    if (slideMenu && e.target.id === 'slideMenu') closeMenu();
    const helpOverlay = document.getElementById('helpOverlay');
    if (helpOverlay && e.target.id === 'helpOverlay') closeHelp();
});
