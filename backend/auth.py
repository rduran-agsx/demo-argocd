# backend/auth.py

from flask import Blueprint, jsonify, request, redirect, current_app, url_for, session
import jwt
from datetime import datetime, timedelta
import os
from app import db, oauth
from urllib.parse import urljoin, urlparse
import logging
import traceback
import secrets

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    github_id = db.Column(db.String(100), unique=True, nullable=True)
    google_id = db.Column(db.String(100), unique=True, nullable=True)
    username = db.Column(db.String(100))
    name = db.Column(db.String(100))
    email = db.Column(db.String(120))
    avatar_url = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

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
    return url.rstrip('/').strip()

def init_oauth(app):
    """Initialize OAuth with GitHub and Google"""
    try:
        oauth.register(
            name='github',
            client_id=app.config['GITHUB_CLIENT_ID'],
            client_secret=app.config['GITHUB_CLIENT_SECRET'],
            access_token_url='https://github.com/login/oauth/access_token',
            authorize_url='https://github.com/login/oauth/authorize',
            api_base_url='https://api.github.com/',
            client_kwargs={'scope': 'user:email'}
        )

        base_url = app.config['API_URL'].rstrip('/')
        redirect_uri = f"{base_url}/auth/google/callback"
        
        oauth.register(
            name='google',
            client_id=app.config['GOOGLE_CLIENT_ID'],
            client_secret=app.config['GOOGLE_CLIENT_SECRET'],
            server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
            client_kwargs={
                'scope': 'openid email profile',
                'prompt': 'select_account',
                'redirect_uri': redirect_uri
            }
        )
        
        app.logger.info(f"OAuth initialized with Google redirect URI: {redirect_uri}")
        
    except Exception as e:
        app.logger.error(f"OAuth initialization failed: {str(e)}")
        raise

@auth_bp.route('/auth/github')
def github_auth():
    """Initiate GitHub OAuth flow"""
    try:
        callback_url = url_for('auth.github_callback', _external=True)
        state = secrets.token_hex(16)
        session['oauth_state'] = state
        
        return oauth.github.authorize_redirect(
            redirect_uri=callback_url,
            state=state
        )
    except Exception as e:
        current_app.logger.error(f"GitHub auth error: {str(e)}")
        frontend_url = validate_url(current_app.config['FRONTEND_URL'])
        return redirect(f"{frontend_url}/auth?error=github_auth_failed")

@auth_bp.route('/auth/github/callback')
def github_callback():
    """Handle GitHub OAuth callback"""
    try:
        state = request.args.get('state')
        if state and session.get('oauth_state') != state:
            raise ValueError("State verification failed")
        
        token = oauth.github.authorize_access_token()
        if not token:
            raise ValueError("No token received from GitHub")

        resp = oauth.github.get('user', token=token)
        profile = resp.json()

        emails_resp = oauth.github.get('user/emails', token=token)
        emails = emails_resp.json()
        primary_email = next((email['email'] for email in emails if email['primary']), None)

        user = User.query.filter_by(github_id=str(profile['id'])).first()
        if not user:
            user = User(
                github_id=str(profile['id']),
                username=profile['login'],
                name=profile.get('name'),
                email=primary_email,
                avatar_url=profile['avatar_url']
            )
            db.session.add(user)
            db.session.commit()
        else:
            user.name = profile.get('name', user.name)
            user.email = primary_email or user.email
            user.avatar_url = profile['avatar_url']
            db.session.commit()

        jwt_token = generate_token(user.id)
        session.pop('oauth_state', None)

        frontend_url = validate_url(current_app.config['FRONTEND_URL'])
        return redirect(f"{frontend_url}/?token={jwt_token}")

    except Exception as e:
        current_app.logger.error(f"GitHub callback error: {str(e)}")
        frontend_url = validate_url(current_app.config['FRONTEND_URL'])
        return redirect(f"{frontend_url}/auth?error=github_auth_failed")

@auth_bp.route('/auth/google')
def google_auth():
    """Initiate Google OAuth flow"""
    try:
        callback_url = url_for('auth.google_callback', _external=True)
        nonce = secrets.token_hex(16)
        session['nonce'] = nonce
        state = secrets.token_hex(16)
        session['oauth_state'] = state
        
        base_url = current_app.config['API_URL'].rstrip('/')
        redirect_uri = f"{base_url}/auth/google/callback"
        
        return oauth.google.authorize_redirect(
            redirect_uri=redirect_uri,
            state=state,
            nonce=nonce
        )
    except Exception as e:
        current_app.logger.error(f"Google auth error: {str(e)}")
        frontend_url = validate_url(current_app.config['FRONTEND_URL'])
        return redirect(f"{frontend_url}/auth?error=google_auth_failed")

@auth_bp.route('/auth/google/callback')
def google_callback():
    """Handle Google OAuth callback"""
    try:
        state = request.args.get('state')
        if state and session.get('oauth_state') != state:
            raise ValueError("State verification failed")

        token = oauth.google.authorize_access_token()
        if not token:
            raise ValueError("No token received from Google")

        nonce = session.get('nonce')
        userinfo = oauth.google.parse_id_token(token, nonce=nonce)
        if not userinfo:
            raise ValueError("Failed to get user info from Google")

        user = User.query.filter_by(google_id=userinfo['sub']).first()
        if not user:
            user = User(
                google_id=userinfo['sub'],
                username=userinfo['email'].split('@')[0],
                name=userinfo.get('name'),
                email=userinfo['email'],
                avatar_url=userinfo.get('picture')
            )
            db.session.add(user)
        else:
            user.name = userinfo.get('name', user.name)
            user.email = userinfo['email']
            user.avatar_url = userinfo.get('picture', user.avatar_url)
        
        db.session.commit()
        jwt_token = generate_token(user.id)
        session.pop('oauth_state', None)
        session.pop('nonce', None)

        frontend_url = validate_url(current_app.config['FRONTEND_URL'])
        return redirect(f"{frontend_url}/?token={jwt_token}")

    except Exception as e:
        current_app.logger.error(f"Google callback error: {str(e)}")
        frontend_url = validate_url(current_app.config['FRONTEND_URL'])
        return redirect(f"{frontend_url}/auth?error=google_auth_failed")

@auth_bp.route('/auth/me')
def get_user():
    """Get current user information"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            current_app.logger.warning("No valid authorization header found")
            return jsonify({'error': 'No token provided'}), 401

        token = auth_header.split(' ')[1]
        
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
        current_app.logger.error(f"Error in get_user: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

@auth_bp.errorhandler(404)
def not_found_error(error):
    current_app.logger.warning(f"404 error: {str(error)}")
    return jsonify({'error': 'Not found', 'message': str(error)}), 404

@auth_bp.errorhandler(500)
def internal_error(error):
    current_app.logger.error(f"500 error: {str(error)}")
    db.session.rollback()
    return jsonify({
        'error': 'Internal server error',
        'message': str(error) if current_app.debug else 'An unexpected error occurred'
    }), 500