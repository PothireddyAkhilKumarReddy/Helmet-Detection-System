import React, { useState, useEffect, useRef } from 'react';
import {
    CloudArrowUp,
    Folders,
    Image as ImageIcon,
    WarningCircle,
    Scan,
    CheckCircle,
    Question,
    ClockCounterClockwise,
    ArrowsCounterClockwise,
    FilePdf,
    MagnifyingGlassPlus,
    IdentificationCard,
    Images, // Added for batch upload icon
    VideoCamera // Added for video tab icon
} from '@phosphor-icons/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// The Flask backend API is running on port 5000 explicitly
const API_URL = 'http://127.0.0.1:5000';

function Dashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('single');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState({ title: '', subtitle: '' });
    const [currentTime, setCurrentTime] = useState('');

    const [resultData, setResultData] = useState(null); // Data for single image result
    const [batchResults, setBatchResults] = useState(null); // Data for batch results
    const [videoStreamUrl, setVideoStreamUrl] = useState(null); // URL for streaming video processing

    // Stats and History States
    const [stats, setStats] = useState({ total_scans: '--', total_violations: '--', accuracy: '--' });
    const [recentDetections, setRecentDetections] = useState([]);

    const singleFileInputRef = useRef(null);
    const batchFileInputRef = useRef(null);
    const videoFileInputRef = useRef(null); // Added for video upload

    // Initial Data Fetch & Clock
    useEffect(() => {
        fetchStats();
        fetchHistory();

        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/analytics/stats`);
            setStats(res.data);
        } catch (err) {
            console.error("Failed to fetch stats:", err);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/analytics/history`);
            setRecentDetections(res.data);
        } catch (err) {
            console.error("Failed to fetch history:", err);
        }
    };

    const handleSingleUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setLoadingMessage({
            title: 'Processing Image...',
            subtitle: 'YOLOv8 Large model is analyzing the frame'
        });
        setIsLoading(true);
        setResultData(null);
        setBatchResults(null);
        setVideoStreamUrl(null); // Clear video stream

        try {
            const res = await axios.post(`${API_URL}/detect`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                fetchStats();
                fetchHistory();
                navigate('/results', { state: { type: 'single', payload: res.data } });
            } else {
                alert(`Error: ${res.data.error}`);
            }
        } catch (err) {
            console.error(err);
            alert("Network error occurred during upload.");
        } finally {
            setIsLoading(false);
            if (singleFileInputRef.current) singleFileInputRef.current.value = '';
        }
    };

    const handleBatchUpload = async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        let validCount = 0;

        for (let i = 0; i < files.length; i++) {
            if (files[i].type.startsWith('image/')) {
                formData.append('files[]', files[i]);
                validCount++;
            }
        }

        if (validCount === 0) {
            alert("No valid images found in the selected folder.");
            return;
        }

        setLoadingMessage({
            title: `Processing Batch (${validCount} images)...`,
            subtitle: 'Please keep this tab open. The backend is analyzing all frames.'
        });
        setIsLoading(true);
        setResultData(null);
        setBatchResults(null);
        setVideoStreamUrl(null); // Clear video stream

        try {
            const res = await axios.post(`${API_URL}/api/batch-detect`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                fetchStats();
                fetchHistory();
                navigate('/results', { state: { type: 'batch', payload: res.data.results } });
            } else {
                alert(`Error: ${res.data.error}`);
            }
        } catch (err) {
            console.error(err);
            alert("Network error occurred during batch processing.");
        } finally {
            setIsLoading(false);
            if (batchFileInputRef.current) batchFileInputRef.current.value = '';
        }
    };

    const handleVideoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('video', file);

        setLoadingMessage({
            title: 'Processing Video Stream...',
            subtitle: 'The backend is analyzing the video frames in real-time.'
        });
        setIsLoading(true);
        setResultData(null);
        setBatchResults(null);
        setVideoStreamUrl(null); // Clear previous video stream

        try {
            const res = await axios.post(`${API_URL}/api/upload-video`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                // Refresh history but video stats usually don't populate instantly until frame yields finish
                fetchHistory();
                navigate('/results', { state: { type: 'video', payload: res.data } });
            } else {
                alert(`Error: ${res.data.error}`);
            }
        } catch (err) {
            console.error(err);
            alert("Network error occurred during video processing.");
        } finally {
            setIsLoading(false);
            if (videoFileInputRef.current) videoFileInputRef.current.value = '';
        }
    };

    const handleNewAnalysis = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="dashboard-container" style={{ padding: '2rem 5%', maxWidth: '1100px', margin: '0 auto' }}>
            {/* Content Header (Title + Time) */}
            <div className="content-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>Traffic Overview</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>Monitor live streams and process AI analytics.</p>
                </div>
                <div className="time-badge">
                    <ClockCounterClockwise size={18} />
                    <span>{currentTime}</span>
                </div>
            </div>

            {/* Top Horizon KPIs */}
            <div className="horizon-panel glass-panel">
                <div className="horizon-item">
                    <div className="horizon-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--brand-primary)' }}>
                        <Scan size={24} />
                    </div>
                    <div className="horizon-data">
                        <p>Today's Scans</p>
                        <h3>{stats.total_scans}</h3>
                    </div>
                </div>

                <div className="horizon-item">
                    <div className="horizon-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--status-danger)' }}>
                        <WarningCircle size={24} />
                    </div>
                    <div className="horizon-data">
                        <p>Violations Detected</p>
                        <h3>{stats.total_violations}</h3>
                    </div>
                </div>

                <div className="horizon-item">
                    <div className="horizon-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--status-safe)' }}>
                        <Scan size={24} /> {/* Placeholder icon mapping Crosshair */}
                    </div>
                    <div className="horizon-data">
                        <p>System Accuracy</p>
                        <h3>{stats.accuracy}%</h3>
                    </div>
                </div>
            </div>

            {/* Main Centered Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', marginTop: '2.5rem' }}>

                {/* Analysis Studio */}
                <div className="analysis-card glass-panel">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3><Scan /> Analysis Studio</h3>
                        <div className="studio-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`}
                                onClick={() => setActiveTab('single')}
                            >
                                Single Image
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'batch' ? 'active' : ''}`}
                                onClick={() => setActiveTab('batch')}
                            >
                                Batch Processing
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'video' ? 'active' : ''}`}
                                onClick={() => setActiveTab('video')}
                            >
                                Video
                            </button>
                        </div>
                    </div>

                    {!isLoading ? (
                        <>
                            {activeTab === 'single' && (
                                <div className="upload-section" onClick={() => singleFileInputRef.current?.click()}>
                                    <input
                                        type="file"
                                        ref={singleFileInputRef}
                                        style={{ display: 'none' }}
                                        accept="image/jpeg, image/jpg, image/png, image/webp"
                                        onChange={handleSingleUpload}
                                    />
                                    <div className="upload-content">
                                        <div className="upload-icon-wrapper">
                                            <CloudArrowUp size={48} />
                                        </div>
                                        <h3>Upload an Image for Analysis</h3>
                                        <p>Click or drag and drop your file here</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '10px' }}>Supports JPG, PNG, WEBP</p>
                                    </div>
                                </div>
                            )}

                            {/* Batch Image Upload Container */}
                            {activeTab === 'batch' && (
                                <div
                                    className="upload-section"
                                    onClick={() => batchFileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        ref={batchFileInputRef}
                                        style={{ display: 'none' }}
                                        webkitdirectory="true"
                                        directory="true"
                                        multiple
                                        onChange={handleBatchUpload}
                                    />
                                    <div className="upload-content">
                                        <div className="upload-icon-wrapper">
                                            <Folders size={48} />
                                        </div>
                                        <h3>Upload a Folder for Batch Analysis</h3>
                                        <p>Click or drag and drop your folder here</p>
                                    </div>
                                </div>
                            )}

                            {/* Video Upload Container */}
                            {activeTab === 'video' && (
                                <div
                                    className="upload-section"
                                    style={{ border: '2px dashed #9d4edd', backgroundColor: 'rgba(157, 78, 221, 0.05)' }}
                                >
                                    <input
                                        type="file"
                                        ref={videoFileInputRef}
                                        style={{ display: 'none' }}
                                        accept="video/*"
                                        onChange={handleVideoUpload}
                                    />
                                    <div className="upload-content" onClick={() => videoFileInputRef.current?.click()}>
                                        <div className="upload-icon-wrapper" style={{ background: 'rgba(157, 78, 221, 0.2)' }}>
                                            <VideoCamera size={48} color="#c77dff" />
                                        </div>
                                        <h3>Upload Video for Analysis</h3>
                                        <p>Click or drag and drop your video here</p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '10px' }}>Supports MP4, AVI, MKV</p>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="loader-container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                            <div className="pulse-ring"></div>
                            <h3 style={{ marginTop: '1.5rem', color: 'var(--text-primary)' }}>{loadingMessage.title}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{loadingMessage.subtitle}</p>
                            <div style={{ width: '200px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', margin: '15px auto', overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: 'var(--brand-primary)', width: '50%', animation: 'loadBar 2s infinite ease-in-out' }}></div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Removed Result Views to instead route to /results */}

                {/* Recent Table */}
                <div className="recent-activity-card glass-panel">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                        <h3><ClockCounterClockwise /> Recent Detections</h3>
                        <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>View All</button>
                    </div>
                    <div className="table-container">
                        <table className="data-table" style={{ width: '100%', textAlign: 'left' }}>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Thumbnail</th>
                                    <th>Status</th>
                                    <th>Plate Detected</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentDetections.map((row, i) => (
                                    <tr key={i}>
                                        <td>{row.timestamp.split(' ')[1].slice(0, 5)}</td>
                                        <td>
                                            <img src={`${API_URL}${row.result_url}`} alt="thumb" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                                        </td>
                                        <td>
                                            <span className={`badge ${row.status_text.includes('NO HELMET') ? 'badge-danger' : 'badge-safe'}`}>
                                                {row.status_text}
                                            </span>
                                        </td>
                                        <td style={{ color: row.plate_text !== 'No Plate Detected' ? '#fbbf24' : 'inherit' }}>
                                            {row.plate_text}
                                        </td>
                                    </tr>
                                ))}
                                {recentDetections.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No recent activity.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
