



/* =========================================================
   ELEMENTS
========================================================= */

const startCameraButton =
    document.getElementById("start-camera");

const cameraPlaceholder =
    document.getElementById("camera-placeholder");

const mealServiceSelect =
    document.getElementById("meal-service");

const selectedMeal =
    document.getElementById("selected-meal");

const manualToggle =
    document.getElementById("manual-toggle");

const manualForm =
    document.getElementById("manual-form");

const qrTokenInput =
    document.getElementById("qr-token");

const manualSubmit =
    document.getElementById("manual-submit");

const resultOverlay =
    document.getElementById("result-overlay");

const resultModal =
    document.getElementById("result-modal");

const modalIcon =
    document.getElementById("modal-icon");

const modalStatus =
    document.getElementById("modal-status");

const modalTitle =
    document.getElementById("modal-title");

const modalMessage =
    document.getElementById("modal-message");

const modalStudent =
    document.getElementById("modal-student");

const closeResult =
    document.getElementById("close-result");

const successCount =
    document.getElementById("success-count");

const rejectedCount =
    document.getElementById("rejected-count");

const resultCard =
    document.getElementById("result-card");

const resultIcon =
    document.getElementById("result-icon");

const resultTitle =
    document.getElementById("result-title");

const resultMessage =
    document.getElementById("result-message");

const studentResult =
    document.getElementById("student-result");


/* =========================================================
   STATE
========================================================= */

let html5QrCode = null;

let scannerRunning = false;

let processingScan = false;

let successTotal = 0;

let rejectedTotal = 0;


/*
 * Prevent html5-qrcode from submitting
 * the same QR repeatedly.
 */

let lastScannedToken = null;

let lastScanTime = 0;

const SCAN_COOLDOWN = 2500;


/* =========================================================
   CSRF
========================================================= */

function getCookie(name) {

    const cookies =
        document.cookie.split(";");


    for (const cookie of cookies) {

        const trimmed =
            cookie.trim();


        if (
            trimmed.startsWith(
                `${name}=`
            )
        ) {

            return decodeURIComponent(
                trimmed.substring(
                    name.length + 1
                )
            );
        }
    }


    return null;
}


const csrfToken =
    getCookie("csrftoken");


/* =========================================================
   MEAL SERVICE DISPLAY
========================================================= */

/*
 * The meal service is now determined by the backend.
 *
 * We keep the dropdown display functionality because
 * your existing HTML may still have the meal-service
 * selector.
 */

if (mealServiceSelect) {

    mealServiceSelect.addEventListener(
        "change",
        () => {

            const option =
                mealServiceSelect.options[
                    mealServiceSelect.selectedIndex
                ];


            if (!mealServiceSelect.value) {

                if (selectedMeal) {

                    selectedMeal.innerHTML = `
                        <div class="empty-state">
                            <span class="empty-icon">
                                🍽
                            </span>

                            <p>
                                Current meal is determined automatically
                            </p>
                        </div>
                    `;
                }

                return;
            }


            const text =
                option.textContent.trim();


            const parts =
                text.split("—");


            const mealName =
                parts[0]?.trim() ||
                "Meal";


            const serviceTime =
                parts[1]?.trim() ||
                "";


            if (selectedMeal) {

                selectedMeal.innerHTML = `
                    <div class="selected-meal-content">

                        <h3>
                            ${escapeHtml(mealName)}
                        </h3>

                        <span class="selected-meal-type">
                            MEAL SERVICE
                        </span>

                        <div class="service-time">

                            <span>
                                Serving time
                            </span>

                            <strong>
                                ${escapeHtml(serviceTime)}
                            </strong>

                        </div>

                    </div>
                `;
            }
        }
    );
}


/* =========================================================
   START CAMERA / QR SCANNER
========================================================= */

