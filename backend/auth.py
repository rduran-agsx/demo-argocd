# backend/auth.py

from flask import Blueprint, jsonify, request, redirect, current_app, url_for, session
import jwt
from datetime import datetime, timedelta
import os
from app import db, oauth
from urllib.parse import urljoin, urlparse
import logging
import traceback

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    github_id = db.Column(db.String(100), unique=True)
    username = db.Column(db.String(100))
    name = db.Column(db.String(100))
    email = db.Column(db.String(120))
    avatar_url = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Create blueprint with url_prefix
auth_bp = Blueprint('auth', __name__, url_prefix='/api')

def generate_token(user_id):
    """Generate JWT token for authenticated users"""
    try:
        payload = {
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(days=1),
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
    except Exception as e:
        current_app.logger.error(f"Error generating token: {str(e)}")
        raise

def validate_url(url):
    """Validate and normalize URL"""
    if not url:
        return None
    parsed = urlparse(url)
    if not parsed.scheme:
        url = f"https://{url}"
    return url.rstrip('/')

def init_oauth(app):
    """Initialize OAuth with GitHub"""
    try:
        base_url = app.config['API_URL'].rstrip('/')
        callback_url = f"{base_url}/auth/github/callback"
        
        app.logger.info(f"Initializing OAuth with callback URL: {callback_url}")
        
        oauth.register(
            name='github',
            client_id=app.config['GITHUB_CLIENT_ID'],
            client_secret=app.config['GITHUB_CLIENT_SECRET'],
            access_token_url='https://github.com/login/oauth/access_token',
            access_token_params=None,
            authorize_url='https://github.com/login/oauth/authorize',
            authorize_params=None,
            api_base_url='https://api.github.com/',
            client_kwargs={'scope': 'user:email'},
        )
        app.logger.info("OAuth initialization successful")
    except Exception as e:
        app.logger.error(f"OAuth initialization failed: {str(e)}")
        raise

def get_callback_url():
    """Generate the correct callback URL based on configuration"""
    api_url = current_app.config['API_URL']
    if not api_url:
        raise ValueError("API_URL not configured")

    base_url = validate_url(api_url).rstrip('/')
    callback_path = '/auth/github/callback'
    callback_url = base_url + callback_path
    return callback_url

@auth_bp.route('/auth/github')
def github_auth():
    """Initiate GitHub OAuth flow"""
    try:
        callback_url = get_callback_url()
        current_app.logger.info(f"Initiating GitHub OAuth flow with callback URL: {callback_url}")
        
        # Store state in session for verification
        state = os.urandom(16).hex()
        session['oauth_state'] = state
        
        return oauth.github.authorize_redirect(
            redirect_uri=callback_url,
            state=state
        )
    except Exception as e:
        current_app.logger.error(f"GitHub auth error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({
            'error': 'Authentication failed',
            'message': str(e)
        }), 500

@auth_bp.route('/auth/github/callback')
def github_callback():
    """Handle GitHub OAuth callback"""
    try:
        # Verify state if it was stored
        state = request.args.get('state')
        if state and session.get('oauth_state') != state:
            raise ValueError("State verification failed")
        
        current_app.logger.info("Processing GitHub callback")
        token = oauth.github.authorize_access_token()
        
        if not token:
            raise ValueError("No token received from GitHub")

        # Fetch user profile
        resp = oauth.github.get('user', token=token)
        profile = resp.json()
        current_app.logger.info(f"Received GitHub profile for user: {profile.get('login')}")

        # Fetch user emails
        emails_resp = oauth.github.get('user/emails', token=token)
        emails = emails_resp.json()
        primary_email = next((email['email'] for email in emails if email['primary']), None)

        if not primary_email:
            current_app.logger.warning(f"No primary email found for user: {profile.get('login')}")

        # Find or create user
        user = User.query.filter_by(github_id=str(profile['id'])).first()
        if not user:
            current_app.logger.info(f"Creating new user for GitHub id: {profile['id']}")
            user = User(
                github_id=str(profile['id']),
                username=profile['login'],
                name=profile.get('name'),
                email=primary_email,
                avatar_url=profile['avatar_url']
            )
            db.session.add(user)
            db.session.commit()
            current_app.logger.info(f"New user created with id: {user.id}")
        else:
            current_app.logger.info(f"Found existing user with id: {user.id}")

        # Generate JWT token
        jwt_token = generate_token(user.id)
        
        # Clear OAuth state
        session.pop('oauth_state', None)

        # Redirect to frontend with token
        frontend_url = validate_url(current_app.config['FRONTEND_URL'])
        redirect_url = f"{frontend_url}?token={jwt_token}"
        current_app.logger.info(f"Redirecting to frontend: {redirect_url}")
        return redirect(redirect_url)

    except Exception as e:
        current_app.logger.error(f"Callback error: {str(e)}\n{traceback.format_exc()}")
        frontend_url = validate_url(current_app.config['FRONTEND_URL'])
        error_url = f"{frontend_url}/auth?error=server_error&message={str(e)}"
        return redirect(error_url)

@auth_bp.route('/auth/me')
def get_user():
    """Get current user information"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            current_app.logger.warning("No valid authorization header found")
            return jsonify({'error': 'No token provided'}), 401

        token = auth_header.split(' ')[1]
        
        # Decode and verify token
        try:
            payload = jwt.decode(
                token, 
                current_app.config['JWT_SECRET_KEY'], 
                algorithms=['HS256']
            )
        except jwt.ExpiredSignatureError:
            current_app.logger.warning("Expired token received")
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError as e:
            current_app.logger.warning(f"Invalid token received: {str(e)}")
            return jsonify({'error': 'Invalid token'}), 401

        # Get user from database
        user = User.query.get(payload['user_id'])
        if not user:
            current_app.logger.error(f"User not found for id: {payload['user_id']}")
            return jsonify({'error': 'User not found'}), 404

        current_app.logger.info(f"User data retrieved for id: {user.id}")
        return jsonify({
            'id': user.id,
            'username': user.username,
            'name': user.name,
            'email': user.email,
            'avatar_url': user.avatar_url
        })

    except Exception as e:
        current_app.logger.error(f"Error in get_user: {str(e)}\n{traceback.format_exc()}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

# Error handlers
@auth_bp.errorhandler(404)
def not_found_error(error):
    current_app.logger.warning(f"404 error: {str(error)}")
    return jsonify({'error': 'Not found', 'message': str(error)}), 404

@auth_bp.errorhandler(500)
def internal_error(error):
    current_app.logger.error(f"500 error: {str(error)}\n{traceback.format_exc()}")
    db.session.rollback()
    return jsonify({
        'error': 'Internal server error',
        'message': str(error) if current_app.debug else 'An unexpected error occurred'
    }), 500