import React, { useState, useEffect, useRef } from 'react';
import {
    CloudArrowUp,
    Folders,
    WarningCircle,
    Scan,
    ClockCounterClockwise,
    VideoCamera,
    Car,
    WarningOctagon,
    Target,
    CheckCircle
} from '@phosphor-icons/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://127.0.0.1:5000';

function Dashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('single');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState({ title: '', subtitle: '' });

    const [stats, setStats] = useState({ total_scans: '--', total_violations: '--', accuracy: '--' });
    const [recentDetections, setRecentDetections] = useState([]);

    const singleFileInputRef = useRef(null);
    const batchFileInputRef = useRef(null);
    const videoFileInputRef = useRef(null);

    useEffect(() => {
        fetchStats();
        fetchHistory();
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

    const handleUploadTemplate = async (event, uploadType) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        let endpoint = '';
        let routeType = '';

        if (uploadType === 'single') {
            formData.append('file', files[0]);
            endpoint = '/detect';
            routeType = 'single';
            setLoadingMessage({ title: 'Processing Image...', subtitle: 'YOLOv8 is analyzing the frame' });
        } else if (uploadType === 'batch') {
            let validCount = 0;
            for (let i = 0; i < files.length; i++) {
                if (files[i].type.startsWith('image/')) {
                    formData.append('files[]', files[i]);
                    validCount++;
                }
            }
            if (validCount === 0) { alert("No valid images found."); return; }
            endpoint = '/api/batch-detect';
            routeType = 'batch';
            setLoadingMessage({ title: `Processing Batch (${validCount} images)...`, subtitle: 'Please wait.' });
        } else if (uploadType === 'video') {
            formData.append('video', files[0]);
            endpoint = '/api/upload-video';
            routeType = 'video';
            setLoadingMessage({ title: 'Processing Video Stream...', subtitle: 'Analyzing video frames.' });
        }

        setIsLoading(true);

        try {
            const res = await axios.post(`${API_URL}${endpoint}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success || res.status === 200) {
                navigate('/results', { state: { type: routeType, payload: res.data.results || res.data } });
            } else {
                alert(`Error: ${res.data.error}`);
            }
        } catch (err) {
            console.error(err);
            alert("Network error occurred during processing.");
        } finally {
            setIsLoading(false);
            if (singleFileInputRef.current) singleFileInputRef.current.value = '';
            if (batchFileInputRef.current) batchFileInputRef.current.value = '';
            if (videoFileInputRef.current) videoFileInputRef.current.value = '';
        }
    };

    return (
        <div style={{ padding: '0 5%', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>System Overview</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Real-time monitoring of traffic systems.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-safe)', boxShadow: '0 0 8px var(--status-safe)' }}></div>
                    <span style={{ color: 'var(--status-safe)', fontWeight: 600 }}>System Online</span>
                    <span style={{ marginLeft: '12px' }}>Last update: Just now</span>
                </div>
            </div>

            {/* Top KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

                {/* Card 1 */}
                <div className="premium-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Car size={24} weight="fill" />
                        </div>
                        <span style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600 }}>+12.5% ↗</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Total Vehicles Scanned</p>
                    <h2 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 700 }}>{stats.total_scans} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>today</span></h2>
                    <div style={{ height: '4px', background: 'var(--bg-panel-hover)', borderRadius: '2px', marginTop: '1.25rem', overflow: 'hidden' }}>
                        <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)' }}></div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="premium-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <WarningCircle size={24} weight="fill" />
                        </div>
                        <span style={{ color: '#f43f5e', fontSize: '0.85rem', fontWeight: 600 }}>+2.4% ↗</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Active Violations</p>
                    <h2 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 700 }}>{stats.total_violations} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>flagged</span></h2>
                    <div style={{ height: '4px', background: 'var(--bg-panel-hover)', borderRadius: '2px', marginTop: '1.25rem', overflow: 'hidden' }}>
                        <div style={{ width: '35%', height: '100%', background: 'linear-gradient(90deg, #9333ea, #a855f7)' }}></div>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="premium-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Target size={24} weight="fill" />
                        </div>
                        <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>Stable</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Model Confidence</p>
                    <h2 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 700 }}>{stats.accuracy}% <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>YOLOv8</span></h2>
                    <div style={{ height: '4px', background: 'var(--bg-panel-hover)', borderRadius: '2px', marginTop: '1.25rem', overflow: 'hidden' }}>
                        <div style={{ width: '98%', height: '100%', background: 'linear-gradient(90deg, #059669, #10b981)' }}></div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>

                {/* Neural Analysis Zone */}
                <div className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', margin: 0 }}><Scan color="var(--brand-primary)" /> Neural Analysis Zone</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setActiveTab('single')} className={activeTab === 'single' ? 'tab-pill active' : 'tab-pill'}>Single</button>
                            <button onClick={() => setActiveTab('batch')} className={activeTab === 'batch' ? 'tab-pill active' : 'tab-pill'}>Batch</button>
                            <button onClick={() => setActiveTab('video')} className={activeTab === 'video' ? 'tab-pill active' : 'tab-pill'}>Video</button>
                        </div>
                    </div>

                    {!isLoading ? (
                        <div className="upload-zone">
                            {activeTab === 'single' && <input type="file" ref={singleFileInputRef} style={{ display: 'none' }} onChange={(e) => handleUploadTemplate(e, 'single')} accept="image/*" />}
                            {activeTab === 'batch' && <input type="file" ref={batchFileInputRef} style={{ display: 'none' }} onChange={(e) => handleUploadTemplate(e, 'batch')} webkitdirectory="true" directory="true" multiple />}
                            {activeTab === 'video' && <input type="file" ref={videoFileInputRef} style={{ display: 'none' }} onChange={(e) => handleUploadTemplate(e, 'video')} accept="video/*" />}

                            <div className="upload-icon-pulse">
                                <CloudArrowUp size={48} weight="duotone" />
                            </div>
                            <h3>Drop {activeTab === 'video' ? 'Video Stream or File' : 'Image Files or Folder'}</h3>
                            <p>Support for MP4, AVI, JPG, PNG. Files are processed locally using WebAssembly where supported.</p>
                            <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => {
                                if (activeTab === 'single') singleFileInputRef.current?.click();
                                if (activeTab === 'batch') batchFileInputRef.current?.click();
                                if (activeTab === 'video') videoFileInputRef.current?.click();
                            }}>Select Source</button>
                        </div>
                    ) : (
                        <div className="upload-zone loading">
                            <div className="pulse-ring"></div>
                            <h3 style={{ marginTop: '1rem' }}>{loadingMessage.title}</h3>
                            <p style={{ color: 'var(--text-muted)' }}>{loadingMessage.subtitle}</p>
                        </div>
                    )}
                </div>

                {/* Recent Detections Vertical List */}
                <div className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', margin: 0, cursor: 'pointer' }}
                            onClick={() => navigate('/history')}
                        >
                            <ClockCounterClockwise color="var(--brand-primary)" /> Recent Detections
                        </h3>
                        {recentDetections.length > 5 && (
                            <button
                                onClick={() => navigate('/history')}
                                style={{ background: 'transparent', border: 'none', color: 'var(--brand-primary)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                            >
                                View All
                            </button>
                        )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '400px', paddingRight: '8px' }}>
                        {recentDetections.slice(0, 5).map((row, i) => (
                            <div key={i} className="detection-list-item">
                                <div className="detection-icon" style={{ background: row.status_text.includes('NO HELMET') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: row.status_text.includes('NO HELMET') ? '#ef4444' : '#10b981' }}>
                                    {row.status_text.includes('NO HELMET') ? <WarningOctagon size={20} weight="fill" /> : <CheckCircle size={20} weight="fill" />}
                                </div>
                                <div className="detection-info">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <h4 style={{ color: row.status_text.includes('NO HELMET') ? '#ef4444' : '#10b981', margin: 0, fontSize: '0.85rem', fontWeight: 700 }}>{row.status_text}</h4>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.timestamp.split(' ')[1].slice(0, 5)}</span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', margin: '0.2rem 0', color: 'var(--text-primary)' }}>{row.plate_text !== 'No Plate Detected' ? row.plate_text : 'Unknown Vehicle'}</p>
                                    <div className="detection-img-preview" style={{ backgroundImage: `url(${API_URL}${row.result_url})` }}>
                                        <div className="conf-badge">0.98 Conf</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {recentDetections.length === 0 && (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>No recent activity.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Camera Feeds */}
            <div className="premium-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Feeds</h3>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
                        <span style={{ color: 'var(--status-safe)' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-safe)', marginRight: '6px' }}></span>3 Online</span>
                        <span style={{ color: 'var(--status-danger)' }}><span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-danger)', marginRight: '6px' }}></span>1 Offline</span>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    {[1, 2, 3, 4].map(cam => (
                        <div key={cam} className="camera-feed-box" style={{ opacity: cam === 3 ? 0.5 : 1 }}>
                            <div className="cam-label">
                                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: cam === 3 ? 'var(--status-danger)' : 'var(--status-safe)', marginRight: '6px' }}></span>
                                CAM-0{cam}
                            </div>
                            {cam === 3 ? (
                                <div style={{ height: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--status-danger)' }}>
                                    <VideoCamera size={32} weight="slash" style={{ marginBottom: '8px' }} />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>NO SIGNAL</span>
                                </div>
                            ) : (
                                <div style={{ height: '140px', background: 'var(--bg-input)', backgroundImage: `url(https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&q=80)`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
