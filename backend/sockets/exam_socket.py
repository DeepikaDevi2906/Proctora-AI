from extensions import socketio
from flask_socketio import emit

from ai_model.main_ai import analyze_frame
from ai_model.utils.frame_utils import decode_frame
from services.event_engine import process_event
from services.agent_service import ask_agent
from ai_model.identity.face_auth import register_face
import time

#Performance control
last_processed_time = 0
FRAME_INTERVAL = 1  # seconds

# Prevent spam
last_warning_time = 0
WARNING_COOLDOWN = 5

last_audio_warning = 0

tab_switch_count = 0


#CONNECT
@socketio.on('connect')
def handle_connect():
    print("Client connected")
    emit('response', {"message": "Connected to server"})


#DISCONNECT
@socketio.on('disconnect')
def handle_disconnect():
    print("Client disconnected")


#MAIN VIDEO STREAM
@socketio.on('video_frame')
def handle_video(data):
    global last_processed_time, last_warning_time

    current_time = time.time()

    # Throttle frames
    if current_time - last_processed_time < FRAME_INTERVAL:
        return

    last_processed_time = current_time

    # Decode frame
    frame = decode_frame(data['frame'])

    if frame is None:
        print("[ERROR] Empty frame")
        return

    #Run AI
    result = analyze_frame(frame)
    event = result.get("event", "normal")

    # Score
    score = process_event(event)
    # 🔐 Identity mismatch (HIGH PRIORITY)
    # 🚨 HIGH PRIORITY EVENTS (no delay)

# Phone
    if event == "phone_detected":
       socketio.emit('warning', {
        "message": "Mobile phone detected! This is not allowed.",
        "level": "high",
        "event": "phone_detected"
      })
    return
# Identity mismatch
    if event == "identity_mismatch":
      socketio.emit('warning', {
        "message": "Identity mismatch detected!",
        "level": "high",
        "event": "identity_mismatch"
      })
    return

# Liveness failure
    if event == "not_live":
     socketio.emit('warning', {
        "message": "Liveness check failed! Please blink naturally.",
        "level": "high",
        "event": "not_live"
    })
    return
    print(f"[AI] Event: {event} | Score: {score}")

    # Default fallback messages
    default_messages = {
        "multiple_faces": "Multiple people detected. Please ensure you are alone.",
        "no_face": "Face not visible. Please return to your position.",
        "looking_away": "Please focus on your screen.",
        "normal": "Monitoring..."
    }

    # PRIORITY: PHONE DETECTION
    if event == "phone_detected":
        socketio.emit('warning', {
            "message": "Mobile phone detected! This is not allowed.",
            "level": "high",
            "event": "phone_detected"
        })
        return

    # HIGH RISK → Agentic AI
    if score > 0.8:
        if current_time - last_warning_time > WARNING_COOLDOWN:
            msg = ask_agent(event)

            socketio.emit('warning', {
                "message": msg,
                "level": "high",
                "event": event
            })

            last_warning_time = current_time

    # MEDIUM RISK
    elif score > 0.5:
        msg = default_messages.get(event, "Please follow exam rules.")

        socketio.emit('warning', {
            "message": msg,
            "level": "medium",
            "event": event
        })

    # NORMAL
    else:
        socketio.emit('warning', {
            "message": "Monitoring...",
            "level": "low",
            "event": "normal"
        })

@socketio.on('tab_switch')
def handle_tab_switch(data):
    global tab_switch_count

    tab_switch_count += 1

    print(f"[ALERT] Tab switch count: {tab_switch_count}")

    if tab_switch_count == 1:
        msg = "Tab switching detected! Please stay on the exam screen."

    elif tab_switch_count <= 3:
        msg = f"Warning! You switched tabs {tab_switch_count} times."

    else:
        msg = f"Multiple violations detected ({tab_switch_count}). Exam terminated."

        #SEND TERMINATION SIGNAL
        socketio.emit('terminate_exam', {
            "message": msg
        })

        return

    socketio.emit('warning', {
        "message": msg,
        "level": "high",
        "event": "tab_switch"
    })
#AUDIO DETECTION
@socketio.on('audio_event')
def handle_audio_event(data):
    global last_audio_warning

    volume = data.get("volume", 0)
    current_time = time.time()

    print(f"[AUDIO] Volume detected: {volume}")

    # Trigger if voice detected
    if volume > 0.04 and current_time - last_audio_warning > 3:
        print("[AUDIO] Triggering warning")

        socketio.emit('warning', {
            "message": "Voice detected. Please maintain silence.",
            "level": "medium",
            "event": "audio_detected"
        })

        last_audio_warning = current_time
@socketio.on('register_face')
def handle_register(data):
    frame = decode_frame(data['frame'])

    success = register_face(frame)

    if success:
        emit('response', {"message": "Face registered successfully"})
    else:
        emit('response', {"message": "Face registration failed"})