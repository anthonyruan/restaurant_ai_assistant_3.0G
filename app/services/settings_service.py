import json
import os

SETTINGS_PATH = "settings.json"
DEFAULT_HASHTAGS = "#vietspot #vietspotNYC #vietnamese #vietfood"

def get_settings():
    if not os.path.exists(SETTINGS_PATH):
        return {"hashtags": DEFAULT_HASHTAGS}
    try:
        with open(SETTINGS_PATH, "r") as f:
            return json.load(f)
    except json.JSONDecodeError:
        return {"hashtags": DEFAULT_HASHTAGS}

def save_settings(data):
    with open(SETTINGS_PATH, "w") as f:
        json.dump(data, f, indent=4)

def get_hashtags():
    settings = get_settings()
    return settings.get("hashtags", DEFAULT_HASHTAGS)
