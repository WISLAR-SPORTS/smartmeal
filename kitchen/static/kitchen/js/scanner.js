
const resultBox = document.getElementById("result");

let scanner;
let scanLocked = false;


/*
|--------------------------------------------------------------------------
| Result helpers
|--------------------------------------------------------------------------
*/

function showLoading() {

    resultBox.innerHTML = `
        <div class="loading-state">

            <div class="spinner"></div>

            <h3>Verifying meal card...</h3>

            <p>Please wait.</p>

        </div>
    `;
}


function showError(message) {

    resultBox.innerHTML = `
        <div class="error-state">

            <div class="error-icon">
                <i class="fas fa-times"></i>
            </div>

            <h3>Verification Failed</h3>

            <p>${escapeHtml(message)}</p>

            <button
                class="scan-again-btn"
                onclick="resetScanner()"
            >
                <i class="fas fa-redo"></i>
                Scan Again
            </button>

        </div>
    `;
}


function showSuccess(data) {

    const name = escapeHtml(data.student.name);
    const studentId = escapeHtml(data.student.student_id);
    const university = escapeHtml(data.student.university);
    const cardNumber = escapeHtml(data.meal_card.card_number);
    const status = escapeHtml(data.meal_card.status);

    const initials = data.student.name
        .split(" ")
        .map(name => name.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();

    resultBox.innerHTML = `
        <div class="verification-success">

            <div class="success-banner">

                <div class="success-banner-icon">
                    <i class="fas fa-check"></i>
                </div>

                <div>
                    <strong>Meal Card Verified</strong>
                    <span>The card is valid and active.</span>
                </div>

            </div>


            <div class="student-profile">

                <div class="student-avatar">
                    ${initials}
                </div>

                <div>
                    <h3>${name}</h3>
                    <p>${studentId}</p>
                </div>

            </div>


            <div class="student-details">

                <div class="detail-row">

                    <span class="detail-label">
                        Student ID
                    </span>

                    <span class="detail-value">
                        ${studentId}
                    </span>

                </div>


                <div class="detail-row">

                    <span class="detail-label">
                        University
                    </span>

                    <span class="detail-value">
                        ${university}
                    </span>

                </div>


                <div class="detail-row">

                    <span class="detail-label">
                        Meal Card
                    </span>

                    <span class="detail-value">
                        ${cardNumber}
                    </span>

                </div>


                <div class="detail-row">

                    <span class="detail-label">
                        Status
                    </span>

                    <span class="detail-value">

                        <span class="active-badge">
                            <i class="fas fa-check-circle"></i>
                            ${status}
                        </span>

                    </span>

                </div>

            </div>


            <button
                class="scan-again-btn"
                onclick="resetScanner()"
            >
                <i class="fas fa-qrcode"></i>
                Scan Another Card
            </button>

        </div>
    `;
}


/*
|--------------------------------------------------------------------------
| Verify QR code
|--------------------------------------------------------------------------
*/

function verifyQRCode(qrToken) {

    showLoading();

    const formData = new FormData();

    formData.append("qr_token", qrToken);

    fetch("{% url 'kitchen:verify_qr' %}", {

        method: "POST",

        headers: {
            "X-CSRFToken": "{{ csrf_token }}"
        },

        body: formData

    })

    .then(response => response.json())

    .then(data => {

        if (data.success) {

            showSuccess(data);

        } else {

            showError(data.message);

        }

    })

    .catch(error => {

        console.error(error);

        showError(
            "Unable to connect to the server. Please try again."
        );

    });

}


/*
|--------------------------------------------------------------------------
| QR scanner
|--------------------------------------------------------------------------
*/

function onScanSuccess(decodedText) {

    if (scanLocked) {
        return;
    }

    scanLocked = true;

    console.log("QR Code:", decodedText);

    verifyQRCode(decodedText);
}


function onScanFailure(error) {
    // Ignore failed scans.
}


/*
|--------------------------------------------------------------------------
| Reset scanner
|--------------------------------------------------------------------------
*/

function resetScanner() {

    scanLocked = false;

    resultBox.innerHTML = `
        <div class="empty-state">

            <div class="empty-icon">
                <i class="fas fa-user-check"></i>
            </div>

            <h3>Waiting for scan</h3>

            <p>
                Scan a valid SmartMeal QR code to view the student's
                meal card information.
            </p>

        </div>
    `;
}


/*
|--------------------------------------------------------------------------
| Escape HTML
|--------------------------------------------------------------------------
*/

function escapeHtml(value) {

    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;
}


/*
|--------------------------------------------------------------------------
| Initialize scanner
|--------------------------------------------------------------------------
*/

scanner = new Html5QrcodeScanner(
    "reader",
    {
        fps: 10,

        qrbox: {
            width: 250,
            height: 250
        },

        aspectRatio: 1.0,

        rememberLastUsedCamera: true,

        showTorchButtonIfSupported: true,

        showZoomSliderIfSupported: true,

    },
    false
);

scanner.render(
    onScanSuccess,
    onScanFailure
);


