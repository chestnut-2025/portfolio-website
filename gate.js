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
            background: #F6F6F4;
            display: flex; align-items: center; justify-content: center;
            font-family: 'Inter', -apple-system, sans-serif;
            transform-origin: center;
        }
        [data-theme="dark"] #gate { background: #141412; }

        /* ── Fog overlay ─────────────────────────────────────────── */
        #gate-fog {
            position: absolute; inset: 0;
            background: #FFFFFF;
            opacity: 0.2;
            pointer-events: none;
            transition: opacity 0.5s ease;
        }
        [data-theme="dark"] #gate-fog { background: #141412; opacity: 0.25; }

        /* ── Content ─────────────────────────────────────────────── */
        #gate-content {
            position: relative;
            display: flex; flex-direction: column;
            gap: 20px;
            width: 520px;
            z-index: 1;
        }

        /* ── Label ───────────────────────────────────────────────── */
        #gate-label {
            font-size: 12px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #8E8E8A;
            font-weight: 500;
        }
        [data-theme="dark"] #gate-label { color: #666; }

        /* ── Headline frame (two layers stacked) ─────────────────── */
        #gate-headline {
            position: relative;
            line-height: 1.05;
        }
        #gate-headline-clear,
        #gate-headline-obscured {
            font-size: 64px;
            font-weight: 600;
            letter-spacing: -0.03em;
            line-height: 1.05;
            color: #111111;
            margin: 0;
            white-space: pre-line;
            transition: opacity 0.5s ease;
        }
        [data-theme="dark"] #gate-headline-clear,
        [data-theme="dark"] #gate-headline-obscured { color: #EEEDE8; }

        /* Obscured sits on top of clear via absolute */
        #gate-headline-obscured {
            position: absolute;
            inset: 0;
            opacity: 1;
        }
        #gate-headline-clear {
            opacity: 0;
            /* reserves height even when invisible */
            visibility: visible;
        }

        /* ── Subtext ─────────────────────────────────────────────── */
        #gate-sub {
            font-size: 18px;
            color: #7C7C78;
            font-weight: 300;
            line-height: 1.5;
            margin: 0;
            transition: opacity 0.5s ease;
        }
        [data-theme="dark"] #gate-sub { color: #666; }

        /* ── Input row ───────────────────────────────────────────── */
        #gate-row {
            display: flex;
            gap: 16px;
            align-items: center;
            margin-top: 12px;
        }
        #gate-input {
            width: 360px;
            height: 58px;
            padding: 0 20px;
            border: 1.5px solid #D7D7D2;
            border-radius: 999px;
            background: #FFFFFF;
            font-family: inherit;
            font-size: 17px;
            color: #111111;
            outline: none;
            caret-color: #111111;
            transition: border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.3s ease;
        }
        [data-theme="dark"] #gate-input {
            background: #1E1E1A; border-color: #333;
            color: #EEEDE8; caret-color: #EEEDE8;
        }
        #gate-input::placeholder { font-size: 17px; color: #8C8C88; }
        #gate-input:focus {
            border-color: #AAAAAA;
            box-shadow: 0 0 0 3px rgba(17,17,17,0.05);
        }
        [data-theme="dark"] #gate-input:focus { border-color: #555; }
        #gate-input.flash   { border-color: #888 !important; }
        #gate-input.shake   {
            animation: gate-shake 0.3s ease;
            border-color: #F2AABF !important;
        }
        #gate-input:disabled { opacity: 0.4; cursor: not-allowed; }

        #gate-btn {
            height: 58px;
            padding: 0 28px;
            border-radius: 999px;
            border: 1.5px solid #E2E2DD;
            background: transparent;
            font-family: inherit;
            font-size: 16px;
            color: #222222;
            cursor: pointer;
            white-space: nowrap;
            transition: border-color 0.2s ease, opacity 0.2s ease;
        }
        [data-theme="dark"] #gate-btn { border-color: #333; color: #EEEDE8; }
        #gate-btn:hover:not(:disabled) { border-color: #999; }
        #gate-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        #gate-hint {
            font-size: 14px;
            color: #888;
            font-weight: 300;
            opacity: 0;
            transition: opacity 0.25s ease;
            padding-left: 4px;
        }
        #gate-hint.show { opacity: 1; }

        /* ── "There it is." flash ────────────────────────────────── */
        #gate-flash {
            position: absolute; inset: 0;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center; gap: 14px;
            pointer-events: none;
            z-index: 2;
        }
        #gate-flash-text {
            font-size: 30px;
            font-weight: 600;
            letter-spacing: -0.02em;
            color: #111111;
            opacity: 0;
        }
        [data-theme="dark"] #gate-flash-text { color: #EEEDE8; }
        #gate-egg {
            font-size: 1.4rem;
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        /* ── Page transition ─────────────────────────────────────── */
        #gate.opening {
            transition: transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease;
            transform: scale(1.02);
            opacity: 0;
        }

        /* ── States ──────────────────────────────────────────────── */

        /* Typing1: fog drops, obscured starts fading, clear starts showing */
        #gate.s-typing1 #gate-fog              { opacity: 0.12; }
        #gate.s-typing1 #gate-headline-obscured { opacity: 0.7; }
        #gate.s-typing1 #gate-headline-clear    { opacity: 0.3; }

        /* Typing2: more revealed */
        #gate.s-typing2 #gate-fog              { opacity: 0.06; }
        #gate.s-typing2 #gate-headline-obscured { opacity: 0.3; }
        #gate.s-typing2 #gate-headline-clear    { opacity: 0.7; }

        /* Success: fully revealed */
        #gate.s-success #gate-fog              { opacity: 0; }
        #gate.s-success #gate-headline-obscured { opacity: 0; }
        #gate.s-success #gate-headline-clear    { opacity: 1; }

        /* ── Keyframes ───────────────────────────────────────────── */
        @keyframes gate-shake {
            0%,100% { transform: translateX(0);   }
            20%     { transform: translateX(-3px); }
            50%     { transform: translateX(3px);  }
            75%     { transform: translateX(-2px); }
            90%     { transform: translateX(2px);  }
        }
        @keyframes gate-flash-in {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0);   }
        }

        /* ── Responsive ──────────────────────────────────────────── */
        @media (max-width: 600px) {
            #gate-content         { width: 100%; padding: 0 28px; }
            #gate-headline-clear,
            #gate-headline-obscured { font-size: 40px; }
            #gate-flash-text      { font-size: 24px; }
            #gate-input           { width: 100%; }
            #gate-row             { flex-wrap: wrap; }
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
            <div id="gate-fog"></div>

            <div id="gate-flash" aria-live="polite">
                <span id="gate-flash-text">There it is.</span>
                <span id="gate-egg" aria-hidden="true">🌰</span>
            </div>

            <div id="gate-content">
                <span id="gate-label">Julie Ahn — Portfolio</span>

                <div id="gate-headline" aria-label="Not everything is public.">
                    <h1 id="gate-headline-clear" aria-hidden="true">Not everything{NL}is public.</h1>
                    <h1 id="gate-headline-obscured" aria-hidden="true">Not everything{NL}is p&#x2022;&#x2022;&#x2022;&#x2022;c.</h1>
                </div>

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
        `.replace(/{NL}/g, '\n');
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        var input   = document.getElementById('gate-input');
        var btn     = document.getElementById('gate-btn');
        var hint    = document.getElementById('gate-hint');
        var content = document.getElementById('gate-content');
        var flash   = document.getElementById('gate-flash');
        var egg     = document.getElementById('gate-egg');
        var flashTimer, errorTimer;

        input.focus();

        /* ── State machine ─────────────────────────────────────── */
        function setState(s) {
            overlay.className = s ? 's-' + s : '';
        }

        function getTypingState(len) {
            if (len === 0) return null;
            if (len <= 3)  return 'typing1';
            return 'typing2';
        }

        /* ── Input feedback ────────────────────────────────────── */
        input.addEventListener('input', function () {
            hint.classList.remove('show');
            setState(getTypingState(input.value.length));

            /* border flash */
            input.classList.add('flash');
            clearTimeout(flashTimer);
            flashTimer = setTimeout(function () {
                input.classList.remove('flash');
            }, 130);
        });

        /* ── Error ─────────────────────────────────────────────── */
        function showError() {
            setState(null);
            input.classList.add('shake');
            hint.classList.add('show');
            input.value = '';
            input.addEventListener('animationend', function () {
                input.classList.remove('shake');
            }, { once: true });
            clearTimeout(errorTimer);
            errorTimer = setTimeout(function () {
                input.disabled = false;
                btn.disabled   = false;
                btn.innerHTML  = 'Enter &#8594;';
                input.focus();
            }, 750);
        }

        /* ── Success ───────────────────────────────────────────── */
        function openDoor() {
            /* Fully reveal the page */
            setState('success');

            /* Step 1 (0–200ms): "There it is." fades in */
            setTimeout(function () {
                content.style.transition = 'opacity 0.25s ease';
                content.style.opacity    = '0';
                flash.querySelector('#gate-flash-text').style.animation =
                    'gate-flash-in 0.35s cubic-bezier(0.25,0,0,1) forwards';
            }, 150);

            /* 🌰 easter egg */
            setTimeout(function () {
                egg.style.opacity = '1';
                setTimeout(function () { egg.style.opacity = '0'; }, 300);
            }, 400);

            /* Step 3 (500–800ms): page scales out */
            setTimeout(function () {
                var ft = document.getElementById('gate-flash-text');
                ft.style.transition = 'opacity 0.25s ease';
                ft.style.opacity    = '0';
                overlay.classList.add('opening');
            }, 560);

            overlay.addEventListener('transitionend', function handler(e) {
                if (e.propertyName !== 'opacity' || e.target !== overlay) return;
                overlay.removeEventListener('transitionend', handler);
                window.scrollTo(0, 0);
                document.body.style.overflow = '';
                overlay.remove();
            });
        }

        /* ── Attempt ───────────────────────────────────────────── */
        function attempt() {
            var val = input.value.trim();
            if (!val || btn.disabled) return;
            btn.innerHTML  = '&hellip;';
            btn.disabled   = true;
            input.disabled = true;

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
