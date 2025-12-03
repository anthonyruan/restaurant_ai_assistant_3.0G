from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from .config import Config

load_dotenv()

def create_app(config_class=Config):
    app = Flask(__name__, static_folder='../static')
    app.config.from_object(config_class)
    
    # Enable CORS for frontend communication
    CORS(app)

    # Register Blueprints
    from .api.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    return app
