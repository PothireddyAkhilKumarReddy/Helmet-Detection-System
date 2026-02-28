import React, { useState, useEffect, useRef } from 'react';
import { VideoCamera, Play, Stop, VideoCameraSlash, Broadcast } from '@phosphor-icons/react';

const API_URL = 'http://127.0.0.1:5000';

function LiveFeed() {
    const [isStreaming, setIsStreaming] = useState(false);
    const videoRef = useRef(null);

    // Clean up the stream if the user navigates away
    useEffect(() => {
        return () => {
            if (videoRef.current) {
                videoRef.current.src = '';
            }
        };
    }, []);

    const toggleStream = () => {
        if (!isStreaming) {
            // Start Stream
            setIsStreaming(true);
            if (videoRef.current) {
                // Add timestamp to bypass cache
                videoRef.current.src = `${API_URL}/api/live-feed?t=${new Date().getTime()}`;
            }
        } else {
            // Stop Stream
            setIsStreaming(false);
            if (videoRef.current) {
                videoRef.current.src = ''; // Cut feed
            }
        }
    };

    return (
        <div className="dashboard-container" style={{ padding: '2rem' }}>
            <div className="content-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <VideoCamera size={32} /> Live Camera Feed
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Monitor street cameras and process traffic streams in real-time.</p>
                </div>
            </div>

            <div className="live-feed-container glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Controls Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="status-indicator">
                            <span
                                className={`pulse-dot ${isStreaming ? 'online' : ''}`}
                                style={{ width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block', backgroundColor: isStreaming ? 'var(--status-safe)' : 'var(--status-danger)' }}
                            ></span>
                            <span style={{ fontWeight: 600, color: isStreaming ? 'var(--status-safe)' : 'var(--text-secondary)' }}>
                                {isStreaming ? 'LIVE INFERENCE' : 'OFFLINE'}
                            </span>
                        </div>
                        <select className="settings-select" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                            <option>Camera 1 (Main Intersection)</option>
                            <option>Camera 2 (Highway Exit)</option>
                            <option>Camera 3 (Toll Booth)</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            className={isStreaming ? "btn-secondary" : "btn-primary"}
                            onClick={toggleStream}
                            style={{ padding: '8px 16px', borderColor: isStreaming ? 'var(--status-danger)' : '', color: isStreaming ? 'var(--status-danger)' : '' }}
                        >
                            {isStreaming ? <><Stop weight="fill" /> Stop Stream</> : <><Play weight="fill" /> Start Stream</>}
                        </button>
                    </div>
                </div>

                {/* Video Display Area */}
                <div className="video-wrapper" style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

                    {/* Offline State UI */}
                    {!isStreaming && (
                        <div id="offline-state" style={{ textAlign: 'center' }}>
                            <VideoCameraSlash size={48} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '1rem' }} />
                            <h3 style={{ color: 'rgba(255,255,255,0.4)' }}>Stream Paused</h3>
                        </div>
                    )}

                    {/* The actual MJPEG feed */}
                    <img
                        ref={videoRef}
                        alt="Live Feed"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', display: isStreaming ? 'block' : 'none' }}
                    />

                    {/* Overlay Stats */}
                    {isStreaming && (
                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <Broadcast /> LIVE INFERENCE
                            </span>
                        </div>
                    )}
                </div>

                {/* Info Panel */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div className="metric-card" style={{ padding: '1rem', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>FPS Target</div>
                        <h3 style={{ fontFamily: 'monospace' }}>24.0</h3>
                    </div>
                    <div className="metric-card" style={{ padding: '1rem', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Analysis Engine</div>
                        <h3>YOLOv8 Large</h3>
                    </div>
                    <div className="metric-card" style={{ padding: '1rem', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Bandwidth</div>
                        <h3 style={{ fontFamily: 'monospace' }}>~2.4 MB/s</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LiveFeed;
