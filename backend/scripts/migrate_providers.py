# backend/scripts/migrate_providers.py

import os
import sys
from pathlib import Path

script_dir = Path(__file__).resolve().parent
backend_dir = script_dir.parent
sys.path.append(str(backend_dir))

import json
import re
import logging
from app import app, db
from models import Provider, Exam, Topic
from sqlalchemy.exc import SQLAlchemyError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def parse_exam_file(filename):
    """Parse exam filename to extract title, code and topic number."""
    filename = filename.replace('.json', '')
    
    topic_number = 1
    topic_match = re.search(r'__topic-(\d+)', filename)
    if topic_match:
        topic_number = int(topic_match.group(1))
        filename = re.sub(r'__topic-\d+', '', filename)
    
    code_match = re.search(r'-code-([^_]+)', filename)
    exam_code = ''
    if code_match:
        exam_code = code_match.group(1)
        exam_title = filename.split('-code-')[0]
    else:
        exam_title = filename
    
    return exam_title, exam_code, topic_number

def get_exam_title_from_code(exam_title, exam_code):
    """Format exam title with code."""
    if exam_code:
        return f"{exam_code}: {exam_title}"
    return exam_title

def migrate_providers_to_db():
    """Migrates exam data to database, properly handling multi-topic exams."""
    try:
        root_dir = os.path.join(backend_dir, 'providers')
        logger.info(f"Looking for providers in: {root_dir}")
        
        if not os.path.exists(root_dir):
            logger.error(f"Providers directory not found at: {root_dir}")
            return

        stats = {
            'providers_migrated': 0,
            'exams_migrated': 0,
            'topics_migrated': 0
        }

        # List all provider directories
        provider_dirs = [d for d in os.listdir(root_dir) 
                        if os.path.isdir(os.path.join(root_dir, d))]
        logger.info(f"Found {len(provider_dirs)} provider directories")

        for provider_name in provider_dirs:
            provider_path = os.path.join(root_dir, provider_name)
            logger.info(f"Processing provider: {provider_name}")

            # Create or get provider
            provider = Provider.query.filter_by(name=provider_name).first()
            if not provider:
                provider = Provider(
                    name=provider_name,
                    is_popular=provider_name.lower() in ['amazon', 'microsoft', 'google']
                )
                db.session.add(provider)
                db.session.commit()
                logger.info(f"Created new provider: {provider_name}")
                stats['providers_migrated'] += 1
            else:
                logger.info(f"Using existing provider: {provider_name}")

            # Group exam files by base exam name
            exam_groups = {}
            exam_files = [f for f in os.listdir(provider_path) 
                         if f.endswith('.json')]
            logger.info(f"Found {len(exam_files)} exam files for {provider_name}")

            for exam_file in exam_files:
                exam_title, exam_code, topic_number = parse_exam_file(exam_file)
                base_key = f"{exam_title}-code-{exam_code}"
                
                if base_key not in exam_groups:
                    exam_groups[base_key] = []
                
                file_path = os.path.join(provider_path, exam_file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        exam_data = json.load(f)
                    
                    exam_groups[base_key].append({
                        'topic_number': topic_number,
                        'data': exam_data,
                        'file_name': exam_file
                    })
                    logger.info(f"Loaded exam file: {exam_file}")
                except Exception as e:
                    logger.error(f"Error loading exam file {exam_file}: {str(e)}")
                    continue

            # Process each exam group
            for base_key, topic_files in exam_groups.items():
                exam_title, exam_code, _ = parse_exam_file(base_key)
                display_title = get_exam_title_from_code(exam_title, exam_code)
                exam_id = f"{provider.name}-{exam_title}-code-{exam_code}"

                try:
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
                        db.session.add(exam)
                        stats['exams_migrated'] += 1
                        logger.info(f"Created new exam: {display_title}")
                    else:
                        logger.info(f"Updating existing exam: {display_title}")

                    # Create or update topics
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
                            db.session.add(topic)
                            stats['topics_migrated'] += 1
                            logger.info(f"Created new topic {topic_info['topic_number']} for exam: {display_title}")
                        else:
                            topic.data = topic_info['data']
                            logger.info(f"Updated topic {topic_info['topic_number']} for exam: {display_title}")

                    db.session.commit()
                except Exception as e:
                    logger.error(f"Error processing exam {exam_id}: {str(e)}")
                    db.session.rollback()
                    continue

        logger.info(f"""
        Migration completed successfully:
        - Providers migrated: {stats['providers_migrated']}
        - Exams migrated: {stats['exams_migrated']}
        - Topics migrated: {stats['topics_migrated']}
        """)

    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
        db.session.rollback()
        raise

if __name__ == '__main__':
    logger.info("Starting provider migration...")
    with app.app_context():
        migrate_providers_to_db()
    logger.info("Provider migration completed.")