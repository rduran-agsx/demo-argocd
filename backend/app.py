# backend/app.py

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from config import Config

# Initialize extensions
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}})
    db.init_app(app)
    
    return app

app = create_app()

# Import routes after app creation
from models import *
from routes import *