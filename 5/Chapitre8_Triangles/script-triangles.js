// ============================================================
//  Chapitre 8 – Les triangles  |  Contrôleur de présentation
// ============================================================

let currentSlideIndex = 0;
let currentStepIndex  = 0;
const slides      = document.querySelectorAll('.slide');
const totalSlides = slides.length;

const slideTitles = [
    "Les triangles",
    "I. Somme des angles d'un triangle",
    "II. Inégalité triangulaire",
    "III.1) Construction – 3 côtés",
    "III.2) Construction – angle + 2 côtés",
    "III.3) Construction – 2 angles + côté",
    "IV. La médiatrice – Définition",
    "IV. Médiatrice – Méthode équerre",
    "IV. Médiatrice – Propriétés",
    "IV. Médiatrice – Méthode compas",
    "IV. Cercle circonscrit"
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

    const stepIndicator = document.getElementById('stepIndicator');
    if (totalSteps > 0 && currentStepIndex < totalSteps) {
        stepIndicator.textContent = `Étape ${currentStepIndex}/${totalSteps}`;
        stepIndicator.classList.remove('hidden');
    } else {
        stepIndicator.classList.add('hidden');
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
