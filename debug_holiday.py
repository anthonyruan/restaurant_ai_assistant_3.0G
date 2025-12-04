import requests
import datetime
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("HOLIDAY_API_KEY")
year = datetime.datetime.now().year
country = "US"

url = "https://calendarific.com/api/v2/holidays"
params = {
    "api_key": api_key,
    "country": country,
    "year": year
}

response = requests.get(url, params=params)
data = response.json()
holidays = data.get("response", {}).get("holidays", [])

print(f"Found {len(holidays)} holidays.")
if holidays:
    print("Sample holiday structure:")
    print(holidays[0])
    
    print("\nFirst 10 holidays types:")
    for h in holidays[:10]:
        print(f"{h['name']}: {h.get('type')}")
