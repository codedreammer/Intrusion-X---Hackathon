function extractFeatures() {
    const url = window.location.href.toLowerCase();

    function isFakeDomain(domain) {
        return (
            domain.includes("g00gle") ||
            domain.includes("faceb00k") ||
            domain.includes("paypa1") ||
            domain.includes("goog1e")
        );
    }

    return {
        hasLoginKeyword: url.includes("login"),
        hasSecureKeyword: url.includes("secure"),
        hasVerifyKeyword: url.includes("verify"),
        hasFakeDomain: isFakeDomain(url),
        hasPasswordField: document.querySelector("input[type='password']") !== null,
        highScriptCount: document.scripts.length > 3
    };
}

function calculateRisk(features) {
    let score = 0;

    if (features.hasLoginKeyword) score += 20;
    if (features.hasSecureKeyword) score += 10;
    if (features.hasVerifyKeyword) score += 15;
    if (features.hasFakeDomain) score += 50;
    if (features.hasPasswordField) score += 25;
    if (features.highScriptCount) score += 10;

    return score;
}

function getReasons(features) {
    const reasons = [];

    if (features.hasLoginKeyword) reasons.push("Login-related keyword in URL");
    if (features.hasSecureKeyword) reasons.push("Suspicious 'secure' keyword");
    if (features.hasVerifyKeyword) reasons.push("Verification keyword detected");
    if (features.hasFakeDomain) reasons.push("Fake or spoofed domain detected");
    if (features.hasPasswordField) reasons.push("Password field present");
    if (features.highScriptCount) reasons.push("High number of scripts");

    return reasons;
}

function showWarning(score, reasons) {
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

    const reasonList = reasons.map(r => `<li>${r}</li>`).join("");

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
            width: 280px;
        ">
        <h3>🛡️ PhishShield AI</h3>
        <p><b>Status:</b> <span style="color:${color}">${label}</span></p>
        <p><b>Risk Score:</b> ${score}</p>

        <p style="margin-top:10px;"><b>Why this is flagged:</b></p>
        <ul style="font-size:12px; padding-left:15px;">
            ${reasonList}
        </ul>

        <button onclick="window.location.href='https://google.com'" 
        style="background:${color};color:white;padding:6px 10px;border:none;border-radius:5px;margin-top:8px;">
        Leave Site
        </button>
        </div>
    `;
    document.body.appendChild(warning);
}

const features = extractFeatures();
const risk = calculateRisk(features);
const reasons = getReasons(features);
showWarning(risk, reasons);