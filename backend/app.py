# backend/app.py

from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from authlib.integrations.flask_client import OAuth
from config import Config
from werkzeug.middleware.proxy_fix import ProxyFix
from sqlalchemy import text
import os

db = SQLAlchemy()
oauth = OAuth()

def create_app():
    flask_app = Flask(__name__)
    flask_app.config.from_object(Config)
    
    flask_app.secret_key = flask_app.config['JWT_SECRET_KEY']
    
    flask_app.wsgi_app = ProxyFix(
        flask_app.wsgi_app,
        x_for=1,
        x_proto=1,
        x_host=1,
        x_prefix=1
    )
    
    origins = flask_app.config.get('CORS_ORIGINS', '').split(',') if isinstance(flask_app.config.get('CORS_ORIGINS'), str) else flask_app.config.get('CORS_ORIGINS', [])
    CORS(flask_app, resources={
        r"/api/*": {
            "origins": origins,
            "supports_credentials": True,
            "allow_headers": ["Content-Type", "Authorization"],
            "expose_headers": ["Content-Type", "Authorization"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        }
    })
    
    db.init_app(flask_app)
    oauth.init_app(flask_app)
    
    with flask_app.app_context():
        from models import Provider, Exam, Topic, UserPreference, FavoriteQuestion, UserAnswer, ExamAttempt, ExamVisit
        from auth import User, init_oauth, auth_bp
        
        init_oauth(flask_app)
        
        try:
            db.create_all()
        except Exception as e:
            flask_app.logger.error(f"Error creating database tables: {str(e)}")
        
        flask_app.register_blueprint(auth_bp)
        
        from routes import routes_bp
        flask_app.register_blueprint(routes_bp)
        
        @flask_app.route('/health')
        def health_check():
            try:
                db.session.execute(text('SELECT 1'))
                return jsonify({
                    'status': 'healthy',
                    'database': 'connected',
                    'env': os.getenv('FLASK_ENV', 'production')
                }), 200
            except Exception as e:
                flask_app.logger.error(f"Health check failed: {str(e)}")
                return jsonify({
                    'status': 'unhealthy',
                    'database': str(e),
                    'env': os.getenv('FLASK_ENV', 'production')
                }), 500
    
    return flask_app

app = create_app()
application = app

if __name__ == '__main__':
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(debug=debug, host='0.0.0.0', port=int(os.getenv('PORT', 5000)))