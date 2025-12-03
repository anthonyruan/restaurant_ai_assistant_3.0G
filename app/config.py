import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev_secret_key")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    SQUARE_ACCESS_TOKEN = os.getenv("SQUARE_ACCESS_TOKEN")
    SQUARE_LOCATION_ID = os.getenv("SQUARE_LOCATION_ID")
    WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")
    HOLIDAY_API_KEY = os.getenv("HOLIDAY_API_KEY")
    IG_USER_ID = os.getenv("IG_USER_ID")
    IG_ACCESS_TOKEN = os.getenv("IG_ACCESS_TOKEN")
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'static/images/dishes')
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif'}
