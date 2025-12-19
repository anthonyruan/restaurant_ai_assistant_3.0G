import os
import random
import io
from PIL import Image
from flask import current_app
import cloudinary
import cloudinary.uploader
import cloudinary.api

# No longer needed
# DISH_IMAGE_MAP_PATH = 'dish_image_map.json'

def _configure_cloudinary():
    cloudinary.config(
        cloud_name=current_app.config['CLOUDINARY_CLOUD_NAME'],
        api_key=current_app.config['CLOUDINARY_API_KEY'],
        api_secret=current_app.config['CLOUDINARY_API_SECRET']
    )

def get_all_images():
    _configure_cloudinary()
    try:
        # Fetch resources from the specific folder
        # We need tags and context to group them
        result = cloudinary.api.resources(
            type="upload",
            prefix="restaurant_assistant/dishes/", # Filter by folder
            tags=True,
            context=True,
            max_results=500 # Adjust as needed
        )
        
        images_by_dish = {}
        
        for resource in result.get('resources', []):
            # Try to find dish name from tags
            dish_name = "Uncategorized"
            tags = resource.get('tags', [])
            for tag in tags:
                if tag.startswith('dish_'):
                    dish_name = tag[5:] # Remove 'dish_' prefix
                    break
            
            # Fallback to context if no tag (for backward compatibility or manual uploads)
            if dish_name == "Uncategorized" and 'context' in resource:
                custom = resource['context'].get('custom', {})
                if 'caption' in custom:
                    dish_name = custom['caption']
            
            if dish_name not in images_by_dish:
                images_by_dish[dish_name] = []
                
            images_by_dish[dish_name].append({
                "url": resource.get('secure_url'),
                "public_id": resource.get('public_id'),
                "created_at": resource.get('created_at')
            })
            
        return images_by_dish
        
    except Exception as e:
        print(f"Error fetching images from Cloudinary: {e}")
        return {}

def upload_image(file, dish_name):
    _configure_cloudinary()
    if not file:
        return False, "No file provided"
    
    try:
        # Optimize image before upload (optional, Cloudinary can also do it)
        # But let's do basic resizing here to save bandwidth
        img = Image.open(file)
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
            
        max_width = 1440
        if img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
        img_io = io.BytesIO()
        img.save(img_io, 'JPEG', quality=85)
        img_io.seek(0)
        
        # Upload
        # Tag format: dish_{dish_name}
        # Context: caption={dish_name}
        clean_dish_name = dish_name.strip()
        tag = f"dish_{clean_dish_name}"
        
        upload_result = cloudinary.uploader.upload(
            img_io,
            folder="restaurant_assistant/dishes",
            tags=[tag],
            context={"caption": clean_dish_name},
            resource_type="image"
        )
        
        return True, {
            "url": upload_result.get('secure_url'),
            "public_id": upload_result.get('public_id')
        }
        
    except Exception as e:
        print(f"Error uploading to Cloudinary: {e}")
        return False, str(e)

def delete_image(public_id, dish_name=None):
    # dish_name is unused but kept for API signature compatibility if needed
    _configure_cloudinary()
    try:
        cloudinary.uploader.destroy(public_id)
        return True
    except Exception as e:
        print(f"Error deleting from Cloudinary: {e}")
        return False

def update_image_category(public_id, old_dish, new_dish):
    _configure_cloudinary()
    try:
        old_tag = f"dish_{old_dish}"
        new_tag = f"dish_{new_dish}"
        
        # Remove old tag
        cloudinary.uploader.remove_tag(old_tag, [public_id])
        # Add new tag
        cloudinary.uploader.add_tag(new_tag, [public_id])
        # Update context
        cloudinary.uploader.add_context({"caption": new_dish}, [public_id])
        
        return True
    except Exception as e:
        print(f"Error updating image category: {e}")
        return False

