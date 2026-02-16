import os
import cv2
import numpy as np
import tensorflow as tf
import sys
from license_plate import LicensePlateDetector

# Suppress TF warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# Constants
CWD_PATH = os.getcwd()
MODEL_RCNN_PATH = os.path.join(CWD_PATH, 'HelmetDetection', 'rcnn')
MODEL_YOLO_PATH = os.path.join(CWD_PATH, 'HelmetDetection', 'yolo')

PATH_TO_CKPT = os.path.join(MODEL_RCNN_PATH, 'frozen_inference_graph.pb')
PATH_TO_LABELS = os.path.join(MODEL_RCNN_PATH, 'label_map.pbtxt')

YOLO_CONFIG = os.path.join(MODEL_YOLO_PATH, 'yolov3_custom.cfg')
YOLO_WEIGHTS = os.path.join(MODEL_YOLO_PATH, 'yolov3_custom_4000.weights')
YOLO_CLASSES = os.path.join(MODEL_YOLO_PATH, 'obj.names')

MIN_SCORE_THRESH = 0.6
YOLO_CONFIDENCE = 0.5
YOLO_THRESHOLD = 0.3

def check_lfs_files():
    """Checks if model files are valid (not just LFS pointers)."""
    files_to_check = [PATH_TO_CKPT, YOLO_WEIGHTS]
    for f in files_to_check:
        if not os.path.exists(f):
            print(f"[ERROR] File not found: {f}")
            return False
        if os.path.getsize(f) < 2000: # LFS pointers are usually < 1KB
            print(f"[ERROR] File seems to be a Git LFS pointer (too small): {f}")
            print("Please download the actual model weights!")
            return False
    return True

def load_label_map(label_map_path):
    """Simple parser for pbtxt label map."""
    item_id = None
    item_name = None
    items = {}
    
    with open(label_map_path, "r") as f:
        for line in f:
            line = line.strip()
            if line.startswith("id:"):
                item_id = int(line.split(":")[-1].strip())
            elif line.startswith("name:"):
                item_name = line.split(":")[-1].strip().replace("'", "")
                if item_id is not None:
                    items[item_id] = item_name
    return items

