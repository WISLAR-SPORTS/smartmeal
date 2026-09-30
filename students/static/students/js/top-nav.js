
    /* ==========================================
       THEME TOGGLE
       DESKTOP + MOBILE USE ONE FUNCTION
    ========================================== */

    const desktopToggle =
        document.getElementById("theme-toggle");

    const mobileToggle =
        document.getElementById("mobile-theme-toggle");


    function isDarkMode() {

        return document.documentElement
            .getAttribute("data-theme") === "dark";

    }


    function updateThemeButtons() {

        const dark =
            isDarkMode();


        /* --------------------------------------
           Desktop Toggle
        -------------------------------------- */

        if (desktopToggle) {

            desktopToggle.setAttribute(
                "aria-pressed",
                dark ? "true" : "false"
            );

            desktopToggle.setAttribute(
                "aria-label",
                dark
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            );

            desktopToggle.innerHTML =
                `<i data-lucide="${dark ? "sun" : "moon"}"></i>`;
        }


        /* --------------------------------------
           Mobile Toggle
        -------------------------------------- */

        if (mobileToggle) {

            mobileToggle.setAttribute(
                "aria-pressed",
                dark ? "true" : "false"
            );

            mobileToggle.setAttribute(
                "aria-label",
                dark
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            );


            const iconContainer =
                mobileToggle.querySelector(
                    ".mobile-menu-icon"
                );

            if (iconContainer) {

                iconContainer.innerHTML =
                    `<i data-lucide="${dark ? "sun" : "moon"}"></i>`;

            }


            const text =
                mobileToggle.querySelector(
                    ".mobile-menu-text strong"
                );

            if (text) {

                text.textContent =
                    dark
                        ? "Light Mode"
                        : "Dark Mode";

            }


            const indicator =
                mobileToggle.querySelector(
                    ".mobile-theme-indicator"
                );

            if (indicator) {

                indicator.innerHTML =
                    `<i data-lucide="${dark ? "sun" : "moon"}"></i>`;

            }

        }


        /* Re-render Lucide icons */

        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }

    }


    function toggleTheme() {

        const dark =
            isDarkMode();


        if (dark) {

            document.documentElement
                .removeAttribute("data-theme");

            localStorage.setItem(
                "smartmeal-theme",
                "light"
            );

        } else {

            document.documentElement
                .setAttribute(
                    "data-theme",
                    "dark"
                );

            localStorage.setItem(
                "smartmeal-theme",
                "dark"
            );

        }


        updateThemeButtons();

    }


    /* --------------------------------------
       Desktop Theme Button
    -------------------------------------- */

    if (desktopToggle) {

        desktopToggle.addEventListener(
            "click",
            toggleTheme
        );

    }


    /* --------------------------------------
       Mobile Theme Button
    -------------------------------------- */

    if (mobileToggle) {

        mobileToggle.addEventListener(
            "click",
            toggleTheme
        );

    }


    /* Set correct state when page loads */

    updateThemeButtons();


    /* ==========================================
       NAVBAR SHADOW ON SCROLL
    ========================================== */

    const header =
        document.querySelector(".landing-header");

    window.addEventListener("scroll", function () {

        if (!header) return;

        if (window.scrollY > 20) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }

    });
