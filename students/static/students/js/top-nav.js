
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



  
    const photoInput = document.getElementById(
        "{{ form.photo.id_for_label }}"
    );

    photoInput.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {

            let preview =
                document.getElementById("photo-preview");

            const placeholder =
                document.getElementById("photo-placeholder");


            if (placeholder) {
                placeholder.remove();
            }


            if (!preview) {

                preview = document.createElement("img");

                preview.id = "photo-preview";

                preview.className = "photo-preview";

                preview.alt = "Profile photo preview";

                document
                    .querySelector(".photo-preview-container")
                    .appendChild(preview);
            }


            preview.src = event.target.result;
        };

        reader.readAsDataURL(file);
    });

