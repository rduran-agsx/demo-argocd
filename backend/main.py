# backend/main.py

from app import app
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(name)

if name == 'main':
    try:
        logger.info("Starting Flask application...")
        app.run(debug=True, host='0.0.0.0')
    except Exception as e:
        logger.error(f"Application startup failed: {str(e)}")