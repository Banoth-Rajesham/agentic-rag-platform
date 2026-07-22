import os
import json
import urllib.request
from src.config.settings import GROQ_API_KEY

def call_groq_llm(prompt: str, system_prompt: str = "You are a helpful medical assistant.") -> str:
    """
    Call Groq API using standard urllib to keep dependencies to a minimum.
    """
    if not GROQ_API_KEY:
        print("GROQ_API_KEY not found in settings or environment.")
        return ""
        
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
        "response_format": {"type": "json_object"}
    }
    
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers=headers,
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            return res_data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Error calling Groq API: {e}")
        return ""