async function startScanner() {

    /*
     * Do NOT require a meal-service selection here.
     *
     * The backend determines the current meal using
     * Kampala time.
     */

    if (scannerRunning) {
        return;
    }


    /*
     * Make sure html5-qrcode is loaded.
     */

    if (
        typeof Html5Qrcode ===
        "undefined"
    ) {

        console.error(
            "html5-qrcode library was not loaded."
        );

        showTemporaryMessage(
            "QR scanner library could not be loaded."
        );

        return;
    }


    /*
     * Make sure the QR reader element exists.
     */

    const qrReader =
        document.getElementById(
            "qr-reader"
        );


    if (!qrReader) {

        console.error(
            "QR reader element was not found."
        );

        showTemporaryMessage(
            "QR scanner could not be initialized."
        );

        return;
    }


    try {

        html5QrCode =
            new Html5Qrcode(
                "qr-reader"
            );


        await html5QrCode.start(

            {
                facingMode: "environment"
            },

            {
                fps: 10,

                qrbox: {
                    width: 250,
                    height: 250
                },

                aspectRatio: 1.0,

                rememberLastUsedCamera: true
            },

            onQRCodeScanned,

            onQRCodeDetectionError

        );


        scannerRunning = true;


        /*
         * Hide placeholder.
         */

        if (cameraPlaceholder) {

            cameraPlaceholder
                .classList
                .add("hidden");
        }


        /*
         * Hide start button.
         */

        if (startCameraButton) {

            startCameraButton
                .classList
                .add("hidden");
        }


        console.log(
            "QR scanner started."
        );


    } catch (error) {

        console.error(
            "Scanner start error:",
            error
        );


        html5QrCode = null;

        scannerRunning = false;


        showTemporaryMessage(
            "Unable to access the camera. Please allow camera permission and try again."
        );
    }
}


if (startCameraButton) {

    startCameraButton.addEventListener(
        "click",
        startScanner
    );
}


/* =========================================================
   QR DETECTED
========================================================= */

async function onQRCodeScanned(
    decodedText
) {

    if (!decodedText) {
        return;
    }


    const qrToken =
        decodedText.trim();


    if (!qrToken) {
        return;
    }


    /*
     * html5-qrcode can detect the same QR
     * repeatedly.
     */

    const now =
        Date.now();


    if (
        qrToken === lastScannedToken &&
        now - lastScanTime <
            SCAN_COOLDOWN
    ) {

        return;
    }


    /*
     * Don't process another scan while
     * the current request is being processed.
     */

    if (processingScan) {
        return;
    }


    lastScannedToken =
        qrToken;

    lastScanTime =
        now;


    await processQRCode(
        qrToken
    );
}


/* =========================================================
   QR DETECTION ERROR
========================================================= */

function onQRCodeDetectionError(
    errorMessage
) {

    /*
     * html5-qrcode continuously calls this
     * while searching for a QR code.
     *
     * Do not display errors here.
     */
}


/* =========================================================
   PROCESS QR
========================================================= */

async function processQRCode(
    qrToken
) {

    if (processingScan) {
        return;
    }


    if (!qrToken) {
        return;
    }


    processingScan = true;


    try {

        /*
         * IMPORTANT:
         *
         * We ONLY send the QR token.
         *
         * We do NOT send:
         *
         *     meal_service_id
         *
         * The backend determines the meal service
         * from the MealToken.
         */
        console.log("================================"); 
        console.log("QR TOKEN RAW:", qrToken); 
        console.log("QR TOKEN JSON:", JSON.stringify(qrToken)); 
        console.log("QR TOKEN LENGTH:", qrToken.length)
        ; console.log("================================");

        const response =
            await fetch(
                "/meals/api/redeem/",
                {
                    method: "POST",

                    credentials:
                        "same-origin",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "X-CSRFToken":
                            csrfToken,

                        "X-Requested-With":
                            "XMLHttpRequest"
                    },

                    body: JSON.stringify({

                        qr_token:
                            qrToken

                    })
                }
            );


        /*
         * Parse JSON response.
         */

        let data;


        try {

            data =
                await response.json();

        } catch (error) {

            data = {

                success: false,

                result: "error",

                message:
                    "The server returned an invalid response."
            };
        }


        /*
         * Handle HTTP errors.
         */

        if (!response.ok) {

            data.success =
                false;


            if (!data.message) {

                data.message =
                    "The meal redemption request was rejected.";
            }


            if (!data.result) {

                data.result =
                    "error";
            }
        }


        /*
         * Display result.
         */

        showResult(
            data
        );


    } catch (error) {

        console.error(
            "Redemption error:",
            error
        );


        showResult({

            success: false,

            result: "error",

            message:
                "Could not connect to the server. Please try again."
        });


    } finally {

        /*
         * Keep the scanner protected briefly
         * while the result is displayed.
         */

        setTimeout(
            () => {

                processingScan =
                    false;

            },
            1500
        );
    }
}


