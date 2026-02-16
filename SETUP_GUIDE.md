# Setup Guide: Training YOLOv8 on Kaggle

## 1. Train Your Model (Using Kaggle)
We will use **Kaggle** (free GPUs) to train the model.

1.  **Log in to Kaggle**: Go to [https://www.kaggle.com/](https://www.kaggle.com/).
2.  **Create New Notebook**: Click **Create > New Notebook**.
3.  **Upload the Notebook**:
    *   In the Kaggle notebook editor, go to **File > Import Notebook**.
    *   Select `Train_YOLOv8_Kaggle.ipynb` from your project folder.
4.  **Configure Settings** (Important!):
    *   Open the **Settings** sidebar (right side).
    *   **Accelerator**: Select **GPU T4 x2**.
    *   **Internet**: Switch **On**.
5.  **Get Roboflow API Key**:
    *   Go to [https://app.roboflow.com/settings/api](https://app.roboflow.com/settings/api).
    *   Copy your "Private API Key" (it's free).
6.  **Run**:
    *   Click **Run All**.
    *   Enter your API Key when prompted.

## 2. Download the Model
Once training finishes (approx 20 mins):
1.  Look at the **Output** tab (right sidebar, near Settings).
2.  Navigate to `/kaggle/working/runs/detect/train/weights/`.
3.  Find `best.pt`.
4.  Click the three dots `...` next to it and **Download**.

## 3. Install the Model
1.  **Copy** the downloaded `best.pt` file.
2.  **Paste** it into your project folder:
    `c:\Users\akhil\OneDrive\Documents\Academic Projects\Helmet Detection System\`

## 4. Run the Web App
Double-click `run_web_app.bat` to start the interface!

