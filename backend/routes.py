# backend/routes.py

from flask import jsonify, abort, request
from app import app, db
from models import Provider, Exam, Topic, UserPreference, FavoriteQuestion, UserAnswer, ExamAttempt, ExamVisit
from utils import get_exam_order, format_display_title
from provider_categories import get_provider_categories, get_total_providers, get_total_categories
from urllib.parse import unquote
from sqlalchemy import func, text
from datetime import datetime

def get_provider_description(provider_name):
    """Get provider description from provider_categories data"""
    categories = get_provider_categories()
    for category in categories:
        for provider in category['providers']:
            if provider['name'] == provider_name:
                return provider['description']
    return f"Official certification exams from {provider_name}"

@app.route('/api/providers', methods=['GET'])
def get_providers():
    page = request.args.get('page', type=int)
    per_page = request.args.get('per_page', type=int)
    
    provider_stats = db.session.query(
        Provider.id,
        func.count(Exam.id).label('total_exams'),
        func.sum(Exam.total_questions).label('total_questions')
    ).join(
        Exam, Provider.id == Exam.provider_id, isouter=True
    ).group_by(Provider.id).all()
    
    stats_lookup = {
        id: {
            'total_exams': total_exams or 0,
            'total_questions': total_questions or 0
        }
        for id, total_exams, total_questions in provider_stats
    }
    
    if page is None or per_page is None:
        providers = Provider.query.all()
        return jsonify({
            'providers': [
                {
                    'name': provider.name,
                    'description': get_provider_description(provider.name),
                    'image': f"/api/placeholder/100/100",
                    'totalExams': stats_lookup.get(provider.id, {}).get('total_exams', 0),
                    'totalQuestions': stats_lookup.get(provider.id, {}).get('total_questions', 0),
                    'exams': sorted([
                        {
                            'id': f"{provider.name}-{exam.title}",
                            'title': exam.title,
                            'progress': exam.progress,
                            'totalQuestions': exam.total_questions,
                            'order': get_exam_order(exam.title, provider.name)
                        } for exam in provider.exams
                    ], key=lambda x: (x['order'], x['title'])),
                    'isPopular': provider.is_popular
                } for provider in providers
            ],
            'total': len(providers),
            'pages': 1,
            'current_page': 1
        })
    else:
        providers = Provider.query.paginate(page=page, per_page=per_page, error_out=False)
        return jsonify({
            'providers': [
                {
                    'name': provider.name,
                    'description': get_provider_description(provider.name),
                    'image': f"/api/placeholder/100/100",
                    'totalExams': stats_lookup.get(provider.id, {}).get('total_exams', 0),
                    'totalQuestions': stats_lookup.get(provider.id, {}).get('total_questions', 0),
                    'exams': sorted([
                        {
                            'id': f"{provider.name}-{exam.title}",
                            'title': exam.title,
                            'progress': exam.progress,
                            'totalQuestions': exam.total_questions,
                            'order': get_exam_order(exam.title, provider.name)
                        } for exam in provider.exams
                    ], key=lambda x: (x['order'], x['title'])),
                    'isPopular': provider.is_popular
                } for provider in providers.items
            ],
            'total': providers.total,
            'pages': providers.pages,
            'current_page': page
        })

