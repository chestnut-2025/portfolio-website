(function () {

    /* Disable browser scroll restoration immediately — before DOMContentLoaded */
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    var HASH = '0104f4cab7d32c34991d5dbb50461a50379c96a3d26b1ba3d50c27ce3d32f3c2';
    var KEY  = 'portfolio_auth';

    if (sessionStorage.getItem(KEY) === HASH) return;

    var hideStyle = document.createElement('style');
    hideStyle.textContent = 'body{visibility:hidden!important}';
    document.head.appendChild(hideStyle);

    var styleEl = document.createElement('style');
    styleEl.textContent = `
        /* ── Gate backdrop ───────────────────────────────────────── */
        #gate {
            position: fixed; inset: 0; z-index: 9999;
            background: #F2F0EC;
            display: flex; align-items: center; justify-content: center;
            font-family: 'Inter', -apple-system, sans-serif;
            transform-origin: center;
            padding: 24px;
            box-sizing: border-box;
            overflow: hidden;
        }
        [data-theme="dark"] #gate { background: #141412; }

        #gate.exiting {
            transition: opacity 0.5s ease-out, transform 0.5s ease-out;
            opacity: 0;
            transform: scale(1.01);
        }

        /* ── Drawing canvas (lives behind bento cards) ───────────── */
        #gate-canvas {
            position: absolute;
            inset: 0;
            pointer-events: none;
        }

        /* ── Bento grid ──────────────────────────────────────────── */
        #gate-grid {
            position: relative;
            z-index: 1;
            display: grid;
            grid-template-areas:
                "name  cases  years"
                "name  think  think"
                "home  home   home"
                "pass  pass   pass";
            grid-template-columns: 1fr 135px 135px;
            gap: 10px;
            width: 100%;
            max-width: 700px;
        }

        /* ── Base card ───────────────────────────────────────────── */
        .gate-card {
            background: #FEFDFB;
            border: 1px solid rgba(0, 0, 0, 0.08);
            border-radius: 20px;
            box-sizing: border-box;
            opacity: 0;
            transform: translateY(10px);
            transition: opacity 0.45s ease, transform 0.45s ease;
        }
        .gate-card.visible {
            opacity: 1;
            transform: translateY(0);
        }
        [data-theme="dark"] .gate-card {
            background: #1C1C1A;
            border-color: rgba(255, 255, 255, 0.07);
        }

        /* ── Name card ───────────────────────────────────────────── */
        #gate-name-card {
            grid-area: name;
            padding: 32px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 220px;
        }
        #gate-name-tag {
            font-size: 10px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: #A0A09C;
            font-weight: 500;
        }
        [data-theme="dark"] #gate-name-tag { color: #4A4A46; }
        #gate-name {
            font-size: 34px;
            font-weight: 600;
            line-height: 1.08;
            letter-spacing: -0.025em;
            color: #111111;
            margin: 0;
        }
        [data-theme="dark"] #gate-name { color: #EEEDE8; }
        #gate-nickname {
            font-size: 12.5px;
            color: #B8B8B2;
            font-style: italic;
            font-weight: 300;
            margin: 5px 0 0;
        }
        [data-theme="dark"] #gate-nickname { color: #4A4A46; }
        #gate-company {
            font-size: 13px;
            color: #888884;
            font-weight: 400;
            margin: 10px 0 0;
        }
        [data-theme="dark"] #gate-company { color: #555; }
        #gate-tagline {
            font-size: 12px;
            color: #B8B8B2;
            font-weight: 300;
            font-style: italic;
            line-height: 1.5;
            margin: 0;
        }
        [data-theme="dark"] #gate-tagline { color: #444; }

        /* ── Stat cards ──────────────────────────────────────────── */
        #gate-cases-card { grid-area: cases; }
        #gate-years-card  { grid-area: years; }
        .gate-stat-card {
            padding: 22px 20px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .gate-stat-num {
            font-size: 38px;
            font-weight: 600;
            letter-spacing: -0.04em;
            color: #111111;
            line-height: 1;
            display: block;
        }
        [data-theme="dark"] .gate-stat-num { color: #EEEDE8; }
        .gate-stat-label {
            font-size: 11px;
            font-weight: 500;
            color: #444440;
            display: block;
            margin-top: 7px;
        }
        [data-theme="dark"] .gate-stat-label { color: #AAAA9E; }
        .gate-stat-sub {
            font-size: 10px;
            color: #B8B8B2;
            font-weight: 300;
            line-height: 1.5;
            display: block;
            margin-top: 5px;
        }
        [data-theme="dark"] .gate-stat-sub { color: #4A4A46; }

        /* ── How I Think card ────────────────────────────────────── */
        #gate-think-card {
            grid-area: think;
            padding: 20px 24px;
        }
        #gate-think-label {
            font-size: 10px;
            letter-spacing: 0.13em;
            text-transform: uppercase;
            color: #A0A09C;
            font-weight: 500;
            display: block;
            margin-bottom: 12px;
        }
        [data-theme="dark"] #gate-think-label { color: #4A4A46; }
        .gate-think-step {
            display: flex;
            align-items: baseline;
            gap: 9px;
            margin-bottom: 8px;
        }
        .gate-think-step:last-child { margin-bottom: 0; }
        .gate-think-n {
            font-size: 9px;
            color: #CACAC4;
            font-weight: 500;
            flex-shrink: 0;
            letter-spacing: 0.05em;
        }
        [data-theme="dark"] .gate-think-n { color: #383836; }
        .gate-think-text {
            font-size: 11.5px;
            color: #444440;
            font-weight: 400;
            line-height: 1.35;
        }
        [data-theme="dark"] .gate-think-text { color: #888880; }

        /* ── At Home card ────────────────────────────────────────── */
        #gate-home-card {
            grid-area: home;
            padding: 20px 28px;
            display: flex;
            align-items: center;
            gap: 16px;
        }
        #gate-home-label {
            font-size: 10px;
            letter-spacing: 0.13em;
            text-transform: uppercase;
            color: #A0A09C;
            font-weight: 500;
            white-space: nowrap;
            flex-shrink: 0;
        }
        [data-theme="dark"] #gate-home-label { color: #4A4A46; }
        #gate-home-divider {
            width: 1px;
            height: 32px;
            background: rgba(0,0,0,0.08);
            flex-shrink: 0;
        }
        [data-theme="dark"] #gate-home-divider { background: rgba(255,255,255,0.07); }
        #gate-home-text {
            font-size: 12.5px;
            color: #666660;
            font-weight: 300;
            line-height: 1.6;
            margin: 0;
        }
        [data-theme="dark"] #gate-home-text { color: #666; }

        /* ── Password card ───────────────────────────────────────── */
        #gate-pw-card {
            grid-area: pass;
            padding: 22px 32px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
        #gate-pw-header {
            display: flex;
            align-items: center;
            gap: 7px;
            margin-bottom: 16px;
        }
        #gate-pw-icon { color: #C0C0BA; flex-shrink: 0; }
        [data-theme="dark"] #gate-pw-icon { color: #444; }
        #gate-pw-label {
            font-size: 11px;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #A0A09C;
            font-weight: 500;
        }
        [data-theme="dark"] #gate-pw-label { color: #555; }

        /* ── Input ───────────────────────────────────────────────── */
        #gate-input {
            width: 240px;
            padding: 0 0 10px;
            border: none;
            border-bottom: 1px solid #D6D6D0;
            background: transparent;
            font-family: inherit;
            font-size: 16px;
            color: #111111;
            text-align: center;
            outline: none;
            caret-color: #111111;
            transition: border-color 0.2s ease;
        }
        [data-theme="dark"] #gate-input {
            border-bottom-color: #2E2E2A;
            color: #EEEDE8;
            caret-color: #EEEDE8;
        }
        #gate-input::placeholder { color: #C8C8C2; font-size: 16px; }
        #gate-input:focus { border-bottom-color: #888884; }
        [data-theme="dark"] #gate-input:focus { border-bottom-color: #555; }
        #gate-input:disabled { opacity: 0.35; cursor: not-allowed; }
        #gate-input.gate-error-flash { border-bottom-color: #111111; transition: border-color 0s; }
        [data-theme="dark"] #gate-input.gate-error-flash { border-bottom-color: #EEEDE8; }

        /* ── Hint ────────────────────────────────────────────────── */
        #gate-hint {
            font-size: 11.5px;
            color: #B8B8B2;
            font-weight: 300;
            margin-top: 13px;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        [data-theme="dark"] #gate-hint { color: #555; }
        #gate-hint.show { opacity: 1; }

        /* ── Responsive ──────────────────────────────────────────── */
        @media (max-width: 620px) {
            #gate { padding: 14px; align-items: flex-start; padding-top: 36px; }
            #gate-grid {
                grid-template-areas:
                    "name  name"
                    "cases years"
                    "think think"
                    "home  home"
                    "pass  pass";
                grid-template-columns: 1fr 1fr;
            }
            #gate-name-card { min-height: auto; }
            #gate-name { font-size: 26px; }
            .gate-stat-num { font-size: 30px; }
            #gate-home-card { flex-direction: column; align-items: flex-start; gap: 8px; }
            #gate-home-divider { width: 32px; height: 1px; }
            #gate-input { width: 100%; }
            #gate-pw-card { padding: 18px 20px; }
        }
    `;
    document.head.appendChild(styleEl);

    /* ── DOM ──────────────────────────────────────────────────────── */
    function init() {
        hideStyle.remove();

        var overlay = document.createElement('div');
        overlay.id = 'gate';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.innerHTML = `
            <canvas id="gate-canvas"></canvas>

            <div id="gate-grid">

                <!-- Name -->
                <div class="gate-card" id="gate-name-card">
                    <span id="gate-name-tag">Product Designer</span>
                    <div>
                        <p id="gate-name">Sunghyun Ahn</p>
                        <p id="gate-nickname">(I go by Julie)</p>
                        <p id="gate-company">Apple Inc.</p>
                    </div>
                    <p id="gate-tagline">Making complex systems feel simple.</p>
                </div>

                <!-- Case studies -->
                <div class="gate-card gate-stat-card" id="gate-cases-card">
                    <span class="gate-stat-num">3</span>
                    <span class="gate-stat-label">Case Studies</span>
                    <span class="gate-stat-sub">End-to-end work,<br>from messy to shipped</span>
                </div>

                <!-- Experience -->
                <div class="gate-card gate-stat-card" id="gate-years-card">
                    <span class="gate-stat-num">4+</span>
                    <span class="gate-stat-label">Years Experience</span>
                    <span class="gate-stat-sub">Enterprise &amp;<br>consumer products</span>
                </div>

                <!-- How I think -->
                <div class="gate-card" id="gate-think-card">
                    <span id="gate-think-label">How I Think</span>
                    <div class="gate-think-step">
                        <span class="gate-think-n">01</span>
                        <span class="gate-think-text">Start messy</span>
                    </div>
                    <div class="gate-think-step">
                        <span class="gate-think-n">02</span>
                        <span class="gate-think-text">Make it make sense</span>
                    </div>
                    <div class="gate-think-step">
                        <span class="gate-think-n">03</span>
                        <span class="gate-think-text">Then make it feel obvious</span>
                    </div>
                </div>

                <!-- At home -->
                <div class="gate-card" id="gate-home-card">
                    <span id="gate-home-label">At Home</span>
                    <div id="gate-home-divider"></div>
                    <p id="gate-home-text">Outnumbered by one tiny human and one very opinionated Australian Shepherd (Hodu). Powered by snacks.</p>
                </div>

                <!-- Password -->
                <div class="gate-card" id="gate-pw-card">
                    <div id="gate-pw-header">
                        <svg id="gate-pw-icon" width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <rect x="1.75" y="5.75" width="9.5" height="6.5" rx="1.25" stroke="currentColor" stroke-width="1.25"/>
                            <path d="M4 5.75V4A2.5 2.5 0 0 1 9 4v1.75" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>
                        </svg>
                        <span id="gate-pw-label">Enter password to unlock</span>
                    </div>
                    <input id="gate-input" type="password"
                        placeholder="Password"
                        autocomplete="current-password"
                        aria-label="Password">
                    <p id="gate-hint" aria-live="polite">Not quite. Try again.</p>
                </div>

            </div>
        `;
        document.body.appendChild(overlay);
        window.scrollTo(0, 0);

        /* ── Drawing canvas ───────────────────────────────────────── */
        var canvas  = document.getElementById('gate-canvas');
        var ctx     = canvas.getContext('2d');
        var isDark  = document.documentElement.getAttribute('data-theme') === 'dark';
        var BG      = isDark ? 'rgba(20,20,18,' : 'rgba(242,240,236,';
        var INK     = isDark ? 'rgba(238,237,232,0.16)' : 'rgba(0,0,0,0.12)';

        function resizeCanvas() {
            canvas.width  = overlay.offsetWidth  || window.innerWidth;
            canvas.height = overlay.offsetHeight || window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        var isDrawing = false;
        var mx = 0, my = 0;  /* actual mouse */
        var cx = 0, cy = 0;  /* lerped position */
        var lx = 0, ly = 0;  /* last drawn point */

        /* Only begin drawing when clicking the gate background (not a card) */
        overlay.addEventListener('mousedown', function (e) {
            if (e.target !== overlay) return;
            isDrawing = true;
            mx = cx = lx = e.clientX;
            my = cy = ly = e.clientY;
        });
        window.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });
        window.addEventListener('mouseup',   function ()  { isDrawing = false; });

        var LERP       = 0.2;   /* lower = more lag / softer feel */
        var drawActive = true;

        (function drawLoop() {
            if (!drawActive) return;
            requestAnimationFrame(drawLoop);

            /* Dissolve everything by layering a semi-transparent bg each frame */
            ctx.fillStyle = BG + '0.038)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            /* Update lerped position */
            cx += (mx - cx) * LERP;
            cy += (my - cy) * LERP;

            if (isDrawing && Math.hypot(cx - lx, cy - ly) > 0.3) {
                ctx.beginPath();
                ctx.moveTo(lx, ly);
                ctx.lineTo(cx, cy);
                ctx.strokeStyle = INK;
                ctx.lineWidth   = 1.5;
                ctx.lineCap     = 'round';
                ctx.lineJoin    = 'round';
                ctx.shadowBlur  = 4;
                ctx.shadowColor = INK;
                ctx.stroke();
                ctx.shadowBlur  = 0;
            }

            lx = cx;
            ly = cy;
        })();

        /* ── Stagger cards in ─────────────────────────────────────── */
        var cards = overlay.querySelectorAll('.gate-card');
        cards.forEach(function (card, i) {
            setTimeout(function () { card.classList.add('visible'); }, 40 + i * 70);
        });

        /* ── Subtle parallax ──────────────────────────────────────── */
        /* depth per card: name, cases, years, think, home, pass */
        var depths       = [5, 9, 9, 7, 3, 2];
        var parallaxReady = false;
        setTimeout(function () { parallaxReady = true; }, 900);

        overlay.addEventListener('mousemove', function (e) {
            if (!parallaxReady) return;
            var rect = overlay.getBoundingClientRect();
            var dx = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
            var dy = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
            cards.forEach(function (card, i) {
                var d = depths[i] || 4;
                card.style.transition = 'transform 0.25s ease';
                card.style.transform  = 'translate(' + (dx * d).toFixed(2) + 'px,' + (dy * d).toFixed(2) + 'px)';
            });
        });

        overlay.addEventListener('mouseleave', function () {
            if (!parallaxReady) return;
            cards.forEach(function (card) {
                card.style.transition = 'transform 0.6s ease';
                card.style.transform  = 'translate(0,0)';
            });
        });

        /* ── Auth ─────────────────────────────────────────────────── */
        var input   = document.getElementById('gate-input');
        var pwLabel = document.getElementById('gate-pw-label');
        var hint    = document.getElementById('gate-hint');
        var errorTimer;

        input.focus();

        /* Error */
        function showError() {
            input.value = '';
            hint.classList.add('show');
            input.classList.add('gate-error-flash');
            clearTimeout(errorTimer);
            errorTimer = setTimeout(function () {
                input.classList.remove('gate-error-flash');
                input.disabled = false;
                input.focus();
            }, 600);
        }

        /* Success */
        function openDoor() {
            document.documentElement.style.scrollBehavior = 'auto';
            document.documentElement.style.overflowAnchor = 'none';
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;

            pwLabel.textContent = 'There it is.';

            setTimeout(function () {
                var egg = document.createElement('span');
                egg.textContent = '🌰';
                egg.style.cssText = 'position:absolute;font-size:1px;opacity:0';
                overlay.appendChild(egg);
                setTimeout(function () { egg.remove(); }, 200);
            }, 50);

            setTimeout(function () { overlay.classList.add('exiting'); }, 80);

            var done = false;
            function finish() {
                if (done) return;
                done = true;
                drawActive = false;
                overlay.remove();

                window.scrollTo(0, 0);
                var guardActive = true;
                var guardHandler = function () {
                    if (guardActive && window.scrollY > 0) window.scrollTo(0, 0);
                };
                window.addEventListener('scroll', guardHandler, { passive: true });
                setTimeout(function () {
                    guardActive = false;
                    window.removeEventListener('scroll', guardHandler);
                    document.documentElement.style.scrollBehavior = '';
                    document.documentElement.style.overflowAnchor = '';
                }, 400);
            }
            overlay.addEventListener('transitionend', function handler(e) {
                if (e.propertyName !== 'opacity' || e.target !== overlay) return;
                overlay.removeEventListener('transitionend', handler);
                finish();
            });
            setTimeout(finish, 800);
        }

        /* Attempt */
        function attempt() {
            var val = input.value.trim();
            if (!val || input.disabled) return;
            input.disabled = true;
            hint.classList.remove('show');
            crypto.subtle.digest('SHA-256', new TextEncoder().encode(val))
                .then(function (buf) {
                    var hex = Array.from(new Uint8Array(buf))
                        .map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
                    if (hex === HASH) {
                        sessionStorage.setItem(KEY, HASH);
                        openDoor();
                    } else {
                        showError();
                    }
                });
        }

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') attempt();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
