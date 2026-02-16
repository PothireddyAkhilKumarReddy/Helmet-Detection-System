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
        contours = sorted(contours, key=cv2.contourArea, reverse=True)[:10]

        location = None
        for contour in contours:
            approx = cv2.approxPolyDP(contour, 10, True)
            if len(approx) == 4:
                location = approx
                break

        if location is None:
            return None, None 

        mask = np.zeros(gray.shape, np.uint8)
        new_image = cv2.drawContours(mask, [location], 0, 255, -1)
        new_image = cv2.bitwise_and(image, image, mask=mask)

        (x, y) = np.where(mask == 255)
        (x1, y1) = (np.min(x), np.min(y))
        (x2, y2) = (np.max(x), np.max(y))
        cropped_image = gray[x1:x2+1, y1:y2+1]

        # Calculate bounding box (x, y, w, h) for display
        x_rect, y_rect, w_rect, h_rect = cv2.boundingRect(location)
        
        return cropped_image, (x_rect, y_rect, w_rect, h_rect)

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
