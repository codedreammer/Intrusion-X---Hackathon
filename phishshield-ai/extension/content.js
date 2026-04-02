function detectPhishing() {
    let score = 0;
    const url = window.location.href.toLowerCase();

    // URL checks
    if (url.includes("login") || url.includes("verify")) score += 20;
    if (url.includes("secure")) score += 10;
    if (url.includes("bank")) score += 15;

    // Fake domain tricks
    if (url.includes("g00gle") || url.includes("faceb00k")) score += 40;

    // Check login form
    const passwordField = document.querySelector("input[type='password']");
    if (passwordField) score += 25;

    // Suspicious scripts
    if (document.scripts.length > 3) score += 10;

    return score;
}

function showWarning(score) {
    let color = "green";
    let label = "Safe";

    if (score > 70) {
        color = "red";
        label = "Dangerous";
    } else if (score > 40) {
        color = "orange";
        label = "Suspicious";
    }

    if (score < 30) return;

    const warning = document.createElement("div");
    warning.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #121212;
            color: white;
            padding: 20px;
            z-index: 9999;
            font-family: Arial;
            border-radius: 12px;
            border-left: 6px solid ${color};
            box-shadow: 0 0 15px rgba(0,0,0,0.5);
            width: 260px;
        ">
        <h3 style="margin:0;">🛡️ PhishShield AI</h3>
        <p><b>Status:</b> <span style="color:${color}">${label}</span></p>
        <p><b>Risk Score:</b> ${score}</p>
        <p style="font-size:13px;">This site may not be safe.</p>

        <button onclick="window.location.href='https://google.com'" 
        style="background:${color};color:white;padding:6px 10px;border:none;border-radius:5px;margin-top:5px;">
        Leave Site
        </button>
        </div>
    `;
    document.body.appendChild(warning);
}

const risk = detectPhishing();
showWarning(risk);