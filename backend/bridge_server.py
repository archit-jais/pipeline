import socket
import threading
import time
import struct
import pickle
import cv2
import numpy as np
from flask import Flask, Response, request, jsonify
from flask_cors import CORS

# ──────────────────────────────────────────────────────────
#  CONFIG
# ──────────────────────────────────────────────────────────
RPI_IP   = '10.161.98.201'
CMD_PORT = 9999
VID_PORT = 9998

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

def connect_to_pi():
    global cmd_sock, vid_sock
    print(f'Connecting to Pi at {RPI_IP}...')
    try:
        cmd_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        cmd_sock.connect((RPI_IP, CMD_PORT))
        print('[CMD] Connected')

        vid_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        vid_sock.connect((RPI_IP, VID_PORT))
        print('[VID] Connected')
        return True
    except Exception as e:
        print(f'Connection failed: {e}')
        return False

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

def generate_mjpeg():
    while True:
        with frame_lock:
            if latest_frame is None:
                time.sleep(0.1)
                continue
            ret, buffer = cv2.imencode('.jpg', latest_frame)
            frame_bytes = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.03) # ~30 FPS

@app.route('/video_feed')
def video_feed():
    return Response(generate_mjpeg(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    if connect_to_pi():
        threading.Thread(target=receive_video, daemon=True).start()
    else:
        print("WARNING: Starting in offline mode (no Pi connection)")
    
    app.run(host='0.0.0.0', port=5000, threaded=True)
