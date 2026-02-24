// Traffic AI Guard - Dashboard Interaction Script

const dropArea = document.getElementById('upload-section');
const processingState = document.getElementById('loader');
const resultArea = document.getElementById('result-area');
const resultImg = document.getElementById('result-img');

// On load, set current time and initialize theme
document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    initTheme();

    // Start real-time clock
    setInterval(updateTime, 1000);

    // Bind file input change event for "Browse Files" clicking
    const fileInputEl = document.getElementById('file-input');
    if (fileInputEl) {
        fileInputEl.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                uploadFile(e.target.files[0]);
            }
        });
    }
});

// Theme Management
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

function initTheme() {
    const savedTheme = localStorage.getItem('app-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        let currentTheme = document.documentElement.getAttribute('data-theme');
        let newTheme = currentTheme === 'light' ? 'dark' : 'light';

        // Save and apply
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('app-theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    if (!themeIcon) return;
    if (theme === 'light') {
        themeIcon.className = "ph ph-moon"; // Show moon (to click back to dark)
    } else {
        themeIcon.className = "ph ph-sun"; // Show sun (to click to light)
    }
}

function updateTime() {
    const timeEl = document.getElementById('current-time');
    if (timeEl) {
        const now = new Date();
        timeEl.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
}

// Real-time metrics tracking
function incrementRealScans() {
    const scansEl = document.getElementById('today-scans');
    if (scansEl) {
        let current = parseInt(scansEl.innerText.replace(/,/g, ''));
        scansEl.innerText = (current + 1).toLocaleString();
    }
}

function incrementRealViolations() {
    const violationsEl = document.getElementById('violations-count');
    if (violationsEl) {
        let currentVio = parseInt(violationsEl.innerText.replace(/,/g, ''));
        violationsEl.innerText = (currentVio + 1).toLocaleString();
    }
}

// Drag & Drop Handling
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.add('highlight'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove('highlight'), false);
});

dropArea.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}, false);

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleFiles(files) {
    if (files.length > 0) {
        uploadFile(files[0]);
    }
}

function loadSample(url, filename) {
    // Show loading state while fetching the local file
    dropArea.style.display = 'none';
    resultArea.style.display = 'none';
    processingState.style.display = 'flex';

    fetch(url)
        .then(res => res.blob())
        .then(blob => {
            const file = new File([blob], filename, { type: blob.type || 'image/webp' });
            uploadFile(file);
        })
        .catch(err => {
            console.error('Error loading sample:', err);
            alert('Failed to load sample image.');
            resetApp();
        });
}

function uploadFile(file) {
    let url = '/detect';
    let formData = new FormData();
    formData.append('file', file);

    // Switch to Skeleton Loading UI
    dropArea.style.display = 'none';
    resultArea.style.display = 'none';
    processingState.style.display = 'flex'; // show loader

    fetch(url, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            // Hide Loader
            processingState.style.display = 'none';

            if (data.success) {
                try {
                    updateDashboard(data);
                } catch (uiError) {
                    console.error('UI Update Error:', uiError);
                    alert('Error updating dashboard UI: ' + uiError.message);
                    resetApp();
                }
            } else {
                alert('Error from server: ' + data.error);
                resetApp();
            }
        })
        .catch(error => {
            console.error('Network/Parsing Error:', error);
            processingState.style.display = 'none';
            // Differentiate JSON syntax block vs raw network unreachable
            if (error instanceof SyntaxError) {
                alert('Server returned an invalid response. Check backend terminal for 500 Internal Server errors.');
            } else {
                alert('An network connection error occurred. Ensure the server backend is running.');
            }
            resetApp();
        });
}

function updateDashboard(data) {
    updateTime();

    // 1. Main Image
    resultImg.src = data.result_url;

    // 2. Status Card
    const statusTextEl = document.getElementById('status-text');
    const statusCard = document.getElementById('status-card-container');
    const statusIcon = document.getElementById('status-icon');

    // Reset classes
    statusCard.classList.remove('is-safe', 'is-danger');

    const statusText = data.status_text || "Unknown";
    statusTextEl.innerText = statusText;

    if (statusText.includes("NO HELMET")) {
        statusCard.classList.add('is-danger');
        statusIcon.className = "ph ph-warning-circle";
    } else if (statusText.includes("With Helmet")) {
        statusCard.classList.add('is-safe');
        statusIcon.className = "ph ph-check-circle";
    } else {
        // Unknown or No rider
        statusIcon.className = "ph ph-question";
    }

    // 3. Plate Card
    const plateNumber = document.getElementById('plate-text');

    let hasText = (data.plate_text && data.plate_text !== "No Plate Detected");

    // Text update
    plateNumber.innerText = hasText ? data.plate_text : "NOT FOUND";
    if (!hasText) {
        plateNumber.style.color = "var(--text-muted)";
        plateNumber.style.fontSize = "1.2rem";
    } else {
        plateNumber.style.color = "#fbbf24";
        plateNumber.style.fontSize = "1.8rem";
    }

    // Reveal the dashboard grid
    resultArea.style.display = 'block';

    // 4. Update Recent Activity Table
    addRecentDetection(data);

    // 5. Update KPI Counters with real data
    incrementRealScans();
    if (statusText.includes("NO HELMET")) {
        incrementRealViolations();
    }
}

function addRecentDetection(data) {
    const tableBody = document.getElementById('recent-detections-body');
    if (!tableBody) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const statusText = data.status_text || "Unknown";

    let badgeClass = "badge-safe";
    if (statusText.includes("NO HELMET")) {
        badgeClass = "badge-danger";
    }

    let plateStr = data.plate_text && data.plate_text !== "No Plate Detected" ? data.plate_text : "--";

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${timeStr}</td>
        <td>
            <div style="width: 40px; height: 40px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border-color);">
                <img src="${data.result_url}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
        </td>
        <td><span class="badge ${badgeClass}">${statusText}</span></td>
        <td>${plateStr}</td>
        <td><button class="icon-btn"><i class="ph ph-dots-three-outline"></i></button></td>
    `;

    // Add new row to the top of the table
    tableBody.prepend(tr);
}

function resetApp() {
    resultArea.style.display = 'none';
    processingState.style.display = 'none';
    dropArea.style.display = 'block';

    // Reset main visual state
    resultImg.src = '';
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';

    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
