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



function showResult(status, reasons, score, url, features) {
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

    // Full-screen Modal for Phishing / Suspicious (React UI converted to HTML)
    const isPhishing = status === "phishing";
    const color = isPhishing ? "#dc2626" : "#ea580c"; // red-600 : orange-600
    const alertBg = isPhishing ? "rgba(220, 38, 38, 0.1)" : "rgba(234, 88, 12, 0.1)";
    const alertBorder = isPhishing ? "#ef4444" : "#f97316";
    const alertText = isPhishing ? "#f87171" : "#fb923c";
    const riskLevel = isPhishing ? "HIGH" : "MEDIUM";
    const confScore = Math.min(Math.round(score), 99); // cap at 99%
    const titleText = isPhishing ? "Suspicious Website Detected" : "Potentially Unsafe Site";
    const titleDesc = isPhishing ? "This site may be attempting to steal your data." : "This site exhibits suspicious characteristics. Proceed with caution.";

    const httpsText = url.startsWith('https') ? '✅ Yes' : '❌ No';
    const httpsColor = url.startsWith('https') ? '#4ade80' : '#f87171';

    const ipText = features && features.having_ip_address === 1 ? '🚫 Flagged' : '✅ Clean';
    const ipColor = features && features.having_ip_address === 1 ? '#f87171' : '#4ade80';

    box.innerHTML = `
        <div style="
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(3, 7, 18, 0.98); /* bg-gray-950 equivalent */
            backdrop-filter: blur(10px);
            display: flex; align-items: center; justify-content: center; flex-direction: column;
            z-index: 999999;
            font-family: system-ui, -apple-system, sans-serif;
            color: white;
            animation: fadeIn 0.3s ease-out;
            box-sizing: border-box;
        ">
          <!-- The modal card -->
          <div style="
            width: 90%; max-width: 420px; background: #111827; /* bg-gray-900 */
            border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px ${alertBg};
            padding: 24px; border: 1px solid #1f2937; /* border-gray-800 */
            box-sizing: border-box;
          ">
            
            <!-- Header -->
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
              <div style="font-size: 24px;">🛡️</div>
              <h1 style="font-size: 20px; font-weight: 600; margin: 0;">PhishShield AI</h1>
            </div>

            <!-- Alert -->
            <div style="background: ${alertBg}; border: 1px solid ${alertBorder}; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
              <h2 style="color: ${alertText}; font-weight: 600; font-size: 18px; margin: 0 0 4px 0;">🚨 ${titleText}</h2>
              <p style="font-size: 14px; color: #d1d5db; margin: 0;">${titleDesc}</p>
            </div>

            <!-- Threat + Confidence -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
              <div>
                <p style="font-size: 14px; color: #9ca3af; margin: 0 0 4px 0;">Threat Level</p>
                <span style="padding: 4px 12px; background: ${color}; color: white; border-radius: 9999px; font-size: 14px; font-weight: 600;">
                  ${riskLevel}
                </span>
              </div>
              <div style="text-align: right;">
                <p style="font-size: 14px; color: #9ca3af; margin: 0 0 4px 0;">Confidence</p>
                <span style="font-size: 24px; font-weight: 600; color: white;">
                  ${confScore}%
                </span>
              </div>
            </div>

            <!-- Reasons -->
            <div style="margin-bottom: 16px;">
              <h3 style="font-size: 14px; color: #9ca3af; margin: 0 0 8px 0;">⚠️ Why this is risky:</h3>
              <ul style="font-size: 14px; color: #d1d5db; margin: 0; padding-left: 0; list-style-type: none;">
                ${reasons.map(r => `<li style="margin-bottom: 4px; display: flex; gap: 6px;"><span>•</span> <span>${r}</span></li>`).join("")}
              </ul>
            </div>

            <!-- Security Checks -->
            <div style="margin-bottom: 20px;">
              <h3 style="font-size: 14px; color: #9ca3af; margin: 0 0 8px 0;">🔒 Security Checks:</h3>
              <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; font-size: 14px;">
                <div style="color: #d1d5db;">HTTPS:</div> <div style="color: ${httpsColor}; font-weight: 500;">${httpsText}</div>
                <div style="color: #d1d5db;">Domain Age:</div> <div style="color: #facc15; font-weight: 500;">⚠ Unknown</div>
                <div style="color: #d1d5db;">IP Format:</div> <div style="color: ${ipColor}; font-weight: 500;">${ipText}</div>
              </div>
            </div>

            <!-- AI Info -->
            <div style="background: #1f2937; border-radius: 8px; padding: 12px; margin-bottom: 20px; font-size: 13px; color: #9ca3af; line-height: 1.5; border: 1px solid rgba(255,255,255,0.05);">
              🧠 <b>AI Model:</b> Phishing Detection Model<br />
              📡 <b>Source:</b> ML + Heuristic + Local Rules
            </div>

            <!-- Buttons -->
            <div style="display: flex; gap: 10px;">
              <button onclick="window.history.length > 1 ? window.history.back() : window.location.href='https://google.com'" style="
                flex: 1; background: #374151; color: white; border: none; padding: 10px 0; border-radius: 8px; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s;
              " onmouseover="this.style.background='#4b5563'" onmouseout="this.style.background='#374151'">
                🔙 Go Back
              </button>
              <button onclick="window.location.href='https://google.com'" style="
                flex: 1; background: #dc2626; color: white; border: none; padding: 10px 0; border-radius: 8px; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s;
              " onmouseover="this.style.background='#ef4444'" onmouseout="this.style.background='#dc2626'">
                🚫 Block Site
              </button>
            </div>

            <!-- Proceed -->
            <button id="phishshield-ignore-btn" style="
              width: 100%; margin-top: 16px; background: transparent; border: none; color: #6b7280; font-size: 13px; cursor: pointer; text-decoration: underline; text-underline-offset: 4px; transition: all 0.2s;
            " onmouseover="this.style.color='#9ca3af'" onmouseout="this.style.color='#6b7280'">
              ⚠ Proceed anyway (unsafe)
            </button>

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

    showResult(status, reasons, score, url, features);
});
