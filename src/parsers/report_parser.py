from typing import Dict, Any
from src.parsers.patient_parser import parse_patient_info
from src.parsers.lab_parser import parse_lab_tests
from src.parsers.organ_detector import detect_organ
from src.parsers.summary_generator import generate_summary
from src.parsers.recommendation import generate_recommendations

def parse_report_to_structured_data(text: str) -> Dict[str, Any]:
    """
    Coordinate all individual parsing modules to construct the full structured report dict.
    """
    patient = parse_patient_info(text)
    tests = parse_lab_tests(text)
    organ = detect_organ(text)
    summary = generate_summary(tests, organ)
    recs = generate_recommendations(organ, len(summary["abnormal_tests"]))

    return {
        "patient": patient,
        "tests": tests,
        "summary": summary,
        "organ": organ,
        "risk_level": recs["risk_level"],
        "recommendations": recs["recommendations"],
        "raw_text": text
    }