def get_random_image_for_dish(dish_name):
    _configure_cloudinary()
    try:
        # Use Search API to find images with the specific tag
        # 1. Exact Match
        tag = f"dish_{dish_name}"
        result = _search_cloudinary(tag)
        if result: return result

        # 2. Alias / Synonym Check (Hardcoded for common mapping)
        # e.g. "Chicken Banhmi" -> "Chicken Sandwich"
        
        # Define base aliases
        aliases = {
            "Banhmi": "Sandwich",
            "Bánh Mì": "Sandwich",
            "Banh Mi": "Sandwich"
        }
        
        mapped_name = dish_name
        for key, value in aliases.items():
            if key.lower() in mapped_name.lower():
                mapped_name = mapped_name.lower().replace(key.lower(), value).title() # Simple replace
        
        if mapped_name != dish_name:
            tag = f"dish_{mapped_name}"
            result = _search_cloudinary(tag)
            if result: return result

        # 3. Fallback: If the name contains "Sandwich", try searching for just "Sandwich" category
        # This handles "Chicken Sandwich" -> finding "Sandwich" generic images
        if "Sandwich" in dish_name and dish_name != "Sandwich":
             tag = "dish_Sandwich"
             result = _search_cloudinary(tag)
             if result: return result

        # 4. Super Fallback (Python-side filtering):
        # If Search API fails or index is slow, we use our own list.
        if len(dish_name.split()) == 1: 
             all_images = get_all_images() # Uses cached result if possible or fetches fresh
             matches = []
             target = dish_name.lower()
             
             for dish_key, images in all_images.items():
                 # Check if the dish category itself contains the target word
                 # e.g. dish_key="Chicken Sandwich" contains "sandwich"
                 if target in dish_key.lower():
                     matches.extend(images)
            
             if matches:
                 selected = random.choice(matches)
                 return selected['url']

        return None

    except Exception as e:
        print(f"Error searching Cloudinary: {e}")
        return None

def _search_cloudinary(tag, exact=True):
    try:
        # If exact match, use quotes for strict tag matching
        # If broad (exact=False), use wildcard pattern
        tag_query = f"\"{tag}\"" if exact else tag
        
        expression = f"resource_type:image AND tags:{tag_query} AND folder:restaurant_assistant/dishes"
        
        result = cloudinary.search.Search()\
            .expression(expression)\
            .max_results(50)\
            .execute()
            
        resources = result.get('resources', [])
        if resources:
            selected = random.choice(resources)
            return selected.get('secure_url')
    except Exception as e:
        print(f"Error searching Cloudinary for {tag}: {e}")
    return None
        


def optimize_image_for_instagram(filename):
    # This function was used when we had local files. 
    # Now, if we are using Cloudinary, we might just need to return the URL 
    # if the image is already in Cloudinary.
    # However, the current flow in routes.py calls this with a filename extracted from a URL?
    # Wait, routes.py logic:
    # if 'static/images/dishes/' in image_url: ...
    
    # If we migrate fully, we won't have 'static/images/dishes/' URLs anymore.
    # We will have Cloudinary URLs.
    # So this function might become obsolete or just a pass-through.
    
    # But for now, to support the transition, let's assume if a filename is passed,
    # it might be a leftover local file (unlikely on Render) or we just return None.
    
    # Actually, let's keep it for now but make it upload to Cloudinary if it finds a local file.
    # But since we are removing local storage, this is only useful if there are files on disk.
    
    # Let's reimplement it to be safe: check if file exists locally (unlikely), if so upload.
    # If not, maybe it's already a Cloudinary URL?
    
    # The route logic calls this if URL contains 'static/images/dishes/'.
    # If we switch to Cloudinary, get_random_image_for_dish returns a Cloudinary URL.
    # So the condition in routes.py won't trigger.
    # So this function won't be called for new images.
    
    # But what if we want to "optimize" an existing Cloudinary image for Instagram?
    # Cloudinary does that automatically via URL transformations (f_auto, q_auto, etc).
    # But Instagram needs a specific URL.
    
    # Let's leave this function to handle local files just in case, using the new upload logic.
    return upload_image_from_local(filename)

def upload_image_from_local(filename):
    _configure_cloudinary()
    upload_folder = current_app.config['UPLOAD_FOLDER']
    file_path = os.path.join(upload_folder, filename)
    
    if not os.path.exists(file_path):
        return None
        
    try:
        upload_result = cloudinary.uploader.upload(
            file_path,
            folder="restaurant_assistant/dishes",
            resource_type="image"
        )
        return upload_result.get('secure_url')
    except Exception:
        return None
