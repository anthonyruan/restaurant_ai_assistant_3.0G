import os
import json
import shutil
import random
import io
from PIL import Image
from werkzeug.utils import secure_filename
from flask import current_app, url_for, send_file

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

def optimize_image_for_instagram(filename):
    upload_folder = current_app.config['UPLOAD_FOLDER']
    file_path = os.path.join(upload_folder, filename)
    
    print(f"DEBUG: Optimizing image. Upload folder: {upload_folder}")
    print(f"DEBUG: Full file path: {file_path}")
    
    if not os.path.exists(file_path):
        print(f"ERROR: File not found at {file_path}")
        # Try looking in absolute path if relative fails
        if not os.path.isabs(file_path):
             abs_path = os.path.abspath(file_path)
             print(f"DEBUG: Absolute path check: {abs_path}")
             if os.path.exists(abs_path):
                 file_path = abs_path
                 print("DEBUG: Found at absolute path")
             else:
                 return None
        else:
             return None
        
    try:
        with Image.open(file_path) as img:
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'P'):
                img = img.convert('RGB')
                
            # Resize if too large (max width 1440px for Instagram)
            max_width = 1440
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                
            # Save to buffer
            img_io = io.BytesIO()
            # Quality 85 is usually good enough and keeps size down
            img.save(img_io, 'JPEG', quality=85)
            img_io.seek(0)
            return img_io
    except Exception as e:
        print(f"Error optimizing image: {e}")
        import traceback
        traceback.print_exc()
        return None

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
