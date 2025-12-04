import requests
import datetime
from flask import current_app
from app.utils import ttl_cache

@ttl_cache(ttl_seconds=600)
def get_holiday_info(country="US"):
    api_key = current_app.config["HOLIDAY_API_KEY"]
    tomorrow = datetime.datetime.utcnow().date() + datetime.timedelta(days=1)

    url = "https://calendarific.com/api/v2/holidays"
    
    # Check tomorrow
    params = {
        "api_key": api_key,
        "country": country,
        "year": tomorrow.year,
        "month": tomorrow.month,
        "day": tomorrow.day
    }

    try:
        response = requests.get(url, params=params)
        holidays = response.json().get("response", {}).get("holidays", [])
        
        # Filter for National holidays only
        holidays = [h for h in holidays if 'National holiday' in h.get('type', [])]
        
        if holidays:
            name = holidays[0].get("name", "Holiday")
            return {
                "is_holiday": True,
                "message": f"🎉 Tomorrow is {name}!"
            }
            
        # If not holiday, find next one
        upcoming_params = {
            "api_key": api_key,
            "country": country,
            "year": tomorrow.year
        }
        upcoming_response = requests.get(url, params=upcoming_params)
        all_holidays = upcoming_response.json().get("response", {}).get("holidays", [])
        
        # Filter for National holidays only
        all_holidays = [h for h in all_holidays if 'National holiday' in h.get('type', [])]
        
        future_holidays = [h for h in all_holidays if datetime.date.fromisoformat(h["date"]["iso"][:10]) > tomorrow]
        future_holidays.sort(key=lambda h: datetime.date.fromisoformat(h["date"]["iso"][:10]))
        
        if future_holidays:
            next_holiday = future_holidays[0]
            next_date = datetime.date.fromisoformat(next_holiday["date"]["iso"][:10])
            delta = (next_date - tomorrow).days
            return {
                "is_holiday": False,
                "next_holiday_in_days": delta,
                "message": f"🗓️ Tomorrow is not a holiday. {delta} days left until {next_holiday['name']}."
            }
            
        return {"is_holiday": False, "message": "No upcoming holidays found."}
        
    except Exception as e:
        print(f"❌ Error fetching holiday: {e}")
        return {"is_holiday": False, "message": "⚠️ Error fetching holiday info."}
