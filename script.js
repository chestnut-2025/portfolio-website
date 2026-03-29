document.addEventListener('DOMContentLoaded', function () {
    window.scrollTo(0, 0);
});

/* ============================================================
   LIVE CLOCK + VISITOR LOCATION
============================================================ */
(function () {
    var timeEl     = document.getElementById('heroTime');
    var locationEl = document.getElementById('heroLocation');
    var sepEl      = document.getElementById('heroMetaSep');
    if (!timeEl) return;

    // Clock
    function tick() {
        var now  = new Date();
        var h    = now.getHours();
        var m    = String(now.getMinutes()).padStart(2, '0');
        var ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        timeEl.textContent = h + ':' + m + ' ' + ampm;
    }
    tick();
    setInterval(tick, 1000);

    // Location via geolocation + reverse geocode
    if (!locationEl || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(function (pos) {
        var lat = pos.coords.latitude;
        var lon = pos.coords.longitude;
        fetch('https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lon + '&format=json')
            .then(function (r) { return r.json(); })
            .then(function (data) {
                var city = data.address.city
                        || data.address.town
                        || data.address.village
                        || data.address.county
                        || '';
                if (city) {
                    locationEl.textContent = city;
                    if (sepEl) sepEl.style.display = '';
                }
            })
            .catch(function () {});
    }, function () {
        // Permission denied or unavailable — show nothing
    });
})();

/* ============================================================
   CUSTOM CURSOR — two rings
============================================================ */
(function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;

    const inner = document.querySelector('.cursor-inner');
    const outer = document.querySelector('.cursor-outer');
    const label = outer && outer.querySelector('.cursor-label');
    if (!inner || !outer) return;

    let mouse     = { x: -200, y: -200 };
    let innerPos  = { x: -200, y: -200 };
    let outerPos  = { x: -200, y: -200 };

    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // ── Click ─────────────────────────────────────────────────
    document.addEventListener('mousedown', () => {
        inner.classList.add('is-clicking');
        outer.classList.add('is-clicking');
    });
    document.addEventListener('mouseup', () => {
        inner.classList.remove('is-clicking');
        outer.classList.remove('is-clicking');
    });

    // ── Hide when leaving window ──────────────────────────────
    document.addEventListener('mouseleave', () => {
        inner.style.opacity = '0';
        outer.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        inner.style.opacity = '';
        outer.style.opacity = '';
    });

    // ── Hover: project CTAs ───────────────────────────────────
    document.querySelectorAll('.project-cta').forEach(el => {
        el.addEventListener('mouseenter', () => {
            inner.classList.add('is-hovering', 'is-view');
            outer.classList.add('is-hovering', 'is-view');
            if (label) label.textContent = 'View';
        });
        el.addEventListener('mouseleave', () => {
            inner.classList.remove('is-hovering', 'is-view');
            outer.classList.remove('is-hovering', 'is-view');
            if (label) label.textContent = '';
        });
    });

    // ── Hover: other links & buttons ──────────────────────────
    document.querySelectorAll('a:not(.project-cta), button, [role="button"]').forEach(el => {
        el.addEventListener('mouseenter', () => {
            inner.classList.add('is-hovering');
            outer.classList.add('is-hovering');
        });
        el.addEventListener('mouseleave', () => {
            inner.classList.remove('is-hovering');
            outer.classList.remove('is-hovering');
        });
    });

    // ── Hover: text ───────────────────────────────────────────
    document.querySelectorAll('p, h1, h2, h3').forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (!inner.classList.contains('is-hovering')) {
                inner.classList.add('is-text');
                outer.classList.add('is-text');
            }
        });
        el.addEventListener('mouseleave', () => {
            inner.classList.remove('is-text');
            outer.classList.remove('is-text');
        });
    });

    // ── Animation loop: inner faster, outer slower ────────────
    function animate() {
        innerPos.x += (mouse.x - innerPos.x) * 0.18;
        innerPos.y += (mouse.y - innerPos.y) * 0.18;
        outerPos.x += (mouse.x - outerPos.x) * 0.09;
        outerPos.y += (mouse.y - outerPos.y) * 0.09;

        inner.style.transform = `translate(calc(${innerPos.x}px - 50%), calc(${innerPos.y}px - 50%))`;
        outer.style.transform = `translate(calc(${outerPos.x}px - 50%), calc(${outerPos.y}px - 50%))`;

        requestAnimationFrame(animate);
    }
    animate();
})();

