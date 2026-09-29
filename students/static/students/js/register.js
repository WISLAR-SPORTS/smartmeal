
/*
==========================================
INITIALIZE LUCIDE
==========================================
*/
document.addEventListener("DOMContentLoaded", function () {

if (typeof lucide !== "undefined") {
    lucide.createIcons();
}


/*
==========================================
PASSWORD TOGGLES
==========================================
*/

const passwordToggles =
    document.querySelectorAll(".password-toggle");


passwordToggles.forEach(function (toggle) {

    toggle.addEventListener("click", function (event) {

        event.preventDefault();


        const targetId =
            toggle.getAttribute("data-target");


        const passwordInput =
            document.getElementById(targetId);


        if (!passwordInput) {

            console.error(
                "Password field not found:",
                targetId
            );

            return;
        }


        const isHidden =
            passwordInput.type === "password";


        if (isHidden) {

            passwordInput.type = "text";

            toggle.setAttribute(
                "aria-label",
                "Hide password"
            );

            toggle.setAttribute(
                "aria-pressed",
                "true"
            );

            toggle.innerHTML =
                '<i data-lucide="eye-off"></i>';

        } else {

            passwordInput.type = "password";

            toggle.setAttribute(
                "aria-label",
                "Show password"
            );

            toggle.setAttribute(
                "aria-pressed",
                "false"
            );

            toggle.innerHTML =
                '<i data-lucide="eye"></i>';

        }


        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }

    });

});

});


