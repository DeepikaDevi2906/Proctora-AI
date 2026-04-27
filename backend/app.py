from flask import Flask
from extensions import socketio
import sys
import os
from routes.exam_routes import exam_bp
from sockets import exam_socket
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'secret!'
    socketio.init_app(app)
    
    app.register_blueprint(exam_bp)
    return app

app = create_app()

if __name__ == "__main__":
    socketio.run(app, debug=True)