@app.route('/api/exams/<exam_id>', methods=['GET'])
def get_exam(exam_id):
    if exam_id == 'undefined' or '-' not in exam_id:
        abort(400, description="Invalid exam ID")
    
    exam_id = unquote(exam_id)
    
    provider_name, exam_title_with_code = exam_id.split('-', 1)
    
    provider = Provider.query.filter_by(name=provider_name).first()
    if not provider:
        abort(404, description="Provider not found")
    
    exam = Exam.query.filter_by(
        provider_id=provider.id,
        title=exam_title_with_code
    ).first()
    
    if not exam:
        exam = Exam.query.filter(
            Exam.provider_id == provider.id,
            Exam.id.ilike(f"{provider_name}-{exam_title_with_code}%")
        ).first()
    
    if not exam:
        abort(404, description="Exam not found")
    
    exam_data = {
        'id': exam.id,
        'provider': provider.name,
        'examTitle': exam.title.split(': ')[1] if ': ' in exam.title else exam.title,
        'examCode': exam.title.split(': ')[0] if ': ' in exam.title else '',
        'topics': {topic.number: topic.data for topic in exam.topics}
    }
    
    try:
        user_id = 1
        
        visit = ExamVisit.query.filter_by(
            user_id=user_id,
            exam_id=exam.id
        ).first()
        
        if not visit:
            visit = ExamVisit(
                user_id=user_id,
                exam_id=exam.id
            )
            db.session.add(visit)
        else:
            visit.last_visit_date = datetime.utcnow()
        
        preference = UserPreference.query.filter_by(user_id=user_id).first()
        if preference:
            preference.last_visited_exam = exam.id
        else:
            preference = UserPreference(user_id=user_id, last_visited_exam=exam.id)
            db.session.add(preference)
        
        db.session.commit()
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error tracking exam visit: {str(e)}")
    
    return jsonify(exam_data)

@app.route('/api/user-preference', methods=['GET', 'POST'])
def user_preference():
    user_id = 1

    if request.method == 'GET':
        preference = UserPreference.query.filter_by(user_id=user_id).first()
        if preference:
            return jsonify({'last_visited_exam': preference.last_visited_exam})
        return jsonify({'last_visited_exam': None})

    elif request.method == 'POST':
        data = request.json
        preference = UserPreference.query.filter_by(user_id=user_id).first()
        if preference:
            preference.last_visited_exam = data['last_visited_exam']
        else:
            preference = UserPreference(user_id=user_id, last_visited_exam=data['last_visited_exam'])
            db.session.add(preference)
        db.session.commit()
        return jsonify({'message': 'Preference updated successfully'})

