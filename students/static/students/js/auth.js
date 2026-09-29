javascript
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    /* =========================================
       REDUCED MOTION
    ========================================= */

    const prefersReducedMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    /* =========================================
       PASSWORD SHOW / HIDE
    ========================================= */

    const passwordButtons =
        document.querySelectorAll(".password-toggle");

    passwordButtons.forEach((button) => {

        button.addEventListener("click", (event) => {

            event.preventDefault();

            const targetId = button.dataset.target;
            const input = document.getElementById(targetId);

            if (!input) return;

            const isPassword =
                input.type === "password";

            input.type =
                isPassword ? "text" : "password";

            button.textContent =
                isPassword ? "🙈" : "👁";

            button.setAttribute(
                "aria-label",
                isPassword
                    ? "Hide password"
                    : "Show password"
            );

            /* Liquid twist */

            if (!prefersReducedMotion) {

                button.animate(
                    [
                        {
                            transform: "rotate(0deg) scale(1)"
                        },
                        {
                            transform:
                                "rotate(-18deg) scale(0.85)"
                        },
                        {
                            transform:
                                "rotate(18deg) scale(1.08)"
                        },
                        {
                            transform:
                                "rotate(0deg) scale(1)"
                        }
                    ],
                    {
                        duration: 350,
                        easing: "cubic-bezier(.34,1.56,.64,1)"
                    }
                );

            }

        });

    });


    /* =========================================
       PASSWORD STRENGTH
    ========================================= */

    const passwordInput =
        document.querySelector(
            '[name="password"]'
        );

    const strengthBars =
        document.querySelectorAll(
            ".strength-bars span"
        );

    const strengthText =
        document.querySelector(
            ".strength-text"
        );

    if (
        passwordInput &&
        strengthBars.length &&
        strengthText
    ) {

        passwordInput.addEventListener(
            "input",
            () => {

                const password =
                    passwordInput.value;

                let strength = 0;

                if (password.length >= 8) {
                    strength++;
                }

                if (/[A-Z]/.test(password)) {
                    strength++;
                }

                if (/[0-9]/.test(password)) {
                    strength++;
                }

                if (/[^A-Za-z0-9]/.test(password)) {
                    strength++;
                }

                const colors = [
                    "#fb7185",
                    "#f59e0b",
                    "#facc15",
                    "#34d399"
                ];

                const labels = [
                    "Too weak",
                    "Weak",
                    "Good",
                    "Strong"
                ];

                strengthBars.forEach(
                    (bar, index) => {

                        if (index < strength) {

                            bar.style.background =
                                colors[strength - 1];

                            if (!prefersReducedMotion) {

                                bar.animate(
                                    [
                                        {
                                            transform:
                                                "scaleX(0.5)",
                                            opacity: 0.3
                                        },
                                        {
                                            transform:
                                                "scaleX(1)",
                                            opacity: 1
                                        }
                                    ],
                                    {
                                        duration: 300,
                                        easing:
                                            "cubic-bezier(.34,1.56,.64,1)"
                                    }
                                );

                            }

                        } else {

                            bar.style.background =
                                "rgba(255,255,255,0.12)";

                        }

                    }
                );

                if (password.length === 0) {

                    strengthText.textContent =
                        "Enter a password";

                    strengthText.style.color =
                        "rgba(255,255,255,0.65)";

                } else {

                    strengthText.textContent =
                        labels[strength - 1] ||
                        "Too weak";

                    strengthText.style.color =
                        colors[strength - 1] ||
                        colors[0];

                }

            }
        );

    }


    /* =========================================
       PHOTO PREVIEW
    ========================================= */

    const photoInput =
        document.querySelector(
            'input[type="file"]'
        );

    const photoPreview =
        document.getElementById(
            "photoPreview"
        );

    if (photoInput && photoPreview) {

        photoInput.addEventListener(
            "change",
            (event) => {

                const file =
                    event.target.files[0];

                if (!file) return;

                if (!file.type.startsWith("image/")) {

                    photoInput.value = "";

                    photoPreview.innerHTML =
                        "📷";

                    return;
                }

                const reader =
                    new FileReader();

                reader.onload = (e) => {

                    photoPreview.innerHTML = `
                        <img
                            src="${e.target.result}"
                            alt="Profile preview"
                        >
                    `;

                    if (!prefersReducedMotion) {

                        photoPreview.animate(
                            [
                                {
                                    transform:
                                        "scale(0.5) rotate(-10deg)",
                                    opacity: 0
                                },
                                {
                                    transform:
                                        "scale(1.1) rotate(3deg)",
                                    opacity: 1
                                },
                                {
                                    transform:
                                        "scale(1) rotate(0)",
                                    opacity: 1
                                }
                            ],
                            {
                                duration: 550,
                                easing:
                                    "cubic-bezier(.34,1.56,.64,1)"
                            }
                        );

                    }

                };

                reader.readAsDataURL(file);

            }
        );

    }


    /* =========================================
       TERMS CHECKBOX
    ========================================= */

    const terms =
        document.getElementById("terms");

    if (terms) {

        terms.addEventListener(
            "change",
            () => {

                const wrapper =
                    terms.closest(
                        ".terms-checkbox"
                    );

                if (!wrapper) return;

                if (terms.checked) {

                    wrapper.style.color =
                        "#6ee7b7";

                    const checkbox =
                        wrapper.querySelector(
                            ".custom-checkbox"
                        );

                    if (
                        checkbox &&
                        !prefersReducedMotion
                    ) {

                        checkbox.animate(
                            [
                                {
                                    transform:
                                        "scale(0.7) rotate(-15deg)"
                                },
                                {
                                    transform:
                                        "scale(1.15) rotate(8deg)"
                                },
                                {
                                    transform:
                                        "scale(1) rotate(0)"
                                }
                            ],
                            {
                                duration: 400,
                                easing:
                                    "cubic-bezier(.34,1.56,.64,1)"
                            }
                        );

                    }

                } else {

                    wrapper.style.color =
                        "rgba(255,255,255,0.65)";

                }

            }
        );

    }


    /* =========================================
       FORM VALIDATION
    ========================================= */

    const registerForm =
        document.getElementById(
            "registerForm"
        );

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            (event) => {

                if (
                    terms &&
                    !terms.checked
                ) {

                    event.preventDefault();

                    const wrapper =
                        terms.closest(
                            ".terms-checkbox"
                        );

                    if (wrapper) {

                        wrapper.style.color =
                            "#fb7185";

                        if (!prefersReducedMotion) {

                            wrapper.animate(
                                [
                                    {
                                        transform:
                                            "translateX(0)"
                                    },
                                    {
                                        transform:
                                            "translateX(-7px) rotate(-1deg)"
                                    },
                                    {
                                        transform:
                                            "translateX(7px) rotate(1deg)"
                                    },
                                    {
                                        transform:
                                            "translateX(-4px)"
                                    },
                                    {
                                        transform:
                                            "translateX(0)"
                                    }
                                ],
                                {
                                    duration: 400,
                                    easing: "ease-out"
                                }
                            );

                        }

                    }

                    return;
                }

            }
        );

    }


    /* =========================================
       LIQUID BUTTON EFFECT
    ========================================= */

    const liquidButtons =
        document.querySelectorAll(
            ".liquid-button"
        );

    liquidButtons.forEach((button) => {

        /* Create liquid layer if missing */

        if (
            !button.querySelector(
                ".button-liquid"
            )
        ) {

            const liquid =
                document.createElement("span");

            liquid.className =
                "button-liquid";

            button.appendChild(liquid);

        }


        button.addEventListener(
            "click",
            (event) => {

                if (prefersReducedMotion) {
                    return;
                }

                /* Calculate click position */

                const rect =
                    button.getBoundingClientRect();

                const x =
                    event.clientX - rect.left;

                const y =
                    event.clientY - rect.top;


                /* Ripple */

                const ripple =
                    document.createElement("span");

                ripple.className =
                    "button-ripple";

                ripple.style.left =
                    `${x}px`;

                ripple.style.top =
                    `${y}px`;

                button.appendChild(ripple);


                ripple.animate(
                    [
                        {
                            width: "0px",
                            height: "0px",
                            opacity: 0.6,
                            transform:
                                "translate(-50%, -50%)"
                        },
                        {
                            width: "500px",
                            height: "500px",
                            opacity: 0,
                            transform:
                                "translate(-50%, -50%)"
                        }
                    ],
                    {
                        duration: 700,
                        easing: "ease-out"
                    }
                ).onfinish = () => {
                    ripple.remove();
                };


                /* Twist */

                button.animate(
                    [
                        {
                            transform:
                                "translateY(0) rotateX(0deg) rotateY(0deg)"
                        },
                        {
                            transform:
                                "translateY(2px) rotateX(7deg) rotateY(-5deg)"
                        },
                        {
                            transform:
                                "translateY(-2px) rotateX(-4deg) rotateY(5deg)"
                        },
                        {
                            transform:
                                "translateY(0) rotateX(0deg) rotateY(0deg)"
                        }
                    ],
                    {
                        duration: 450,
                        easing:
                            "cubic-bezier(.34,1.56,.64,1)"
                    }
                );

            }
        );


        /* Hover arrow */

        const arrow =
            button.querySelector(
                ".button-arrow"
            );

        if (arrow) {

            button.addEventListener(
                "mouseenter",
                () => {

                    if (prefersReducedMotion) return;

                    arrow.animate(
                        [
                            {
                                transform:
                                    "translateX(0) rotate(0)"
                            },
                            {
                                transform:
                                    "translateX(5px) rotate(8deg)"
                            }
                        ],
                        {
                            duration: 250,
                            fill: "forwards",
                            easing:
                                "cubic-bezier(.34,1.56,.64,1)"
                        }
                    );

                }
            );

        }

    });


    /* =========================================
       INPUT LIQUID GLOW
    ========================================= */

    const inputGroups =
        document.querySelectorAll(
            ".liquid-input"
        );

    inputGroups.forEach((container) => {

        container.addEventListener(
            "mousemove",
            (event) => {

                if (window.innerWidth < 768) {
                    return;
                }

                const rect =
                    container.getBoundingClientRect();

                const x =
                    ((event.clientX - rect.left) /
                        rect.width) *
                    100;

                const y =
                    ((event.clientY - rect.top) /
                        rect.height) *
                    100;

                container.style.setProperty(
                    "--mouse-x",
                    `${x}%`
                );

                container.style.setProperty(
                    "--mouse-y",
                    `${y}%`
                );

            }
        );

    });


    /* =========================================
       CARD LIQUID TILT
    ========================================= */

    const cards =
        document.querySelectorAll(
            ".auth-card"
        );

    cards.forEach((card) => {

        if (window.innerWidth <= 768) {
            return;
        }

        card.addEventListener(
            "mousemove",
            (event) => {

                if (prefersReducedMotion) {
                    return;
                }

                const rect =
                    card.getBoundingClientRect();

                const x =
                    event.clientX - rect.left;

                const y =
                    event.clientY - rect.top;

                const rotateY =
                    ((x / rect.width) - 0.5) * 5;

                const rotateX =
                    ((y / rect.height) - 0.5) * -5;

                card.style.transform =
                    `perspective(1200px)
                     rotateX(${rotateX}deg)
                     rotateY(${rotateY}deg)
                     translateY(-2px)`;

                card.style.setProperty(
                    "--mouse-x",
                    `${x}px`
                );

                card.style.setProperty(
                    "--mouse-y",
                    `${y}px`
                );

            }
        );


        card.addEventListener(
            "mouseleave",
            () => {

                card.style.transform =
                    "";

            }
        );

    });


    /* =========================================
       BRAND ICON LIQUID HOVER
    ========================================= */

    const brandIcon =
        document.querySelector(
            ".brand-icon"
        );

    if (brandIcon) {

        brandIcon.addEventListener(
            "mouseenter",
            () => {

                if (prefersReducedMotion) return;

                brandIcon.animate(
                    [
                        {
                            transform:
                                "rotate(0deg) scale(1)"
                        },
                        {
                            transform:
                                "rotate(-8deg) scale(1.05)"
                        },
                        {
                            transform:
                                "rotate(8deg) scale(1.08)"
                        },
                        {
                            transform:
                                "rotate(0deg) scale(1)"
                        }
                    ],
                    {
                        duration: 600,
                        easing:
                            "cubic-bezier(.34,1.56,.64,1)"
                    }
                );

            }
        );

    }


    /* =========================================
       SECTION HEADING INTERACTION
    ========================================= */

    const sectionNumbers =
        document.querySelectorAll(
            ".section-number"
        );

    sectionNumbers.forEach((number) => {

        number.addEventListener(
            "mouseenter",
            () => {

                if (prefersReducedMotion) return;

                number.animate(
                    [
                        {
                            transform:
                                "rotate(0deg) scale(1)"
                        },
                        {
                            transform:
                                "rotate(12deg) scale(1.08)"
                        },
                        {
                            transform:
                                "rotate(-8deg) scale(1.05)"
                        },
                        {
                            transform:
                                "rotate(0deg) scale(1)"
                        }
                    ],
                    {
                        duration: 450,
                        easing:
                            "cubic-bezier(.34,1.56,.64,1)"
                    }
                );

            }
        );

    });


    /* =========================================
       FORM SUBMISSION / LOADING
    ========================================= */

    const forms =
        document.querySelectorAll(
            ".auth-form"
        );

    forms.forEach((form) => {

        form.addEventListener(
            "submit",
            (event) => {

                /*
                 * Do not immediately disable the button
                 * if browser validation fails.
                 */

                if (
                    !form.checkValidity()
                ) {
                    return;
                }


                const button =
                    form.querySelector(
                        ".liquid-button"
                    );

                if (!button) return;


                button.disabled = true;

                button.classList.add(
                    "is-loading"
                );


                const text =
                    button.querySelector(
                        ".button-text"
                    );

                if (text) {

                    text.dataset.originalText =
                        text.textContent;

                    text.textContent =
                        "Please wait...";

                }


                const arrow =
                    button.querySelector(
                        ".button-arrow"
                    );

                if (arrow) {
                    arrow.style.display =
                        "none";
                }


                /*
                 * Add spinner
                 */

                if (
                    !button.querySelector(
                        ".button-spinner"
                    )
                ) {

                    const spinner =
                        document.createElement(
                            "span"
                        );

                    spinner.className =
                        "button-spinner";

                    button.appendChild(
                        spinner
                    );

                }

            }
        );

    });


    /* =========================================
       TOUCH FEEDBACK
    ========================================= */

    document
        .querySelectorAll(
            ".liquid-button, .brand-icon, .section-number"
        )
        .forEach((element) => {

            element.addEventListener(
                "touchstart",
                () => {

                    element.classList.add(
                        "touch-active"
                    );

                },
                {
                    passive: true
                }
            );

            element.addEventListener(
                "touchend",
                () => {

                    setTimeout(() => {

                        element.classList.remove(
                            "touch-active"
                        );

                    }, 180);

                },
                {
                    passive: true
                }
            );

        });


    /* =========================================
       SMOOTH FIELD ERROR ANIMATION
    ========================================= */

    document
        .querySelectorAll(
            ".has-error"
        )
        .forEach((field) => {

            if (prefersReducedMotion) {
                return;
            }

            const input =
                field.querySelector(
                    ".liquid-input"
                );

            if (!input) return;

            input.animate(
                [
                    {
                        transform:
                            "translateX(0)"
                    },
                    {
                        transform:
                            "translateX(-3px)"
                    },
                    {
                        transform:
                            "translateX(3px)"
                    },
                    {
                        transform:
                            "translateX(0)"
                    }
                ],
                {
                    duration: 350,
                    easing: "ease-out"
                }
            );

        });


    /* =========================================
       FLOATING CARD SHINE
    ========================================= */

    const shine =
        document.querySelector(
            ".card-shine"
        );

    if (
        shine &&
        !prefersReducedMotion
    ) {

        shine.animate(
            [
                {
                    transform:
                        "translate(0, 0) scale(1)",
                    opacity: 0.5
                },
                {
                    transform:
                        "translate(-40px, 30px) scale(1.15)",
                    opacity: 0.8
                },
                {
                    transform:
                        "translate(0, 0) scale(1)",
                    opacity: 0.5
                }
            ],
            {
                duration: 7000,
                iterations: Infinity,
                easing: "ease-in-out"
            }
        );

    }


    /* =========================================
       ESCAPE KEY
       Clear focused field glow
    ========================================= */

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key !== "Escape") {
                return;
            }

            document
                .querySelectorAll(
                    ".liquid-input:focus-within"
                )
                .forEach((element) => {

                    const input =
                        element.querySelector(
                            "input, select"
                        );

                    if (input) {
                        input.blur();
                    }

                });

        }
    );

});

