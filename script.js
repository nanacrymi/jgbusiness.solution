(function() {
    'use strict';

    const WHATSAPP_NUMBER = '233247217424'; // <-- Replace with your number

    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('.nav-links a');
    const hamburger = document.getElementById('hamburger');
    const navLinksContainer = document.getElementById('navLinks');
    const navbar = document.getElementById('navbar');
    const videoModal = document.getElementById('videoModal');
    const closeModal = document.getElementById('closeModal');
    const videoIframe = document.getElementById('videoIframe');
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    // ---------- Navigation ----------
    function navigateTo(pageId) {
        pages.forEach(p => p.classList.remove('active'));
        const target = document.getElementById('page-' + pageId);
        if (target) target.classList.add('active');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === pageId) link.classList.add('active');
        });
        navLinksContainer.classList.remove('open');
        hamburger.classList.remove('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (pageId === 'home') {
            history.pushState(null, '', window.location.pathname);
        } else {
            history.pushState(null, '', '#' + pageId);
        }
        if (pageId === 'services') setTimeout(initCarousel, 100);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page) navigateTo(page);
        });
    });

    document.querySelectorAll('[data-page]').forEach(el => {
        el.addEventListener('click', function(e) {
            if (this.closest('.nav-links')) return;
            e.preventDefault();
            const page = this.dataset.page;
            if (page) navigateTo(page);
        });
    });

    // ---------- Mobile Menu ----------
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinksContainer.classList.toggle('open');
    });

    document.addEventListener('click', function(e) {
        if (!navbar.contains(e.target) && navLinksContainer.classList.contains('open')) {
            navLinksContainer.classList.remove('open');
            hamburger.classList.remove('active');
        }
    });

    window.addEventListener('scroll', function() {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    });

    // ---------- Video Modal ----------
    function openVideo() {
        videoIframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0';
        videoModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    function closeVideo() {
        videoModal.classList.remove('open');
        videoIframe.src = '';
        document.body.style.overflow = '';
    }
    if (document.getElementById('playVideoBtn')) {
        document.getElementById('playVideoBtn').addEventListener('click', openVideo);
    }
    closeModal.addEventListener('click', closeVideo);
    videoModal.addEventListener('click', function(e) {
        if (e.target === this) closeVideo();
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeVideo();
    });

    // ---------- Stats Counters ----------
    function animateCounters() {
        const statNumbers = document.querySelectorAll('.stat-item .number');
        statNumbers.forEach(el => {
            const target = parseInt(el.dataset.count);
            if (!target) return;
            let current = 0;
            const increment = Math.ceil(target / 50);
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    el.textContent = target + '+';
                    clearInterval(timer);
                } else {
                    el.textContent = current;
                }
            }, 30);
        });
    }

    const homePage = document.getElementById('page-home');
    const observer = new MutationObserver(() => {
        if (homePage.classList.contains('active') && !homePage.dataset.counted) {
            homePage.dataset.counted = 'true';
            animateCounters();
        }
    });
    observer.observe(homePage, { attributes: true, attributeFilter: ['class'] });
    if (homePage.classList.contains('active')) {
        homePage.dataset.counted = 'true';
        setTimeout(animateCounters, 400);
    }

    // ---------- Form Validation ----------
    function validateField(group) {
        const input = group.querySelector('input, textarea');
        if (!input) return true;
        let isValid = true;
        if (input.hasAttribute('required') && !input.value.trim()) isValid = false;
        if (input.type === 'email' && input.value.trim()) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(input.value.trim())) isValid = false;
        }
        group.classList.toggle('error', !isValid);
        return isValid;
    }

    // ---------- Contact Form - Submit to WhatsApp ----------
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate all fields
        const groups = this.querySelectorAll('.form-group');
        let allValid = true;
        groups.forEach(group => { if (!validateField(group)) allValid = false; });
        if (!allValid) {
            const firstError = this.querySelector('.form-group.error input, .form-group.error textarea');
            if (firstError) firstError.focus();
            return;
        }

        // Gather form data
        const name = document.getElementById('name')?.value?.trim() || '';
        const email = document.getElementById('email')?.value?.trim() || '';
        const subject = document.getElementById('subject')?.value?.trim() || '';
        const message = document.getElementById('message')?.value?.trim() || '';

        // Build the WhatsApp message
        let whatsappMessage = '';
        if (name) whatsappMessage += `Name: ${name}\n`;
        if (email) whatsappMessage += `Email: ${email}\n`;
        if (subject) whatsappMessage += `Subject: ${subject}\n`;
        if (message) whatsappMessage += `Message: ${message}\n`;
        // Add a footer (optional)
        whatsappMessage += `\nSent from JG Business Solution website.`;

        // Encode the message for URL
        const encodedMessage = encodeURIComponent(whatsappMessage);

        // Create WhatsApp URL
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

        // Open in a new tab/window
        window.open(whatsappUrl, '_blank');

        // Show success toast
        toastMessage.textContent = 'Redirecting to WhatsApp...';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4000);

        // Reset the form
        contactForm.reset();
        groups.forEach(g => g.classList.remove('error'));
    });

    contactForm.querySelectorAll('.form-group input, .form-group textarea').forEach(el => {
        el.addEventListener('blur', function() { validateField(this.closest('.form-group')); });
        el.addEventListener('input', function() {
            const group = this.closest('.form-group');
            if (group.classList.contains('error')) validateField(group);
        });
    });

    // ---------- Hash Handling ----------
    function handleHash() {
        const hash = window.location.hash.replace('#', '');
        if (hash && ['home', 'services', 'about', 'contact'].includes(hash)) {
            navigateTo(hash);
        } else {
            navigateTo('home');
        }
    }
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash.replace('#', '');
        if (hash && ['home', 'services', 'about', 'contact'].includes(hash)) navigateTo(hash);
    });

    // ---------- SERVICES CAROUSEL ----------
    let currentSlide = 0, totalSlides = 0, autoPlayTimer = null;
    const carouselContainer = document.getElementById('servicesCarousel');
    const slidesContainer = document.getElementById('carouselSlides');
    const dotsContainer = document.getElementById('carouselDots');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');

    function initCarousel() {
        if (!slidesContainer || !carouselContainer) return;
        const slides = slidesContainer.querySelectorAll('.carousel-slide');
        totalSlides = slides.length;
        if (totalSlides === 0) return;
        dotsContainer.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
            if (i === 0) dot.classList.add('active');
            dot.dataset.index = i;
            dot.addEventListener('click', function() { goToSlide(parseInt(this.dataset.index)); resetAutoPlay(); });
            dotsContainer.appendChild(dot);
        }
        goToSlide(0);
        prevBtn.addEventListener('click', function() { goToSlide(currentSlide - 1); resetAutoPlay(); });
        nextBtn.addEventListener('click', function() { goToSlide(currentSlide + 1); resetAutoPlay(); });
        carouselContainer.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
        carouselContainer.addEventListener('mouseleave', startAutoPlay);
        startAutoPlay();
    }

    function goToSlide(index) {
        if (totalSlides === 0) return;
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        currentSlide = index;
        slidesContainer.style.transform = 'translateX(' + (-currentSlide * 100) + '%)';
        dotsContainer.querySelectorAll('button').forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
    }

    function startAutoPlay() { clearInterval(autoPlayTimer); autoPlayTimer = setInterval(() => goToSlide(currentSlide + 1), 5000); }
    function resetAutoPlay() { clearInterval(autoPlayTimer); startAutoPlay(); }

    let carouselInitialized = false;
    function checkAndInitCarousel() {
        const servicesPage = document.getElementById('page-services');
        if (servicesPage.classList.contains('active') && !carouselInitialized) {
            initCarousel();
            carouselInitialized = true;
        }
    }
    const pageObserver = new MutationObserver(checkAndInitCarousel);
    pages.forEach(page => pageObserver.observe(page, { attributes: true, attributeFilter: ['class'] }));
    checkAndInitCarousel();
    window.addEventListener('hashchange', () => setTimeout(checkAndInitCarousel, 50));

    // ---------- HOME CAROUSEL (smooth infinite loop) ----------
    let homeCurrentSlide = 0, homeTotalSlides = 0, homeAutoPlayTimer = null;
    const homeCarousel = document.getElementById('homeCarousel');
    const homeSlides = document.getElementById('homeSlides');
    const homeDots = document.getElementById('homeDots');
    const homePrev = document.getElementById('homePrev');
    const homeNext = document.getElementById('homeNext');

    let homeCarouselInitialized = false;

    function initHomeCarousel() {
        if (homeCarouselInitialized) return;
        clearInterval(homeAutoPlayTimer);

        if (!homeSlides || !homeCarousel) return;
        let slides = homeSlides.querySelectorAll('.home-slide');
        if (slides.length === 0) return;

        // Clone first slide for seamless loop
        const firstClone = slides[0].cloneNode(true);
        homeSlides.appendChild(firstClone);

        slides = homeSlides.querySelectorAll('.home-slide');
        homeTotalSlides = slides.length; // original + 1

        // Build dots (only for original slides)
        homeDots.innerHTML = '';
        const originalCount = homeTotalSlides - 1;
        for (let i = 0; i < originalCount; i++) {
            const dot = document.createElement('button');
            dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
            if (i === 0) dot.classList.add('active');
            dot.dataset.index = i;
            dot.addEventListener('click', function() {
                goToHomeSlide(parseInt(this.dataset.index));
                resetHomeAutoPlay();
            });
            homeDots.appendChild(dot);
        }

        homeCurrentSlide = 0;
        homeSlides.style.transition = 'transform 0.6s ease';
        homeSlides.style.transform = 'translateX(0%)';

        homePrev.addEventListener('click', function() {
            goToHomeSlide(homeCurrentSlide - 1);
            resetHomeAutoPlay();
        });
        homeNext.addEventListener('click', function() {
            goToHomeSlide(homeCurrentSlide + 1);
            resetHomeAutoPlay();
        });

        homeCarousel.addEventListener('mouseenter', () => clearInterval(homeAutoPlayTimer));
        homeCarousel.addEventListener('mouseleave', startHomeAutoPlay);

        let touchStartX = 0, touchEndX = 0;
        homeCarousel.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX);
        homeCarousel.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) goToHomeSlide(homeCurrentSlide + 1);
                else goToHomeSlide(homeCurrentSlide - 1);
                resetHomeAutoPlay();
            }
        });

        startHomeAutoPlay();
        homeCarouselInitialized = true;
    }

    function goToHomeSlide(index) {
        if (homeTotalSlides === 0) return;
        if (index < 0) index = 0;
        if (index > homeTotalSlides - 1) index = homeTotalSlides - 1;

        homeCurrentSlide = index;
        homeSlides.style.transition = 'transform 0.6s ease';
        homeSlides.style.transform = 'translateX(' + (-homeCurrentSlide * 100) + '%)';

        const originalCount = homeTotalSlides - 1;
        homeDots.querySelectorAll('button').forEach((dot, i) => {
            const activeIndex = (homeCurrentSlide === originalCount) ? 0 : homeCurrentSlide;
            dot.classList.toggle('active', i === activeIndex);
        });

        // If we reached the clone, jump back to first slide without animation
        if (homeCurrentSlide === homeTotalSlides - 1) {
            setTimeout(() => {
                homeSlides.style.transition = 'none';
                homeSlides.style.transform = 'translateX(0%)';
                homeCurrentSlide = 0;
                homeSlides.offsetHeight; // force reflow
                homeSlides.style.transition = 'transform 0.6s ease';
            }, 600);
        }
    }

    function startHomeAutoPlay() {
        clearInterval(homeAutoPlayTimer);
        homeAutoPlayTimer = setInterval(() => {
            goToHomeSlide(homeCurrentSlide + 1);
        }, 5500);
    }

    function resetHomeAutoPlay() {
        clearInterval(homeAutoPlayTimer);
        startHomeAutoPlay();
    }

    function checkAndInitHomeCarousel() {
        const homePage = document.getElementById('page-home');
        if (homePage.classList.contains('active')) {
            if (!homeCarouselInitialized) {
                setTimeout(() => { initHomeCarousel(); }, 200);
            }
        } else {
            clearInterval(homeAutoPlayTimer);
            homeAutoPlayTimer = null;
        }
    }

    const homePageObserver = new MutationObserver(checkAndInitHomeCarousel);
    pages.forEach(page => homePageObserver.observe(page, { attributes: true, attributeFilter: ['class'] }));
    checkAndInitHomeCarousel();
    window.addEventListener('hashchange', () => setTimeout(checkAndInitHomeCarousel, 50));

    // Initial navigation
    handleHash();

    console.log('🚀 JG Business Solution website loaded successfully!');
    console.log('✨ Your Ultimate Business Partner');
})();