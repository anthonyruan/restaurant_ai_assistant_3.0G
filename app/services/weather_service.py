import requests
import datetime
from flask import current_app
from app.utils import ttl_cache

@ttl_cache(ttl_seconds=600)
def get_current_weather(city="New York"):
    api_key = current_app.config["WEATHER_API_KEY"]
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=imperial"
    
    try:
        response = requests.get(url)
        if response.status_code != 200:
            return None
        data = response.json()
        return {
            "condition": data["weather"][0]["main"],
            "description": data["weather"][0]["description"],
            "temp": data["main"]["temp"]
        }
    except Exception as e:
        print(f"❌ Error fetching weather: {e}")
        return None

def get_tomorrow_forecast(city="New York"):
    api_key = current_app.config["WEATHER_API_KEY"]
    url = f"https://api.openweathermap.org/data/2.5/forecast?q={city}&appid={api_key}&units=imperial"
    
    try:
        response = requests.get(url)
        data = response.json()
        tomorrow = datetime.datetime.utcnow().date() + datetime.timedelta(days=1)
        entries = [entry for entry in data["list"] if entry["dt_txt"].startswith(str(tomorrow))]
        
        if entries:
            mid_entry = entries[len(entries)//2]
            return {
                "description": mid_entry['weather'][0]['description'].capitalize(),
                "temp": mid_entry['main']['temp']
            }
        return None
    except Exception as e:
        print(f"❌ Error fetching forecast: {e}")
        return None
