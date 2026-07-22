import re
from typing import Dict, Any

def parse_patient_info(text: str) -> Dict[str, Any]:
    """
    Extract patient name, age, gender, lab, and doctor info using simple regexes.
    """
    text_lower = text.lower()
    
    name = "John Doe"
    name_match = re.search(r'(?:name|patient)\s*[:\-]?\s*([A-Za-z\s\.]{3,30})', text, re.I)
    if name_match:
        name = name_match.group(1).strip()
        
    age = "35 Years"
    age_match = re.search(r'(?:age|yr|years)\s*[:\-]?\s*(\d+\s*(?:years|yrs|m|w)?)', text, re.I)
    if age_match:
        age = age_match.group(1).strip()

    gender = "Male"
    if "female" in text_lower or " F " in text or "/f" in text_lower:
        gender = "Female"

    lab_name = "Diagnostic Lab"
    lab_match = re.search(r'(?:lab|laboratory|clinic)\s*[:\-]?\s*([A-Za-z\s\.]{3,30})', text, re.I)
    if lab_match:
        lab_name = lab_match.group(1).strip()

    doctor_name = "Dr. Self Referred"
    doc_match = re.search(r'(?:doctor|physician|dr\.)\s*[:\-]?\s*([A-Za-z\s\.]{3,30})', text, re.I)
    if doc_match:
        doctor_name = "Dr. " + doc_match.group(1).strip()

    return {
        "name": name,
        "age": age,
        "gender": gender,
        "lab_name": lab_name,
        "doctor_name": doctor_name,
        "sample_date": "N/A",
        "report_date": "N/A",
        "report_status": "Final"
    }
