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
    const boxId = 'phishshield-alert-box';
    const existingBox = document.getElementById(boxId);
    if (existingBox) existingBox.remove();

    const box = document.createElement("div");
    box.id = boxId;

    if (status === "safe") {
        // Subtle Toast for Safe Sites
        box.innerHTML = `
            <div style="
                position: fixed;
                bottom: 24px;
                right: 24px;
                background: rgba(20, 20, 20, 0.95);
                color: #fff;
                padding: 16px 24px;
                border-radius: 12px;
                border-left: 4px solid #10b981;
                display: flex;
                align-items: center;
                gap: 14px;
                z-index: 999999;
                font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
                box-shadow: 0 10px 25px rgba(0,0,0,0.4);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255,255,255,0.05);
                transition: opacity 0.5s ease;
            ">
                <span style="font-size: 24px;">🛡️</span>
                <div>
                    <h4 style="margin: 0 0 4px 0; font-size: 15px; font-weight: 600; color: #10b981;">Safe Connection</h4>
                    <div style="font-size: 13px; color: #a3a3a3;">PhishShield AI verified this site.</div>
                </div>
            </div>
        `;
        document.body.appendChild(box);

        // Auto-remove safe toast after 4 seconds
        setTimeout(() => {
            const el = document.getElementById(boxId);
            if (el) {
                el.firstElementChild.style.opacity = '0';
                setTimeout(() => el.remove(), 500);
            }
        }, 4000);
        return;
    }

    // Full-screen Modal for Phishing / Suspicious
    const isPhishing = status === "phishing";
    const color = isPhishing ? "#dc2626" : "#ea580c"; // Red for phishing, Orange for suspicious
    const bgGlow = isPhishing ? "rgba(220, 38, 38, 0.15)" : "rgba(234, 88, 12, 0.15)";
    const icon = isPhishing ? "🛑" : "⚠️";
    const title = isPhishing ? "Deceptive Site Ahead" : "Suspicious Site Detected";
    const description = isPhishing
        ? "Attackers on this site may trick you into doing something dangerous like installing software or revealing your personal information (for example, passwords, phone numbers, or credit cards)."
        : "This site exhibits suspicious characteristics and might not be safe. Please proceed with caution and do not enter any sensitive information.";

    box.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(10, 10, 10, 0.98);
            backdrop-filter: blur(10px);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            animation: fadeIn 0.3s ease-out;
        ">
            <style>
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            </style>
            <div style="
                background: #171717;
                width: 90%;
                max-width: 600px;
                border-radius: 16px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.05), 0 0 40px ${bgGlow};
                border-top: 6px solid ${color};
                padding: 40px;
                text-align: center;
                position: relative;
                color: #f5f5f5;
                animation: slideUp 0.4s ease-out;
            ">
                <div style="font-size: 64px; margin-bottom: 20px; line-height: 1; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">${icon}</div>
                <h1 style="color: ${color}; margin: 0 0 16px 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">${title}</h1>
                <p style="font-size: 15px; line-height: 1.6; color: #a3a3a3; margin-bottom: 28px;">${description}</p>
                
                <div style="background: rgba(0,0,0,0.4); border-radius: 12px; padding: 20px; margin-bottom: 32px; text-align: left; border: 1px solid rgba(255,255,255,0.03);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
                        <strong style="color: #e5e5e5; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            Threat Analysis Report
                        </strong>
                        <span style="background: ${bgGlow}; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; color: ${color}; border: 1px solid rgba(255,255,255,0.1);">Risk Score: ${score}/100</span>
                    </div>
                    <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #d4d4d4; line-height: 1.8;">
                        ${reasons.map(r => `<li style="margin-bottom: 4px;">${r}</li>`).join("")}
                    </ul>
                </div>

                <div style="display: flex; flex-direction: column; gap: 12px; align-items: center;">
                    <button onclick="window.location.href='https://google.com'" style="
                        background: ${color};
                        color: white;
                        border: none;
                        padding: 14px 32px;
                        font-size: 16px;
                        font-weight: 600;
                        border-radius: 8px;
                        cursor: pointer;
                        box-shadow: 0 4px 14px 0 ${isPhishing ? 'rgba(220, 38, 38, 0.4)' : 'rgba(234, 88, 12, 0.4)'};
                        transition: all 0.2s ease;
                        width: 100%;
                        max-width: 300px;
                    " onmouseover="this.style.opacity='0.9'; this.style.transform='translateY(-1px)'" onmouseout="this.style.opacity='1'; this.style.transform='translateY(0)'">
                        Back to Safety
                    </button>
                    
                    <button id="phishshield-ignore-btn" style="
                        background: transparent;
                        color: #737373;
                        border: 1px solid transparent;
                        padding: 10px 24px;
                        font-size: 14px;
                        font-weight: 500;
                        border-radius: 6px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        text-decoration: underline;
                        text-underline-offset: 4px;
                        text-decoration-color: #525252;
                    " onmouseover="this.style.color='#a3a3a3'; this.style.textDecorationColor='#a3a3a3'" onmouseout="this.style.color='#737373'; this.style.textDecorationColor='#525252'">
                        Ignore risk and continue (unsafe)
                    </button>
                </div>
                
                <div style="margin-top: 32px; font-size: 12px; color: #525252; display: flex; align-items: center; justify-content: center; gap: 6px; font-weight: 500;">
                    🛡️ Protected by PhishShield AI
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(box);

    const ignoreBtn = document.getElementById("phishshield-ignore-btn");
    if (ignoreBtn) {
        ignoreBtn.addEventListener("click", () => {
            const el = document.getElementById(boxId);
            if (el) el.remove();
        });
    }
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
