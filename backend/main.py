# backend/main.py

from app import app
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if __name__ == '__main__':
    try:
        logger.info("Starting Flask application...")
        # Change host to '0.0.0.0' to make it accessible from outside the container
        app.run(debug=True, host='0.0.0.0')
    except Exception as e:
        logger.error(f"Application startup failed: {str(e)}")