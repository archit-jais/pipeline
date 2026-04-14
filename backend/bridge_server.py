import socket
import threading
import time
import struct
import pickle
import json
import cv2
import numpy as np
from flask import Flask, Response, request, jsonify
from flask_cors import CORS
import os
from ultralytics import YOLO

# ──────────────────────────────────────────────────────────
#  CONFIG
# ──────────────────────────────────────────────────────────
RPI_IP   = '10.143.0.201'
CMD_PORT = 9999
VID_PORT = 9998
ENV_PORT = 9997

app = Flask(__name__)
CORS(app)

# ──────────────────────────────────────────────────────────
#  SHARED STATE & SOCKETS
# ──────────────────────────────────────────────────────────
latest_frame = None
frame_lock   = threading.Lock()
running      = True

cmd_sock = None
vid_sock = None
env_sock = None

telemetry_state = {
    "temp": 0,
    "pressure": 0,
    "humidity": 0,
    "dist_cm": 0,
    "speed_cms": 0,
    "source": "N/A"
}
telemetry_lock = threading.Lock()

# --- AI CONFIG ---
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'rust_detector.pt')
detection_enabled = False

if os.path.exists(MODEL_PATH):
    print(f"Loading custom model: {MODEL_PATH}")
    model = YOLO(MODEL_PATH)
else:
    print("WARNING: 'rust_detector.pt' not found. Using default 'yolo11n.pt' for testing.")
    model = YOLO('yolo11n.pt')

def connect_to_pi():
    global cmd_sock, vid_sock, env_sock
    print(f'Connecting to Pi at {RPI_IP}...')
    
    success = False
    
    # 1. Command Socket (Movement)
    try:
        cmd_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        cmd_sock.connect((RPI_IP, CMD_PORT))
        print('[CMD] Connected')
        success = True
    except Exception as e:
        print(f'[CMD] Failed: {e}')
        return False

    # 2. Video Socket
    try:
        vid_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        vid_sock.connect((RPI_IP, VID_PORT))
        print('[VID] Connected')
    except Exception as e:
        print(f'[VID] Failed: {e}')

    # 3. Environment Socket (Sensors)
    try:
        env_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        env_sock.settimeout(2.0)
        env_sock.connect((RPI_IP, ENV_PORT))
        print('[ENV] Connected')
    except Exception as e:
        print(f'[ENV] Failed: {e}')
        env_sock = None
        
    return success

def receive_env():
    global telemetry_state, running
    if not env_sock: 
        print("[ENV] No Pi connection. Telemetry inactive.")
        return
    
    buf = ""
    while running:
        try:
            # Match the JSON-per-line protocol from pc_client.py
            chunk = env_sock.recv(1024).decode('utf-8', errors='ignore')
            if not chunk: break
            
            buf += chunk
            while '\n' in buf:
                line, buf = buf.split('\n', 1)
                line = line.strip()
                if not line: continue
                
                try:
                    data = json.loads(line)
                    with telemetry_lock:
                        telemetry_state.update(data)
                except json.JSONDecodeError:
                    continue
        except Exception as e:
            print(f'[ENV] Error: {e}')
            break

def receive_video():
    global latest_frame, running
    if not vid_sock: return
    
    HDR = struct.calcsize('Q')
    buf = b''
    while running:
        try:
            while len(buf) < HDR:
                chunk = vid_sock.recv(4096)
                if not chunk: return
                buf += chunk
            msg_len = struct.unpack('Q', buf[:HDR])[0]
            buf = buf[HDR:]
            while len(buf) < msg_len:
                chunk = vid_sock.recv(65536)
                if not chunk: return
                buf += chunk
            payload = buf[:msg_len]
            buf = buf[msg_len:]
            encoded = pickle.loads(payload)
            frame = cv2.imdecode(encoded, cv2.IMREAD_COLOR)
            with frame_lock:
                latest_frame = frame
        except Exception as e:
            print(f'[VID] Error: {e}')
            break

def receive_webcam():
    global latest_frame, running
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[VIDEO] ERR: Could not open local webcam.")
        return
    print("[VIDEO] Using local webcam fallback")
    while running:
        ret, frame = cap.read()
        if not ret: break
        with frame_lock:
            latest_frame = frame
        time.sleep(0.01)
    cap.release()

# ──────────────────────────────────────────────────────────
#  FLASK ENDPOINTS
# ──────────────────────────────────────────────────────────
@app.route('/command', methods=['POST'])
def send_command():
    data = request.json
    action = data.get('action')
    if action and cmd_sock:
        try:
            cmd_sock.sendall((action + '\n').encode())
            return jsonify({"status": "success", "command": action})
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500
    return jsonify({"status": "ignored"}), 400

@app.route('/servo', methods=['POST'])
def control_servo():
    data = request.json
    angle = data.get('angle')
    if angle is not None and cmd_sock:
        try:
            cmd_payload = f"SERVO:{angle}\n"
            cmd_sock.sendall(cmd_payload.encode())
            return jsonify({"status": "success", "angle": angle})
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500
    return jsonify({"status": "ignored"}), 400

@app.route('/telemetry', methods=['GET'])
def get_telemetry():
    with telemetry_lock:
        return jsonify(telemetry_state)

@app.route('/toggle_detection', methods=['POST'])
def toggle_detection():
    global detection_enabled
    data = request.json
    detection_enabled = data.get('enabled', False)
    status = "ON" if detection_enabled else "OFF"
    print(f"[AI] Detection turned {status}")
    return jsonify({"status": "success", "detection_enabled": detection_enabled})

def generate_mjpeg():
    global detection_enabled
    while True:
        with frame_lock:
            if latest_frame is None:
                time.sleep(0.1)
                continue
            
            # Create a copy for processing to avoid issues with other threads
            processed_frame = latest_frame.copy()

            if detection_enabled:
                try:
                    # Run inference
                    results = model.predict(processed_frame, conf=0.4, verbose=False)
                    # Draw detections on the frame
                    processed_frame = results[0].plot()
                except Exception as e:
                    print(f"AI Detection error: {e}")

            ret, buffer = cv2.imencode('.jpg', processed_frame)
            frame_bytes = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.03) # ~30 FPS

@app.route('/video_feed')
def video_feed():
    return Response(generate_mjpeg(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    print("\n" + "="*40)
    print("  [SERVER] v2.2 (JSON Protocol) ACTIVE")
    print("="*40 + "\n")
    
    if connect_to_pi():
        threading.Thread(target=receive_video, daemon=True).start()
        threading.Thread(target=receive_env,   daemon=True).start()
    else:
        print("WARNING: Starting in offline mode (no Pi connection). Switching to local webcam.")
        threading.Thread(target=receive_webcam, daemon=True).start()
    
    app.run(host='0.0.0.0', port=5000, threaded=True)
