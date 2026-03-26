/* ============================================================
   CUSTOM CURSOR + TRAIL
============================================================ */

// Bail out on touch devices or if user prefers reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouchDevice = window.matchMedia('(hover: none)').matches;

if (!prefersReducedMotion && !isTouchDevice) {
    initCursor();
}

function initCursor() {
    const cursor = document.querySelector('.cursor');
    if (!cursor) return;

    // ── Trail config ──────────────────────────────────────────
    const TRAIL_COUNT = 16;
    const dots = [];

    for (let i = 0; i < TRAIL_COUNT; i++) {
        const dot = document.createElement('div');
        dot.className = 'trail-dot';
        document.body.appendChild(dot);

        // Dots get smaller and more transparent toward the tail
        const size = Math.max(2.5, 9 - i * 0.38);
        dot.style.width  = size + 'px';
        dot.style.height = size + 'px';

        dots.push({
            el: dot,
            x: -200,
            y: -200,
            size,
        });
    }

    // ── Mouse tracking ────────────────────────────────────────
    let mouse = { x: -200, y: -200 };

    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        cursor.style.left = e.clientX + 'px';
        cursor.style.top  = e.clientY + 'px';
    });

    // ── Cursor state: click ───────────────────────────────────
    document.addEventListener('mousedown', () => cursor.classList.add('is-clicking'));
    document.addEventListener('mouseup',   () => cursor.classList.remove('is-clicking'));

    // ── Cursor state: hover interactive elements ──────────────
    const interactives = document.querySelectorAll(
        'a, button, [role="button"], input, textarea, select, label[for]'
    );

    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
    });

    // ── Cursor state: text elements ───────────────────────────
    const textEls = document.querySelectorAll('p, h1, h2, h3, span:not(.project-arrow)');
    textEls.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (!cursor.classList.contains('is-hovering')) {
                cursor.classList.add('is-text');
            }
        });
        el.addEventListener('mouseleave', () => cursor.classList.remove('is-text'));
    });

    // ── Hide cursor when leaving window ───────────────────────
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        dots.forEach(d => d.el.style.opacity = '0');
    });
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });

    // ── Animation loop: snake trail ───────────────────────────
    function animate() {
        let prevX = mouse.x;
        let prevY = mouse.y;

        dots.forEach((dot, i) => {
            // Each dot chases the one ahead of it, with decreasing speed
            const speed = Math.max(0.04, 0.34 - i * 0.015);
            dot.x += (prevX - dot.x) * speed;
            dot.y += (prevY - dot.y) * speed;

            dot.el.style.left    = dot.x + 'px';
            dot.el.style.top     = dot.y + 'px';
            dot.el.style.opacity = ((1 - i / TRAIL_COUNT) * 0.65).toString();

            prevX = dot.x;
            prevY = dot.y;
        });

        requestAnimationFrame(animate);
    }

    animate();
}

/* ============================================================
   STICKY WORK SECTION
============================================================ */
(function () {
    const wrapper      = document.querySelector('.work-sticky-wrapper');
    if (!wrapper) return;

    const slides       = document.querySelectorAll('.work-slide');
    const counterEl    = document.querySelector('.work-counter-current');
    const progressFill = document.querySelector('.work-progress-fill');
    const isMobile     = () => window.innerWidth <= 600;
    const total        = slides.length;

    function update() {
        const rect       = wrapper.getBoundingClientRect();
        const scrollable = wrapper.offsetHeight - window.innerHeight;
        const scrolled   = Math.max(0, -rect.top);
        const progress   = Math.min(1, scrolled / scrollable);

        // Which slide is active (0, 1, or 2)
        const activeIndex = Math.min(total - 1, Math.floor(progress * total));

        slides.forEach((slide, i) => {
            slide.classList.remove('is-active', 'is-past');
            if (i === activeIndex)   slide.classList.add('is-active');
            else if (i < activeIndex) slide.classList.add('is-past');
        });

        // Update counter number
        if (counterEl) counterEl.textContent = String(activeIndex + 1).padStart(2, '0');

        // Update progress bar (vertical on desktop, horizontal on mobile)
        if (progressFill) {
            const pct = (progress * 100) + '%';
            if (isMobile()) {
                progressFill.style.height = '100%';
                progressFill.style.width  = pct;
            } else {
                progressFill.style.width  = '100%';
                progressFill.style.height = pct;
            }
        }
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();
})();

/* ============================================================
   SCROLL ANIMATIONS (fade-up for non-work sections)
============================================================ */
(function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const fadeEls = document.querySelectorAll(
        '.about-inner .section-label, .about-text, .btn, .contact-title, .contact-links'
    );

    fadeEls.forEach(el => {
        el.style.opacity    = '0';
        el.style.transform  = 'translateY(32px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.65s ease';
        el.style.willChange = 'opacity, transform';
    });

    document.querySelectorAll('.about-text').forEach((el, i) => {
        el.style.transitionDelay = `${i * 0.13}s`;
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            el.style.opacity         = '1';
            el.style.transform       = 'none';
            el.style.willChange      = 'auto';
            el.style.transitionDelay = '';
            observer.unobserve(el);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

    fadeEls.forEach(el => observer.observe(el));
})();

/* ============================================================
   SMOOTH ACTIVE NAV LINK (highlight current section)
============================================================ */
(function () {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => {
                        link.removeAttribute('aria-current');
                        if (link.getAttribute('href') === '#' + entry.target.id) {
                            link.setAttribute('aria-current', 'true');
                        }
                    });
                }
            });
        },
        { rootMargin: '-40% 0px -55% 0px' }
    );

    sections.forEach(section => observer.observe(section));
})();