/* =========================================================
   MANUAL TOKEN
========================================================= */

if (manualToggle) {

    manualToggle.addEventListener(
        "click",
        () => {

            if (!manualForm) {
                return;
            }


            manualForm
                .classList
                .toggle("hidden");


            if (
                !manualForm
                    .classList
                    .contains("hidden")
            ) {

                if (qrTokenInput) {

                    qrTokenInput.focus();
                }
            }
        }
    );
}


if (manualSubmit) {

    manualSubmit.addEventListener(
        "click",
        () => {

            if (!qrTokenInput) {
                return;
            }


            const token =
                qrTokenInput.value.trim();


            if (!token) {

                showTemporaryMessage(
                    "Enter a QR token."
                );

                qrTokenInput.focus();

                return;
            }


            processQRCode(
                token
            );
        }
    );
}


if (qrTokenInput) {

    qrTokenInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();


                if (manualSubmit) {

                    manualSubmit.click();
                }
            }
        }
    );
}


/* =========================================================
   DISPLAY RESULT
========================================================= */

function showResult(
    data
) {

    const success =
        data.success === true;


    /*
     * Update counters.
     */

    if (success) {

        successTotal++;


        if (successCount) {

            successCount.textContent =
                successTotal;
        }

    } else {

        rejectedTotal++;


        if (rejectedCount) {

            rejectedCount.textContent =
                rejectedTotal;
        }
    }


    /*
     * Update sidebar result.
     */

    updateSidebarResult(
        data
    );


    /*
     * Update modal styling.
     */

    if (resultModal) {

        resultModal
            .classList
            .toggle(
                "error",
                !success
            );
    }


    /*
     * Success result.
     */

    if (success) {

        if (modalIcon) {

            modalIcon.textContent =
                "✓";
        }


        if (modalStatus) {

            modalStatus.textContent =
                "APPROVED";
        }


        if (modalTitle) {

            modalTitle.textContent =
                "Meal Approved";
        }


        if (modalMessage) {

            modalMessage.textContent =
                data.message ||
                "Meal redeemed successfully.";
        }

    }


    /*
     * Rejected result.
     */

    else {

        if (modalIcon) {

            modalIcon.textContent =
                "×";
        }


        if (modalStatus) {

            modalStatus.textContent =
                getStatusLabel(
                    data.result
                );
        }


        if (modalTitle) {

            modalTitle.textContent =
                "Meal Rejected";
        }


        if (modalMessage) {

            modalMessage.textContent =
                data.message ||
                "This meal could not be redeemed.";
        }
    }


    /*
     * Student information.
     */

    if (
        modalStudent &&
        data.student
    ) {

        modalStudent.innerHTML = `
            <strong>
                ${escapeHtml(
                    data.student.name
                )}
            </strong>

            <br>

            Student ID:
            ${escapeHtml(
                data.student.student_id
            )}
        `;

    } else if (modalStudent) {

        modalStudent.innerHTML =
            "";
    }


    /*
     * Display modal.
     */

    if (resultOverlay) {

        resultOverlay
            .classList
            .remove("hidden");
    }
}


