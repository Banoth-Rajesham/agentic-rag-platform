from typing import List, Dict, Any

def generate_recommendations(organ: str, abnormal_count: int) -> Dict[str, Any]:
    """
    Generate recovery timelines, risk levels, and recommendations based on organ classification.
    """
    risk_level = "Low"
    if abnormal_count > 0:
        risk_level = "Moderate"
    if abnormal_count > 2:
        risk_level = "High"

    # Default lookup rules
    rec_map = {
        "Liver": [
            "Reduce alcohol and fatty food intake.",
            "Supplement with Silymarin (Milk Thistle) 200mg daily.",
            "Eat antioxidant-rich cruciferous vegetables daily."
        ],
        "Kidneys": [
            "Stay hyper-hydrated (drink 3L water daily).",
            "Limit oxalate-rich foods like spinach and nuts.",
            "Reduce animal protein and sodium intake."
        ],
        "Heart": [
            "Follow a low-sodium cardiac diet (< 1500mg daily).",
            "Drink 120ml organic beetroot juice daily.",
            "Perform 150 mins of Zone-2 exercise weekly."
        ],
        "Thyroid": [
            "Monitor TSH levels and consult an endocrinologist.",
            "Include selenium and zinc in diet.",
            "Limit goitrogen consumption."
        ],
        "Diabetes": [
            "Limit carbohydrates and refined sugar intake.",
            "Monitor blood sugar levels regularly.",
            "Engage in 15-minute walks after meals."
        ],
        "General": [
            "Maintain a balanced diet.",
            "Drink enough water daily.",
            "Get 7-8 hours of sleep."
        ]
    }

    return {
        "risk_level": risk_level,
        "recommendations": rec_map.get(organ, rec_map["General"])
    }
