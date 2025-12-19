import os
import requests
from dotenv import load_dotenv

load_dotenv()

user_id = os.getenv("IG_USER_ID")
access_token = os.getenv("IG_ACCESS_TOKEN")

print(f"Checking token for User ID: {user_id}")
if access_token:
    print(f"Token Length: {len(access_token)}")
    print(f"Token Prefix: {access_token[:10]}...")
else:
    print("Token is empty or None")

if not user_id or not access_token:
    print("❌ Missing IG_USER_ID or IG_ACCESS_TOKEN in .env")
    exit(1)

url = "https://graph.facebook.com/v19.0/debug_token"
params = {
    "input_token": access_token,
    "access_token": access_token # Self-check
}

try:
    print("Checking token status via Facebook Graph API...")
    response = requests.get(url, params=params)
    data = response.json()
    
    if response.status_code == 200 and 'data' in data:
        token_data = data['data']
        is_valid = token_data.get('is_valid')
        expires_at = token_data.get('expires_at')
        
        if is_valid:
            import datetime
            exp_date = datetime.datetime.fromtimestamp(expires_at)
            now = datetime.datetime.now()
            days_left = (exp_date - now).days
            
            print(f"✅ Token is VALID!")
            print(f"Expires at: {exp_date}")
            print(f"Days left: {days_left} days")
            print(f"Scopes: {token_data.get('scopes')}")
        else:
            print("❌ Token is INVALID.")
            print(f"Error: {token_data.get('error', {}).get('message')}")
    else:
        print("❌ Request Failed.")
        print(f"Error: {data.get('error', {}).get('message')}")
        
except Exception as e:
    print(f"❌ Error checking token: {e}")
