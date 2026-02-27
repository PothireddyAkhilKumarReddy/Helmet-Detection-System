import os
import sqlite3
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_from_directory, Response
from flask_cors import CORS
from werkzeug.utils import secure_filename
from main import YOLOv8System, check_lfs_files, STREAM_STATS
import sys
import json
import time

# Initialize Flask App
app = Flask(__name__)
# Enable CORS for all domains on all routes
CORS(app, resources={r"/*": {"origins": "*"}})

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
RESULTS_FOLDER = os.path.join(BASE_DIR, 'results')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['RESULTS_FOLDER'] = RESULTS_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max upload setup

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

# Database Initialization
DB_PATH = os.path.join(BASE_DIR, 'traffic_data.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS detections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            status_text TEXT NOT NULL,
            plate_text TEXT,
            result_url TEXT,
            plate_url TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# Initialize Detection System
print("[INFO] Initializing Helmet Detection System...")
# Check models first
if not check_lfs_files():
    print("[ERROR] Model files are missing or invalid (LFS pointers). Please download real weights.")
    sys.exit(1)

system = YOLOv8System()
print("[INFO] System Ready.")

@app.route('/detect', methods=['POST'])
def detect():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Process Image
        try:
            result = system.process_image(filepath, output_dir=app.config['RESULTS_FOLDER'])
            
            # Handle variable return values just in case
            if isinstance(result, tuple):
                if len(result) == 4:
                     output_path, plate_text, plate_crop_path, status_text = result
                elif len(result) == 3:
                     output_path, plate_text, plate_crop_path = result
                     status_text = "Unknown"
                elif len(result) == 2:
                     output_path, plate_text = result
                     plate_crop_path = None
                     status_text = "Unknown"
            else:
                output_path = result
                plate_text = None
                plate_crop_path = None
                status_text = "Unknown"

            if output_path:
                output_filename = os.path.basename(output_path)
                plate_filename = os.path.basename(plate_crop_path) if plate_crop_path else None
                
                import time
                timestamp_val = int(time.time())
                res_url = f'/results/{output_filename}?v={timestamp_val}'
                plt_url = f'/results/{plate_filename}?v={timestamp_val}' if plate_filename else None
                
                # Save to Database
                try:
                    conn = sqlite3.connect(DB_PATH)
                    cursor = conn.cursor()
                    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    cursor.execute('''
                        INSERT INTO detections (timestamp, status_text, plate_text, result_url, plate_url)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (now_str, status_text, plate_text if plate_text else "No Plate Detected", res_url, plt_url))
                    conn.commit()
                    conn.close()
                except Exception as db_e:
                    print(f"[ERROR] Database save error: {db_e}")

                return jsonify({
                    'success': True,
                    'input_url': f'/uploads/{filename}',
                    'result_url': res_url,
                    'plate_text': plate_text if plate_text else "No Plate Detected",
                    'plate_url': plt_url,
                    'status_text': status_text
                })
            else:
                return jsonify({'error': 'Detection failed to produce output'}), 500
        except Exception as e:
            print(f"[ERROR] Logic error: {e}")
            return jsonify({'error': str(e)}), 500

@app.route('/results/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['RESULTS_FOLDER'], filename)

@app.route('/uploads/<filename>')
def serve_input_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/batch-detect', methods=['POST'])
def batch_detect():
    if 'files[]' not in request.files:
        return jsonify({'error': 'No files provided'}), 400
        
    files = request.files.getlist('files[]')
    if not files or all(f.filename == '' for f in files):
        return jsonify({'error': 'No selected files'}), 400

    results = []
    
    for file in files:
        if file and file.filename != '':
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            try:
                # Process Image
                result = system.process_image(filepath, output_dir=app.config['RESULTS_FOLDER'])
                
                # Handle variable return values just in case
                if isinstance(result, tuple):
                    if len(result) == 4:
                         output_path, plate_text, plate_crop_path, status_text = result
                    elif len(result) == 3:
                         output_path, plate_text, plate_crop_path = result
                         status_text = "Unknown"
                    elif len(result) == 2:
                         output_path, plate_text = result
                         plate_crop_path = None
                         status_text = "Unknown"
                else:
                    output_path = result
                    plate_text = None
                    plate_crop_path = None
                    status_text = "Unknown"

                if output_path:
                    output_filename = os.path.basename(output_path)
                    plate_filename = os.path.basename(plate_crop_path) if plate_crop_path else None
                    
                    import time
                    timestamp_val = int(time.time() * 1000) # Use ms for uniqueness in rapid batch
                    res_url = f'/results/{output_filename}?v={timestamp_val}'
                    plt_url = f'/results/{plate_filename}?v={timestamp_val}' if plate_filename else None
                    
                    # Save to Database
                    try:
                        conn = sqlite3.connect(DB_PATH)
                        cursor = conn.cursor()
                        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        safe_plate = plate_text if plate_text else "No Plate Detected"
                        
                        cursor.execute('''
                            INSERT INTO detections (timestamp, status_text, plate_text, result_url, plate_url)
                            VALUES (?, ?, ?, ?, ?)
                        ''', (now_str, status_text, safe_plate, res_url, plt_url))
                        conn.commit()
                        conn.close()
                    except Exception as db_e:
                        print(f"[ERROR] Batch db save error: {db_e}")

                    results.append({
                        'filename': filename,
                        'success': True,
                        'input_url': f'/uploads/{filename}',
                        'result_url': res_url,
                        'plate_text': safe_plate,
                        'plate_url': plt_url,
                        'status_text': status_text
                    })
                else:
                    results.append({'filename': filename, 'success': False, 'error': 'Detection returned no output'})
            except Exception as e:
                print(f"[ERROR] Batch logic error on {filename}: {e}")
                results.append({'filename': filename, 'success': False, 'error': str(e)})
                
    return jsonify({
        'success': True,
        'processed_count': len(results),
        'results': results
    })

@app.route('/api/upload-video', methods=['POST'])
def upload_video():
    # Frontend might send 'video' or 'file' depending on the payload builder
    file_key = 'video' if 'video' in request.files else 'file'
    
    if file_key not in request.files:
        return jsonify({'error': 'No video file part'}), 400
    
    file = request.files[file_key]
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file:
        filename = secure_filename(file.filename)
        # Ensure it's a video file type (basic check)
        if not filename.lower().endswith(('.mp4', '.avi', '.mov', '.mkv')):
             return jsonify({'error': 'Invalid file format. Please upload a video.'}), 400
             
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Return the stream URL immediately
        stream_url = f"/api/stream-video/{filename}"
        
        # Also log this event to the DB (optional but good for tracking)
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute('''
                INSERT INTO detections (timestamp, status_text, plate_text, result_url, plate_url)
                VALUES (?, ?, ?, ?, ?)
            ''', (now_str, "Video Processed", "N/A", stream_url, None))
            conn.commit()
            conn.close()
        except Exception as db_e:
            print(f"[ERROR] Video DB save error: {db_e}")

        return jsonify({
            'success': True,
            'input_url': f'/uploads/{filename}',
            'stream_url': stream_url,
            'filename': filename
        })

@app.route('/api/stream-video/<filename>')
def stream_video(filename):
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(filename))
    if not os.path.exists(filepath):
        return "File not found", 404
        
    # Stream the video, but tell the generator to stop when done (loop=False)
    return Response(system.generate_video_stream(filepath, loop=False),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/stream-stats/<filename>')
def stream_stats(filename):
    """Server-Sent Events endpoint for pushing live tracking metrics"""
    def generate():
        while True:
            # Fetch latest stats built by the background YOLO frame loop
            stats = STREAM_STATS.get(filename, {"safe": 0, "unsafe": 0, "plates": []})
            yield f"data: {json.dumps(stats)}\n\n"
            time.sleep(1) # Broadcast updates 1x per sec to prevent frontend overload

    return Response(generate(), mimetype='text/event-stream')

# --- API ENDPOINTS FOR FRONTEND DATA ---

@app.route('/api/analytics/stats')
def api_stats():
    """Return aggregate statistics from the database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM detections")
    total_scans = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM detections WHERE status_text LIKE '%NO HELMET%'")
    total_violations = cursor.fetchone()[0]
    
    conn.close()
    
    accuracy = 98.5 # Mock high accuracy value
    
    return jsonify({
        'total_scans': total_scans,
        'total_violations': total_violations,
        'accuracy': accuracy
    })

@app.route('/api/analytics/history')
def api_history():
    """Return the 10 most recent detections for the data table."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM detections ORDER BY id DESC LIMIT 10")
    rows = cursor.fetchall()
    
    data = []
    for r in rows:
        data.append({
            'id': r['id'],
            'timestamp': r['timestamp'],
            'status_text': r['status_text'],
            'plate_text': r['plate_text'],
            'result_url': r['result_url']
        })
        
    conn.close()
    return jsonify(data)

@app.route('/api/live-feed')
def live_feed_stream():
    """Stream simulated live camera feed via MJPEG."""
    video_path = os.path.join(app.static_folder, 'samples', 'sample_traffic.mp4')
    if not os.path.exists(video_path):
        return "Video source not found", 404
        
    return Response(system.generate_video_stream(video_path), 
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/analytics/chart')
def api_chart():
    """Return data grouped by date for the Chart.js visual."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    # Group by the DATE part of the timestamp (YYYY-MM-DD)
    cursor.execute('''
        SELECT substr(timestamp, 1, 10) as date, 
               COUNT(*) as total, 
               SUM(CASE WHEN status_text LIKE '%NO HELMET%' THEN 1 ELSE 0 END) as violations
        FROM detections 
        GROUP BY substr(timestamp, 1, 10)
        ORDER BY date ASC
        LIMIT 7
    ''')
    rows = cursor.fetchall()
    conn.close()
    
    dates = []
    totals = []
    violations = []
    for r in rows:
        dates.append(r[0])
        totals.append(r[1])
        violations.append(r[2] if r[2] else 0)
        
    return jsonify({
        'dates': dates,
        'totals': totals,
        'violations': violations
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
