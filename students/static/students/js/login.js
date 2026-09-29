document.addEventListener("DOMContentLoaded", function () {

    console.log("login.js loaded");


    // Initialize Lucide icons
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }


    // Get password input
    const passwordInput = document.getElementById(
        "id_password"
    );


    // Get toggle button
    const passwordToggle = document.getElementById(
        "password-toggle"
    );


    console.log("Password input:", passwordInput);
    console.log("Password toggle:", passwordToggle);


    // Make sure both elements exist
    if (!passwordInput || !passwordToggle) {

        console.error(
            "Password input or password toggle was not found."
        );

        return;
    }


    // Password toggle
    passwordToggle.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            console.log("Eye button clicked");


            // Check current state
            const passwordIsHidden =
                passwordInput.type === "password";


            if (passwordIsHidden) {

                // Show password
                passwordInput.type = "text";

                passwordToggle.setAttribute(
                    "aria-label",
                    "Hide password"
                );

                passwordToggle.setAttribute(
                    "aria-pressed",
                    "true"
                );

                passwordToggle.innerHTML =
                    '<i data-lucide="eye-off"></i>';

            } else {

                // Hide password
                passwordInput.type = "password";

                passwordToggle.setAttribute(
                    "aria-label",
                    "Show password"
                );

                passwordToggle.setAttribute(
                    "aria-pressed",
                    "false"
                );

                passwordToggle.innerHTML =
                    '<i data-lucide="eye"></i>';
            }


            // Re-create the Lucide icon
            if (typeof lucide !== "undefined") {
                lucide.createIcons();
            }

        }
    );

});
