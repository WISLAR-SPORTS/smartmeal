
document.addEventListener("DOMContentLoaded", function () {

    /*
    ==========================================
    STUDENT QR CODE
    ==========================================
    */

    const qrElement = document.getElementById("student-qr");

    const fullscreenButton =
        document.getElementById("fullscreen-qr");

    const modal =
        document.getElementById("qr-modal");

    const modalQr =
        document.getElementById("modal-qr");

    const closeButton =
        document.getElementById("close-qr");


    /*
    ==========================================
    GENERATE QR
    ==========================================
    */

    function generateQRCode(element, token, size) {

        if (!element || !token) {
            return;
        }

        element.innerHTML = "";

        new QRCode(element, {
            text: token,
            width: size,
            height: size,
            colorDark: "#18221e",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.M
        });
    }


    /*
    ==========================================
    MAIN QR
    ==========================================
    */

    if (qrElement) {

        const token =
            qrElement.dataset.token;

        if (token) {

            generateQRCode(
                qrElement,
                token,
                154
            );

        } else {

            qrElement.innerHTML = `
                <div class="qr-placeholder">
                    QR
                </div>
            `;

        }
    }


    /*
    ==========================================
    OPEN QR MODAL
    ==========================================
    */

    if (fullscreenButton) {

        fullscreenButton.addEventListener(
            "click",
            function () {

                const token =
                    qrElement?.dataset.token;

                if (!token) {
                    return;
                }

                modalQr.innerHTML = "";

                generateQRCode(
                    modalQr,
                    token,
                    220
                );

                modal.classList.remove("hidden");

            }
        );

    }


    /*
    ==========================================
    CLOSE QR MODAL
    ==========================================
    */

    function closeModal() {

        if (modal) {
            modal.classList.add("hidden");
        }

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeModal
        );

    }


    /*
    ==========================================
    CLOSE WHEN CLICKING OUTSIDE
    ==========================================
    */

    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (event.target === modal) {
                    closeModal();
                }

            }
        );

    }


    /*
    ==========================================
    ESCAPE KEY
    ==========================================
    */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                modal &&
                !modal.classList.contains("hidden")
            ) {

                closeModal();

            }

        }
    );


    /*
    ==========================================
    AUTO REFRESH
    ==========================================
    
    Refresh the dashboard periodically so
    meal redemption status can stay current.

    This performs a normal page reload.
    Change or remove this if you later add
    AJAX/API-based updates.
    */

    const REFRESH_INTERVAL = 120000; // 2 minutes

    setTimeout(function () {

        window.location.reload();

    }, REFRESH_INTERVAL);


});

/* =====================================================
   SMARTMEAL LIVE MEAL COUNTDOWN
===================================================== */

(function () {

    "use strict";


    function formatCountdown(milliseconds) {

        const totalSeconds = Math.max(
            0,
            Math.floor(milliseconds / 1000)
        );


        const hours = Math.floor(
            totalSeconds / 3600
        );


        const minutes = Math.floor(
            (totalSeconds % 3600) / 60
        );


        const seconds =
            totalSeconds % 60;


        if (hours > 0) {

            return (
                `${hours}h ` +
                `${String(minutes).padStart(2, "0")}m`
            );

        }


        return (
            `${String(minutes).padStart(2, "0")}:` +
            `${String(seconds).padStart(2, "0")}`
        );

    }


    function updateMealCountdowns() {

        const mealItems =
            document.querySelectorAll(
                ".meal-item[data-start][data-end]"
            );


        const now = new Date();


        mealItems.forEach(function (meal) {

            const countdown =
                meal.querySelector(
                    ".countdown-value"
                );


            if (!countdown) {
                return;
            }


            const startTime =
                new Date(
                    meal.dataset.start
                );


            const endTime =
                new Date(
                    meal.dataset.end
                );


            /*
             * Invalid date protection
             */

            if (
                Number.isNaN(startTime.getTime()) ||
                Number.isNaN(endTime.getTime())
            ) {

                countdown.textContent =
                    "Time unavailable";

                return;
            }


            /*
             * Remove previous states
             */

            meal.classList.remove(
                "countdown-warning",
                "countdown-danger",
                "meal-ended"
            );


            const untilStart =
                startTime.getTime() -
                now.getTime();


            const untilEnd =
                endTime.getTime() -
                now.getTime();


            /*
             * MEAL HAS NOT STARTED
             */

            if (untilStart > 0) {

                countdown.textContent =
                    "Starts in " +
                    formatCountdown(untilStart);

                return;
            }


            /*
             * MEAL IS CURRENTLY ACTIVE
             */

            if (untilEnd > 0) {

                countdown.textContent =
                    "Ends in " +
                    formatCountdown(untilEnd);


                /*
                 * Less than 10 minutes
                 */

                if (
                    untilEnd <=
                    10 * 60 * 1000
                ) {

                    meal.classList.add(
                        "countdown-warning"
                    );

                }


                /*
                 * Less than 2 minutes
                 */

                if (
                    untilEnd <=
                    2 * 60 * 1000
                ) {

                    meal.classList.remove(
                        "countdown-warning"
                    );

                    meal.classList.add(
                        "countdown-danger"
                    );

                }


                return;
            }


            /*
             * MEAL HAS ENDED
             */

            countdown.textContent =
                "Meal ended";


            meal.classList.add(
                "meal-ended"
            );

        });

    }


    /*
     * Run immediately
     */

    updateMealCountdowns();


    /*
     * Update every second
     */

    setInterval(
        updateMealCountdowns,
        1000
    );

})();
