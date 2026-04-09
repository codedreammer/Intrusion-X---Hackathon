function extractFeatures() {
    const url = window.location.href;

    return {
        having_ip_address: /\d+\.\d+\.\d+\.\d+/.test(url) ? 1 : -1,
        url_length: url.length < 54 ? -1 : (url.length <= 75 ? 0 : 1),
        shortening_service: url.includes("bit.ly") ? 1 : -1,
        having_at_symbol: url.includes("@") ? 1 : -1,
        double_slash_redirecting: url.lastIndexOf("//") > 7 ? 1 : -1,
        prefix_suffix: url.includes("-") ? 1 : -1,
        having_sub_domain: (url.split(".").length > 3) ? 1 : -1,
        ssl_final_state: url.startsWith("https") ? 1 : -1,

        domain_registration_length: -1,
        favicon: document.querySelector("link[rel~='icon']") ? -1 : 1,
        port: -1,
        https_token: url.includes("https") ? 1 : -1,
        request_url: -1,
        url_of_anchor: -1,
        links_in_tags: -1,
        sfh: -1,
        submitting_to_email: -1,
        abnormal_url: -1,
        redirect: -1,
        on_mouseover: -1,
        rightclick: document.oncontextmenu ? 1 : -1,
        popupwindow: window.open ? -1 : 1,
        iframe: document.querySelector("iframe") ? 1 : -1,
        age_of_domain: -1,
        dns_record: -1,
        web_traffic: -1,
        page_rank: -1,
        google_index: -1,
        links_pointing_to_page: -1,
        statistical_report: -1
    };
}

async function getPrediction(features) {
    try {
        const response = await fetch("http://127.0.0.1:5000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(features)
        });
        const data = await response.json();
        return data.prediction;
    } catch (error) {
        console.error("API Error:", error);
        return null;
    }
}

function showResult(status, reasons, score) {
    let color = "green";
    let text = "Safe Website";

    if (status === "suspicious") {
        color = "orange";
        text = "Suspicious Website";
    }

    if (status === "phishing") {
        color = "red";
        text = "Phishing Website";
    }

    const box = document.createElement("div");

    box.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #121212;
            color: white;
            padding: 20px;
            border-radius: 12px;
            border-left: 6px solid ${color};
            width: 300px;
            z-index: 9999;
            font-family: Arial, sans-serif;
            box-shadow: 0px 4px 10px rgba(0,0,0,0.5);
        ">
            <h3 style="margin-top: 0;">🛡️ PhishShield AI</h3>

            <p><b>Status:</b> <span style="color:${color}">${text}</span></p>
            <p><b>Risk Score:</b> ${score}</p>

            ${status !== "safe"
            ? `<p style="margin-bottom: 5px;"><b>Why flagged:</b></p>
                       <ul style="font-size: 13px; padding-left: 18px; margin-top: 0;">${reasons.map(r => `<li>${r}</li>`).join("")}</ul>
                       <button onclick="window.location.href='https://google.com'" style="background:${color};color:white;padding:8px 12px;border:none;border-radius:5px;margin-top:8px;cursor:pointer;width:100%;">Leave Site Safely</button>
                       `
            : `<p style="color:lightgreen;">No suspicious activity detected</p>`
        }
        </div>
    `;

    document.body.appendChild(box);
}

window.addEventListener("load", async () => {
    const features = extractFeatures();
    const prediction = await getPrediction(features);

    const url = window.location.href.toLowerCase();

    let domain = "";
    try {
        domain = new URL(url).hostname;
    } catch (e) {
        domain = url;
    }

    const hasPassword = document.querySelector("input[type='password']");

    let score = 0;
    const reasons = [];

    // 🔴 HIGH RISK SIGNALS
    if (features.having_ip_address === 1) {
        score += 40;
        reasons.push("IP-based URL detected");
    }

    if (!url.startsWith("https")) {
        score += 30;
        reasons.push("Website not using HTTPS");
    }

    // 🟡 MEDIUM SIGNALS
    if (hasPassword) {
        score += 15;
        reasons.push("Password field detected");
    }

    if (url.includes("verify") || url.includes("secure")) {
        score += 15;
        reasons.push("Suspicious keywords in URL");
    }

    if (features.prefix_suffix === 1) {
        score += 10;
        reasons.push("Hyphen in domain");
    }

    // 🟢 TRUST SIGNALS
    if (url.startsWith("https")) score -= 10;

    if (domain.endsWith(".edu") || domain.endsWith(".gov")) {
        score -= 20;
        reasons.push("Trusted domain type");
    }

    if (domain.split(".").length <= 3) score -= 5;

    // 🧠 ML INFLUENCE
    if (prediction === 1) {
        score += 25;
        reasons.push("ML model detected phishing pattern");
    }

    // 🎯 FINAL DECISION
    let status = "safe";
    if (score >= 60) status = "phishing";
    else if (score >= 30) status = "suspicious";

    showResult(status, reasons, score);
});
