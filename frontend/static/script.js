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

    // Fetch initial database analytics state
    fetchDashboardStats();
    fetchDashboardHistory();

    // Bind file input change event for "Browse Files" clicking
    const fileInputEl = document.getElementById('file-input');
    if (fileInputEl) {
        fileInputEl.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                uploadFile(e.target.files[0]);
            }
        });
    }

    // Bind batch file input
    const batchFileInputEl = document.getElementById('batch-file-input');
    if (batchFileInputEl) {
        batchFileInputEl.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                uploadBatch(e.target.files);
            }
        });
    }
});

/* Tab Switching Logic */
function switchTab(tab) {
    const singleTabBtn = document.getElementById('tab-single');
    const batchTabBtn = document.getElementById('tab-batch');
    const singleSection = document.getElementById('upload-section');
    const batchSection = document.getElementById('batch-upload-section');
    const quickActions = document.getElementById('quick-actions');
    const resultArea = document.getElementById('result-area');

    resultArea.style.display = 'none';

    if (tab === 'single') {
        singleTabBtn.classList.add('active');
        batchTabBtn.classList.remove('active');
        singleSection.style.display = 'block';
        batchSection.style.display = 'none';
        quickActions.style.display = 'flex';
    } else if (tab === 'batch') {
        batchTabBtn.classList.add('active');
        singleTabBtn.classList.remove('active');
        batchSection.style.display = 'block';
        singleSection.style.display = 'none';
        quickActions.style.display = 'none'; // Hide quick test for batch
    }
}

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

// Real-time metrics fetching from API
function fetchDashboardStats() {
    fetch('/api/analytics/stats')
        .then(res => res.json())
        .then(data => {
            const scansEl = document.getElementById('today-scans');
            if (scansEl) scansEl.innerText = data.total_scans.toLocaleString();

            const violationsEl = document.getElementById('violations-count');
            if (violationsEl) violationsEl.innerText = data.total_violations.toLocaleString();

            const accuracyEl = document.getElementById('system-accuracy');
            if (accuracyEl) accuracyEl.innerText = data.accuracy.toFixed(1) + '%';
        })
        .catch(err => console.error("Error fetching stats:", err));
}

