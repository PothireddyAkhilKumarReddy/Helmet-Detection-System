import json

notebook_path = "c:/Users/akhil/OneDrive/Documents/Academic Projects/Helmet Detection System/Train_YOLOv8_KaggleDataset.ipynb"

with open(notebook_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

new_code_source = [
    "# 6. Display Training Results & Metrics Graphs (Accuracy / Loss)\n",
    "from IPython.display import Image, display\n",
    "\n",
    "print('--- Training vs Validation Loss & Accuracy Metrics ---')\n",
    "try:\n",
    "    # YOLOv8 automatically saves this comprehensive graph during training\n",
    "    display(Image(filename='runs/detect/train/results.png', width=1000))\n",
    "except Exception as e:\n",
    "    print('Results graph not found. Make sure training has started/completed.', e)\n",
    "\n",
    "print('\\n--- Model Confusion Matrix ---')\n",
    "try:\n",
    "    # Shows how well it differentiates Helmet vs No Helmet vs Plate\n",
    "    display(Image(filename='runs/detect/train/confusion_matrix.png', width=800))\n",
    "except Exception:\n",
    "    pass\n",
    "\n",
    "print('\\n--- Precision-Recall (PR) Curve ---')\n",
    "try:\n",
    "    # Shows the tradeoff between precision and recall for different thresholds\n",
    "    display(Image(filename='runs/detect/train/PR_curve.png', width=800))\n",
    "except Exception:\n",
    "    pass\n"
]

new_cell = {
    "cell_type": "code",
    "execution_count": None,
    "metadata": {},
    "outputs": [],
    "source": new_code_source
}

nb['cells'].append(new_cell)

with open(notebook_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=4)
    
print("Notebook updated successfully.")
