# backend/scripts/migrate_providers.py

import os
import sys
from pathlib import Path
import logging
import json
import re
from contextlib import contextmanager
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

script_dir = Path(__file__).resolve().parent
backend_dir = script_dir.parent
sys.path.append(str(backend_dir))

from app import app, db
from models import Provider, Exam, Topic

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

@contextmanager
def session_scope():
    """Provide a transactional scope around a series of operations."""
    session = db.session
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()

def parse_exam_file(filename):
    """Parse exam filename to extract title, code and topic number."""
    try:
        filename = filename.replace('.json', '')
        
        # Extract topic number
        topic_number = 1
        topic_match = re.search(r'__topic-(\d+)', filename)
        if topic_match:
            topic_number = int(topic_match.group(1))
            filename = re.sub(r'__topic-\d+', '', filename)
        
        # Extract exam code
        code_match = re.search(r'-code-([^_]+)', filename)
        if code_match:
            exam_code = code_match.group(1)
            exam_title = filename.split('-code-')[0]
        else:
            exam_code = ''
            exam_title = filename
        
        return exam_title, exam_code, topic_number
    except Exception as e:
        logger.error(f"Error parsing filename {filename}: {str(e)}")
        raise

def get_exam_title_from_code(exam_title, exam_code):
    """Format exam title with code."""
    try:
        if exam_code and exam_code.strip():
            return f"{exam_code}: {exam_title}"
        return exam_title
    except Exception as e:
        logger.error(f"Error formatting exam title: {str(e)}")
        return exam_title

def load_exam_file(file_path):
    """Load and validate exam JSON file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if not isinstance(data, list):
            raise ValueError("Exam data must be a list of questions")
            
        return data
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in file {file_path}: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error loading file {file_path}: {str(e)}")
        raise

def process_provider(session, provider_path, provider_name, stats):
    """Process a single provider and its exams."""
    try:
        logger.info(f"Processing provider: {provider_name}")
        
        # Create or get provider
        provider = Provider.query.filter_by(name=provider_name).first()
        if not provider:
            provider = Provider(
                name=provider_name,
                is_popular=provider_name.lower() in ['amazon', 'microsoft', 'google']
            )
            session.add(provider)
            session.flush()
            stats['providers_migrated'] += 1
            logger.info(f"Created new provider: {provider_name}")
        
        # Group exam files by base exam
        exam_groups = {}
        exam_files = [f for f in os.listdir(provider_path) if f.endswith('.json')]
        
        if not exam_files:
            logger.warning(f"No exam files found for provider: {provider_name}")
            return
            
        logger.info(f"Found {len(exam_files)} exam files for {provider_name}")
        
        for exam_file in exam_files:
            try:
                exam_title, exam_code, topic_number = parse_exam_file(exam_file)
                base_key = f"{exam_title}-code-{exam_code}"
                
                if base_key not in exam_groups:
                    exam_groups[base_key] = []
                
                file_path = os.path.join(provider_path, exam_file)
                exam_data = load_exam_file(file_path)
                
                exam_groups[base_key].append({
                    'topic_number': topic_number,
                    'data': exam_data,
                    'file_name': exam_file
                })
                logger.info(f"Loaded exam file: {exam_file}")
                
            except Exception as e:
                logger.error(f"Error processing exam file {exam_file}: {str(e)}")
                continue
        
        # Process each exam group
        for base_key, topic_files in exam_groups.items():
            try:
                process_exam_group(session, provider, base_key, topic_files, stats)
            except Exception as e:
                logger.error(f"Error processing exam group {base_key}: {str(e)}")
                continue
                
    except Exception as e:
        logger.error(f"Error processing provider {provider_name}: {str(e)}")
        raise

def process_exam_group(session, provider, base_key, topic_files, stats):
    """Process a group of topic files belonging to the same exam."""
    try:
        exam_title, exam_code, _ = parse_exam_file(base_key)
        display_title = get_exam_title_from_code(exam_title, exam_code)
        exam_id = f"{provider.name}-{exam_title}-code-{exam_code}"
        
        # Create or update exam
        exam = Exam.query.get(exam_id)
        if not exam:
            total_questions = sum(len(topic['data']) for topic in topic_files)
            exam = Exam(
                id=exam_id,
                title=display_title,
                total_questions=total_questions,
                provider_id=provider.id
            )
            session.add(exam)
            stats['exams_migrated'] += 1
            logger.info(f"Created new exam: {display_title}")
        
        # Process topics
        for topic_info in topic_files:
            topic = Topic.query.filter_by(
                exam_id=exam_id,
                number=topic_info['topic_number']
            ).first()
            
            if not topic:
                topic = Topic(
                    number=topic_info['topic_number'],
                    data=topic_info['data'],
                    exam_id=exam_id
                )
                session.add(topic)
                stats['topics_migrated'] += 1
                logger.info(f"Created topic {topic_info['topic_number']} for exam: {display_title}")
            else:
                topic.data = topic_info['data']
                logger.info(f"Updated topic {topic_info['topic_number']} for exam: {display_title}")
        
        session.flush()
        
    except Exception as e:
        logger.error(f"Error processing exam {exam_id}: {str(e)}")
        raise

def migrate_providers_to_db():
    """Main migration function with improved error handling and progress tracking."""
    start_time = datetime.now()
    logger.info(f"Starting provider migration at {start_time}")
    
    stats = {
        'providers_migrated': 0,
        'exams_migrated': 0,
        'topics_migrated': 0,
        'errors': []
    }
    
    try:
        root_dir = os.path.join(backend_dir, 'providers')
        if not os.path.exists(root_dir):
            raise FileNotFoundError(f"Providers directory not found at: {root_dir}")
            
        provider_dirs = [d for d in os.listdir(root_dir) 
                        if os.path.isdir(os.path.join(root_dir, d))]
        
        total_providers = len(provider_dirs)
        logger.info(f"Found {total_providers} provider directories")
        
        with session_scope() as session:
            for idx, provider_name in enumerate(provider_dirs, 1):
                provider_path = os.path.join(root_dir, provider_name)
                
                try:
                    logger.info(f"Processing provider {idx}/{total_providers}: {provider_name}")
                    process_provider(session, provider_path, provider_name, stats)
                    
                except Exception as e:
                    error_msg = f"Failed to process provider {provider_name}: {str(e)}"
                    stats['errors'].append(error_msg)
                    logger.error(error_msg)
                    continue
        
        # Log final statistics
        end_time = datetime.now()
        duration = end_time - start_time
        
        logger.info(f"""
Migration completed in {duration}:
- Providers migrated: {stats['providers_migrated']}
- Exams migrated: {stats['exams_migrated']}
- Topics migrated: {stats['topics_migrated']}
- Errors encountered: {len(stats['errors'])}
        """)
        
        if stats['errors']:
            logger.warning("The following errors occurred during migration:")
            for error in stats['errors']:
                logger.warning(error)
                
    except Exception as e:
        logger.error(f"Fatal error during migration: {str(e)}")
        raise

if __name__ == '__main__':
    logger.info("Starting provider migration script...")
    try:
        with app.app_context():
            migrate_providers_to_db()
        logger.info("Provider migration completed successfully")
    except Exception as e:
        logger.error(f"Provider migration failed: {str(e)}")
        sys.exit(1)