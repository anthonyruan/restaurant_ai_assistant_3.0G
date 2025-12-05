from flask import Blueprint, jsonify, request, send_file, current_app
from app.services import square_service, weather_service, holiday_service, openai_service, instagram_service, image_service, settings_service


api_bp = Blueprint('api', __name__)

@api_bp.route('/sales/top-dishes', methods=['GET'])
def get_top_dishes():
    dishes = square_service.get_top_dishes()
    return jsonify(dishes)

@api_bp.route('/weather/current', methods=['GET'])
def get_weather():
    weather = weather_service.get_current_weather()
    return jsonify(weather)

@api_bp.route('/weather/forecast', methods=['GET'])
def get_forecast():
    forecast = weather_service.get_tomorrow_forecast()
    return jsonify(forecast)

@api_bp.route('/holiday', methods=['GET'])
def get_holiday():
    holiday = holiday_service.get_holiday_info()
    return jsonify(holiday)

@api_bp.route('/generate/caption', methods=['POST'])
def generate_caption():
    data = request.json
    mode = data.get('mode') # 'sales', 'weather', 'holiday'
    
    if mode == 'sales':
        dish_name = data.get('dish_name')
        result = openai_service.generate_caption(dish_name)
        # result is now a dict {"caption": ...}
        return jsonify(result)
    elif mode == 'weather':
        weather_data = data.get('weather_data')
        result = openai_service.generate_weather_caption(weather_data)
        # result is now a dict {"caption": ..., "dish_name": ...}
        return jsonify(result)
    elif mode == 'holiday':
        holiday_message = data.get('holiday_message')
        caption = openai_service.generate_holiday_caption(holiday_message)
        return jsonify({"caption": caption})
    else:
        return jsonify({"error": "Invalid mode"}), 400

@api_bp.route('/generate/image', methods=['POST'])
def generate_image():
    data = request.json
    mode = data.get('mode')
    
    if mode == 'sales':
        dish_name = data.get('dish_name')
        # Use library image
        image_url = image_service.get_random_image_for_dish(dish_name)
        if not image_url:
             # Fallback to placeholder or error? User requested "not AI".
             # Let's return a placeholder or null to indicate no image found.
             image_url = "https://via.placeholder.com/400x400.png?text=No+Image+In+Library"
    elif mode == 'weather':
        # Weather mode now passes dish_name if available (from caption generation step)
        dish_name = data.get('dish_name')
        if dish_name:
             image_url = image_service.get_random_image_for_dish(dish_name)
        else:
             image_url = None
             
        if not image_url:
             image_url = "https://via.placeholder.com/400x400.png?text=No+Image+In+Library"
             
    elif mode == 'holiday':
        caption = data.get('caption')
        prompt = f"A festive Vietnamese dish celebration. {caption}. Professional food photography."
        image_url = openai_service.generate_image(prompt)
    else:
        return jsonify({"error": "Invalid mode"}), 400
        
    return jsonify({"image_url": image_url})

@api_bp.route('/instagram/post', methods=['POST'])
def post_instagram():
    data = request.json
    image_url = data.get('image_url')
    caption = data.get('caption')
    
    # Check if it's a local image (from our own static folder)
    # If so, use the optimized endpoint to ensure it meets Instagram specs
    if 'static/images/dishes/' in image_url:
        filename = image_url.split('/')[-1]
        # Optimize and upload to Cloudinary
        optimized_url = image_service.optimize_image_for_instagram(filename)
        if optimized_url:
            image_url = optimized_url
            print(f"DEBUG: Using Cloudinary URL for Instagram: {image_url}")
        else:
            print("ERROR: Failed to optimize/upload image to Cloudinary")
            # Fallback to original logic if upload fails (though likely to fail on IG too)
    
    result = instagram_service.post_to_instagram(image_url, caption)
    if result['success']:
        return jsonify(result)
    else:
        return jsonify(result), 500

@api_bp.route('/instagram/refresh_token', methods=['POST'])
def refresh_instagram_token():
    result = instagram_service.refresh_access_token()
    if result['success']:
        return jsonify(result)
    else:
        return jsonify(result), 500

@api_bp.route('/images', methods=['GET'])
def get_images():
    images = image_service.get_all_images()
    return jsonify(images)

@api_bp.route('/images/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file"}), 400
        
    file = request.files['image']
    dish_name = request.form.get('dish_name', 'Uncategorized')
    
    success, result = image_service.upload_image(file, dish_name)
    if success:
        return jsonify(result) # Returns {url, public_id}
    else:
        return jsonify({"error": result}), 500

@api_bp.route('/images', methods=['DELETE'])
def delete_image():
    public_id = request.args.get('public_id')
    dish_name = request.args.get('dish_name') # Optional, for compatibility
    
    if not public_id:
        return jsonify({"error": "Public ID required"}), 400
        
    success = image_service.delete_image(public_id, dish_name)
    if success:
        return jsonify({"success": True})
    else:
        return jsonify({"error": "Failed to delete"}), 500

@api_bp.route('/images/category', methods=['PUT'])
def update_image_category():
    data = request.json
    public_id = data.get('public_id')
    old_dish = data.get('old_dish')
    new_dish = data.get('new_dish')
    
    if not public_id or not new_dish:
        return jsonify({"error": "Public ID and new dish name required"}), 400
        
    success = image_service.update_image_category(public_id, old_dish, new_dish)
    if success:
        return jsonify({"success": True})
    else:
        return jsonify({"error": "Failed to update"}), 500

@api_bp.route('/images/optimized/<filename>', methods=['GET'])
def get_optimized_image(filename):
    # This function now uploads to Cloudinary and returns the URL
    secure_url = image_service.optimize_image_for_instagram(filename)
    if secure_url:
        from flask import redirect
        return redirect(secure_url)
    else:
        return jsonify({"error": "Image not found or failed to process"}), 404

@api_bp.route('/debug/files', methods=['GET'])
def debug_files():
    import os
    cwd = os.getcwd()
    upload_folder = current_app.config['UPLOAD_FOLDER']
    
    info = {
        "cwd": cwd,
        "upload_folder": upload_folder,
        "upload_folder_exists": os.path.exists(upload_folder),
        "files_in_upload": [],
        "files_in_cwd": os.listdir(cwd) if os.path.exists(cwd) else []
    }
    
    if os.path.exists(upload_folder):
        info["files_in_upload"] = os.listdir(upload_folder)
        
    return jsonify(info)

@api_bp.route('/settings', methods=['GET', 'POST'])
def settings():
    if request.method == 'POST':
        data = request.json
        settings_service.save_settings(data)
        return jsonify({"success": True})
    else:
        return jsonify(settings_service.get_settings())
