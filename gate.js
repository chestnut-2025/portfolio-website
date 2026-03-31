(function () {

    var HASH = '0104f4cab7d32c34991d5dbb50461a50379c96a3d26b1ba3d50c27ce3d32f3c2';
    var KEY  = 'portfolio_auth';

    if (sessionStorage.getItem(KEY) === HASH) return;

    var hideStyle = document.createElement('style');
    hideStyle.textContent = 'body{visibility:hidden!important}';
    document.head.appendChild(hideStyle);

    /* ── Styles ───────────────────────────────────────────────────── */
    var styleEl = document.createElement('style');
    styleEl.textContent = `
        #gate {
            position: fixed; inset: 0; z-index: 9999;
            background: #FFFFFF;
            display: flex; align-items: center; justify-content: center;
            font-family: 'Inter', -apple-system, sans-serif;
            transform-origin: center;
        }
        [data-theme="dark"] #gate { background: #141412; }

        /* ── Layout ─────────────────────────────────────────────── */
        #gate-layout {
            display: flex;
            align-items: center;
            gap: 64px;
            padding: 0 24px;
            width: 100%;
            max-width: 760px;
        }

        /* ── Circle ─────────────────────────────────────────────── */
        #gate-circle {
            position: relative;
            width: 96px; height: 96px;
            flex-shrink: 0;
            animation: gate-idle 2.5s ease-in-out infinite;
        }
        #gate-ring {
            position: absolute; inset: 0;
            border-radius: 50%;
            border: 1.5px solid rgba(17,17,17,0.12);
            transition: transform 0.2s ease, opacity 0.4s ease, border-color 0.3s ease;
        }
        [data-theme="dark"] #gate-ring { border-color: rgba(238,237,232,0.15); }

        #gate-shape {
            position: absolute; top: 50%; left: 50%;
            width: 24px; height: 24px;
            transform: translate(-50%,-50%) rotate(0deg);
            background: #F5E03A;
            border-radius: 10px;
            transition:
                transform 0.3s cubic-bezier(0.25,0,0,1),
                border-radius 0.3s cubic-bezier(0.25,0,0,1),
                scale 0.2s ease;
        }

        /* Ripple on keystroke */
        .gate-ripple {
            position: absolute; inset: 0; border-radius: 50%;
            border: 1px solid rgba(17,17,17,0.08);
            transform: scale(1); opacity: 1; pointer-events: none;
            transition: transform 0.55s cubic-bezier(0.2,0,0,1), opacity 0.55s ease;
        }
        [data-theme="dark"] .gate-ripple { border-color: rgba(238,237,232,0.1); }
        .gate-ripple.expand { transform: scale(3.2); opacity: 0; }

        /* ── Circle states ───────────────────────────────────────── */
        .s-typing { animation: none; transform: scale(0.97); transition: transform 0.2s ease; }
        .s-typing #gate-shape { scale: 0.95; }

        .s-error { animation: none; }
        .s-error #gate-ring { border-color: rgba(242,170,191,0.65); transform: scale(0.9); }

        /* Success: square → diamond */
        .s-diamond #gate-shape {
            transform: translate(-50%,-50%) rotate(45deg);
        }
        /* Diamond → circle */
        .s-morph #gate-shape {
            transform: translate(-50%,-50%) rotate(45deg);
            border-radius: 999px;
        }
        /* Ring expands */
        .s-expand #gate-ring {
            transform: scale(1.4);
            opacity: 0;
            transition: transform 0.3s cubic-bezier(0.2,0,0,1), opacity 0.3s ease;
        }

        /* ── Content ────────────────────────────────────────────── */
        #gate-content {
            display: flex; flex-direction: column;
            transition: opacity 0.25s ease;
        }
        #gate-content.hide { opacity: 0; pointer-events: none; }

        #gate-label {
            font-size: 12px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #9E9E9E;
            font-weight: 500;
            margin-bottom: 24px;
        }
        [data-theme="dark"] #gate-label { color: #666; }

        #gate-title {
            font-size: 56px;
            line-height: 1.05;
            font-weight: 600;
            color: #111111;
            margin: 0 0 16px;
            letter-spacing: -0.03em;
        }
        [data-theme="dark"] #gate-title { color: #EEEDE8; }

        #gate-sub {
            font-size: 18px;
            color: #7A7A7A;
            font-weight: 300;
            margin: 0 0 32px;
            line-height: 1.5;
        }
        [data-theme="dark"] #gate-sub { color: #666; }

        /* Input row */
        #gate-row {
            display: flex;
            gap: 16px;
            align-items: center;
        }
        #gate-input {
            width: 360px;
            height: 56px;
            padding: 0 20px;
            border: 1.5px solid #DADADA;
            border-radius: 999px;
            background: #FFFFFF;
            font-family: inherit;
            font-size: 16px;
            color: #111111;
            outline: none;
            caret-color: #111111;
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        [data-theme="dark"] #gate-input {
            background: #1E1E1A;
            border-color: #333;
            color: #EEEDE8;
            caret-color: #EEEDE8;
        }
        #gate-input::placeholder { font-size: 16px; color: #B0B0B0; }
        #gate-input:focus {
            border-color: #AAAAAA;
            box-shadow: 0 0 0 3px rgba(17,17,17,0.04);
        }
        [data-theme="dark"] #gate-input:focus { border-color: #555; }
        #gate-input.flash { border-color: #888 !important; }
        [data-theme="dark"] #gate-input.flash { border-color: #888 !important; }
        #gate-input.shake {
            animation: gate-shake 0.3s ease;
            border-color: #F2AABF !important;
        }
        #gate-input:disabled { opacity: 0.4; cursor: not-allowed; }

        #gate-btn {
            height: 56px;
            padding: 0 28px;
            border-radius: 999px;
            border: 1.5px solid #E0E0E0;
            background: transparent;
            font-family: inherit;
            font-size: 16px;
            color: #222222;
            cursor: pointer;
            white-space: nowrap;
            transition: border-color 0.2s ease, opacity 0.2s ease;
        }
        [data-theme="dark"] #gate-btn { border-color: #333; color: #EEEDE8; }
        #gate-btn:hover:not(:disabled) { border-color: #AAAAAA; }
        #gate-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        #gate-hint {
            font-size: 14px;
            color: #888888;
            font-weight: 300;
            opacity: 0;
            margin-top: 16px;
            transition: opacity 0.25s ease;
        }
        #gate-hint.show { opacity: 1; }

        /* ── "There it is." flash ────────────────────────────────── */
        #gate-flash {
            position: absolute;
            display: flex; flex-direction: column; align-items: center; gap: 12px;
            pointer-events: none;
            opacity: 0;
        }
        #gate-flash-text {
            font-size: 56px;
            font-weight: 600;
            letter-spacing: -0.03em;
            line-height: 1.05;
            color: #111111;
        }
        [data-theme="dark"] #gate-flash-text { color: #EEEDE8; }
        #gate-egg {
            font-size: 1.6rem;
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        /* ── Page transition ─────────────────────────────────────── */
        #gate.opening {
            transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease;
            transform: scale(1.02);
            opacity: 0;
        }

        /* ── Keyframes ───────────────────────────────────────────── */
        @keyframes gate-idle {
            0%,100% { transform: scale(1);    }
            50%     { transform: scale(1.02); }
        }
        @keyframes gate-shake {
            0%        { transform: translateX(0);  }
            20%       { transform: translateX(-3px); }
            50%       { transform: translateX(3px);  }
            75%       { transform: translateX(-2px); }
            90%       { transform: translateX(2px);  }
            100%      { transform: translateX(0);  }
        }
        @keyframes gate-flash-in {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0);   }
        }

        /* ── Responsive ──────────────────────────────────────────── */
        @media (max-width: 640px) {
            #gate-layout    { flex-direction: column; gap: 32px; align-items: flex-start; padding: 0 28px; }
            #gate-circle    { width: 64px; height: 64px; }
            #gate-title     { font-size: 36px; }
            #gate-flash-text { font-size: 36px; }
            #gate-input     { width: 100%; }
            #gate-row       { flex-wrap: wrap; }
        }
    `;
    document.head.appendChild(styleEl);

    /* ── DOM init ─────────────────────────────────────────────────── */
    function init() {
        hideStyle.remove();

        var overlay = document.createElement('div');
        overlay.id = 'gate';
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
                    <p id="gate-hint">Not quite.</p>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        var circle  = document.getElementById('gate-circle');
        var input   = document.getElementById('gate-input');
        var btn     = document.getElementById('gate-btn');
        var hint    = document.getElementById('gate-hint');
        var content = document.getElementById('gate-content');
        var flash   = document.getElementById('gate-flash');
        var egg     = document.getElementById('gate-egg');
        var flashTimer, errorTimer;

        document.body.style.overflow = 'hidden';
        input.focus();

        /* Helpers */
        function setState(s) { circle.className = s ? 's-' + s : ''; }

        function spawnRipple() {
            var r = document.createElement('div');
            r.className = 'gate-ripple';
            circle.appendChild(r);
            requestAnimationFrame(function () {
                requestAnimationFrame(function () { r.classList.add('expand'); });
            });
            setTimeout(function () { r.remove(); }, 650);
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
            clearTimeout(errorTimer);
            errorTimer = setTimeout(function () {
                setState(null);
                input.disabled = false;
                btn.disabled   = false;
                btn.innerHTML  = 'Enter &#8594;';
                input.focus();
            }, 750);
        }

        /* Success — total ~800ms */
        function openDoor() {
            /* 0–200ms: "There it is." fades in */
            content.classList.add('hide');
            flash.style.animation = 'gate-flash-in 0.2s ease forwards';

            /* 200–500ms: square → diamond → circle, ring expands */
            setTimeout(function () {
                setState('diamond');
            }, 200);
            setTimeout(function () {
                setState('morph');
            }, 320);
            setTimeout(function () {
                setState('expand');
                egg.style.opacity = '1';
                setTimeout(function () { egg.style.opacity = '0'; }, 280);
            }, 400);

            /* 500–800ms: page scales + fades */
            setTimeout(function () {
                flash.style.transition = 'opacity 0.2s ease';
                flash.style.opacity    = '0';
                overlay.classList.add('opening');
            }, 520);

            overlay.addEventListener('transitionend', function handler(e) {
                if (e.propertyName !== 'opacity' || e.target !== overlay) return;
                overlay.removeEventListener('transitionend', handler);
                window.scrollTo(0, 0);
                document.body.style.overflow = '';
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
