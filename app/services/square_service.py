import requests
import datetime
from flask import current_app
from app.utils import ttl_cache

@ttl_cache(ttl_seconds=600)
def get_top_dishes():
    token = current_app.config["SQUARE_ACCESS_TOKEN"]
    location_id = current_app.config["SQUARE_LOCATION_ID"]
    
    today = datetime.datetime.utcnow().date()
    yesterday = today - datetime.timedelta(days=1)
    start_time = f"{yesterday}T00:00:00Z"
    end_time = f"{yesterday}T23:59:59Z"

    url = "https://connect.squareup.com/v2/orders/search"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    body = {
        "location_ids": [location_id],
        "query": {
            "filter": {
                "date_time_filter": {
                    "created_at": {
                        "start_at": start_time,
                        "end_at": end_time
                    }
                },
                "state_filter": {
                    "states": ["COMPLETED"]
                }
            },
            "sort": {
                "sort_field": "CREATED_AT",
                "sort_order": "DESC"
            }
        }
    }

    try:
        response = requests.post(url, headers=headers, json=body)
        data = response.json()
        
        item_counter = {}
        for order in data.get("orders", []):
            for line_item in order.get("line_items", []):
                name = line_item.get("name", "Unnamed Item")
                quantity = int(float(line_item.get("quantity", "1")))
                item_counter[name] = item_counter.get(name, 0) + quantity
        
        top_items = sorted(item_counter.items(), key=lambda x: x[1], reverse=True)[:5]
        return [{"name": name, "sold": count} for name, count in top_items]
    except Exception as e:
        print(f"❌ Error parsing Square orders: {e}")
        return [{"name": "⚠️ Error fetching data", "sold": 0}]
