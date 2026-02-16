# Setup Guide: Training YOLOv8

## 1. Train Your Model (Using Google Colab)
Since this project now uses **YOLOv8** for high-accuracy detection, you need to train the model on a GPU.

1.  **Open Google Colab**: Go to [https://colab.research.google.com/](https://colab.research.google.com/).
2.  **Upload Notebook**: Click "Upload" and select the `Train_YOLOv8.ipynb` file from your project folder.
3.  **Get Roboflow API Key**:
    *   Go to [https://app.roboflow.com/settings/api](https://app.roboflow.com/settings/api).
    *   Copy your "Private API Key" (it's free).
4.  **Run the Notebook**:
    *   In Colab, go to **Runtime > Run all**.
    *   When prompted, paste your API Key and press Enter.
    *   Wait for the training to finish (approx 15-30 minutes).

## 2. Download the Model
Once training is complete, the last cell in the notebook will trigger a download.
*   **File Name**: `best.pt`
*   **Location**: It will be in the `runs/detect/train/weights/` folder on Colab if it doesn't download automatically.

## 3. Install the Model
1.  **Copy** the downloaded `best.pt` file.
2.  **Paste** it into your project folder:
    `c:\Users\akhil\OneDrive\Documents\Academic Projects\Helmet Detection System\`

## 4. Run the Web App
Double-click `run_web_app.bat` to start the interface!

