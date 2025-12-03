import os
import json
import shutil
import random
from werkzeug.utils import secure_filename
from flask import current_app, url_for

DISH_IMAGE_MAP_PATH = 'dish_image_map.json'

def get_dish_image_map():
    if not os.path.exists(DISH_IMAGE_MAP_PATH):
        return {}
    try:
        with open(DISH_IMAGE_MAP_PATH, 'r') as f:
            return json.load(f)
    except json.JSONDecodeError:
        return {}

def get_random_image_for_dish(dish_name):
    dish_map = get_dish_image_map()
    if dish_name in dish_map and dish_map[dish_name]:
        filename = random.choice(dish_map[dish_name])
        # Return full URL
        return url_for('static', filename=f'images/dishes/{filename}', _external=True)
    return None

def save_dish_image_map(data):
    with open(DISH_IMAGE_MAP_PATH, 'w') as f:
        json.dump(data, f, indent=4)

def get_all_images():
    dish_map = get_dish_image_map()
    # Also scan the directory to find unmapped images? 
    # For now, let's stick to the map as the source of truth for "managed" images.
    # But we should probably return a flat list or grouped structure.
    # Let's return the map directly, frontend can parse it.
    return dish_map

def upload_image(file, dish_name):
    if not file:
        return False, "No file provided"
    
    filename = secure_filename(file.filename)
    upload_folder = current_app.config['UPLOAD_FOLDER']
    
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder)
        
    # Avoid overwriting
    base, ext = os.path.splitext(filename)
    counter = 1
    while os.path.exists(os.path.join(upload_folder, filename)):
        filename = f"{base}_{counter}{ext}"
        counter += 1
        
    file.save(os.path.join(upload_folder, filename))
    
    # Update map
    dish_map = get_dish_image_map()
    if dish_name not in dish_map:
        dish_map[dish_name] = []
    
    dish_map[dish_name].append(filename)
    save_dish_image_map(dish_map)
    
    return True, filename

def delete_image(filename, dish_name):
    upload_folder = current_app.config['UPLOAD_FOLDER']
    file_path = os.path.join(upload_folder, filename)
    
    # Remove from disk
    if os.path.exists(file_path):
        os.remove(file_path)
        
    # Remove from map
    dish_map = get_dish_image_map()
    if dish_name in dish_map and filename in dish_map[dish_name]:
        dish_map[dish_name].remove(filename)
        if not dish_map[dish_name]: # Remove key if empty
            del dish_map[dish_name]
        save_dish_image_map(dish_map)
        return True
    
    return False

def update_image_category(filename, old_dish, new_dish):
    dish_map = get_dish_image_map()
    
    if old_dish in dish_map and filename in dish_map[old_dish]:
        dish_map[old_dish].remove(filename)
        if not dish_map[old_dish]:
            del dish_map[old_dish]
            
        if new_dish not in dish_map:
            dish_map[new_dish] = []
        dish_map[new_dish].append(filename)
        
        save_dish_image_map(dish_map)
        return True
        
    return False
