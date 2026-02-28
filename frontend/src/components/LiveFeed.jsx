import React, { useState, useEffect, useRef } from 'react';
import { VideoCamera, Play, Pause, Camera, Flag, SquaresFour, SkipBack, SkipForward, ClockCounterClockwise } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://127.0.0.1:5000';

function LiveFeed() {
    const navigate = useNavigate();
    const [isStreaming, setIsStreaming] = useState(false);
    const videoRef = useRef(null);

    // Simulated Event Ledger for Live Webcams (Since pure live-feed doesn't have an SSE ledger yet)
    const [liveEvents, setLiveEvents] = useState([]);

    useEffect(() => {
        return () => {
            if (videoRef.current) {
                videoRef.current.src = '';
            }
        };
    }, []);

    const toggleStream = () => {
        if (!isStreaming) {
            setIsStreaming(true);
            if (videoRef.current) {
                videoRef.current.src = `${API_URL}/api/live-feed?t=${new Date().getTime()}`;
            }
            // Start a fake polling for the sake of the mockup UI filling out
            const interval = setInterval(() => {
                setLiveEvents(prev => [{
                    time: new Date().toLocaleTimeString(),
                    cam: 'CAM-01',
                    status: 'No Helmet Detected',
                    confidence: (Math.random() * (0.99 - 0.85) + 0.85).toFixed(2)
                }, ...prev].slice(0, 50));
            }, 8000);
            return () => clearInterval(interval);
        } else {
            setIsStreaming(false);
            if (videoRef.current) {
                videoRef.current.src = '';
            }
        }
    };

    return (
        <div style={{ padding: '1rem 5%', maxWidth: '1600px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.5rem 0', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isStreaming ? 'var(--status-danger)' : 'var(--text-muted)', boxShadow: isStreaming ? '0 0 10px var(--status-danger)' : 'none' }}></div>
                        Global Camera Network
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Real-time live inference stream from connected webcams.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div className="time-badge" style={{ color: isStreaming ? 'var(--status-safe)' : 'var(--text-muted)', borderColor: isStreaming ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)', background: isStreaming ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-input)' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isStreaming ? 'var(--status-safe)' : 'var(--text-muted)' }}></span>
                        {isStreaming ? 'NETWORK ONLINE' : 'NETWORK OFFLINE'}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'stretch' }}>

                {/* Left Col: Giant Video Player */}
                <div style={{ flex: '1 1 70%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="premium-card" style={{ padding: '0', overflow: 'hidden', background: '#000', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {!isStreaming && (
                                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                                    <VideoCamera size={48} weight="duotone" style={{ marginBottom: '1rem' }} />
                                    <h3>Camera Feed Offline</h3>
                                    <p>Click Play on the control bar below to initiate OpenCV VideoCapture.</p>
                                </div>
                            )}
                            <img ref={videoRef} alt="Webcam Stream" style={{ width: '100%', height: '100%', objectFit: 'cover', display: isStreaming ? 'block' : 'none' }} />

                            {/* HUD Overlays */}
                            {isStreaming && (
                                <>
                                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>
                                        MAIN INTERSECTION (CAM-01)
                                    </div>
                                    <div style={{ position: 'absolute', top: '3rem', left: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px' }}>
                                        <span style={{ color: 'var(--status-safe)' }}>FPS: 28</span> • MJPEG
                                    </div>
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(239, 68, 68, 0.2)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'pulseRing 2s infinite' }}></div>
                                        LIVE
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Media Control Bar */}
                    <div className="premium-card" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <select style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 16px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}>
                                <option>Camera 1 (Main Intersection)</option>
                                <option>Camera 2 (Highway Exit)</option>
                                <option>Camera 3 (Toll Plaza)</option>
                            </select>
                            <button className="btn-outline" style={{ padding: '10px', borderRadius: '8px', display: 'flex' }}><SquaresFour size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><SkipBack size={24} weight="fill" /></button>
                            <button onClick={toggleStream} style={{ background: isStreaming ? 'rgba(239, 68, 68, 0.1)' : 'var(--brand-primary)', border: isStreaming ? '1px solid rgba(239, 68, 68, 0.5)' : 'none', color: isStreaming ? '#ef4444' : 'white', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: isStreaming ? 'none' : 'var(--shadow-glow)', transition: 'all 0.2s ease' }}>
                                {isStreaming ? <Pause size={24} weight="fill" /> : <Play size={24} weight="fill" />}
                            </button>
                            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><SkipForward size={24} weight="fill" /></button>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px' }}><Camera size={20} /> Snapshot</button>
                            <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--status-danger)' }}><Flag size={20} /> Flag Event</button>
                        </div>
                    </div>
                </div>

                {/* Right Col: Live Event Log */}
                <div style={{ flex: '1 1 30%', display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '350px' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="premium-card" style={{ flex: 1, padding: '1.25rem', textAlign: 'center' }}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Frames Scanned</p>
                            <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>24,892</h2>
                        </div>
                        <div className="premium-card" style={{ flex: 1, padding: '1.25rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.75rem', fontWeight: 700, color: 'var(--status-danger)', textTransform: 'uppercase' }}>Interventions</p>
                            <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: 'var(--status-danger)' }}>{liveEvents.length}</h2>
                        </div>
                    </div>

                    <div className="premium-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}>
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><ClockCounterClockwise color="var(--brand-primary)" /> Live Event Log</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', cursor: 'pointer', fontWeight: 600 }}>Filter</span>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '500px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {liveEvents.map((evt, idx) => (
                                <div key={idx} style={{ background: 'var(--bg-input)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', padding: '1rem', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{evt.status}</h4>
                                    <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{evt.cam} • Timestamp: {evt.time}</p>

                                    <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                                        <span style={{ padding: '2px 8px', borderRadius: '100px', border: '1px solid var(--border-color)', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Bike</span>
                                        <span style={{ padding: '2px 8px', borderRadius: '100px', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>Conf: {evt.confidence}</span>
                                    </div>
                                </div>
                            ))}
                            {liveEvents.length === 0 && (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '2rem' }}>Awaiting live events...</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LiveFeed;
