def process_event(event):
    scores = {
        "normal": 0.1,
        "looking_away": 0.6,
        "no_face": 0.7,
        "multiple_faces": 0.9,
        "audio_detected": 0.6,
        "tab_switch": 1.0,
        "phone_detected": 1.0,
        "not_live": 1.0,
        "identity_mismatch": 1.0,
    }

    return scores.get(event, 0.0)