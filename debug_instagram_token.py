import os
import requests
from dotenv import load_dotenv

load_dotenv()

user_id = os.getenv("IG_USER_ID")
access_token = os.getenv("IG_ACCESS_TOKEN")

print(f"Checking token for User ID: {user_id}")

if not user_id or not access_token:
    print("❌ Missing IG_USER_ID or IG_ACCESS_TOKEN in .env")
    exit(1)

url = f"https://graph.facebook.com/v19.0/{user_id}"
params = {
    "fields": "id,username,name",
    "access_token": access_token
}

try:
    response = requests.get(url, params=params)
    data = response.json()
    
    if response.status_code == 200:
        print("✅ Token is VALID!")
        print(f"User: {data.get('name')} ({data.get('username')})")
        print(f"ID: {data.get('id')}")
    else:
        print("❌ Token is INVALID or EXPIRED.")
        print(f"Error: {data.get('error', {}).get('message')}")
        print(f"Type: {data.get('error', {}).get('type')}")
        print(f"Code: {data.get('error', {}).get('code')}")
        
except Exception as e:
    print(f"❌ Error checking token: {e}")
