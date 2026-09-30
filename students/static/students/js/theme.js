
(function () {
    "use strict";

    const STORAGE_KEY = "smartmeal-theme";

    const html = document.documentElement;
    const toggle = document.getElementById("theme-toggle");


    /* =========================================
       SYSTEM THEME
    ========================================= */

    function getSystemTheme() {
        return window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches
            ? "dark"
            : "light";
    }


    /* =========================================
       UPDATE TOGGLE BUTTON
    ========================================= */

    function updateButton(theme) {

        /*
         * Some pages do not have the theme toggle.
         * That's okay.
         */

        if (!toggle) {
            return;
        }

        toggle.setAttribute(
            "aria-pressed",
            theme === "dark"
                ? "true"
                : "false"
        );

        toggle.setAttribute(
            "aria-label",
            theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
        );
    }


    /* =========================================
       APPLY THEME
    ========================================= */

    function applyTheme(theme, save = true) {

        if (theme === "dark") {

            html.setAttribute(
                "data-theme",
                "dark"
            );

        } else {

            /*
             * Light mode uses :root defaults.
             * No data-theme attribute is needed.
             */

            html.removeAttribute(
                "data-theme"
            );
        }


        updateButton(theme);


        if (save) {

            localStorage.setItem(
                STORAGE_KEY,
                theme
            );

        }

    }


    /* =========================================
       GET INITIAL THEME
    ========================================= */

    function getInitialTheme() {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );


        /*
         * Use saved SmartMeal preference.
         */

        if (
            saved === "dark" ||
            saved === "light"
        ) {
            return saved;
        }


        /*
         * No saved preference yet.
         * Follow system preference.
         */

        return getSystemTheme();

    }


    /* =========================================
       INITIAL THEME
    ========================================= */

    const initialTheme =
        getInitialTheme();


    applyTheme(
        initialTheme,
        false
    );


    /* =========================================
       TOGGLE
    ========================================= */

    if (toggle) {

        toggle.addEventListener(
            "click",
            function () {

                const currentTheme =
                    html.getAttribute(
                        "data-theme"
                    ) === "dark"
                        ? "dark"
                        : "light";


                const newTheme =
                    currentTheme === "dark"
                        ? "light"
                        : "dark";


                /*
                 * Start walking
                 */

                toggle.classList.add(
                    "is-moving"
                );


                /*
                 * Change theme while
                 * character is moving.
                 */

                setTimeout(
                    function () {

                        applyTheme(
                            newTheme,
                            true
                        );

                    },
                    180
                );


                /*
                 * Stop walking after
                 * the transition.
                 */

                setTimeout(
                    function () {

                        toggle.classList.remove(
                            "is-moving"
                        );

                    },
                    700
                );

            }
        );

    }


    /* =========================================
       SYSTEM THEME
    ========================================= */

    const mediaQuery =
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        );


    mediaQuery.addEventListener(
        "change",
        function (event) {

            const saved =
                localStorage.getItem(
                    STORAGE_KEY
                );


            /*
             * Only follow system changes
             * when the user has never selected
             * a theme manually.
             */

            if (!saved) {

                applyTheme(
                    event.matches
                        ? "dark"
                        : "light",
                    false
                );

            }

        }
    );

})();


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
