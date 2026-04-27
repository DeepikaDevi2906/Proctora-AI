🎓Proctora AI

Proctora AI is an intelligent real-time online proctoring system that monitors exam integrity using a combination of computer vision, audio analysis, and behavioral tracking.
The system integrates multiple AI modules such as face detection, mobile phone detection, identity verification, and liveness detection, and generates dynamic warnings using an AI agent with voice feedback.

Features

- Face detection & multiple face detection
- Mobile phone detection (YOLOv8)
- Identity verification (face matching)
- Liveness detection (blink detection)
- Audio monitoring (sound detection)
- Tab switch detection
- Copy/paste & DevTools blocking
- AI-generated warnings (Ollama)
- Voice feedback using Web Speech API
- Automatic exam termination on repeated violations

Tech Stack

# Frontend
- React.js
- Socket.IO (WebSockets)
- Web Speech API (Text-to-Speech)
- Web Audio API (Audio Detection)

# Backend
- Flask
- Flask-SocketIO

# AI & Computer Vision
- OpenCV (Face Detection)
- YOLOv8 (Mobile Phone Detection)
- MediaPipe (Liveness Detection)

# AI Intelligence
- Ollama (LLM for dynamic responses)

# Programming Languages
- Python
- JavaScript

# Working

1. User starts exam and registers face
2. Webcam and microphone capture real-time data
3. Frames are sent to backend via WebSockets
4. AI modules analyze behavior:
   - Face presence
   - Identity match
   - Liveness (blink)
   - Phone usage
   - Audio activity
5. Events are scored based on severity
6. High-risk events trigger AI-generated warnings
7. Warnings are displayed and spoken aloud
8. Repeated violations lead to exam termination
