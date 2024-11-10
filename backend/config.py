# backend/config.py

import os
from dotenv import load_dotenv

# Load the appropriate .env file based on environment
env = os.getenv('FLASK_ENV', 'development')
env_file = f'.env.{env}'
load_dotenv(env_file)

class Config:
    """Flask application configuration."""
    
    # Environment
    ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = ENV == 'development'
    
    # Database
    DB_USER = os.getenv('DB_USER', 'hiraya-admin')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'password')
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5433')
    DB_NAME = os.getenv('DB_NAME', 'hiraya-db')

    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL') or \
        f'postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'

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
    
    # API Configuration
    JSON_SORT_KEYS = False
    CORS_HEADERS = 'Content-Type'
    
    # Environment-specific URLs - ensure consistent trailing slashes
    API_URL = os.getenv('API_URL', 
        'http://localhost:5000/api' if ENV == 'development' else 'https://hiraya.amihan.net'
    ).rstrip('/')
    
    FRONTEND_URL = os.getenv('FRONTEND_URL', 
        'http://localhost:3000' if ENV == 'development' else 'https://hiraya.amihan.net'
    ).rstrip('/')
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 
        "http://localhost:3000,http://localhost:5000" if ENV == 'development' else "https://hiraya.amihan.net"
    ).split(',')
    
    # Authentication
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'lB5y4lCxV1oDJTrIQLVTTtFGf_hTsoG3AVWuTMy9UkXbf0ynTnU0LogFykO_U6g')
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours in seconds
    
    # OAuth Configuration
    GITHUB_CLIENT_ID = os.getenv('GITHUB_CLIENT_ID')
    GITHUB_CLIENT_SECRET = os.getenv('GITHUB_CLIENT_SECRET')
    
    # Proxy settings for handling SSL/HTTPS behind reverse proxy
    PREFERRED_URL_SCHEME = 'https'
    
    @property
    def OAUTH_CALLBACK_BASE_URL(self):
        """Get base URL for OAuth callbacks"""
        return f"{self.API_URL}"