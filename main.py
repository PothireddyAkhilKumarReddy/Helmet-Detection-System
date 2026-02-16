import cv2
import numpy as np
import os
from ultralytics import YOLO
from license_plate import LicensePlateDetector

class YOLOv8System:
    def __init__(self, model_path='best.pt'):
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
            
            if "no" in lbl_lower and "helmet" in lbl_lower: # no-helmet
                color = (0, 0, 255) # Red for violation
                print(f"[VIOLATION] No Helmet detected! ({conf:.2f})")
            elif "plate" in lbl_lower:
                color = (255, 0, 0) # Blue for plate
                
                # License Plate Logic
                if conf > 0.2: 
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
        
        return output_path, full_text, final_plate_path

def check_lfs_files():
    # Placeholder for compatibility if app.py calls it
    # YOLO doesn't require git LFS checks for this setup
    return True

if __name__ == "__main__":
    system = YOLOv8System()
    # Demo
    # system.process_image("test.jpg")