@app.route('/api/favorite', methods=['POST'])
def favorite_question():
    data = request.json
    user_id = 1
    exam_id = unquote(data['exam_id'])
    topic_number = data['topic_number']
    question_index = data['question_index']

    exam = Exam.query.filter_by(id=exam_id).first()
    if not exam:
        provider_name = exam_id.split('-')[0]
        exam_title = exam_id.split(':', 1)[1].strip() if ':' in exam_id else exam_id
        
        exam = Exam.query.filter(
            Exam.id.ilike(f"{provider_name}-%"),
            Exam.title.ilike(f"%{exam_title}%")
        ).first()
        
        if not exam:
            return jsonify({'error': 'Exam not found'}), 404
        
        exam_id = exam.id

    favorite = FavoriteQuestion.query.filter_by(
        user_id=user_id,
        exam_id=exam_id,
        topic_number=topic_number,
        question_index=question_index
    ).first()

    try:
        if favorite:
            db.session.delete(favorite)
            db.session.commit()
            return jsonify({'message': 'Question unfavorited successfully', 'is_favorite': False}), 200
        else:
            new_favorite = FavoriteQuestion(
                user_id=user_id,
                exam_id=exam_id,
                topic_number=topic_number,
                question_index=question_index
            )
            db.session.add(new_favorite)
            db.session.commit()
            return jsonify({'message': 'Question favorited successfully', 'is_favorite': True}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/favorites/<exam_id>', methods=['GET'])
def get_favorite_questions(exam_id):
    user_id = 1
    favorites = FavoriteQuestion.query.filter_by(user_id=user_id, exam_id=exam_id).order_by(FavoriteQuestion.topic_number, FavoriteQuestion.question_index).all()
    return jsonify({
        'favorites': [
            {
                'topic_number': fav.topic_number,
                'question_index': fav.question_index
            } for fav in favorites
        ]
    })

@app.route('/api/save-answer', methods=['POST'])
def save_answer():
    data = request.json
    user_id = 1
    exam_id = data['exam_id']
    topic_number = data['topic_number']
    question_index = data['question_index']
    selected_options = data['selected_options']

    user_answer = UserAnswer.query.filter_by(
        user_id=user_id,
        exam_id=exam_id,
        topic_number=topic_number,
        question_index=question_index
    ).first()

    if user_answer:
        user_answer.selected_options = selected_options
    else:
        user_answer = UserAnswer(
            user_id=user_id,
            exam_id=exam_id,
            topic_number=topic_number,
            question_index=question_index,
            selected_options=selected_options
        )
        db.session.add(user_answer)

    db.session.commit()
    return jsonify({'message': 'Answer saved successfully'}), 200

@app.route('/api/get-answers/<exam_id>', methods=['GET'])
def get_answers(exam_id):
    user_id = 1
    user_answers = UserAnswer.query.filter_by(user_id=user_id, exam_id=exam_id).all()
    return jsonify({
        'answers': [
            {
                'topic_number': answer.topic_number,
                'question_index': answer.question_index,
                'selected_options': answer.selected_options
            } for answer in user_answers
        ]
    })

@app.route('/api/submit-answers', methods=['POST'])
def submit_answers():
    data = request.json
    exam_id = unquote(data['exam_id'])
    user_answers = data['user_answers']
    
    exam = Exam.query.filter_by(id=exam_id).first()
    if not exam:
        provider_name = exam_id.split('-')[0]
        exam_title = exam_id.split(':', 1)[1].strip() if ':' in exam_id else exam_id
        
        exam = Exam.query.filter(
            Exam.id.ilike(f"{provider_name}-%"),
            Exam.title.ilike(f"%{exam_title}%")
        ).first()
        
        if not exam:
            return jsonify({'error': 'Exam not found'}), 404
        
        exam_id = exam.id

    if not exam:
        return jsonify({'error': 'Exam not found'}), 404

    total_questions = 0
    correct_answers = 0
    incorrect_questions = []

    for topic in exam.topics:
        topic_data = topic.data
        for question_index, question in enumerate(topic_data):
            total_questions += 1
            question_id = f"T{topic.number} Q{question_index + 1}"
            correct_answer = set(question['answer'])
            user_answer = set(user_answers.get(question_id, []))

            correct_indices = set(ord(letter.upper()) - ord('A') for letter in correct_answer)
            user_indices = set(int(index) for index in user_answer)

            if correct_indices == user_indices:
                correct_answers += 1
            else:
                incorrect_questions.append(question_id)

    score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
    passed = score >= 75

    try:
        exam_attempt = ExamAttempt(
            user_id=1,
            exam_id=exam_id,
            score=score,
            total_questions=total_questions,
            correct_answers=correct_answers,
            incorrect_questions=incorrect_questions,
            attempt_date=datetime.utcnow()
        )
        db.session.add(exam_attempt)
        db.session.commit()

        result = {
            'total_questions': total_questions,
            'correct_answers': correct_answers,
            'score': round(score, 2),
            'passed': passed,
            'incorrect_questions': incorrect_questions
        }

        return jsonify(result)
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/incorrect-questions/<exam_id>', methods=['GET'])
def get_incorrect_questions(exam_id):
    user_id = 1
    latest_attempt = ExamAttempt.query.filter_by(user_id=user_id, exam_id=exam_id).order_by(ExamAttempt.attempt_date.desc()).first()
    
    if not latest_attempt:
        return jsonify({'incorrect_questions': []})
    
    return jsonify({'incorrect_questions': latest_attempt.incorrect_questions})

@app.route('/api/exam-progress', methods=['GET'])
def get_exam_progress():
    user_id = 1
    
    base_query = db.session.query(Exam).distinct().join(
        Provider,
        Exam.provider_id == Provider.id
    )

    exam_queries = [
        base_query.join(UserAnswer, UserAnswer.exam_id == Exam.id).filter(UserAnswer.user_id == user_id),
        base_query.join(ExamAttempt, ExamAttempt.exam_id == Exam.id).filter(ExamAttempt.user_id == user_id),
        base_query.join(ExamVisit, ExamVisit.exam_id == Exam.id).filter(ExamVisit.user_id == user_id),
        base_query.join(UserPreference, UserPreference.last_visited_exam == Exam.id).filter(UserPreference.user_id == user_id)
    ]

    final_query = exam_queries[0]
    for query in exam_queries[1:]:
        final_query = final_query.union(query)

    user_exams = final_query.all()

    provider_data = {}
    for exam in user_exams:
        total_questions = exam.total_questions
        
        answered_questions = UserAnswer.query.filter_by(
            user_id=user_id,
            exam_id=exam.id
        ).count()
        
        progress = round((answered_questions / total_questions * 100) if total_questions > 0 else 0, 1)
        
        attempts = ExamAttempt.query.filter_by(
            user_id=user_id,
            exam_id=exam.id
        ).order_by(ExamAttempt.attempt_date.desc()).all()
        
        attempt_count = len(attempts)
        latest_grade = None
        average_score = 0
        status = "Not Attempted"
        
        if attempt_count > 0:
            latest_attempt = attempts[0]
            correct_answers = round((latest_attempt.score / 100) * latest_attempt.total_questions)
            latest_grade = {
                'score': correct_answers,
                'total': latest_attempt.total_questions
            }
            status = "Passed" if latest_attempt.score >= 75 else "Failed"
            average_score = round(sum(attempt.score for attempt in attempts) / attempt_count, 2)
        
        last_update = None
        if attempts:
            time_diff = datetime.utcnow() - attempts[0].attempt_date
            if time_diff.days == 0:
                if time_diff.seconds < 3600:
                    if time_diff.seconds < 300:
                        last_update = "Just now"
                    else:
                        minutes = time_diff.seconds // 60
                        last_update = f"{minutes} {'minute' if minutes == 1 else 'minutes'} ago"
                else:
                    hours = time_diff.seconds // 3600
                    last_update = f"{hours} {'hour' if hours == 1 else 'hours'} ago"
            elif time_diff.days == 1:
                last_update = "Yesterday"
            elif time_diff.days < 7:
                last_update = f"{time_diff.days} {'day' if time_diff.days == 1 else 'days'} ago"
            elif time_diff.days < 30:
                weeks = time_diff.days // 7
                last_update = f"{weeks} {'week' if weeks == 1 else 'weeks'} ago"
            else:
                months = time_diff.days // 30
                last_update = f"{months} {'month' if months == 1 else 'months'} ago"
        else:
            last_answer = UserAnswer.query.filter_by(
                user_id=user_id,
                exam_id=exam.id
            ).order_by(UserAnswer.id.desc()).first()
            
            if last_answer:
                last_update = "In Progress"
            else:
                visit = ExamVisit.query.filter_by(
                    user_id=user_id,
                    exam_id=exam.id
                ).first()
                
                if visit:
                    time_diff = datetime.utcnow() - visit.last_visit_date
                    if time_diff.days == 0:
                        if time_diff.seconds < 3600:
                            if time_diff.seconds < 300:
                                last_update = "Just now"
                            else:
                                minutes = time_diff.seconds // 60
                                last_update = f"{minutes} {'minute' if minutes == 1 else 'minutes'} ago"
                        else:
                            hours = time_diff.seconds // 3600
                            last_update = f"{hours} {'hour' if hours == 1 else 'hours'} ago"
                    elif time_diff.days == 1:
                        last_update = "Yesterday"
                    elif time_diff.days < 7:
                        last_update = f"{time_diff.days} {'day' if time_diff.days == 1 else 'days'} ago"
                    elif time_diff.days < 30:
                        weeks = time_diff.days // 7
                        last_update = f"{weeks} {'week' if weeks == 1 else 'weeks'} ago"
                    else:
                        months = time_diff.days // 30
                        last_update = f"{months} {'month' if months == 1 else 'months'} ago"
                else:
                    last_update = "Not Started"

        timestamp = None
        if attempts:
            timestamp = attempts[0].attempt_date.timestamp() * 1000
        elif 'visit' in locals() and visit:
            timestamp = visit.last_visit_date.timestamp() * 1000
        elif last_answer:
            timestamp = datetime.utcnow().timestamp() * 1000

        exam_data = {
            'id': exam.id,
            'exam': format_display_title(exam.title),
            'examType': 'Actual',
            'attempts': attempt_count,
            'averageScore': average_score,
            'progress': progress,
            'latestGrade': latest_grade or {
                'score': 0,
                'total': total_questions
            },
            'status': status,
            'timestamp': timestamp,
            'updated': last_update
        }
        
        provider_name = exam.provider.name
        if provider_name not in provider_data:
            provider_data[provider_name] = {
                'name': provider_name,
                'exams': [],
                'isPopular': exam.provider.is_popular
            }
        provider_data[provider_name]['exams'].append(exam_data)

        provider_data[provider_name]['exams'].sort(
            key=lambda x: x['timestamp'] if x['timestamp'] else 0,
            reverse=True
        )

    return jsonify({'providers': list(provider_data.values())})

@app.route('/api/track-exam-visit', methods=['POST'])
def track_exam_visit():
    data = request.json
    user_id = 1
    exam_id = data.get('exam_id')
    
    if not exam_id:
        return jsonify({'error': 'Exam ID is required'}), 400
        
    visit = ExamVisit.query.filter_by(
        user_id=user_id,
        exam_id=exam_id
    ).first()
    
    if not visit:
        visit = ExamVisit(
            user_id=user_id,
            exam_id=exam_id
        )
        db.session.add(visit)
    else:
        visit.last_visit_date = datetime.utcnow()
    
    db.session.commit()
    return jsonify({'message': 'Visit tracked successfully'}), 200

@app.route('/api/delete-exams', methods=['POST'])
def delete_exams():
    """Delete selected exams and their associated data"""
    data = request.json
    user_id = 1
    exam_ids = data.get('exam_ids', [])
    
    if not exam_ids:
        return jsonify({'error': 'No exam IDs provided'}), 400
    
    try:
        UserPreference.query.filter(
            UserPreference.user_id == user_id,
            UserPreference.last_visited_exam.in_(exam_ids)
        ).update({UserPreference.last_visited_exam: None}, synchronize_session=False)
        
        FavoriteQuestion.query.filter(
            FavoriteQuestion.user_id == user_id,
            FavoriteQuestion.exam_id.in_(exam_ids)
        ).delete(synchronize_session=False)
        
        UserAnswer.query.filter(
            UserAnswer.user_id == user_id,
            UserAnswer.exam_id.in_(exam_ids)
        ).delete(synchronize_session=False)
        
        ExamAttempt.query.filter(
            ExamAttempt.user_id == user_id,
            ExamAttempt.exam_id.in_(exam_ids)
        ).delete(synchronize_session=False)
        
        ExamVisit.query.filter(
            ExamVisit.user_id == user_id,
            ExamVisit.exam_id.in_(exam_ids)
        ).delete(synchronize_session=False)
        
        Exam.query.filter(Exam.id.in_(exam_ids)).update(
            {Exam.progress: 0}, 
            synchronize_session=False
        )
        
        db.session.commit()
        return jsonify({'message': 'Exams deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/delete-provider-exams', methods=['POST'])
def delete_provider_exams():
    """Delete all exams for specified providers"""
    data = request.json
    user_id = 1
    provider_names = data.get('provider_names', [])
    
    if not provider_names:
        return jsonify({'error': 'No provider names provided'}), 400
    
    try:
        exam_ids = db.session.query(Exam.id).join(Provider).filter(
            Provider.name.in_(provider_names)
        ).all()
        exam_ids = [eid[0] for eid in exam_ids]
        
        if not exam_ids:
            return jsonify({'message': 'No exams found for the specified providers'}), 200
        
        UserPreference.query.filter(
            UserPreference.user_id == user_id,
            UserPreference.last_visited_exam.in_(exam_ids)
        ).update({UserPreference.last_visited_exam: None}, synchronize_session=False)
        
        FavoriteQuestion.query.filter(
            FavoriteQuestion.user_id == user_id,
            FavoriteQuestion.exam_id.in_(exam_ids)
        ).delete(synchronize_session=False)
        
        UserAnswer.query.filter(
            UserAnswer.user_id == user_id,
            UserAnswer.exam_id.in_(exam_ids)
        ).delete(synchronize_session=False)
        
        ExamAttempt.query.filter(
            ExamAttempt.user_id == user_id,
            ExamAttempt.exam_id.in_(exam_ids)
        ).delete(synchronize_session=False)
        
        ExamVisit.query.filter(
            ExamVisit.user_id == user_id,
            ExamVisit.exam_id.in_(exam_ids)
        ).delete(synchronize_session=False)
        
        Exam.query.filter(Exam.id.in_(exam_ids)).update(
            {Exam.progress: 0}, 
            synchronize_session=False
        )
        
        db.session.commit()
        return jsonify({'message': 'Provider exams deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/delete-all-progress', methods=['POST'])
def delete_all_progress():
    """Delete all exam progress for the user"""
    user_id = 1
    
    try:
        UserPreference.query.filter_by(user_id=user_id).update(
            {UserPreference.last_visited_exam: None}, 
            synchronize_session=False
        )
        FavoriteQuestion.query.filter_by(user_id=user_id).delete(synchronize_session=False)
        UserAnswer.query.filter_by(user_id=user_id).delete(synchronize_session=False)
        ExamAttempt.query.filter_by(user_id=user_id).delete(synchronize_session=False)
        ExamVisit.query.filter_by(user_id=user_id).delete(synchronize_session=False)
        
        Exam.query.update({Exam.progress: 0}, synchronize_session=False)
        
        db.session.commit()
        return jsonify({'message': 'All progress deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/sidebar-state', methods=['GET'])
def get_sidebar_state():
    user_id = 1
    preference = UserPreference.query.filter_by(user_id=user_id).first()
    
    if preference:
        return jsonify({'is_collapsed': preference.is_sidebar_collapsed})
    return jsonify({'is_collapsed': False})

@app.route('/api/sidebar-state', methods=['POST'])
def update_sidebar_state():
    user_id = 1
    data = request.json
    is_collapsed = data.get('is_collapsed', False)
    
    preference = UserPreference.query.filter_by(user_id=user_id).first()
    if preference:
        preference.is_sidebar_collapsed = is_collapsed
    else:
        preference = UserPreference(
            user_id=user_id,
            is_sidebar_collapsed=is_collapsed
        )
        db.session.add(preference)
    
    db.session.commit()
    return jsonify({'message': 'Sidebar state updated successfully'})

@app.route('/api/provider-statistics', methods=['GET'])
def get_provider_statistics():
    """Get provider statistics and categories."""
    try:
        provider_stats = db.session.query(
            Provider.name,
            Provider.is_popular,
            func.count(Exam.id).label('total_exams'),
            func.sum(Exam.total_questions).label('total_questions')
        ).join(
            Exam, Provider.id == Exam.provider_id, isouter=True
        ).group_by(
            Provider.name,
            Provider.is_popular
        ).all()

        stats_lookup = {
            name: {
                'description': get_provider_description(name),
                'is_popular': is_popular,
                'total_exams': total_exams or 0,
                'total_questions': total_questions or 0
            }
            for name, is_popular, total_exams, total_questions in provider_stats
        }

        categories = get_provider_categories()

        for category in categories:
            category['providers'] = [
                {
                    **provider,
                    'totalExams': stats_lookup.get(provider['name'], {}).get('total_exams', 0),
                    'totalQuestions': stats_lookup.get(provider['name'], {}).get('total_questions', 0),
                    'isPopular': stats_lookup.get(provider['name'], {}).get('is_popular', provider.get('isPopular', False))
                }
                for provider in category['providers']
            ]

        return jsonify({
            "categories": categories,
            "totalProviders": get_total_providers(),
            "totalCategories": get_total_categories()
        })
    except Exception as e:
        print(f"Error in provider_statistics: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    
@app.route('/api/health')
def health_check():
    try:
        # try to query the database
        db.session.execute(text('SELECT 1'))
        return jsonify({'status': 'healthy', 'database': 'connected'}), 200
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'database': str(e)}), 500