# Setup Guide

## 1. Install Dependencies
I have already installed the required dependencies for you.

## 2. Download Model Weights (CRITICAL)
The automated download failed because the branch name was incorrect. **Please use these corrected links.**

### File 1: Faster R-CNN Model (`frozen_inference_graph.pb`)
*   **Download Link**: [Click Here to Download frozen_inference_graph.pb](https://github.com/manikanta-varaganti/detection-of-motorcyclists-without-helmet/raw/main/HelmetDetection/rcnn/frozen_inference_graph.pb?download=)
*   **Target Size**: ~114 MB
*   **Action**: Download and move to `HelmetDetection/rcnn/frozen_inference_graph.pb` (replace existing small file).

### File 2: YOLO Weights (`yolov3_custom_4000.weights`)
*   **Download Link**: [Click Here to Download yolov3_custom_4000.weights](https://github.com/manikanta-varaganti/detection-of-motorcyclists-without-helmet/raw/main/HelmetDetection/yolo/yolov3_custom_4000.weights?download=)
*   **Target Size**: ~246 MB
*   **Action**: Download and move to `HelmetDetection/yolo/yolov3_custom_4000.weights` (replace existing small file).

## 3. Run the System
After moving the files:
```bash
python main.py
```
