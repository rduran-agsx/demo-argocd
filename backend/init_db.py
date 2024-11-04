# backend/init_db.py

from app import app, db
from models import Provider, Exam, Topic, UserPreference, FavoriteQuestion, UserAnswer, ExamAttempt, ExamVisit
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    """Initialize the database by creating all tables."""
    try:
        with app.app_context():
            # Drop all tables
            db.drop_all()
            logger.info("Dropped all tables.")

            # Create all tables
            db.create_all()
            logger.info("Created all tables successfully.")

    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}")
        raise

if __name__ == "__main__":
    init_db()