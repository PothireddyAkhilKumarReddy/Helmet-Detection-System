import cv2
import numpy as np
import os
from ultralytics import YOLO
from license_plate import LicensePlateDetector
import PIL.Image

# Global dictionary to track live stats per video filename for SSE
STREAM_STATS = {}

class YOLOv8System:
    def __init__(self, model_path=None):
        if model_path is None:
            model_path = os.path.join(os.path.dirname(__file__), 'best.pt')
        # Load YOLOv8 model
        print(f"[INFO] Loading YOLOv8 Model from {model_path}...")
        if not os.path.exists(model_path):
            print(f"[WARNING] Model not found at {model_path}. Downloading standard yolov8n.pt for demo.")
            self.model = YOLO('yolov8n.pt') 
        else:
            self.model = YOLO(model_path)
            
        print("[INFO] Initializing License Plate Detector...")
        self.plate_detector = LicensePlateDetector()
        
        # Load class names
        self.class_names = self.model.names

    def process_image(self, image_path, output_dir="results"):
        img = cv2.imread(image_path)
        if img is None:
            print(f"[ERROR] Could not read image: {image_path}")
            return None, None, None

        # Run Inference
        # conf=0.25 is a good default
        results = self.model(img, conf=0.25)[0]

        detected_texts = []
        final_plate_path = None
        
        # We need to map class IDs to names
        # Standard YOLOv8 training usually assigns indices automatically.
        # We should check class names.
        # Track overall status
        violation_detected = False
        helmet_detected = False
        
        for box in results.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            label = self.class_names[cls_id]
            
            # Draw bounding box logic
            color = (0, 255, 0) # Green default
            
            # Check for specific classes. 
            # Note: Checking strings is safer than IDs since user datasets vary.
            lbl_lower = label.lower()
            
            # Check for specific classes. 
            # Note: Checking strings is safer than IDs since user datasets vary.
            lbl_lower = label.lower()
            
            is_violation = False
            
            if "plate" in lbl_lower or "license" in lbl_lower:
                # License Plate Logic
                if conf > 0.2: 
                    color = (255, 0, 0) # Blue for plate
                    
                    # Crop plate
                    plate_crop = img[y1:y2, x1:x2]
                    
                    if plate_crop.size > 0:
                        # OCR
                        text = self.plate_detector.recognize_text(plate_crop)
                        if text and len(text) > 3:
                            detected_texts.append(text)
                            print(f"[PLATE] Recognized: {text}")
                        
                        # Save crop (overwrite last one for display)
                        os.makedirs(output_dir, exist_ok=True)
                        plate_filename = f"plate_{os.path.basename(image_path)}"
                        final_plate_path = os.path.join(output_dir, plate_filename)
                        cv2.imwrite(final_plate_path, plate_crop)

            elif "helmet" in lbl_lower:
                # Check for negative prefixes
                if "no" in lbl_lower or "without" in lbl_lower or "missing" in lbl_lower or "not" in lbl_lower:
                     # "No Helmet" is a specific class, usually reliable
                     is_violation = True
                     violation_detected = True
                     print(f"[VIOLATION] No Helmet detected! ({conf:.2f})")
                else:
                     # "helmet" or "with helmet"
                     # STRICT FILTER: Only accept if confidence is HIGH (>0.7)
                     # This reduces false positives where hair is detected as a helmet
                     if conf > 0.7:
                         helmet_detected = True
                     else:
                         print(f"[IGNORED] Weak Helmet detection ({conf:.2f}), treating as potentially unsafe.")

            elif "head" in lbl_lower:
                # If the class is "Head", it usually means NO helmet
                if "helmet" not in lbl_lower:
                    is_violation = True
                    violation_detected = True
                    print(f"[VIOLATION] Head detected (likely no helmet)! ({conf:.2f})")

            # Apply violation color
            if is_violation:
                color = (0, 0, 255) # Red
                label = "NO HELMET" # Force label update for clarity

            # Draw Box & Label
            cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)
            cv2.putText(img, f"{label} {conf:.2f}", (x1, y1 - 10), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

        # Save Result Image
        os.makedirs(output_dir, exist_ok=True)
        filename = os.path.basename(image_path)
        output_path = os.path.join(output_dir, "processed_" + filename)
        cv2.imwrite(output_path, img)

        full_text = " | ".join(detected_texts) if detected_texts else "No Text Detected"
        
        # Determine final status string
        if violation_detected:
            status_text = "NO HELMET (Violation)"
        elif helmet_detected:
            status_text = "With Helmet (Safe)"
        else:
            status_text = "No Rider/Helmet Detected"

        return output_path, full_text, final_plate_path, status_text

    def generate_video_stream(self, video_path, loop=True):
        """Generator function to yield annotated frames from a video stream for MJPEG."""
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"[ERROR] Could not open video: {video_path}")
            return

        frame_count = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                if loop:
                    # Video ended, loop back for continuous live simulation
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue
                else:
                    # Stop streaming for uploaded file playback
                    break
                
            frame_count += 1
            # Skip frames to simulate real-time processing speed if needed, or process every frame
            # Process every 2nd frame for better performance on CPU
            if frame_count % 2 != 0:
                continue

            # Run Inference on the frame
            results = self.model(frame, conf=0.25, verbose=False)[0]

            safe_count = 0
            unsafe_count = 0
            plates = []

            for box in results.boxes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = float(box.conf[0])
                cls_id = int(box.cls[0])
                label = self.class_names[cls_id]
                
                color = (0, 255, 0) # Green default
                lbl_lower = label.lower()
                is_violation = False
                
                if "plate" in lbl_lower or "license" in lbl_lower:
                    if conf > 0.2: color = (255, 0, 0)
                elif "helmet" in lbl_lower:
                    if "no" in lbl_lower or "without" in lbl_lower or "missing" in lbl_lower or "not" in lbl_lower:
                         is_violation = True
                elif "head" in lbl_lower:
                    if "helmet" not in lbl_lower:
                        is_violation = True

                if is_violation:
                    color = (0, 0, 255) # Red
                    label = "NO HELMET"
                    unsafe_count += 1
                elif "helmet" in lbl_lower:
                    safe_count += 1
                elif label == "License Plate":
                    # Attempt quick OCR for the specific frame or just track detection
                    try:
                        plate_crop = frame[y1:y2, x1:x2]
                        pil_img = PIL.Image.fromarray(cv2.cvtColor(plate_crop, cv2.COLOR_BGR2RGB))
                        text = self.plate_detector.extract_text(pil_img)
                        if text: plates.append(text)
                    except:
                        pass # Ignore individual frame OCR failures for speed

                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(frame, f"{label} {conf:.2f}", (x1, y1 - 10), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                            
            # Update global stats for SSE
            filename = os.path.basename(video_path)
            STREAM_STATS[filename] = {
                "safe": safe_count,
                "unsafe": unsafe_count,
                "plates": plates if plates else ["No Text Detected"]
            }

            # Encode frame to JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                continue
                
            frame_bytes = buffer.tobytes()
            # Yield frame in multipart format
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

def check_lfs_files():
    # Placeholder for compatibility if app.py calls it
    # YOLO doesn't require git LFS checks for this setup
    return True

if __name__ == "__main__":
    system = YOLOv8System()
    # Demo
    # system.process_image("test.jpg")
