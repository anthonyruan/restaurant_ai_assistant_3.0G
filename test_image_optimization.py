import os
import sys
from flask import Flask

# Add app to path
sys.path.append(os.getcwd())

from app.services import image_service

# Setup minimal app context
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'static/images/dishes')

# Ensure directory exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    print(f"Creating {app.config['UPLOAD_FOLDER']}")
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Use placeholder.jpg for testing
filename = 'placeholder.jpg'
file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)

if not os.path.exists(file_path):
    print(f"❌ Test file {filename} not found in {app.config['UPLOAD_FOLDER']}")
    # List directory to see what's there
    print("Directory contents:")
    print(os.listdir(app.config['UPLOAD_FOLDER']))
    exit(1)

print(f"Testing optimization for {filename}...")

with app.app_context():
    try:
        result = image_service.optimize_image_for_instagram(filename)
        
        if result:
            print("✅ Optimization successful!")
            print(f"Result type: {type(result)}")
            print(f"Result size: {result.getbuffer().nbytes} bytes")
        else:
            print("❌ Optimization returned None")
            
    except Exception as e:
        print(f"❌ Exception during optimization: {e}")
        import traceback
        traceback.print_exc()
