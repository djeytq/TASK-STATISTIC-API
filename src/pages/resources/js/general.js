/* ============================================================
   TASK STATISTICS API — DOCUMENTATION SCRIPTS
   ============================================================ */

(function () {
    "use strict";

    const $ = (sel, ctx) => (ctx || document).querySelector(sel);
    const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

    /* ============================================================
       SIDEBAR (mobile toggle)
       ============================================================ */

    const sidebar = $("#sidebar");
    const overlay = $("#sidebarOverlay");
    const toggleBtn = $("#sidebarToggle");
    const closeBtn = $("#sidebarClose");

    function openSidebar() {
        sidebar && sidebar.classList.add("open");
        overlay && overlay.classList.add("visible");
        document.body.classList.add("no-scroll");
    }

    function closeSidebar() {
        sidebar && sidebar.classList.remove("open");
        overlay && overlay.classList.remove("visible");
        document.body.classList.remove("no-scroll");
    }

    if (toggleBtn) toggleBtn.addEventListener("click", openSidebar);
    if (closeBtn) closeBtn.addEventListener("click", closeSidebar);
    if (overlay) overlay.addEventListener("click", closeSidebar);

    $$(".nav-link").forEach(function (link) {
        link.addEventListener("click", closeSidebar);
    });

    /* ============================================================
       SCROLL SPY — highlight the current section in the nav
       ============================================================ */

    const sections = $$(".section");
    const navLinks = $$(".nav-link");

    if ("IntersectionObserver" in window && sections.length) {
        const spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                const targetId = "#" + entry.target.id;
                navLinks.forEach(function (link) {
                    const active = link.getAttribute("href") === targetId;
                    link.classList.toggle("active", active);
                });
            });
        }, {
            rootMargin: "-20% 0px -70% 0px",
            threshold: 0
        });
        sections.forEach(function (section) { spy.observe(section); });
    }

    /* ============================================================
       COPY TO CLIPBOARD (helper)
       ============================================================ */

    function copyText(text, onDone) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(onDone, function () { onDone(); });
        } else {
            /* Fallback for older browsers */
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand("copy"); } catch (e) { /* ignore */ }
            document.body.removeChild(ta);
            onDone();
        }
    }

    /* ============================================================
       CODE BLOCKS — inject header + copy button
       ============================================================ */

    $$(".code-block").forEach(function (block) {

        const codeEl = block.querySelector("code");
        if (!codeEl) return;

        const header = document.createElement("div");
        header.className = "code-block-header";

        const label = document.createElement("span");
        label.textContent = (codeEl.dataset.lang || "code").toUpperCase();

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "copy-btn";
        btn.textContent = "Copy";

        btn.addEventListener("click", function () {
            copyText(codeEl.textContent, function () {
                btn.textContent = "Copied!";
                setTimeout(function () { btn.textContent = "Copy"; }, 1600);
            });
        });

        header.appendChild(label);
        header.appendChild(btn);
        block.insertBefore(header, block.firstChild);
    });

    /* ============================================================
       BUTTONS WITH data-copy
       ============================================================ */

    $$("[data-copy]").forEach(function (btn) {

        const labelEl = $(".btn-copy-label", btn);

        btn.addEventListener("click", function () {
            copyText(btn.getAttribute("data-copy"), function () {
                if (labelEl) {
                    const original = labelEl.textContent;
                    labelEl.textContent = "Copied!";
                    setTimeout(function () { labelEl.textContent = original; }, 1600);
                }
            });
        });
    });

    /* ============================================================
       MINI SYNTAX HIGHLIGHTER (no external libraries)
       ============================================================ */

    const TOKEN_PATTERN =
        /(\/\/[^\n]*|#[^\n]*|"[^"]*"|'[^']*'|`[^`]*`|\b(?:async|await|const|let|var|function|return|if|else|for|while|of|in|new|try|catch|throw|class|import|from|export|default|extends|this|true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b)/g;

    function highlightCode(el) {
        const source = el.textContent;
        const parts = source.split(TOKEN_PATTERN);

        el.innerHTML = parts.map(function (token) {
            if (!token) return "";

            if (token.startsWith("//") || token.startsWith("#")) {
                return '<span class="tok-comment">' + token + "</span>";
            }
            if (/^["'`]/.test(token)) {
                return '<span class="tok-string">' + token + "</span>";
            }
            if (/^\d/.test(token)) {
                return '<span class="tok-number">' + token + "</span>";
            }
            if (/^(async|await|const|let|var|function|return|if|else|for|while|of|in|new|try|catch|throw|class|import|from|export|default|extends|this|true|false|null|undefined)$/.test(token)) {
                return '<span class="tok-keyword">' + token + "</span>";
            }
            return token;
        }).join("");
    }

    $$(".code-block code").forEach(highlightCode);

})();
