
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

