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
        gray = cv2.bilateralFilter(gray, 11, 17, 17) # Noise reduction
        edged = cv2.Canny(gray, 30, 200) # Edge detection

        # Find contours
        keypoints = cv2.findContours(edged.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        contours = imutils.grab_contours(keypoints)
        contours = sorted(contours, key=cv2.contourArea, reverse=True)[:30]

        location = None
        height, width = image.shape[:2]
        plate_img = None
        plate_rect = None
        
        for contour in contours:
            # Get the bounding rect immediately, don't rely on 4-point polygon
            (x, y, w, h) = cv2.boundingRect(contour)
            ar = w / float(h)
            area = w * h

            # Filter 1: Position 
            # Plate must be in the lower part of the rider (avoid heads/torso)
            # Center of box should be in the lower 60% of the image (y > 0.4 * height)
            center_y = y + h / 2
            if center_y < height * 0.4:
                 continue
            
            # Filter 2: Aspect Ratio
            # Plates are rectangular. Allow some square-ness for angles, but generally wide.
            if ar < 0.8 or ar > 8.0:
                continue

            # Filter 3: Minimum size (relative to rider crop)
            # It shouldn't be microscopic noise
            if area < 100: 
                continue

            # If we passed filters, assume this is the plate (since we sorted by area, largest valid rect wins)
            # We add a small padding usually, but here we scan directly.
            plate_img = image[y:y+h, x:x+w]
            plate_rect = (x, y, w, h)
            break
            
        return plate_img, plate_rect

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
        # plate_image = self.maximize_contrast(plate_image) # Optional: can enable if needed

        result = self.reader.readtext(plate_image)
        
        text = ""
        for (bbox, t, prob) in result:
             # Basic filter for confidence (optional) or length
             if prob > 0.2:
                 text += t + " "
        
        return text.strip().upper()
