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
    DB_PORT = os.getenv('DB_PORT', '5433')
    DB_NAME = os.getenv('DB_NAME', 'hiraya-db')

    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL') or f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'

    # Database optimizations
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': int(os.getenv('SQLALCHEMY_POOL_SIZE', 30)),
        'max_overflow': int(os.getenv('SQLALCHEMY_MAX_OVERFLOW', 10)),
        'pool_timeout': int(os.getenv('SQLALCHEMY_POOL_TIMEOUT', 60)),
        'pool_recycle': int(os.getenv('SQLALCHEMY_POOL_RECYCLE', 1800)),
        'pool_pre_ping': True,
        'echo': bool(os.getenv('SQL_ECHO', False)),
        'connect_args': {
            'connect_timeout': 60,
            'options': '-c statement_timeout=60000'
        }
    }

    # Query tuning
    SQLALCHEMY_RECORD_QUERIES = False
    SQLALCHEMY_COMMIT_ON_TEARDOWN = False
    SQLALCHEMY_ECHO = False
    
    JSON_SORT_KEYS = False
    CORS_HEADERS = 'Content-Type'

    # Updated CORS_ORIGINS with IP addresses
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 
        "http://localhost:3000,"
        "https://hiraya.amihan.net,"
        "http://10.74.0.21:30080,"
        "http://10.74.0.22:30080,"
        "http://10.74.0.23:30080,"
        "http://10.74.0.24:30080"
    ).split(',')