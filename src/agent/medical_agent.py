import json
from typing import Dict, Any
from src.rag.rag_service import retrieve_rag_context
from src.llms.groq_service import call_groq_llm
from src.parsers.report_parser import parse_report_to_structured_data

def run_medical_agent(report_text: str) -> Dict[str, Any]:
    """
    Medical Agent: Integrates RAG lookup with parser or LLM analysis.
    """
    # 1. RAG - retrieve relevant medical guidelines
    context = retrieve_rag_context(report_text)
    
    # 2. Extract structured fields locally first as a solid backup
    local_data = parse_report_to_structured_data(report_text)
    
    # 3. Compile prompt for LLM agent reasoning if API key exists
    system_prompt = (
        "You are an expert Medical Diagnostic Agent. Parse the patient report text and reference guidelines. "
        "Return a valid JSON object matching the schemas.patient, schemas.tests, schemas.summary structure. "
        "JSON format must strictly contain keys: patient, tests, summary, organ, risk_level, recommendations."
    )
    
    prompt = (
        f"Patient Report Text:\n{report_text}\n\n"
        f"Retrieved Reference Guidelines:\n{context}\n\n"
        f"Parsed Local Structure:\n{json.dumps(local_data, indent=2)}\n\n"
        "Refine and enhance the local structure using the guidelines. Output final refined JSON only."
    )
    
    # Try calling LLM, fallback to local parsed data if it fails or API key is absent
    llm_response = call_groq_llm(prompt, system_prompt)
    if llm_response:
        try:
            enhanced_data = json.loads(llm_response)
            # Ensure raw_text is populated
            enhanced_data["raw_text"] = report_text
            return enhanced_data
        except Exception as e:
            print(f"Agent failed to parse LLM JSON: {e}. Falling back to local parser.")
            
    return local_data