class HelmetSystem:
    def __init__(self):
        print("[INFO] Loading R-CNN Model...")
        self.detection_graph = tf.Graph()
        with self.detection_graph.as_default():
            od_graph_def = tf.compat.v1.GraphDef()
            with tf.io.gfile.GFile(PATH_TO_CKPT, 'rb') as fid:
                serialized_graph = fid.read()
                od_graph_def.ParseFromString(serialized_graph)
                tf.import_graph_def(od_graph_def, name='')
            
            self.sess = tf.compat.v1.Session(graph=self.detection_graph)
            self.image_tensor = self.detection_graph.get_tensor_by_name('image_tensor:0')
            self.boxes = self.detection_graph.get_tensor_by_name('detection_boxes:0')
            self.scores = self.detection_graph.get_tensor_by_name('detection_scores:0')
            self.classes = self.detection_graph.get_tensor_by_name('detection_classes:0')
            self.num_detections = self.detection_graph.get_tensor_by_name('num_detections:0')

        self.category_index = load_label_map(PATH_TO_LABELS)
        
        print("[INFO] Loading YOLO Model...")
        self.net = cv2.dnn.readNetFromDarknet(YOLO_CONFIG, YOLO_WEIGHTS)
        layer_names = self.net.getLayerNames()
        self.output_layers = [layer_names[i - 1] for i in self.net.getUnconnectedOutLayers()]
        self.yolo_classes = open(YOLO_CLASSES).read().strip().split("\n")

        print("[INFO] Initializing License Plate Detector...")
        self.plate_detector = LicensePlateDetector()

    def detect_riders(self, image):
        image_expanded = np.expand_dims(image, axis=0)
        (boxes, scores, classes, num) = self.sess.run(
            [self.boxes, self.scores, self.classes, self.num_detections],
            feed_dict={self.image_tensor: image_expanded}
        )
        return np.squeeze(boxes), np.squeeze(scores), np.squeeze(classes)

    def detect_helmet(self, image):
        (H, W) = image.shape[:2]
        blob = cv2.dnn.blobFromImage(image, 1 / 255.0, (416, 416), swapRB=True, crop=False)
        self.net.setInput(blob)
        layer_outputs = self.net.forward(self.output_layers)

        boxes = []
        confidences = []
        class_ids = []

        for output in layer_outputs:
            for detection in output:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]
                if confidence > YOLO_CONFIDENCE:
                    box = detection[0:4] * np.array([W, H, W, H])
                    (centerX, centerY, width, height) = box.astype("int")
                    x = int(centerX - (width / 2))
                    y = int(centerY - (height / 2))
                    boxes.append([x, y, int(width), int(height)])
                    confidences.append(float(confidence))
                    class_ids.append(class_id)
        
        idxs = cv2.dnn.NMSBoxes(boxes, confidences, YOLO_CONFIDENCE, YOLO_THRESHOLD)
        return idxs, boxes, class_ids

    def process_image(self, image_path, output_dir=None):
        if not os.path.isfile(image_path):
            print(f"[ERROR] Image not found: {image_path}")
            return None
        
        image = cv2.imread(image_path)
        if image is None:
            print("[ERROR] Could not read image.")
            return None

        im_height, im_width, _ = image.shape
        boxes, scores, classes = self.detect_riders(image)

        for i in range(len(boxes)):
            if scores[i] > MIN_SCORE_THRESH:
                ymin, xmin, ymax, xmax = boxes[i]
                (left, right, top, bottom) = (xmin * im_width, xmax * im_width, ymin * im_height, ymax * im_height)
                
                # Padding
                l, r, t, b = int(left), int(right), int(top), int(bottom)
                rider_img = image[t:b, l:r]
                
                if rider_img.size == 0: continue

                # Helmet Detection
                idxs, y_boxes, y_classes = self.detect_helmet(rider_img)
                
                if len(idxs) > 0:
                    for j in idxs.flatten():
                        label = self.yolo_classes[y_classes[j]]
                        if label == 'No Helmet':
                            # Draw Red Box on Rider
                            cv2.rectangle(image, (l, t), (r, b), (0, 0, 255), 2)
                            cv2.putText(image, "NO HELMET", (l, t - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
                            
                            print("[VIOLATION] Motorcyclist detected without helmet!")
                            
                            # Attempt Plate Detection
                            plate_img, plate_rect = self.plate_detector.detect_plate(rider_img)
                            if plate_img is not None:
                                text = self.plate_detector.recognize_text(plate_img)
                                print(f"[LICENSE PLATE] Detected: {text}")
                                
                                # Draw plate info
                                (px, py, pw, ph) = plate_rect
                                px += l
                                py += t
                                cv2.rectangle(image, (px, py), (px + pw, py + ph), (255, 0, 0), 2)
                                cv2.putText(image, text, (px, py - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
                        else:
                            # Helmet Detected
                            cv2.rectangle(image, (l, t), (r, b), (0, 255, 0), 2)
                            cv2.putText(image, "Helmet", (l, t - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        # Save output
        if output_dir:
             output_path = os.path.join(output_dir, "output_" + os.path.basename(image_path))
        else:
             output_path = "output_" + os.path.basename(image_path)
             
        cv2.imwrite(output_path, image)
        print(f"[INFO] Saved result to {output_path}")
        return output_path

if __name__ == "__main__":
    if not check_lfs_files():
        sys.exit(1)
        
    system = HelmetSystem()
    
    # Test on a sample image
    # Allow user to pass image path argument
    if len(sys.argv) > 1:
        img_path = sys.argv[1]
    else:
        img_path = "input/images/sample.jpeg" # Default from repo structure
        # Check if Sample exists, if not try to find one
        if not os.path.exists(img_path):
             # Try to find any jpg in images
             if os.path.exists("images"):
                 files = [os.path.join("images", f) for f in os.listdir("images") if f.endswith(".jpg") or f.endswith(".jpeg")]
                 if files: img_path = files[0]

    print(f"[INFO] Processing {img_path}")
    system.process_image(img_path)
