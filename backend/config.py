# backend/config.py

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Flask application configuration."""

    ENV = os.getenv('FLASK_ENV', 'development')

    DB_USER = os.getenv('DB_USER', 'hiraya-admin')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'password')
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'hiraya-db')

    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL') or f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
    CORS_HEADERS = 'Content-Type'

    CORS_ORIGINS = os.getenv('CORS_ORIGINS', "http://localhost:3000,http://127.0.0.1:3000").split(',')