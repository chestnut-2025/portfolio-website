(function () {

    var HASH = '0104f4cab7d32c34991d5dbb50461a50379c96a3d26b1ba3d50c27ce3d32f3c2';
    var KEY  = 'portfolio_auth';

    if (sessionStorage.getItem(KEY) === HASH) return;

    /* ── Hide body immediately — no flash of content ─────────────── */
    var hideStyle = document.createElement('style');
    hideStyle.textContent = 'body{visibility:hidden!important}';
    document.head.appendChild(hideStyle);

    /* ── Inject styles into <head> now (safe before body exists) ──── */
    var styleEl = document.createElement('style');
    styleEl.textContent = `
        #gate {
            position: fixed; inset: 0; z-index: 9999;
            background: var(--bg, #FAFAF8);
            display: flex; align-items: center; justify-content: center;
            font-family: 'Inter', -apple-system, sans-serif;
            transform-origin: center;
            will-change: transform, opacity;
        }
        #gate-layout {
            display: flex; align-items: center;
            gap: 52px; padding: 0 24px;
            width: 100%; max-width: 680px;
        }
        #gate-content {
            display: flex; flex-direction: column;
            gap: 18px; flex: 1;
            transition: opacity 0.3s ease;
        }
        #gate-content.hide { opacity: 0; pointer-events: none; }

        /* Circle */
        #gate-circle {
            position: relative;
            width: 88px; height: 88px;
            flex-shrink: 0;
        }
        #gate-ring {
            position: absolute; inset: 0; border-radius: 50%;
            border: 1.5px solid rgba(26,26,24,0.14);
            animation: gate-idle-pulse 3s ease-in-out infinite;
            transition: transform 0.4s cubic-bezier(0.25,0,0,1),
                        border-color 0.3s ease, opacity 0.5s ease;
        }
        [data-theme="dark"] #gate-ring { border-color: rgba(238,237,232,0.14); }

        #gate-shape {
            position: absolute; top: 50%; left: 50%;
            width: 22px; height: 22px;
            transform: translate(-50%,-50%) rotate(0deg);
            background: #F5E03A; border-radius: 4px;
            transition: transform 0.45s cubic-bezier(0.25,0,0,1),
                        border-radius 0.4s cubic-bezier(0.25,0,0,1),
                        width 0.4s cubic-bezier(0.25,0,0,1),
                        height 0.4s cubic-bezier(0.25,0,0,1),
                        opacity 0.3s ease;
        }
        .gate-ripple {
            position: absolute; inset: 0; border-radius: 50%;
            border: 1px solid rgba(26,26,24,0.12);
            transform: scale(1); opacity: 1; pointer-events: none;
            transition: transform 0.6s cubic-bezier(0.2,0,0,1), opacity 0.6s ease;
        }
        [data-theme="dark"] .gate-ripple { border-color: rgba(238,237,232,0.12); }
        .gate-ripple.expand { transform: scale(3); opacity: 0; }

        /* Circle states */
        .s-typing  #gate-ring { animation: none; transform: scale(0.96); border-color: rgba(26,26,24,0.28); }
        .s-error   #gate-ring { animation: none; transform: scale(0.88); border-color: rgba(242,170,191,0.7); }
        .s-error   #gate-shape { opacity: 0.7; }
        .s-diamond #gate-shape { transform: translate(-50%,-50%) rotate(45deg); }
        .s-circle  #gate-shape { transform: translate(-50%,-50%) rotate(45deg); border-radius: 50%; width: 26px; height: 26px; }
        .s-ripple  #gate-ring  { transform: scale(3.2); opacity: 0;
            transition: transform 0.65s cubic-bezier(0.2,0,0,1), opacity 0.65s ease; }
        [data-theme="dark"] .s-typing #gate-ring { border-color: rgba(238,237,232,0.28); }

        /* Typography */
        #gate-label {
            font-size: 0.62rem; letter-spacing: 0.16em; text-transform: uppercase;
            color: var(--text-muted, #999); font-weight: 500;
        }
        #gate-title {
            font-size: clamp(1.55rem, 3.5vw, 2.1rem); font-weight: 600;
            letter-spacing: -0.03em; line-height: 1.15;
            color: var(--text, #1A1A18); margin: 0;
        }
        #gate-sub {
            font-size: 0.9rem; font-weight: 300;
            color: var(--text-muted, #999); margin: -6px 0 0; line-height: 1.5;
        }

        /* Input row */
        #gate-row { display: flex; gap: 10px; width: 100%; }
        #gate-input {
            flex: 1; height: 44px; padding: 0 18px; border-radius: 100px;
            border: 1px solid var(--border, #E0DED8);
            background: var(--bg, #FAFAF8);
            font-family: inherit; font-size: 0.88rem;
            color: var(--text, #1A1A18); outline: none;
            caret-color: var(--text, #1A1A18);
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        #gate-input::placeholder { color: var(--text-muted, #999); }
        #gate-input:focus {
            border-color: rgba(26,26,24,0.3);
            box-shadow: 0 0 0 3px rgba(26,26,24,0.04);
        }
        [data-theme="dark"] #gate-input:focus {
            border-color: rgba(238,237,232,0.3);
            box-shadow: 0 0 0 3px rgba(238,237,232,0.04);
        }
        #gate-input.flash   { border-color: rgba(26,26,24,0.48) !important; }
        #gate-input.shake   { animation: gate-shake 0.38s cubic-bezier(0.36,0.07,0.19,0.97); border-color: rgba(242,170,191,0.6) !important; }
        #gate-input:disabled { opacity: 0.45; cursor: not-allowed; }
        [data-theme="dark"] #gate-input.flash { border-color: rgba(238,237,232,0.48) !important; }

        #gate-btn {
            height: 44px; padding: 0 22px; border-radius: 100px;
            border: 1px solid var(--border, #E0DED8);
            background: var(--bg, #FAFAF8);
            font-family: inherit; font-size: 0.85rem;
            color: var(--text, #1A1A18); cursor: pointer;
            white-space: nowrap; min-width: 96px;
            transition: border-color 0.2s ease, opacity 0.2s ease;
        }
        #gate-btn:hover:not(:disabled) { border-color: rgba(26,26,24,0.38); }
        #gate-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        #gate-hint {
            font-size: 0.8rem; color: var(--text-muted, #999);
            font-weight: 300; opacity: 0;
            transition: opacity 0.25s ease; min-height: 1.1em;
        }
        #gate-hint.show { opacity: 1; }

        /* Flash */
        #gate-flash {
            position: absolute;
            display: flex; flex-direction: column; align-items: center; gap: 12px;
            pointer-events: none; opacity: 0;
        }
        #gate-flash-text {
            font-size: clamp(1.55rem, 3.5vw, 2.1rem); font-weight: 600;
            letter-spacing: -0.03em; color: var(--text, #1A1A18);
        }
        #gate-egg { font-size: 1.5rem; opacity: 0; transition: opacity 0.2s ease; }

        /* Door open */
        #gate.opening {
            transition: transform 0.65s cubic-bezier(0.4,0,0.2,1), opacity 0.65s ease;
            transform: scale(1.025); opacity: 0;
        }

        /* Keyframes */
        @keyframes gate-idle-pulse {
            0%,100% { opacity: 0.65; }
            50%      { opacity: 1; }
        }
        @keyframes gate-shake {
            0%,100% { transform: translateX(0); }
            20%     { transform: translateX(-4px); }
            60%     { transform: translateX(4px); }
            80%     { transform: translateX(-2px); }
        }
        @keyframes gate-flash-in {
            from { opacity: 0; transform: translateY(8px); filter: blur(5px); }
            to   { opacity: 1; transform: translateY(0);   filter: blur(0); }
        }

        @media (max-width: 540px) {
            #gate-layout { flex-direction: column; gap: 36px; align-items: flex-start; padding: 0 28px; }
            #gate-circle  { width: 64px; height: 64px; }
        }
    `;
    document.head.appendChild(styleEl);

    /* ── Everything DOM-related runs after body exists ────────────── */
    function init() {
        hideStyle.remove();

        /* Build overlay */
        var overlay = document.createElement('div');
        overlay.id  = 'gate';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.innerHTML = `
            <div id="gate-flash" aria-live="polite">
                <span id="gate-flash-text">There it is.</span>
                <span id="gate-egg" aria-hidden="true">🌰</span>
            </div>
            <div id="gate-layout">
                <div id="gate-circle">
                    <div id="gate-ring"></div>
                    <div id="gate-shape"></div>
                </div>
                <div id="gate-content">
                    <span id="gate-label">Julie Ahn — Portfolio</span>
                    <h1 id="gate-title">Not everything<br>is public.</h1>
                    <p id="gate-sub">This is one of those things.</p>
                    <div id="gate-row">
                        <input id="gate-input" type="password"
                            placeholder="Enter password"
                            autocomplete="current-password"
                            aria-label="Password">
                        <button id="gate-btn">Enter &#8594;</button>
                    </div>
                    <p id="gate-hint" aria-live="polite">Not quite.</p>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        /* Refs */
        var circle  = document.getElementById('gate-circle');
        var input   = document.getElementById('gate-input');
        var btn     = document.getElementById('gate-btn');
        var hint    = document.getElementById('gate-hint');
        var content = document.getElementById('gate-content');
        var flash   = document.getElementById('gate-flash');
        var egg     = document.getElementById('gate-egg');
        var flashTimer, errorResetTimer;

        input.focus();

        function setState(s) { circle.className = s ? 's-' + s : ''; }

        function spawnRipple() {
            var r = document.createElement('div');
            r.className = 'gate-ripple';
            circle.appendChild(r);
            requestAnimationFrame(function () {
                requestAnimationFrame(function () { r.classList.add('expand'); });
            });
            setTimeout(function () { r.remove(); }, 700);
        }

        /* Input feedback */
        input.addEventListener('input', function () {
            hint.classList.remove('show');
            if (!input.value) { setState(null); return; }
            setState('typing');
            input.classList.add('flash');
            clearTimeout(flashTimer);
            flashTimer = setTimeout(function () { input.classList.remove('flash'); }, 130);
            spawnRipple();
        });

        /* Error */
        function showError() {
            setState('error');
            input.classList.add('shake');
            hint.classList.add('show');
            input.value = '';
            input.addEventListener('animationend', function () {
                input.classList.remove('shake');
            }, { once: true });
            clearTimeout(errorResetTimer);
            errorResetTimer = setTimeout(function () {
                setState(null);
                input.disabled = false;
                btn.disabled   = false;
                btn.innerHTML  = 'Enter &#8594;';
                input.focus();
            }, 750);
        }

        /* Success */
        function openDoor() {
            setTimeout(function () { setState('diamond'); }, 80);
            setTimeout(function () { setState('circle');  }, 320);
            setTimeout(function () { setState('ripple');  }, 480);
            setTimeout(function () {
                content.classList.add('hide');
                flash.style.animation = 'gate-flash-in 0.45s cubic-bezier(0.25,0,0,1) forwards';
            }, 580);
            setTimeout(function () {
                egg.style.opacity = '1';
                setTimeout(function () { egg.style.opacity = '0'; }, 300);
            }, 820);
            setTimeout(function () {
                flash.style.transition = 'opacity 0.3s ease';
                flash.style.opacity    = '0';
                overlay.classList.add('opening');
            }, 1100);
            overlay.addEventListener('transitionend', function handler(e) {
                if (e.propertyName !== 'opacity' || e.target !== overlay) return;
                overlay.removeEventListener('transitionend', handler);
                overlay.remove();
            });
        }

        /* Attempt */
        function attempt() {
            var val = input.value.trim();
            if (!val || btn.disabled) return;
            btn.innerHTML  = '&hellip;';
            btn.disabled   = true;
            input.disabled = true;
            setState(null);
            crypto.subtle.digest('SHA-256', new TextEncoder().encode(val))
                .then(function (buf) {
                    var hex = Array.from(new Uint8Array(buf))
                        .map(function (b) { return b.toString(16).padStart(2,'0'); }).join('');
                    hex === HASH
                        ? (sessionStorage.setItem(KEY, HASH), openDoor())
                        : showError();
                });
        }

        btn.addEventListener('click', attempt);
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
