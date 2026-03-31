(function () {

    var HASH = '0104f4cab7d32c34991d5dbb50461a50379c96a3d26b1ba3d50c27ce3d32f3c2';
    var KEY  = 'portfolio_auth';

    if (sessionStorage.getItem(KEY) === HASH) return;

    var hideStyle = document.createElement('style');
    hideStyle.textContent = 'body{visibility:hidden!important}';
    document.head.appendChild(hideStyle);

    var styleEl = document.createElement('style');
    styleEl.textContent = `
        #gate {
            position: fixed; inset: 0; z-index: 9999;
            background: #F7F7F5;
            display: flex; align-items: center; justify-content: center;
            font-family: 'Inter', -apple-system, sans-serif;
            transform-origin: center;
        }
        [data-theme="dark"] #gate {
            background: #141412;
        }

        /* ── Content block ───────────────────────────────────────── */
        #gate-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            width: 100%;
            max-width: 640px;
            padding: 0 32px;
        }

        /* ── Label ───────────────────────────────────────────────── */
        #gate-label {
            font-size: 11.5px;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: #9A9A96;
            font-weight: 500;
            margin-bottom: 32px;
        }
        [data-theme="dark"] #gate-label { color: #555; }

        /* ── Headline ────────────────────────────────────────────── */
        #gate-title {
            font-size: 72px;
            font-weight: 600;
            line-height: 1.0;
            letter-spacing: -0.03em;
            color: #111111;
            margin: 0 0 16px;
            white-space: pre-line;
            transition: opacity 0.15s ease;
        }
        [data-theme="dark"] #gate-title { color: #EEEDE8; }

        /* ── Subtext ─────────────────────────────────────────────── */
        #gate-sub {
            font-size: 18px;
            color: #7A7A76;
            font-weight: 300;
            line-height: 1.5;
            margin: 0 0 48px;
        }
        [data-theme="dark"] #gate-sub { color: #555; }

        /* ── Underline input ─────────────────────────────────────── */
        #gate-input {
            width: 320px;
            padding: 0 0 10px;
            border: none;
            border-bottom: 1px solid #D6D6D2;
            background: transparent;
            font-family: inherit;
            font-size: 18px;
            color: #111111;
            text-align: center;
            outline: none;
            caret-color: #111111;
            transition: border-color 0.2s ease;
        }
        [data-theme="dark"] #gate-input {
            border-bottom-color: #333;
            color: #EEEDE8;
            caret-color: #EEEDE8;
        }
        #gate-input::placeholder {
            color: #A0A09C;
            font-size: 18px;
        }
        #gate-input:focus {
            border-bottom-color: #111111;
        }
        [data-theme="dark"] #gate-input:focus {
            border-bottom-color: #EEEDE8;
        }
        #gate-input:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        /* Error flash state */
        #gate-input.gate-error-flash {
            border-bottom-color: #111111;
            transition: border-color 0s;
        }

        /* ── Hint ────────────────────────────────────────────────── */
        #gate-hint {
            font-size: 14px;
            color: #A0A09C;
            font-weight: 300;
            margin-top: 20px;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        [data-theme="dark"] #gate-hint { color: #555; }
        #gate-hint.show { opacity: 1; }

        /* ── Page exit ───────────────────────────────────────────── */
        #gate.exiting {
            transition: opacity 0.5s ease-out, transform 0.5s ease-out;
            opacity: 0;
            transform: scale(1.01);
        }

        /* ── Responsive ──────────────────────────────────────────── */
        @media (max-width: 600px) {
            #gate-title  { font-size: 44px; }
            #gate-input  { width: 100%; }
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
            <div id="gate-content">
                <span id="gate-label">Julie Ahn — Portfolio</span>
                <h1 id="gate-title">Not everything\nis public.</h1>
                <p id="gate-sub">This is one of those things.</p>
                <input id="gate-input" type="password"
                    placeholder="Enter password"
                    autocomplete="current-password"
                    aria-label="Password">
                <p id="gate-hint" aria-live="polite">Not quite.</p>
            </div>
        `;
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        var input    = document.getElementById('gate-input');
        var title    = document.getElementById('gate-title');
        var hint     = document.getElementById('gate-hint');
        var errorTimer;

        input.focus();

        /* ── Error ─────────────────────────────────────────────── */
        function showError() {
            input.value = '';
            hint.classList.add('show');

            /* Underline flashes darker then fades back */
            input.classList.add('gate-error-flash');
            clearTimeout(errorTimer);
            errorTimer = setTimeout(function () {
                input.classList.remove('gate-error-flash');
                input.disabled = false;
                input.focus();
            }, 600);
        }

        /* ── Success ───────────────────────────────────────────── */
        function openDoor() {
            /* Headline swaps instantly */
            title.textContent = 'There it is.';

            /* 🌰 — brief, invisible to most, yours to know */
            setTimeout(function () {
                var egg = document.createElement('span');
                egg.textContent = '🌰';
                egg.style.cssText = 'position:absolute;font-size:1px;opacity:0';
                overlay.appendChild(egg);
                setTimeout(function () { egg.remove(); }, 200);
            }, 50);

            /* Page fades out */
            setTimeout(function () {
                overlay.classList.add('exiting');
            }, 80);

            overlay.addEventListener('transitionend', function handler(e) {
                if (e.propertyName !== 'opacity' || e.target !== overlay) return;
                overlay.removeEventListener('transitionend', handler);
                document.body.style.overflow = '';
                overlay.remove();
                requestAnimationFrame(function () { window.scrollTo(0, 0); });
            });
        }

        /* ── Attempt ───────────────────────────────────────────── */
        function attempt() {
            var val = input.value.trim();
            if (!val || input.disabled) return;
            input.disabled = true;
            hint.classList.remove('show');

            crypto.subtle.digest('SHA-256', new TextEncoder().encode(val))
                .then(function (buf) {
                    var hex = Array.from(new Uint8Array(buf))
                        .map(function (b) { return b.toString(16).padStart(2,'0'); }).join('');
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
