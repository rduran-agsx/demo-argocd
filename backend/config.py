# backend/config.py

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Flask application configuration."""
    # Get environment
    ENV = os.getenv('FLASK_ENV', 'development')

    # Database configuration
    DB_USER = os.getenv('DB_USER', 'hiraya-admin')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'password')
    DB_HOST = os.getenv('DB_HOST', 'localhost')  # Default to localhost for local development
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'hiraya-db')

    # Use DATABASE_URL if set, otherwise construct from components
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL') or f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'

    # Common configurations
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
    CORS_HEADERS = 'Content-Type'

    # CORS configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', "http://localhost:3000,http://127.0.0.1:3000").split(',')
