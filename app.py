import os
from flask import Flask, render_template, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from main import YOLOv8System, check_lfs_files
import sys

# Initialize Flask App
app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
RESULTS_FOLDER = 'results'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['RESULTS_FOLDER'] = RESULTS_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload setup

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)

# Initialize Detection System
print("[INFO] Initializing Helmet Detection System...")
# Check models first
if not check_lfs_files():
    print("[ERROR] Model files are missing or invalid (LFS pointers). Please download real weights.")
    sys.exit(1)

system = YOLOv8System()
print("[INFO] System Ready.")

@app.route('/')
def index():
    return render_template('index.html')

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
                
                return jsonify({
                    'success': True,
                    'result_url': f'/results/{output_filename}',
                    'plate_text': plate_text if plate_text else "No Plate Detected",
                    'plate_url': f'/results/{plate_filename}' if plate_filename else None,
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

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
