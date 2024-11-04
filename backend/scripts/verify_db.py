# backend/scripts/verify_db.py

import os
import sys
from pathlib import Path

script_dir = Path(__file__).resolve().parent
backend_dir = script_dir.parent
sys.path.append(str(backend_dir))

from app import app, db
from models import Provider, Exam, Topic
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def verify_database():
    """Verify the database state and show statistics."""
    with app.app_context():
        providers = Provider.query.all()
        logger.info(f"\nTotal Providers: {len(providers)}")
        
        provider_stats = []
        total_exams = 0
        total_topics = 0
        
        for provider in providers:
            exam_count = len(provider.exams)
            topic_count = db.session.query(Topic).join(Exam).filter(Exam.provider_id == provider.id).count()
            
            total_exams += exam_count
            total_topics += topic_count
            
            provider_stats.append({
                'name': provider.name,
                'exams': exam_count,
                'topics': topic_count,
                'is_popular': provider.is_popular
            })
        
        logger.info("\nDatabase Summary:")
        logger.info(f"Total Providers: {len(providers)}")
        logger.info(f"Total Exams: {total_exams}")
        logger.info(f"Total Topics: {total_topics}")
        
        popular_providers = [p for p in provider_stats if p['is_popular']]
        logger.info("\nPopular Providers:")
        for p in popular_providers:
            logger.info(f"- {p['name']}: {p['exams']} exams, {p['topics']} topics")
        
        logger.info("\nTop 5 Providers by Exam Count:")
        top_providers = sorted(provider_stats, key=lambda x: x['exams'], reverse=True)[:5]
        for p in top_providers:
            logger.info(f"- {p['name']}: {p['exams']} exams, {p['topics']} topics")
        
        logger.info("\nVerifying Data Relationships:")
        orphaned_exams = Exam.query.filter(~Exam.provider_id.in_([p.id for p in providers])).count()
        orphaned_topics = Topic.query.filter(~Topic.exam_id.in_([e.id for e in Exam.query.all()])).count()
        
        if orphaned_exams:
            logger.warning(f"Found {orphaned_exams} exams without providers!")
        if orphaned_topics:
            logger.warning(f"Found {orphaned_topics} topics without exams!")
        
        if not orphaned_exams and not orphaned_topics:
            logger.info("✓ All relationships are valid")

if __name__ == '__main__':
    verify_database()