const dropArea = document.getElementById('drop-area');
const loader = document.getElementById('loader');
const resultArea = document.getElementById('result-area');
const resultImg = document.getElementById('result-img');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

// Highlight drop area when item is dragged over it
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

// Handle dropped files
dropArea.addEventListener('drop', handleDrop, false);

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    dropArea.classList.add('highlight');
}

function unhighlight(e) {
    dropArea.classList.remove('highlight');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length > 0) {
        uploadFile(files[0]);
    }
}

function uploadFile(file) {
    let url = '/detect';
    let formData = new FormData();

    formData.append('file', file);

    // Initial UI State
    dropArea.classList.add('hidden');
    loader.classList.remove('hidden');

    fetch(url, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            loader.classList.add('hidden');
            if (data.success) {
                resultImg.src = data.result_url;
                resultArea.classList.remove('hidden');

                // Show Plate Text and Image
                const plateBox = document.getElementById('plate-result');
                const plateNumber = document.getElementById('plate-number');
                const plateImg = document.getElementById('plate-crop-img');
                const statusText = document.getElementById('helmet-status');

                if (plateBox && plateNumber) {
                    // Check if we have text OR if we have an image URL
                    let hasText = (data.plate_text && data.plate_text !== "No Plate Detected");
                    let hasImage = (data.plate_url && data.plate_url.length > 0);

                    // Update Status
                    if (statusText) {
                        statusText.innerText = data.status_text || "Unknown";
                        if (data.status_text && data.status_text.includes("NO HELMET")) {
                            statusText.style.color = "red";
                        } else {
                            statusText.style.color = "#00ff00"; // Green
                        }
                    }

                    if (hasText || hasImage || data.status_text) {
                        plateNumber.innerText = hasText ? `"${data.plate_text}"` : "Text not recognized";
                        plateBox.classList.remove('hidden');

                        if (hasImage) {
                            plateImg.src = data.plate_url;
                            plateImg.classList.remove('hidden');
                        } else {
                            plateImg.classList.add('hidden');
                        }
                    } else {
                        plateBox.classList.add('hidden');
                    }
                }
            } else {
                alert('Error: ' + data.error);
                resetApp();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            loader.classList.add('hidden');
            alert('An error occurred during processing.');
            resetApp();
        });
}

function resetApp() {
    resultArea.classList.add('hidden');
    dropArea.classList.remove('hidden');
    resultImg.src = '';
    // reset file input
    document.getElementById('fileElem').value = '';
    const plateBox = document.getElementById('plate-result');
    if (plateBox) plateBox.classList.add('hidden');
}
