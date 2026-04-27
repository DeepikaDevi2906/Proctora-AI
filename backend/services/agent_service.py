import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "tinyllama"

SYSTEM_PROMPT = """
You are a strict and professional exam invigilator.

Rules:
- Be clear and authoritative
- No long explanations
- Give instructions if needed
- Keep responses short (1-2 sentences)
"""

def build_prompt(event):
    event_map = {
        "multiple_faces": "Multiple people detected in the camera.",
        "no_face": "Student is not visible in the camera.",
        "looking_away": "Student is frequently looking away from the screen.",
    }

    description = event_map.get(event, "Suspicious behavior detected.")

    prompt = f"""
{SYSTEM_PROMPT}

Situation: {description}

Respond with a warning or instruction.
"""
    return prompt


def ask_agent(event):
    prompt = build_prompt(event)

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "prompt": prompt,
                "stream": False
            }
        )
        return response.json()["response"].strip()

    except Exception as e:
        print("Ollama error:", e)
        return "Please follow exam rules."