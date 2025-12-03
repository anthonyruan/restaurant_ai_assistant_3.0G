import os
import json
import openai
from flask import current_app
from app.utils import ttl_cache

from app.services import settings_service

# Hashtags are now fetched dynamically


def get_client():
    return openai.OpenAI(api_key=current_app.config["OPENAI_API_KEY"])

@ttl_cache(ttl_seconds=600)
def generate_caption(dish_name):
    client = get_client()
    try:
        prompt = f"Write an Instagram caption to promote the Vietnamese dish '{dish_name}' in an appetizing, fun, and catchy way."
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        caption = response.choices[0].message.content.strip() + "\n\n" + settings_service.get_hashtags()
        return {"caption": caption}
    except Exception as e:
        return {"caption": f"⚠️ Error generating caption: {str(e)}" + "\n\n" + settings_service.get_hashtags()}

@ttl_cache(ttl_seconds=600)
def generate_weather_caption(weather_data):
    if not weather_data:
        return {"caption": "⚠️ Weather data unavailable" + "\n\n" + settings_service.get_hashtags(), "dish_name": None}
        
    client = get_client()
    
    # Load dish map to get list of dishes
    dish_map_path = os.path.join(os.getcwd(), 'dish_image_map.json')
    try:
        with open(dish_map_path, 'r') as f:
            dish_image_map = json.load(f)
        dish_list = list(dish_image_map.keys())
    except Exception:
        dish_list = []
        
    # Select a random dish if available, or just use generic
    import random
    selected_dish = random.choice(dish_list) if dish_list else "Vietnamese Pho"

    prompt = (
        f"Write an Instagram caption recommending {selected_dish} for a {weather_data['description']} day "
        f"with a temperature of {weather_data['temp']}°F. "
        f"Make the caption appealing and cozy."
    )
    
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        caption = response.choices[0].message.content.strip() + "\n\n" + settings_service.get_hashtags()
        return {"caption": caption, "dish_name": selected_dish}
    except Exception as e:
        return {"caption": f"⚠️ Error generating weather caption: {str(e)}" + "\n\n" + settings_service.get_hashtags(), "dish_name": None}

@ttl_cache(ttl_seconds=600)
def generate_holiday_caption(holiday_message):
    client = get_client()
    prompt = (
        f"Write an Instagram caption based on this holiday info: '{holiday_message}'. "
        f"Connect it to enjoying delicious Vietnamese food. Make it festive and fun."
    )
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content.strip() + "\n\n" + settings_service.get_hashtags()
    except Exception as e:
        return f"⚠️ Error generating holiday caption: {str(e)}" + "\n\n" + settings_service.get_hashtags()

def generate_image(prompt):
    client = get_client()
    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            n=1,
            size="1024x1024"
        )
        return response.data[0].url
    except Exception as e:
        print(f"❌ Error generating image: {e}")
        return None

def get_dish_image_url(dish_name):
    # Check if we have a mapped image or override
    dish_prompt_overrides = {
        "Sandwich": "Vietnamese Bánh Mì with grilled pork, pickled carrots, cilantro, on a crusty baguette",
        "Pho": "Vietnamese Pho noodle soup with beef, basil, bean sprouts, and lime",
        "Vermicelli": "Vietnamese grilled pork vermicelli bowl with fresh herbs and fish sauce",
        "Spring Roll": "Vietnamese fresh spring rolls with shrimp and vermicelli"
    }
    
    prompt_base = dish_prompt_overrides.get(dish_name, dish_name)
    prompt = f"A high-quality Instagram-style food photo of {prompt_base}, on a wooden table, studio lighting, delicious and fresh, close-up"
    return generate_image(prompt)
