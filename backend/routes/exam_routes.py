from flask import Blueprint, jsonify

exam_bp = Blueprint('exam', __name__)

@exam_bp.route("/test")
def test():
    return jsonify({"message": "Backend working 🚀"})