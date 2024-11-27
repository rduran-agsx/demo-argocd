# backend/scripts/init_db.py

import os
import sys
from pathlib import Path

script_dir = Path(__file__).resolve().parent
backend_dir = script_dir.parent
sys.path.append(str(backend_dir))

from app import app, db
from models import Provider, Exam, Topic, UserPreference, FavoriteQuestion, UserAnswer, ExamAttempt, ExamVisit
from auth import User
import logging
from sqlalchemy import text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    """Initialize the database by creating all tables."""
    try:
        db.session.execute(text('DROP SCHEMA public CASCADE;'))
        db.session.execute(text('CREATE SCHEMA public;'))
        db.session.execute(text('GRANT ALL ON SCHEMA public TO "hirayaadmin";'))
        db.session.execute(text('GRANT ALL ON SCHEMA public TO public;'))
        db.session.commit()
        
        logger.info("Dropped all tables.")

        db.create_all()
        logger.info("Created all tables successfully.")

        inspector = db.inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('users')]
        logger.info(f"Users table columns: {columns}")

    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        if db.session.is_active:
            db.session.rollback()
        raise

if __name__ == "__main__":
    with app.app_context():
        init_db()