/* =========================================================
   SIDEBAR RESULT
========================================================= */

function updateSidebarResult(
    data
) {

    if (!resultCard) {
        return;
    }


    resultCard
        .classList
        .remove("hidden");


    if (data.success) {

        if (resultIcon) {

            resultIcon.textContent =
                "✓";

            resultIcon.style.background =
                "var(--success-bg)";

            resultIcon.style.color =
                "var(--success)";
        }


        if (resultTitle) {

            resultTitle.textContent =
                "Meal Approved";
        }


        if (resultMessage) {

            resultMessage.textContent =
                data.message ||
                "Meal redeemed successfully.";
        }

    } else {

        if (resultIcon) {

            resultIcon.textContent =
                "×";

            resultIcon.style.background =
                "var(--danger-bg)";

            resultIcon.style.color =
                "var(--danger)";
        }


        if (resultTitle) {

            resultTitle.textContent =
                "Meal Rejected";
        }


        if (resultMessage) {

            resultMessage.textContent =
                data.message ||
                "Meal could not be redeemed.";
        }
    }


    /*
     * Display student.
     */

    if (
        studentResult &&
        data.student
    ) {

        studentResult.innerHTML = `
            <strong>
                ${escapeHtml(
                    data.student.name
                )}
            </strong>

            <br>

            ${escapeHtml(
                data.student.student_id
            )}
        `;

    } else if (studentResult) {

        studentResult.textContent =
            "";
    }
}


/* =========================================================
   CLOSE RESULT
========================================================= */

if (closeResult) {

    closeResult.addEventListener(
        "click",
        () => {

            if (resultOverlay) {

                resultOverlay
                    .classList
                    .add("hidden");
            }


            if (qrTokenInput) {

                qrTokenInput.value =
                    "";
            }


            /*
             * Allow another scan.
             */

            processingScan =
                false;


            /*
             * Reset cooldown.
             */

            lastScannedToken =
                null;

            lastScanTime =
                0;
        }
    );
}


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            resultOverlay &&
            !resultOverlay
                .classList
                .contains("hidden")
        ) {

            if (closeResult) {

                closeResult.click();
            }
        }
    }
);


/* =========================================================
   TEMPORARY MESSAGE
========================================================= */

function showTemporaryMessage(
    message
) {

    /*
     * Replace alert() with your toast
     * notification later if desired.
     */

    alert(message);
}


/* =========================================================
   STATUS LABEL
========================================================= */

function getStatusLabel(
    result
) {

    const labels = {

        already_redeemed:
            "ALREADY REDEEMED",

        invalid_card:
            "INVALID CARD",

        blocked_card:
            "CARD BLOCKED",

        expired_card:
            "CARD EXPIRED",

        invalid_meal:
            "INVALID MEAL",

        inactive_student:
            "STUDENT INACTIVE",

        wrong_university:
            "WRONG UNIVERSITY",

        outside_service_time:
            "OUTSIDE SERVICE TIME",

        error:
            "ERROR"
    };


    return (
        labels[result] ||
        "REJECTED"
    );
}


/* =========================================================
   HTML ESCAPING
========================================================= */

function escapeHtml(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;
}


/* =========================================================
   STOP SCANNER
========================================================= */

async function stopScanner() {

    if (!html5QrCode) {
        return;
    }


    try {

        if (scannerRunning) {

            await html5QrCode.stop();
        }


        html5QrCode.clear();


    } catch (error) {

        console.error(
            "Error stopping scanner:",
            error
        );

    } finally {

        html5QrCode =
            null;

        scannerRunning =
            false;

        processingScan =
            false;
    }
}


/* =========================================================
   CLEANUP
========================================================= */

window.addEventListener(
    "beforeunload",
    () => {

        stopScanner();
    }
);

