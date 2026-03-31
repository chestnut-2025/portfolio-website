(function () {
    var HASH = '0104f4cab7d32c34991d5dbb50461a50379c96a3d26b1ba3d50c27ce3d32f3c2';
    var KEY  = 'portfolio_auth';

    if (sessionStorage.getItem(KEY) === HASH) return;

    // Hide body immediately — no flash
    var hideStyle = document.createElement('style');
    hideStyle.id = 'gate-hide';
    hideStyle.textContent = 'body { visibility: hidden !important; }';
    document.head.appendChild(hideStyle);

    function showGate() {
        document.getElementById('gate-hide').remove();

        var style = document.createElement('style');
        style.textContent = [
            '#gate-overlay{',
                'position:fixed;inset:0;z-index:9999;',
                'background:var(--bg,#FAFAF8);',
                'display:flex;align-items:center;justify-content:center;',
                'font-family:"Inter",sans-serif;',
                'transform-origin:center center;',
                'will-change:transform,opacity;',
            '}',
            '#gate-box{',
                'display:flex;flex-direction:column;align-items:flex-start;',
                'gap:20px;width:100%;max-width:360px;padding:0 24px;',
            '}',
            '#gate-label{',
                'font-size:0.65rem;letter-spacing:0.14em;text-transform:uppercase;',
                'color:var(--text-muted,#888);font-weight:500;',
            '}',
            '#gate-title{',
                'font-size:clamp(1.6rem,4vw,2.2rem);font-weight:600;',
                'letter-spacing:-0.03em;line-height:1.15;',
                'color:var(--text,#1A1A18);',
            '}',
            '#gate-sub{',
                'font-size:0.92rem;font-weight:300;',
                'color:var(--text-muted,#888);line-height:1.5;',
                'margin-top:-8px;',
            '}',
            '#gate-row{display:flex;gap:10px;width:100%}',
            '#gate-input{',
                'flex:1;height:44px;padding:0 16px;',
                'border-radius:100px;',
                'border:1px solid var(--border,#E0DED8);',
                'background:var(--bg,#FAFAF8);',
                'font-family:"Inter",sans-serif;font-size:0.9rem;',
                'color:var(--text,#1A1A18);outline:none;',
                'transition:border-color 0.2s ease;',
            '}',
            '#gate-input::placeholder{color:var(--text-muted,#888)}',
            '#gate-input:focus{border-color:var(--text-muted,#888)}',
            '#gate-input.gate-error{border-color:#F2AABF;animation:gate-shake 0.4s ease}',
            '#gate-submit{',
                'height:44px;padding:0 20px;border-radius:100px;',
                'border:1px solid var(--border,#E0DED8);',
                'background:var(--bg,#FAFAF8);',
                'font-family:"Inter",sans-serif;font-size:0.85rem;',
                'color:var(--text,#1A1A18);cursor:pointer;white-space:nowrap;',
                'transition:border-color 0.2s ease;',
            '}',
            '#gate-submit:hover{border-color:var(--text-muted,#888)}',
            '#gate-hint{',
                'font-size:0.82rem;color:var(--text-muted,#888);',
                'font-weight:300;opacity:0;',
                'transition:opacity 0.2s ease;',
                'min-height:1.2em;',
            '}',
            '#gate-hint.gate-hint-show{opacity:1}',

            /* entry moment */
            '#gate-flash{',
                'position:absolute;',
                'font-size:clamp(1.6rem,4vw,2.2rem);font-weight:600;',
                'letter-spacing:-0.03em;',
                'color:var(--text,#1A1A18);',
                'opacity:0;',
                'pointer-events:none;',
                'transition:opacity 0.35s ease;',
            '}',
            '#gate-flash.gate-flash-show{opacity:1}',

            '#gate-box.gate-form-hide{',
                'opacity:0;transition:opacity 0.3s ease;',
            '}',

            '#gate-overlay.gate-open{',
                'transition:transform 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.55s ease;',
                'transform:scale(1.03);',
                'opacity:0;',
            '}',

            '@keyframes gate-shake{',
                '0%,100%{transform:translateX(0)}',
                '20%{transform:translateX(-6px)}',
                '60%{transform:translateX(6px)}',
                '80%{transform:translateX(-3px)}',
            '}'
        ].join('');
        document.head.appendChild(style);

        var overlay = document.createElement('div');
        overlay.id = 'gate-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.innerHTML = [
            '<div id="gate-flash" aria-hidden="true">There it is.</div>',
            '<div id="gate-box">',
                '<span id="gate-label">Julie Ahn &mdash; Portfolio</span>',
                '<h1 id="gate-title">Not everything<br>is public.</h1>',
                '<p id="gate-sub">This is one of those things.</p>',
                '<div id="gate-row">',
                    '<input id="gate-input" type="password" placeholder="Enter password" autocomplete="current-password" aria-label="Password">',
                    '<button id="gate-submit">Enter &#8594;</button>',
                '</div>',
                '<p id="gate-hint">Hmmm, not quite</p>',
            '</div>'
        ].join('');
        document.body.appendChild(overlay);

        var input  = document.getElementById('gate-input');
        var submit = document.getElementById('gate-submit');
        var hint   = document.getElementById('gate-hint');
        var box    = document.getElementById('gate-box');
        var flash  = document.getElementById('gate-flash');

        input.focus();

        function openDoor() {
            // 1. Form fades out
            box.classList.add('gate-form-hide');

            // 2. "There it is." fades in
            setTimeout(function () {
                flash.classList.add('gate-flash-show');
            }, 250);

            // 3. Screen scales open and fades
            setTimeout(function () {
                flash.style.transition = 'opacity 0.3s ease';
                flash.style.opacity = '0';
                overlay.classList.add('gate-open');
            }, 900);

            // 4. Remove overlay, page is live
            overlay.addEventListener('transitionend', function handler(e) {
                if (e.propertyName !== 'opacity') return;
                overlay.removeEventListener('transitionend', handler);
                overlay.remove();
            });
        }

        function attempt() {
            var val = input.value.trim();
            if (!val) return;

            crypto.subtle.digest('SHA-256', new TextEncoder().encode(val))
                .then(function (buf) {
                    var hex = Array.from(new Uint8Array(buf))
                        .map(function (b) { return b.toString(16).padStart(2, '0'); })
                        .join('');

                    if (hex === HASH) {
                        sessionStorage.setItem(KEY, HASH);
                        openDoor();
                    } else {
                        input.classList.add('gate-error');
                        hint.classList.add('gate-hint-show');
                        input.value = '';
                        input.addEventListener('animationend', function () {
                            input.classList.remove('gate-error');
                        }, { once: true });
                        input.focus();
                    }
                });
        }

        submit.addEventListener('click', attempt);
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') attempt();
            hint.classList.remove('gate-hint-show');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showGate);
    } else {
        showGate();
    }
})();
