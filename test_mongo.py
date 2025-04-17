from pymongo import MongoClient

uri = "mongodb+srv://nwume:Ekene2207.@cluster0.hb4rhsj.mongodb.net/urlShortenerDB?retryWrites=true&w=majority&appName=Cluster0"

try:
    client = MongoClient(uri)
    db = client['urlShortenerDB']
    print("✅ Connected to MongoDB database:", db.name)
except Exception as e:
    print("❌ Connection failed:", e)
