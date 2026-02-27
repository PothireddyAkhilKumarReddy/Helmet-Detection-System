import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CaretLeft, CheckCircle, WarningCircle, IdentificationCard, DownloadSimple, VideoCamera, Images, Scan } from '@phosphor-icons/react';
import '../index.css';

const API_URL = 'http://127.0.0.1:5000';

function Results() {
    const location = useLocation();
    const navigate = useNavigate();

    // The state passed from Dashboard
    // type: 'single' | 'batch' | 'video'
    // payload: the JSON response data
    const { type, payload } = location.state || {};

    const [videoStats, setVideoStats] = useState({ safe: 0, unsafe: 0, plates: [] });

    // Open SSE stream for Live Video Metrics
    useEffect(() => {
        let eventSource;
        if (type === 'video' && payload?.filename) {
            eventSource = new EventSource(`${API_URL}/api/stream-stats/${payload.filename}`);
            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setVideoStats(data);
                } catch (e) {
                    console.error("Error parsing SSE video stats", e);
                }
            };
        }
        return () => {
            if (eventSource) eventSource.close();
        };
    }, [type, payload]);

    if (!payload) {
        return (
            <div className="dashboard-container" style={{ padding: '4rem 5%', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--text-primary)' }}>No Analysis Data Found</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Please start a new analysis from the Dashboard.</p>
                <button className="btn-primary" onClick={() => navigate('/')}>
                    <CaretLeft /> Back to Dashboard
                </button>
            </div>
        );
    }

    const renderSingleResult = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Headers */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontWeight: 600, color: 'var(--text-secondary)' }}>Original Input</h3>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Raw image captured from source</p>
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontWeight: 600, color: 'var(--brand-primary)' }}>AI Output</h3>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>YOLOv8 & OCR Processing</p>
                </div>
            </div>

            {/* Split View */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 45%', background: '#000', borderRadius: '12px', overflow: 'hidden', minHeight: '300px', display: 'flex', alignItems: 'center' }}>
                    <img src={`${API_URL}${payload.input_url}`} alt="Input" style={{ width: '100%', display: 'block' }} />
                </div>
                <div style={{ flex: '1 1 45%', background: '#000', borderRadius: '12px', overflow: 'hidden', minHeight: '300px', display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <img src={`${API_URL}${payload.result_url}`} alt="Output" style={{ width: '100%', display: 'block' }} />
                </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                <div className={`metric-card ${payload.status_text.includes("NO HELMET") ? 'is-danger' : 'is-safe'}`} style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Violation Status</span>
                        {payload.status_text.includes("NO HELMET") ? <WarningCircle size={28} color="var(--status-danger)" /> : <CheckCircle size={28} color="var(--status-safe)" />}
                    </div>
                    <h2 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-primary)' }}>{payload.status_text}</h2>
                </div>

                <div className="metric-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Detected Plate</span>
                        <IdentificationCard size={28} color="var(--brand-primary)" />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', margin: 0, color: payload.plate_text !== 'No Plate Detected' ? '#fbbf24' : 'var(--text-muted)' }}>
                        {payload.plate_text}
                    </h2>
                </div>
            </div>
        </div>
    );

    const renderBatchResults = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Processed {payload.length} items successfully in batch.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {payload.map((res, idx) => (
                    <div key={idx} className="metric-card" style={{ padding: '1rem', border: `1px solid ${res.status_text?.includes('NO HELMET') ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255,255,255,0.05)'}` }}>
                        <div style={{ display: 'flex', gap: '10px', height: '140px', marginBottom: '1rem' }}>
                            <div style={{ flex: 1, background: '#000', borderRadius: '6px', overflow: 'hidden' }}>
                                <img src={`${API_URL}${res.input_url}`} alt="In" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <div style={{ flex: 1, background: '#000', borderRadius: '6px', overflow: 'hidden' }}>
                                <img src={`${API_URL}${res.result_url}`} alt="Out" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{res.filename}</span>
                            <span className={`badge ${res.status_text?.includes('NO HELMET') ? 'badge-danger' : 'badge-safe'}`}>
                                {res.status_text?.split('(')[0]?.trim()}
                            </span>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.8rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Plate:</span>
                            <span style={{ fontWeight: 600, color: res.plate_text !== 'No Plate Detected' ? '#fbbf24' : 'var(--text-muted)' }}>{res.plate_text || '--'}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderVideoResult = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Headers */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontWeight: 600, color: 'var(--text-secondary)' }}>Original Input Video</h3>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Raw playback</p>
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontWeight: 600, color: 'var(--brand-primary)' }}>Live Inference Stream</h3>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Processing frame-by-frame</p>
                </div>
            </div>

            {/* Split View */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 45%', background: '#000', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                    <video
                        src={`${API_URL}${payload.input_url}`}
                        autoPlay
                        loop
                        muted
                        controls
                        style={{ width: '100%', display: 'block' }}
                    />
                </div>
                <div style={{ flex: '1 1 45%', background: '#000', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 15, left: 15, display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}>
                        <div style={{ width: 10, height: 10, background: 'var(--status-danger)', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
                        <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>PROCESSING</span>
                    </div>
                    <img src={`${API_URL}${payload.stream_url}`} alt="Video Inference Stream" style={{ width: '100%', display: 'block' }} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                <div className="metric-card" style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--status-safe)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem' }}>Safe Riders</span>
                        <CheckCircle size={28} color="var(--status-safe)" />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', margin: '10px 0', color: 'var(--status-safe)' }}>{videoStats.safe}</h2>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Helmets Detected</p>
                </div>

                <div className="metric-card is-danger" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--status-danger)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem' }}>Violations</span>
                        <WarningCircle size={28} color="var(--status-danger)" />
                    </div>
                    <h2 style={{ fontSize: '2.5rem', margin: '10px 0', color: 'var(--status-danger)' }}>{videoStats.unsafe}</h2>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>No Helmets Found</p>
                </div>

                <div className="metric-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem' }}>Recent Plate</span>
                        <IdentificationCard size={28} color="var(--brand-primary)" />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', margin: '15px 0', color: videoStats.plates?.length && videoStats.plates[0] !== "No Text Detected" ? '#fbbf24' : 'var(--text-muted)' }}>
                        {videoStats.plates?.length ? videoStats.plates[-1] || videoStats.plates[0] : "No Plate Scanning..."}
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Optical Character Recognition</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="dashboard-container" style={{ padding: '2rem 5%', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <button
                        onClick={() => navigate('/')}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '0 0 10px 0', fontSize: '1rem' }}
                    >
                        <CaretLeft /> Back to Dashboard
                    </button>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {type === 'single' && <Scan color="var(--brand-primary)" />}
                        {type === 'batch' && <Images color="var(--brand-primary)" />}
                        {type === 'video' && <VideoCamera color="var(--brand-primary)" />}
                        Analysis Results
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-outline">
                        <DownloadSimple /> Export Report
                    </button>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                {type === 'single' && renderSingleResult()}
                {type === 'batch' && renderBatchResults()}
                {type === 'video' && renderVideoResult()}
            </div>
        </div>
    );
}

export default Results;
