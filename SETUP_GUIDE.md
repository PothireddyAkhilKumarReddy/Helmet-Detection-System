# Setup Guide: Training YOLOv8 (Colab + Kaggle Dataset)

## 1. Train Your Model (Using Google Colab)
We will use **Google Colab** to train the model, but we will use a dataset from **Kaggle**.

1.  **Open Google Colab**: Go to [https://colab.research.google.com/](https://colab.research.google.com/).
2.  **Upload Notebook**: Click "Upload" and select the `Train_YOLOv8_KaggleDataset.ipynb` file.
3.  **Get Kaggle API Key** (Required to download dataset):
    *   Log in to [Kaggle](https://www.kaggle.com/).
    *   Go to **Settings** > **Account** > **Create New API Token**.
    *   This will download a `kaggle.json` file. Keep it ready.
4.  **Find a Dataset**:
    *   Search Kaggle for "Helmet Number Plate YOLOv8".
    *   Copy the **Dataset Slug** (e.g., `simranvol/helmet-number-plate-detection`).
5.  **Run the Notebook**:
    *   In Colab, click **Runtime > Run all**.
    *   **Upload `kaggle.json`** when the cell asks for it.
    *   **Paste the Dataset Slug** when prompted.
    *   Wait for training to finish.

## 2. Download the Model
Once training is complete, the last cell in the notebook will trigger a download.
*   **File Name**: `best.pt`
*   **Location**: It will be in the folders on the left: `runs/detect/train/weights/`.

## 3. Install the Model
1.  **Copy** the downloaded `best.pt` file.
2.  **Paste** it into your project folder:
    `c:\Users\akhil\OneDrive\Documents\Academic Projects\Helmet Detection System\`

## 4. Run the Web App
Double-click `run_web_app.bat` to start the interface!

