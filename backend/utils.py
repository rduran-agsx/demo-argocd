# backend/utils.py

def format_display_title(exam_title):
    """
    Formats exam title for display by removing the exam code portion.
    Example: 'AWS Certified Solutions Architect Associate-code-SAA-C03' 
    becomes 'AWS Certified Solutions Architect Associate'
    """
    if '-code-' in exam_title:
        return exam_title.split('-code-')[0]
    return exam_title

def get_exam_order(exam_title, provider_name):
    """
    Get the display order for exams based on provider and exam title.
    Used for consistent sorting of exams in the UI.
    """
    if provider_name.lower() == 'amazon':
        order_map = {
            'AWS Certified Cloud Practitioner': 1,
            'AWS Certified Solutions Architect Associate': 2,
            'AWS Certified Developer Associate': 3,
            'AWS Certified SysOps Administrator Associate': 4,
            'AWS Certified Solutions Architect Professional': 5,
            'AWS Certified DevOps Engineer Professional': 6,
            'AWS Certified Advanced Networking Specialty': 7,
            'AWS Certified Data Analytics Specialty': 8,
            'AWS Certified Database Specialty': 9,
            'AWS Certified Machine Learning Specialty': 10,
            'AWS Certified Security Specialty': 11,
            'AWS Certified SAP On AWS Specialty': 12,
            'AWS Certified Data Engineer Associate': 13,
            'AWS Certified Alexa Skill Builder Specialty': 14,
            'AWS Certified Big Data Specialty': 15,
        }
        
        version_priority = {
            'C03': 1,
            'C02': 2,
            'C01': 3,
            'C00': 4,
        }
        
        base_order = 100
        for key, value in order_map.items():
            if key.lower() in exam_title.lower():
                base_order = value
                break
        
        for version, priority in version_priority.items():
            if version in exam_title:
                return base_order * 10 + priority
        
        return base_order * 10

    elif provider_name.lower() == 'google':
        order_map = {
            'Google Cloud Digital Leader': 1,
            'Google Associate Cloud Engineer': 2,
            'Google Professional Cloud Architect': 3,
            'Google Professional Data Engineer': 4,
            'Google Professional Cloud Developer': 5,
            'Google Professional Cloud Network Engineer': 6,
            'Google Professional Cloud Security Engineer': 7,
            'Google Professional Cloud DevOps Engineer': 8,
            'Google Professional Machine Learning Engineer': 9,
            'Google Professional Cloud Database Engineer': 10,
            'Google Professional Google Workspace Administrator': 11,
            'Google Professional ChromeOS Administrator': 12,
            'Google G Suite Certification': 13,
            'Google Professional Collaboration Engineer': 14,
            'Google Search Advertising': 15,
            'Google Video Advertising': 16,
            'Google Ads Individual Qualification': 17,
            'Google Analytics Individual Qualification': 18,
            'Google AdWords Fundamentals': 19,
        }
        
        # Special handling for specific exams
        if 'Google Professional ChromeOS Administrator' in exam_title:
            return 12
        elif 'Google G Suite Certification' in exam_title:
            return 13
        elif 'Google Professional Collaboration Engineer' in exam_title:
            return 14
        elif 'Google Analytics Individual Qualification' in exam_title:
            return 18
        elif 'Google AdWords Fundamentals' in exam_title:
            return 19
        
        for key, value in order_map.items():
            if key.lower() in exam_title.lower():
                return value
        return 100

    return 0