/* ============================================================
   ERASER INTERACTION (canvas scratch-off — orig text drawn on canvas)
============================================================ */
(function () {
    var orig   = document.getElementById('textOriginal');
    var reveal = document.getElementById('textReveal');
    var canvas = document.getElementById('eraserCanvas');
    var hint   = document.querySelector('.eraser-hint');
    var cur     = document.querySelector('.cursor-inner');
    var curRing = document.querySelector('.cursor-outer');
    if (!orig || !reveal || !canvas) return;

    var ctx      = canvas.getContext('2d');
    var done     = false;
    var hintGone = false;
    var wasOver  = false;
    var RADIUS   = 52;
    var BG       = '#FAFAF8';

    // Coverage tracking
    var COLS      = 12;
    var ROWS      = 5;
    var covered   = new Set();
    var TOTAL     = COLS * ROWS;
    var THRESHOLD = 0.88;

    function wrapText(text, maxWidth) {
        var words = text.split(' ');
        var lines = [];
        var line  = '';
        for (var i = 0; i < words.length; i++) {
            var test = line ? line + ' ' + words[i] : words[i];
            if (line && ctx.measureText(test).width > maxWidth) {
                lines.push(line);
                line = words[i];
            } else {
                line = test;
            }
        }
        if (line) lines.push(line);
        return lines;
    }

    function initCanvas() {
        var w   = orig.offsetWidth;
        var h   = orig.offsetHeight;
        if (!w || !h) { setTimeout(initCanvas, 50); return; }

        var dpr = window.devicePixelRatio || 1;

        // Size canvas backing store at full device resolution
        canvas.width  = w * dpr;
        canvas.height = h * dpr;
        // Keep CSS size at layout pixels so it sits correctly
        canvas.style.width  = w + 'px';
        canvas.style.height = h + 'px';

        ctx.scale(dpr, dpr);

        // 1. Fill canvas with page background (hides reveal text below)
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, w, h);

        // 2. Draw orig text onto canvas so it looks identical to the HTML element
        var cs  = window.getComputedStyle(orig);
        var lH  = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.06;
        ctx.font         = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
        ctx.fillStyle    = cs.color;
        ctx.textBaseline = 'top';
        if ('letterSpacing' in ctx) ctx.letterSpacing = cs.letterSpacing;

        var lines = wrapText(orig.textContent.trim(), w);
        lines.forEach(function (line, i) {
            ctx.fillText(line, 0, i * lH);
        });

        // 3. Hide the real HTML orig text (canvas replaces it visually)
        orig.style.visibility = 'hidden';

        // 4. Show reveal text below the canvas
        reveal.style.display  = 'block';
        canvas.style.display  = 'block';
    }

    window.addEventListener('load', function () {
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(initCanvas);
        } else {
            initCanvas();
        }
    });

    window.addEventListener('resize', function () {
        if (done) return;
        orig.style.visibility = 'visible';
        covered.clear();
        initCanvas();
    });

    document.addEventListener('mousemove', function (e) {
        if (done) return;

        // Use the canvas bounding rect for hit-testing (same position as hidden orig)
        var rect   = canvas.getBoundingClientRect();
        var isOver = canvas.style.display !== 'none' &&
                     e.clientX >= rect.left && e.clientX <= rect.right &&
                     e.clientY >= rect.top  && e.clientY <= rect.bottom;

        if (isOver && !wasOver) { if (cur) cur.classList.add('is-erasing'); if (curRing) curRing.classList.add('is-erasing'); }
        if (!isOver && wasOver) { if (cur) cur.classList.remove('is-erasing'); if (curRing) curRing.classList.remove('is-erasing'); }
        wasOver = isOver;

        if (!isOver) return;

        if (!hintGone && hint) { hintGone = true; hint.style.opacity = '0'; }

        // Punch a hole in the canvas → reveal text shows through
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Coverage grid
        var col = Math.floor((x / rect.width)  * COLS);
        var row = Math.floor((y / rect.height) * ROWS);
        for (var dc = -1; dc <= 1; dc++) {
            for (var dr = -1; dr <= 1; dr++) {
                var c = col + dc, v = row + dr;
                if (c >= 0 && c < COLS && v >= 0 && v < ROWS) covered.add(c + ',' + v);
            }
        }

        if (covered.size / TOTAL >= THRESHOLD) doReveal();
    });

    function doReveal() {
        done = true;
        if (cur) cur.classList.remove('is-erasing');
        if (curRing) curRing.classList.remove('is-erasing');

        canvas.style.transition = 'opacity 0.5s ease';
        canvas.style.opacity    = '0';

        setTimeout(function () {
            canvas.style.display = 'none';
            if (hint) hint.style.opacity = '0';
        }, 500);
    }
})();

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

