import requests
import os
from flask import current_app

def post_to_instagram(image_url, caption):
    user_id = current_app.config["IG_USER_ID"]
    access_token = current_app.config["IG_ACCESS_TOKEN"]
    
    if not user_id or not access_token:
        return {"success": False, "error": "Instagram credentials not configured"}

    # Step 1: Create Media Object
    upload_url = f"https://graph.facebook.com/v19.0/{user_id}/media"
    upload_payload = {
        "image_url": image_url,
        "caption": caption,
        "access_token": access_token
    }
    
    try:
        upload_res = requests.post(upload_url, data=upload_payload)
        result = upload_res.json()
        creation_id = result.get("id")
        
        if not creation_id:
            return {"success": False, "error": f"Failed to create media: {result}"}
            
        # Step 2: Publish Media
        publish_url = f"https://graph.facebook.com/v19.0/{user_id}/media_publish"
        publish_payload = {
            "creation_id": creation_id,
            "access_token": access_token
        }
        
        publish_res = requests.post(publish_url, data=publish_payload)
        if publish_res.status_code == 200:
            return {"success": True, "id": publish_res.json().get("id")}
        else:
            return {"success": False, "error": f"Failed to publish: {publish_res.text}"}
            
    except Exception as e:
        return {"success": False, "error": str(e)}

def refresh_access_token():
    access_token = current_app.config["IG_ACCESS_TOKEN"]
    if not access_token:
        return {"success": False, "error": "No access token found"}
        
    url = "https://graph.instagram.com/refresh_access_token"
    params = {
        "grant_type": "ig_refresh_token",
        "access_token": access_token
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        if response.status_code == 200:
            return {
                "success": True,
                "access_token": data.get("access_token"),
                "expires_in": data.get("expires_in")
            }
        else:
            return {
                "success": False, 
                "error": data.get("error", {}).get("message", "Unknown error")
            }
    except Exception as e:
        return {"success": False, "error": str(e)}
