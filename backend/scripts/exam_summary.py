# backend/scripts/exam_summary.py

import os
import json

base_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'providers')

exam_providers = []
empty_folders = []
total_question_count = 0
provider_question_counts = {}

def count_questions_in_exam_file(file_path):
    try:
        with open(file_path, 'r') as file:
            data = json.load(file)
            return len(data)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return 0

for provider in os.listdir(base_dir):
    provider_path = os.path.join(base_dir, provider)
    
    if os.path.isdir(provider_path):
        exam_files = []
        provider_total_questions = 0
        exam_names = set()
        
        for root, dirs, files in os.walk(provider_path):
            exam_files.extend([f for f in files if f.endswith('.json')])

        if not exam_files:
            empty_folders.append(provider)
        else:
            for exam_file in exam_files:
                exam_file_path = os.path.join(root, exam_file)
                exam_name = "__".join(exam_file.split("__")[:-1]) if "__topic" in exam_file else exam_file
                if exam_name not in exam_names:
                    exam_names.add(exam_name)
                provider_total_questions += count_questions_in_exam_file(exam_file_path)
            
            provider_question_counts[provider] = {
                "total_questions": provider_total_questions,
                "total_exams": len(exam_names)
            }
            total_question_count += provider_total_questions
        exam_providers.append(provider)

ranked_providers = sorted(provider_question_counts.items(), key=lambda x: x[1]['total_questions'], reverse=True)

summary_path = os.path.join(os.path.dirname(__file__), "exam_summary.txt")
with open(summary_path, "w") as summary_file:
    summary_file.write(f"Total number of exam provider folders: {len(exam_providers)}\n")
    summary_file.write(f"Total number of questions across all exam providers: {total_question_count}\n")
    summary_file.write("Empty folders (no exams):\n")
    for folder in empty_folders:
        summary_file.write(f"  - {folder}\n")
    
    summary_file.write("\nRanking of providers by total number of questions (highest to lowest):\n")
    for provider, data in ranked_providers:
        summary_file.write(f"{provider}: {data['total_questions']} questions, {data['total_exams']} exams\n")

print(f"Summary report has been generated as {summary_path}")