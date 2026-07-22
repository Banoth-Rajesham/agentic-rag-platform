from typing import List, Dict, Any

def generate_summary(tests: List[Dict[str, Any]], organ: str) -> Dict[str, Any]:
    """
    Generate overall summary, identifying abnormal/critical tests.
    """
    abnormal = []
    critical = []
    
    for test in tests:
        if test["status"] in ["High", "Low"]:
            abnormal.append(test["name"])
            
            # Simple critical logic (e.g. extremely high cholesterol or ALT)
            try:
                val = float(test["value"])
                if test["name"] == "Total Cholesterol" and val > 280:
                    critical.append(test["name"])
                elif "ALT" in test["name"] and val > 150:
                    critical.append(test["name"])
            except ValueError:
                pass

    overall = f"Analyzed parameters for {organ} functions."
    if abnormal:
        overall += f" Patient results show elevations in: {', '.join(abnormal)}."
    else:
        overall += " All analyzed parameters are within normal reference ranges."

    return {
        "abnormal_tests": abnormal,
        "critical_values": critical,
        "overall_summary": overall
    }
