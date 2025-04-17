from flask_cors import CORS
from flask import Flask, request, jsonify, redirect, render_template
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import string
import random
from datetime import datetime

# Load .env file
load_dotenv()

# Flask app instance
app = Flask(__name__)
CORS(app)

# Connect to MongoDB
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client['urlShortenerDB']
collection = db['urls']

# Utility function to generate a random short code
def generate_short_code(length=6):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choices(characters, k=length))

# POST /shorten - Accepts long URL, optional short code & expiration
@app.route('/shorten', methods=['POST'])
def shorten_url():
    data = request.get_json()
    original_url = data.get("url")
    custom_code = data.get("short_code")
    expires_at = data.get("expires_at")

    if not original_url:
        return jsonify({"error": "URL is required"}), 400

    short_code = custom_code or generate_short_code()

    # Check if short code already exists (if custom)
    existing_code = collection.find_one({"short_code": short_code})
    if existing_code:
        return jsonify({"error": "Shortcode already exists. Choose another."}), 409

    # Save to DB
    entry = {
        "original_url": original_url,
        "short_code": short_code,
        "created_at": datetime.utcnow(),
        "clicks": 0,
        "expires_at": datetime.strptime(expires_at, "%Y-%m-%dT%H:%M") if expires_at else None
    }
    collection.insert_one(entry)

    short_url = request.host_url + short_code
    return jsonify({
        "original_url": original_url,
        "short_code": short_code,
        "short_url": short_url
    })

# GET /<shortcode> - Redirects to the original long URL
@app.route('/<short_code>', methods=['GET'])
def redirect_to_original(short_code):
    result = collection.find_one({"short_code": short_code})

    if not result:
        return jsonify({"error": "Short URL not found"}), 404

    # Check if expired
    if result.get("expires_at") and datetime.utcnow() > result["expires_at"]:
        return jsonify({"error": "This link has expired."}), 410

    # Increment clicks
    collection.update_one({"short_code": short_code}, {"$inc": {"clicks": 1}})

    return redirect(result["original_url"])

from flask import jsonify

@app.route('/')
def index():
    return render_template('index.html')


# GET /dashboard-data - Returns all URL entries for the dashboard
@app.route('/dashboard-data', methods=['GET'])
def get_dashboard_data():
    urls = list(collection.find())
    for url in urls:
        url['_id'] = str(url['_id'])  # Convert ObjectId to string for JSON
    return jsonify(urls)


# GET /stats/<short_code> - Returns stats for a short URL
@app.route('/stats/<short_code>', methods=['GET'])
def get_url_stats(short_code):
    result = collection.find_one({"short_code": short_code})

    if result:
        return jsonify({
            "original_url": result["original_url"],
            "short_code": result["short_code"],
            "clicks": result.get("clicks", 0),
            "created_at": result["created_at"].isoformat(),
            "expires_at": result["expires_at"].isoformat() if result["expires_at"] else None
        })
    else:
        return jsonify({"error": "Short URL not found"}), 404
    

# DELETE /delete/<short_code> - Deletes a URL entry from the database
@app.route('/delete/<short_code>', methods=['DELETE'])
def delete_short_url(short_code):
    result = collection.delete_one({"short_code": short_code})
    if result.deleted_count == 1:
        return jsonify({"message": "Deleted successfully"}), 200
    else:
        return jsonify({"error": "URL not found"}), 404


if __name__ == '__main__':
    print("✅ Flask app is running...")
    app.run(debug=True)
