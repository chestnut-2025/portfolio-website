(function () {
    var HASH = '0104f4cab7d32c34991d5dbb50461a50379c96a3d26b1ba3d50c27ce3d32f3c2';
    var KEY  = 'portfolio_auth';

    if (sessionStorage.getItem(KEY) === HASH) return;

    var hideStyle = document.createElement('style');
    hideStyle.id = 'gate-hide';
    hideStyle.textContent = 'body{visibility:hidden!important}';
    document.head.appendChild(hideStyle);

    function showGate() {
        document.getElementById('gate-hide').remove();

        /* ── Styles ─────────────────────────────────────────────── */
        var style = document.createElement('style');
        style.textContent = [
            '#gate-overlay{',
                'position:fixed;inset:0;z-index:9999;',
                'background:var(--bg,#FAFAF8);',
                'display:flex;align-items:center;justify-content:center;',
                'font-family:"Inter",sans-serif;',
                'transform-origin:center;will-change:transform,opacity;',
            '}',
            '#gate-box{',
                'display:flex;flex-direction:column;align-items:flex-start;',
                'gap:20px;width:100%;max-width:360px;padding:0 24px;',
                'transition:opacity 0.3s ease;',
            '}',
            '#gate-box.gate-box-hide{opacity:0;pointer-events:none}',

            /* icon */
            '#gate-icon{',
                'position:relative;width:52px;height:52px;',
                'margin-bottom:4px;cursor:default;',
            '}',
            '#gate-ring{',
                'position:absolute;inset:0;border-radius:50%;',
                'border:1.5px solid rgba(26,26,24,0.18);',
                'box-shadow:0 0 14px rgba(26,26,24,0.07);',
                'animation:gate-pulse 2.8s ease-in-out infinite;',
                'transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1),',
                    'border-color 0.3s ease, box-shadow 0.3s ease, opacity 0.4s ease;',
            '}',
            '[data-theme="dark"] #gate-ring{',
                'border-color:rgba(238,237,232,0.18);',
                'box-shadow:0 0 14px rgba(238,237,232,0.06);',
            '}',
            '#gate-shape{',
                'position:absolute;top:50%;left:50%;',
                'width:19px;height:19px;',
                'transform:translate(-50%,-50%) rotate(0deg);',
                'background:#F5E03A;border-radius:3px;',
                'transition:',
                    'transform 0.4s cubic-bezier(0.34,1.3,0.64,1),',
                    'border-radius 0.35s ease,',
                    'width 0.35s ease, height 0.35s ease,',
                    'opacity 0.3s ease,',
                    'box-shadow 0.3s ease;',
            '}',
            '.gate-keyripple{',
                'position:absolute;inset:0;border-radius:50%;',
                'border:1px solid rgba(26,26,24,0.15);',
                'transform:scale(1);opacity:1;pointer-events:none;',
                'transition:transform 0.55s ease,opacity 0.55s ease;',
            '}',
            '[data-theme="dark"] .gate-keyripple{',
                'border-color:rgba(238,237,232,0.15);',
            '}',
            '.gate-keyripple.go{transform:scale(2.8);opacity:0}',

            /* ring states */
            '.gate-is-typing #gate-ring{',
                'animation:none;',
                'border-color:rgba(26,26,24,0.35);',
                'box-shadow:0 0 8px rgba(26,26,24,0.1);',
            '}',
            '[data-theme="dark"] .gate-is-typing #gate-ring{',
                'border-color:rgba(238,237,232,0.35);',
            '}',
            '.gate-is-typing #gate-shape{',
                'border-radius:2px;',
                'box-shadow:0 0 6px rgba(245,224,58,0.4);',
            '}',
            '.gate-is-error #gate-ring{',
                'animation:none;',
                'transform:scale(0.88);',
                'border-color:rgba(242,170,191,0.6);',
            '}',
            '.gate-is-submitting #gate-ring{animation:none}',
            /* success: shape → diamond */
            '.gate-is-diamond #gate-shape{',
                'transform:translate(-50%,-50%) rotate(45deg);',
                'border-radius:2px;',
            '}',
            /* success: diamond → circle */
            '.gate-is-circle #gate-shape{',
                'transform:translate(-50%,-50%) rotate(45deg);',
                'border-radius:50%;width:22px;height:22px;',
            '}',
            /* success: ring ripple */
            '.gate-is-ripple #gate-ring{',
                'transform:scale(3.5);opacity:0;',
                'transition:transform 0.6s cubic-bezier(0.2,0,0,1),opacity 0.6s ease;',
            '}',

            /* typography */
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
                'color:var(--text-muted,#888);margin-top:-8px;',
            '}',

            /* input row */
            '#gate-row{display:flex;gap:10px;width:100%}',
            '#gate-input{',
                'flex:1;height:44px;padding:0 16px;border-radius:100px;',
                'border:1px solid var(--border,#E0DED8);',
                'background:var(--bg,#FAFAF8);',
                'font-family:"Inter",sans-serif;font-size:0.9rem;',
                'color:var(--text,#1A1A18);outline:none;',
                'transition:border-color 0.15s ease;',
                'caret-color:var(--text,#1A1A18);',
            '}',
            '#gate-input::placeholder{color:var(--text-muted,#888)}',
            '#gate-input:focus{border-color:rgba(26,26,24,0.35)}',
            '[data-theme="dark"] #gate-input:focus{border-color:rgba(238,237,232,0.35)}',
            '#gate-input.gate-key-flash{border-color:rgba(26,26,24,0.55)!important}',
            '[data-theme="dark"] #gate-input.gate-key-flash{border-color:rgba(238,237,232,0.55)!important}',
            '#gate-input.gate-error{',
                'border-color:#F2AABF!important;',
                'animation:gate-shake 0.38s ease;',
            '}',
            '#gate-input:disabled{opacity:0.5;cursor:not-allowed}',
            '#gate-submit{',
                'height:44px;padding:0 20px;border-radius:100px;',
                'border:1px solid var(--border,#E0DED8);',
                'background:var(--bg,#FAFAF8);',
                'font-family:"Inter",sans-serif;font-size:0.85rem;',
                'color:var(--text,#1A1A18);cursor:pointer;white-space:nowrap;',
                'min-width:96px;',
                'transition:border-color 0.2s ease,color 0.2s ease,opacity 0.2s ease;',
            '}',
            '#gate-submit:hover{border-color:rgba(26,26,24,0.45)}',
            '#gate-submit:disabled{opacity:0.5;cursor:not-allowed}',
            '#gate-hint{',
                'font-size:0.82rem;color:var(--text-muted,#888);font-weight:300;',
                'opacity:0;transition:opacity 0.2s ease;min-height:1.2em;',
            '}',
            '#gate-hint.show{opacity:1}',

            /* flash text */
            '#gate-flash{',
                'position:absolute;',
                'font-family:"Inter",sans-serif;',
                'font-size:clamp(1.6rem,4vw,2.2rem);font-weight:600;',
                'letter-spacing:-0.03em;color:var(--text,#1A1A18);',
                'opacity:0;pointer-events:none;',
                'transition:opacity 0.35s ease;',
            '}',
            '#gate-flash.show{opacity:1}',

            /* chestnut easter egg */
            '#gate-chestnut{',
                'position:absolute;font-size:2rem;',
                'opacity:0;pointer-events:none;',
                'transition:opacity 0.2s ease;',
                'user-select:none;',
            '}',
            '#gate-chestnut.show{opacity:1}',

            /* door open */
            '#gate-overlay.gate-open{',
                'transition:transform 0.6s cubic-bezier(0.4,0,0.2,1),opacity 0.6s ease;',
                'transform:scale(1.03);opacity:0;',
            '}',

            /* keyframes */
            '@keyframes gate-pulse{',
                '0%,100%{opacity:0.7;box-shadow:0 0 8px rgba(26,26,24,0.05)}',
                '50%{opacity:1;box-shadow:0 0 18px rgba(26,26,24,0.13)}',
            '}',
            '@keyframes gate-shake{',
                '0%,100%{transform:translateX(0)}',
                '20%{transform:translateX(-5px)}',
                '60%{transform:translateX(5px)}',
                '80%{transform:translateX(-3px)}',
            '}',
        ].join('');
        document.head.appendChild(style);

        /* ── HTML ───────────────────────────────────────────────── */
        var overlay = document.createElement('div');
        overlay.id = 'gate-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.innerHTML = [
            '<div id="gate-flash" aria-hidden="true">There it is.</div>',
            '<div id="gate-chestnut" aria-hidden="true">🌰</div>',
            '<div id="gate-box">',
                '<div id="gate-icon">',
                    '<div id="gate-ring"></div>',
                    '<div id="gate-shape"></div>',
                '</div>',
                '<span id="gate-label">Julie Ahn &mdash; Portfolio</span>',
                '<h1 id="gate-title">Not everything<br>is public.</h1>',
                '<p id="gate-sub">This is one of those things.</p>',
                '<div id="gate-row">',
                    '<input id="gate-input" type="password" placeholder="Enter password"',
                        ' autocomplete="current-password" aria-label="Password">',
                    '<button id="gate-submit">Enter &#8594;</button>',
                '</div>',
                '<p id="gate-hint">Not quite.</p>',
            '</div>',
        ].join('');
        document.body.appendChild(overlay);

        var input    = document.getElementById('gate-input');
        var submit   = document.getElementById('gate-submit');
        var hint     = document.getElementById('gate-hint');
        var box      = document.getElementById('gate-box');
        var icon     = document.getElementById('gate-icon');
        var flash    = document.getElementById('gate-flash');
        var chestnut = document.getElementById('gate-chestnut');
        var flashTimer, errorTimer;

        input.focus();

        /* ── Keystroke feedback ─────────────────────────────────── */
        input.addEventListener('input', function () {
            icon.classList.add('gate-is-typing');
            hint.classList.remove('show');

            // Border flash
            input.classList.add('gate-key-flash');
            clearTimeout(flashTimer);
            flashTimer = setTimeout(function () {
                input.classList.remove('gate-key-flash');
            }, 140);

            // Ripple from icon
            var r = document.createElement('div');
            r.className = 'gate-keyripple';
            icon.appendChild(r);
            requestAnimationFrame(function () {
                requestAnimationFrame(function () { r.classList.add('go'); });
            });
            setTimeout(function () { r.remove(); }, 600);

            if (!input.value) icon.classList.remove('gate-is-typing');
        });

        /* ── Error state ────────────────────────────────────────── */
        function showError() {
            icon.classList.remove('gate-is-submitting','gate-is-typing');
            icon.classList.add('gate-is-error');
            input.classList.add('gate-error');
            hint.classList.add('show');
            input.value = '';

            clearTimeout(errorTimer);
            errorTimer = setTimeout(function () {
                icon.classList.remove('gate-is-error');
                input.classList.remove('gate-error');
                input.disabled = false;
                submit.disabled = false;
                submit.innerHTML = 'Enter &#8594;';
                input.focus();
            }, 820);
        }

        /* ── Success sequence ───────────────────────────────────── */
        function openDoor() {
            // Step 1: button → "…", lock input
            submit.innerHTML = '&hellip;';
            submit.disabled = true;
            input.disabled = true;
            icon.classList.remove('gate-is-typing');
            icon.classList.add('gate-is-submitting');

            // Step 2: shape rotates → diamond
            setTimeout(function () {
                icon.classList.add('gate-is-diamond');
            }, 220);

            // Step 3: diamond → circle
            setTimeout(function () {
                icon.classList.remove('gate-is-diamond');
                icon.classList.add('gate-is-circle');
            }, 540);

            // Step 4: ring ripples outward
            setTimeout(function () {
                icon.classList.add('gate-is-ripple');
            }, 720);

            // Step 5: 🌰 flash
            setTimeout(function () {
                chestnut.classList.add('show');
                setTimeout(function () {
                    chestnut.classList.remove('show');
                }, 340);
            }, 860);

            // Step 6: box fades, "There it is." appears
            setTimeout(function () {
                box.classList.add('gate-box-hide');
                flash.classList.add('show');
            }, 1000);

            // Step 7: flash fades, door opens
            setTimeout(function () {
                flash.style.transition = 'opacity 0.3s ease';
                flash.style.opacity    = '0';
                overlay.classList.add('gate-open');
            }, 1600);

            overlay.addEventListener('transitionend', function handler(e) {
                if (e.propertyName !== 'opacity' || e.target !== overlay) return;
                overlay.removeEventListener('transitionend', handler);
                overlay.remove();
            });
        }

        /* ── Attempt ────────────────────────────────────────────── */
        function attempt() {
            var val = input.value.trim();
            if (!val || submit.disabled) return;

            // Immediately acknowledge
            submit.innerHTML = '&hellip;';
            submit.disabled = true;
            input.disabled = true;

            crypto.subtle.digest('SHA-256', new TextEncoder().encode(val))
                .then(function (buf) {
                    var hex = Array.from(new Uint8Array(buf))
                        .map(function (b) { return b.toString(16).padStart(2, '0'); })
                        .join('');

                    if (hex === HASH) {
                        sessionStorage.setItem(KEY, HASH);
                        openDoor();
                    } else {
                        showError();
                    }
                });
        }

        submit.addEventListener('click', attempt);
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') attempt();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showGate);
    } else {
        showGate();
    }
})();
