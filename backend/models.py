# backend/models.py

from datetime import datetime
from app import db

class Provider(db.Model):
    __tablename__ = 'provider'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    is_popular = db.Column(db.Boolean, default=False)
    exams = db.relationship('Exam', backref='provider', lazy=True)

class Exam(db.Model):
    __tablename__ = 'exam'
    id = db.Column(db.String(255), primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    progress = db.Column(db.Integer, default=0)
    total_questions = db.Column(db.Integer, default=0)
    provider_id = db.Column(db.Integer, db.ForeignKey('provider.id'), nullable=False)
    topics = db.relationship('Topic', backref='exam', lazy=True)
    user_preferences = db.relationship('UserPreference', backref='exam', lazy=True)
    favorites = db.relationship('FavoriteQuestion', backref='exam', lazy=True)
    user_answers = db.relationship('UserAnswer', backref='exam', lazy=True)
    attempts = db.relationship('ExamAttempt', backref='exam', lazy=True)
    visits = db.relationship('ExamVisit', backref='exam', lazy=True)

class Topic(db.Model):
    __tablename__ = 'topic'
    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.Integer, nullable=False)
    data = db.Column(db.JSON, nullable=False)
    exam_id = db.Column(db.String(255), db.ForeignKey('exam.id'), nullable=False)

class UserPreference(db.Model):
    __tablename__ = 'user_preference'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    last_visited_exam = db.Column(db.String(255), db.ForeignKey('exam.id'))
    is_sidebar_collapsed = db.Column(db.Boolean, default=False)

    user = db.relationship('User', backref=db.backref('preferences', lazy=True))

class FavoriteQuestion(db.Model):
    __tablename__ = 'favorite_question'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    exam_id = db.Column(db.String(255), db.ForeignKey('exam.id'), nullable=False)
    topic_number = db.Column(db.Integer, nullable=False)
    question_index = db.Column(db.Integer, nullable=False)

    user = db.relationship('User', backref=db.backref('favorites', lazy=True))

    __table_args__ = (
        db.UniqueConstraint('user_id', 'exam_id', 'topic_number', 'question_index', name='unique_favorite_question'),
    )

class UserAnswer(db.Model):
    __tablename__ = 'user_answer'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    exam_id = db.Column(db.String(255), db.ForeignKey('exam.id'), nullable=False)
    topic_number = db.Column(db.Integer, nullable=False)
    question_index = db.Column(db.Integer, nullable=False)
    selected_options = db.Column(db.JSON, nullable=False)

    user = db.relationship('User', backref=db.backref('answers', lazy=True))

    __table_args__ = (
        db.UniqueConstraint('user_id', 'exam_id', 'topic_number', 'question_index', name='unique_user_answer'),
    )

class ExamAttempt(db.Model):
    __tablename__ = 'exam_attempt'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    exam_id = db.Column(db.String(255), db.ForeignKey('exam.id'), nullable=False)
    score = db.Column(db.Float, nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    correct_answers = db.Column(db.Integer, nullable=False)
    incorrect_questions = db.Column(db.JSON, nullable=False)
    attempt_date = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('attempts', lazy=True))

    __table_args__ = (
        db.UniqueConstraint('user_id', 'exam_id', 'attempt_date', name='unique_exam_attempt'),
    )

class ExamVisit(db.Model):
    __tablename__ = 'exam_visit'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    exam_id = db.Column(db.String(255), db.ForeignKey('exam.id'), nullable=False)
    first_visit_date = db.Column(db.DateTime, default=datetime.utcnow)
    last_visit_date = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('visits', lazy=True))

    __table_args__ = (
        db.UniqueConstraint('user_id', 'exam_id', name='unique_exam_visit'),
    )