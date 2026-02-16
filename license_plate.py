import cv2
import numpy as np
import easyocr
import imutils

class LicensePlateDetector:
    def __init__(self, use_gpu=False):
        # Initialize EasyOCR reader
        self.reader = easyocr.Reader(['en'], gpu=use_gpu, verbose=False)

    def detect_plate(self, image):
        """
        Detects the license plate in an image using OpenCV contour detection.
        Returns the cropped plate image and its coordinates (x, y, w, h).
        """
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        # Morphological operations to connect characters/edges
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
        closed = cv2.morphologyEx(edged, cv2.MORPH_CLOSE, kernel)

        # Find contours on the closed image
        keypoints = cv2.findContours(closed.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        contours = imutils.grab_contours(keypoints)
        contours = sorted(contours, key=cv2.contourArea, reverse=True)[:30]

        location = None
        height, width = image.shape[:2]
        
        best_candidate = None
        best_score = -1
        
        for contour in contours:
            # Get the bounding rect
            (x, y, w, h) = cv2.boundingRect(contour)
            ar = w / float(h)
            area = w * h

            # Filter 1: Position 
            # Stricter: Center of box MUST be in the lower 50% of the image
            center_y = y + h / 2
            if center_y < height * 0.5:
                 continue
            
            # Filter 2: Aspect Ratio
            if ar < 1.0 or ar > 6.0:
                continue

            # Filter 3: Minimum size (relative to rider crop)
            if area < 500: 
                continue
            
            # Filter 4: Edge Density (Texture Check)
            # Plates have text => High edge density.
            # Arms/Clothes => Low edge density.
            roi = edged[y:y+h, x:x+w]
            edge_density = cv2.countNonZero(roi) / (w * h)
            
            # If less than 15% of the box is edges, it's likely smooth skin/cloth, not a plate
            if edge_density < 0.15:
                continue

            # Score the candidate
            # Score = Area * Density * Position_Low
            # We want large areas, high density (text), and lower position
            position_score = center_y / height # Higher is better (lower in image)
            score = area * edge_density * position_score
            
            if score > best_score:
                best_score = score
                best_candidate = (x, y, w, h)

        if best_candidate:
            (x, y, w, h) = best_candidate
            plate_img = image[y:y+h, x:x+w]
            plate_rect = (x, y, w, h)
            return plate_img, plate_rect
            
        return None, None

    def maximize_contrast(self, img):
        # Increase contrast for better OCR
        structuringElement = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        imgTopHat = cv2.morphologyEx(img, cv2.MORPH_TOPHAT, structuringElement)
        imgBlackHat = cv2.morphologyEx(img, cv2.MORPH_BLACKHAT, structuringElement)
        imgGrayscalePlusTopHat = cv2.add(img, imgTopHat)
        img = cv2.subtract(imgGrayscalePlusTopHat, imgBlackHat)
        return img

    def recognize_text(self, plate_image):
        """
        Performs OCR on the cropped plate image.
        """
        if plate_image is None or plate_image.size == 0:
            return ""

        # Enhance image for OCR
        # 1. Resize: Upscale to make characters larger/clearer
        scale = 2.0
        plate_image = cv2.resize(plate_image, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
        
        # 2. Contrast: Maximize contrast (optional, but often helps)
        # plate_image = self.maximize_contrast(plate_image) 
        
        # 3. Grayscale + Thresholding (Binarization)
        # This helps EasyOCR focus on black chars on white plate (or vice versa)
        # plate_image_gray = cv2.cvtColor(plate_image, cv2.COLOR_BGR2GRAY) if len(plate_image.shape) == 3 else plate_image
        # _, plate_image = cv2.threshold(plate_image_gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        result = self.reader.readtext(plate_image)
        
        text = ""
        for (bbox, t, prob) in result:
             # Basic filter for confidence (optional) or length
             if prob > 0.2:
                 text += t + " "
        
        return text.strip().upper()