function fetchDashboardHistory() {
    fetch('/api/analytics/history')
        .then(res => res.json())
        .then(data => {
            const tableBody = document.getElementById('recent-detections-body');
            if (!tableBody) return;

            tableBody.innerHTML = ''; // Clear existing rows

            data.forEach(item => {
                const timeStr = item.timestamp.split(' ')[1].substring(0, 5); // Extract HH:MM
                const statusText = item.status_text || "Unknown";

                let badgeClass = "badge-safe";
                if (statusText.includes("NO HELMET")) badgeClass = "badge-danger";

                let plateStr = item.plate_text && item.plate_text !== "No Plate Detected" ? item.plate_text : "--";

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${timeStr}</td>
                    <td>
                        <div style="width: 40px; height: 40px; border-radius: 6px; overflow: hidden; border: 1px solid var(--border-color);">
                            <img src="${item.result_url}" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                    </td>
                    <td><span class="badge ${badgeClass}">${statusText}</span></td>
                    <td>${plateStr}</td>
                    <td><button class="icon-btn"><i class="ph ph-dots-three-outline"></i></button></td>
                `;
                tableBody.appendChild(tr);
            });
        })
        .catch(err => console.error("Error fetching history:", err));
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

function uploadBatch(files) {
    if (files.length === 0) return;

    let formData = new FormData();
    let validFilesFound = 0;

    // Filter for images only
    for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/')) {
            formData.append('files[]', files[i]);
            validFilesFound++;
        }
    }

    if (validFilesFound === 0) {
        alert("No valid images found in the selected folder.");
        return;
    }

    // Switch to Loading UI
    document.getElementById('upload-section').style.display = 'none';
    document.getElementById('batch-upload-section').style.display = 'none';
    document.getElementById('quick-actions').style.display = 'none';
    resultArea.style.display = 'none';
    processingState.style.display = 'flex';

    // Update loader text
    const loaderTitle = document.getElementById('loader-title');
    const loaderSubtitle = document.getElementById('loader-subtitle');
    if (loaderTitle) loaderTitle.innerText = `Processing Batch (${validFilesFound} images)...`;
    if (loaderSubtitle) loaderSubtitle.innerText = "Please keep this tab open. The backend is analyzing all frames.";

    fetch('/api/batch-detect', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Refresh the recent detections table and stats to show the new batch
                fetchDashboardStats();
                fetchDashboardHistory();

                // Populate the Batch Results Grid
                const grid = document.getElementById('batch-results-grid');
                grid.innerHTML = ''; // Clear previous results

                document.getElementById('batch-summary-text').innerText = `Processed ${data.results.length} images`;

                data.results.forEach(res => {
                    let badgeClass = "badge-safe";
                    let iconClass = "ph ph-check-circle";
                    let cardBorder = "1px solid var(--border-color)";

                    const statusText = res.status_text || "Unknown";

                    if (statusText.includes("NO HELMET")) {
                        badgeClass = "badge-danger";
                        iconClass = "ph ph-warning-circle";
                        cardBorder = "1px solid rgba(239, 68, 68, 0.4)";
                    } else if (statusText.includes("No Rider/Helmet Detected")) {
                        badgeClass = "badge-outline";
                        iconClass = "ph ph-question";
                    }

                    const plateStr = res.plate_text && res.plate_text !== "No Plate Detected" ? res.plate_text : "--";
                    const plateColor = plateStr !== "--" ? "#fbbf24" : "var(--text-muted)";

                    const cardHTML = `
                        <div class="metric-card" style="border: ${cardBorder}; padding: 1rem; display: flex; flex-direction: column; gap: 1rem;">
                            <div style="width: 100%; height: 180px; border-radius: 8px; overflow: hidden; background: #000;">
                                <img src="${res.result_url}" alt="Result" style="width: 100%; height: 100%; object-fit: contain;">
                            </div>
                            <div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; align-items: center;">
                                    <span style="font-size: 0.8rem; color: var(--text-muted); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 120px;" title="${res.filename}">${res.filename}</span>
                                    <span class="badge ${badgeClass}"><i class="${iconClass}"></i> ${statusText.split('(')[0].trim()}</span>
                                </div>
                                <div style="background: rgba(0,0,0,0.2); border-radius: 6px; padding: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 0.8rem; color: var(--text-muted);">Plate:</span>
                                    <span style="font-weight: 600; color: ${plateColor}; font-family: monospace;">${plateStr}</span>
                                </div>
                            </div>
                        </div>
                    `;
                    grid.insertAdjacentHTML('beforeend', cardHTML);
                });

                // Show the grid
                document.getElementById('batch-result-area').style.display = 'block';

            } else {
                alert('Error from server: ' + data.error);
                resetApp();
            }
        })
        .catch(error => {
            console.error('Batch Error:', error);
            alert('A network error occurred during batch processing.');
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

    // 4. Update Recent Activity Table and KPIs from Database Source of Truth
    fetchDashboardStats();
    fetchDashboardHistory();
}

function resetApp() {
    resultArea.style.display = 'none';
    const batchResultArea = document.getElementById('batch-result-area');
    if (batchResultArea) batchResultArea.style.display = 'none';
    processingState.style.display = 'none';

    const loaderTitle = document.getElementById('loader-title');
    const loaderSubtitle = document.getElementById('loader-subtitle');
    if (loaderTitle) loaderTitle.innerText = "Processing Image...";
    if (loaderSubtitle) loaderSubtitle.innerText = "YOLOv8 Large model is analyzing the frame";

    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab && activeTab.id === 'tab-batch') {
        switchTab('batch');
    } else {
        switchTab('single');
    }

    // Reset main visual state
    resultImg.src = '';
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
    const batchFileInput = document.getElementById('batch-file-input');
    if (batchFileInput) batchFileInput.value = '';

    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- LIVE CAMERA FEED LOGIC ---
let isStreaming = false;
let liveStatsInterval = null;

function toggleStream() {
    const videoEl = document.getElementById('live-video');
    const offlineState = document.getElementById('offline-state');
    const streamDot = document.getElementById('stream-dot');
    const streamStatus = document.getElementById('stream-status');
    const btn = document.getElementById('btn-start-stream');
    const overlay = document.getElementById('stream-overlay');

    if (!videoEl || !offlineState) return; // Prevent errors on other pages

    if (!isStreaming) {
        // Start Stream
        isStreaming = true;

        // Add a timestamp to bypass caching
        videoEl.src = `/api/live-feed?t=${new Date().getTime()}`;

        offlineState.style.display = 'none';
        videoEl.style.display = 'block';
        overlay.style.display = 'block';

        streamDot.classList.add('online');
        streamStatus.innerText = 'LIVE INFERENCE';
        streamStatus.style.color = 'var(--status-safe)';

        btn.innerHTML = '<i class="ph ph-stop"></i> Stop Stream';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
        btn.style.borderColor = 'var(--status-danger)';
        btn.style.color = 'var(--status-danger)';

        // Start polling stats faster while streaming
        liveStatsInterval = setInterval(() => {
            fetchDashboardStats();
            // Note: In a real app we'd fetch table history too, but that might be 
            // too heavy for SQLite at 10FPS. Stats are lighter.
        }, 3000);

    } else {
        // Stop Stream
        isStreaming = false;
        videoEl.src = ''; // Cut feed

        offlineState.style.display = 'block';
        videoEl.style.display = 'none';
        overlay.style.display = 'none';

        streamDot.classList.remove('online');
        streamStatus.innerText = 'OFFLINE';
        streamStatus.style.color = 'var(--text-secondary)';

        btn.innerHTML = '<i class="ph ph-play"></i> Start Stream';
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-secondary');
        btn.style.borderColor = '';
        btn.style.color = '';

        if (liveStatsInterval) clearInterval(liveStatsInterval);
    }
}
