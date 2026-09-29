
document.addEventListener("DOMContentLoaded", function () {

    /* ======================================================
       DESKTOP USER DROPDOWN
    ====================================================== */

    const userButton =
        document.getElementById("user-menu-button");

    const userDropdown =
        document.getElementById("user-dropdown");


    if (userButton && userDropdown) {

        userButton.addEventListener("click", function (event) {

            event.stopPropagation();

            const isOpen =
                userDropdown.classList.contains("open");

            userDropdown.classList.toggle(
                "open",
                !isOpen
            );

            userButton.setAttribute(
                "aria-expanded",
                String(!isOpen)
            );

        });


        document.addEventListener("click", function (event) {

            if (
                !userDropdown.contains(event.target) &&
                !userButton.contains(event.target)
            ) {

                userDropdown.classList.remove("open");

                userButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        });

    }


    /* ======================================================
       MOBILE PROFILE SHEET
    ====================================================== */

    const mobileProfileButton =
        document.getElementById(
            "mobile-profile-button"
        );

    const mobileProfileSheet =
        document.getElementById(
            "mobile-profile-sheet"
        );

    const mobileOverlay =
        document.querySelector(
            ".mobile-sheet-overlay"
        );


    function openMobileProfile() {

        if (!mobileProfileSheet) {
            return;
        }

        mobileProfileSheet.classList.add("open");

        document.body.style.overflow = "hidden";

    }


    function closeMobileProfile() {

        if (!mobileProfileSheet) {
            return;
        }

        mobileProfileSheet.classList.remove("open");

        document.body.style.overflow = "";

    }


    if (mobileProfileButton) {

        mobileProfileButton.addEventListener(
            "click",
            openMobileProfile
        );

    }


    if (mobileOverlay) {

        mobileOverlay.addEventListener(
            "click",
            closeMobileProfile
        );

    }


    /* ======================================================
       ESCAPE KEY
    ====================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                closeMobileProfile();

                if (userDropdown) {

                    userDropdown.classList.remove(
                        "open"
                    );

                }

            }

        }
    );

});

