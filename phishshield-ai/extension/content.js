function detectPhishing() {
    let score = 0;

    const url = window.location.href;

    // URL checks
    if (url.includes("login") || url.includes("verify")) score += 20;
    if (url.includes("secure")) score += 10;

    // Fake domain example
    if (url.includes("g00gle") || url.includes("faceb00k")) score += 40;

    // Check login form
    const passwordField = document.querySelector("input[type='password']");
    if (passwordField) score += 20;

    // Suspicious scripts
    if (document.querySelector("script")) score += 10;

    return score;
}

function showWarning(score) {
    if (score < 50) return;

    const warning = document.createElement("div");
    warning.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: red;
            color: white;
            padding: 15px;
            z-index: 9999;
            font-family: Arial;
            border-radius: 10px;
        ">
        ⚠️ PhishShield AI Warning<br>
        Risk Score: ${score}<br>
        This may be a phishing site!
        </div>
    `;
    document.body.appendChild(warning);
}

const risk = detectPhishing();
showWarning(risk);