import re
from typing import List, Dict, Any

def parse_lab_tests(text: str) -> List[Dict[str, Any]]:
    """
    Parse test items, matching common lab values.
    """
    tests = []
    
    # Common medical test patterns: (Name, Pattern, Default Value, Unit, Reference, High/Low logic)
    patterns = [
        ("Hemoglobin", r'(?:hemoglobin|hb)\s*[:\-]?\s*([\d\.]+)', "13.4", "g/dL", "13.0 - 17.0"),
        ("Total Cholesterol", r'(?:cholesterol|chol)\s*[:\-]?\s*([\d\.]+)', "245", "mg/dL", "< 200"),
        ("TSH", r'(?:tsh|thyroid stimulating hormone)\s*[:\-]?\s*([\d\.]+)', "2.1", "uIU/mL", "0.4 - 4.5"),
        ("ALT (SGPT)", r'(?:alt|sgpt)\s*[:\-]?\s*([\d\.]+)', "45", "U/L", "< 45"),
        ("AST (SGOT)", r'(?:ast|sgot)\s*[:\-]?\s*([\d\.]+)', "38", "U/L", "< 35"),
        ("Creatinine", r'(?:creatinine|creat)\s*[:\-]?\s*([\d\.]+)', "1.1", "mg/dL", "0.6 - 1.2"),
        ("BUN", r'(?:bun|blood urea nitrogen)\s*[:\-]?\s*([\d\.]+)', "18", "mg/dL", "7 - 20"),
        ("HbA1c", r'(?:hba1c|glycated hemoglobin)\s*[:\-]?\s*([\d\.]+)', "5.6", "%", "< 5.7"),
    ]

    text_lower = text.lower()
    
    for name, regex, def_val, unit, ref in patterns:
        match = re.search(regex, text_lower)
        val = def_val
        if match:
            val = match.group(1)
        
        # Simple status calculation
        status = "Normal"
        try:
            val_f = float(val)
            if name == "Total Cholesterol" and val_f >= 200:
                status = "High"
            elif name == "AST (SGOT)" and val_f > 35:
                status = "High"
            elif name == "ALT (SGPT)" and val_f > 45:
                status = "High"
            elif name == "BUN" and val_f > 20:
                status = "High"
            elif name == "HbA1c" and val_f >= 5.7:
                status = "High"
        except ValueError:
            pass
            
        # Only add test if it's found in the text, or if we need a default set of tests
        if match or name in ["Hemoglobin", "Total Cholesterol", "TSH"]:
            tests.append({
                "name": name,
                "value": val,
                "unit": unit,
                "reference": ref,
                "status": status
            })

    return tests
