from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

# Load model
model = joblib.load("phishing_model.pkl")

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    # Convert incoming data to feature array
    features = np.array([[
        data["having_ip_address"],
        data["url_length"],
        data["shortening_service"],
        data["having_at_symbol"],
        data["double_slash_redirecting"],
        data["prefix_suffix"],
        data["having_sub_domain"],
        data["ssl_final_state"],
        data["domain_registration_length"],
        data["favicon"],
        data["port"],
        data["https_token"],
        data["request_url"],
        data["url_of_anchor"],
        data["links_in_tags"],
        data["sfh"],
        data["submitting_to_email"],
        data["abnormal_url"],
        data["redirect"],
        data["on_mouseover"],
        data["rightclick"],
        data["popupwindow"],
        data["iframe"],
        data["age_of_domain"],
        data["dns_record"],
        data["web_traffic"],
        data["page_rank"],
        data["google_index"],
        data["links_pointing_to_page"],
        data["statistical_report"]
    ]])

    prediction = model.predict(features)[0]

    return jsonify({
        "prediction": int(prediction)
    })

if __name__ == "__main__":
    app.run(debug=True)