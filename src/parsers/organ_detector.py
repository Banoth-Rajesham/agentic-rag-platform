def detect_organ(text: str) -> str:
    """
    Detect the target organ based on keywords in the report text.
    """
    text_lower = text.lower()
    if any(k in text_lower for k in ["bilirubin", "sgot", "sgpt", "ast", "alt", "hepatomegaly", "liver"]):
        return "Liver"
    elif any(k in text_lower for k in ["creatinine", "urea", "bun", "lithiasis", "kidney", "renal"]):
        return "Kidneys"
    elif any(k in text_lower for k in ["cholesterol", "triglyceride", "ldl", "hdl", "ecg", "cardiac", "arrhythmia", "bp"]):
        return "Heart"
    elif any(k in text_lower for k in ["tsh", "t3", "t4", "thyroid"]):
        return "Thyroid"
    elif any(k in text_lower for k in ["hba1c", "glucose", "sugar", "diabetes"]):
        return "Diabetes"
    return "General"
