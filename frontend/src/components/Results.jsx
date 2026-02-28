import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CaretLeft, CheckCircle, WarningCircle, IdentificationCard, DownloadSimple, VideoCamera, Images, Scan, Camera, CornersOut, Flag, Pause, Play, SkipBack, SkipForward, SquaresFour } from '@phosphor-icons/react';
import '../index.css';

const API_URL = 'http://127.0.0.1:5000';

function Results() {
    const location = useLocation();
    const navigate = useNavigate();

    const { type, payload } = location.state || {};
    const [videoStats, setVideoStats] = useState({ safe: 0, unsafe: 0, plates: [], violators: [] });

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
            <div style={{ padding: '4rem 5%', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--text-primary)' }}>No Analysis Data Found</h2>
                <button className="btn-primary" onClick={() => navigate('/')} style={{ marginTop: '1.5rem' }}>
                    <CaretLeft /> Back to Dashboard
                </button>
            </div>
        );
    }

    const renderHeader = (title, subtitle, isLive = false) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
                <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', padding: '0 0 10px 0', fontSize: '1rem', fontWeight: 600 }}>
                    <CaretLeft /> Back to Dashboard
                </button>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.5rem 0', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isLive && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--brand-secondary)', boxShadow: '0 0 10px var(--brand-secondary)' }}></div>}
                    {title}
                </h1>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>{subtitle}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {isLive && (
                    <div className="time-badge" style={{ color: 'var(--status-safe)', borderColor: 'rgba(16, 185, 129, 0.3)', marginRight: '1rem', background: 'rgba(16, 185, 129, 0.05)' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-safe)' }}></span>
                        SYSTEM ONLINE
                    </div>
                )}
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>LATENCY: <span style={{ color: 'var(--brand-primary)' }}>12ms</span></div>
            </div>
        </div>
    );

    const renderSingleResult = () => (
        <div style={{ padding: '1rem 5%', maxWidth: '1400px', margin: '0 auto' }}>
            {renderHeader('Helmet Detection Studio', 'Premium real-time compliance monitoring and automated safety scanning.')}

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem' }}>
                {/* Left Col: Main Studio */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Video / Image Editor Box */}
                    <div className="premium-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', background: 'var(--bg-panel)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Scan color="var(--brand-primary)" weight="fill" />
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Analysis Studio - Processed Image</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <span className="tab-pill active" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>DETECTION ON</span>
                            </div>
                        </div>
                        <div style={{ position: 'relative', width: '100%', minHeight: '400px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={`${API_URL}${payload.result_url}`} alt="YOLOv8 Inference" style={{ width: '100%', height: 'auto', maxHeight: '600px', objectFit: 'contain' }} />
                        </div>
                        {/* Control Bar inside studio */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem', background: 'var(--bg-input)' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn-outline" style={{ display: 'flex', padding: '8px 12px', borderRadius: '8px' }}><CornersOut size={18} /></button>
                                <button className="btn-outline" style={{ display: 'flex', padding: '8px 12px', borderRadius: '8px' }}><DownloadSimple size={18} /></button>
                            </div>
                            <button className="btn-primary" style={{ padding: '8px 24px', borderRadius: '8px' }}>Export PDF</button>
                        </div>
                    </div>

                    {/* Meta Logs Table */}
                    <div className="premium-card">
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>Compliance Confidence Score</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-input)', padding: '1rem', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: payload.status_text.includes("NO HELMET") ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {payload.status_text.includes("NO HELMET") ? <WarningCircle size={24} color="#ef4444" weight="fill" /> : <CheckCircle size={24} color="#10b981" weight="fill" />}
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status</p>
                                        <p style={{ margin: 0, fontWeight: 700, color: payload.status_text.includes("NO HELMET") ? '#ef4444' : '#10b981' }}>{payload.status_text}</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>OCR Plate Mapping</p>
                                    <p style={{ margin: 0, fontWeight: 700, color: '#fbbf24', letterSpacing: '1px' }}>{payload.plate_text}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: Intelligent Alerts Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Confidence Trend</span>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: '5px 0 0 0' }}>94% <span style={{ fontSize: '0.9rem', color: 'var(--status-safe)', fontWeight: 600 }}>+5% vs LW</span></h2>
                        </div>
                        {/* Fake trend bars for aesthetics matching Mockup 2 */}
                        <div style={{ display: 'flex', gap: '8px', height: '120px', alignItems: 'flex-end', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                            {[40, 60, 50, 70, 80, 60, 95].map((h, i) => (
                                <div key={i} style={{ flex: 1, backgroundColor: i === 6 ? 'var(--brand-primary)' : 'var(--brand-light)', height: `${h}%`, borderRadius: '4px' }}></div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                            <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
                        </div>
                    </div>

                    <div className="premium-card" style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Intelligent Alerts <div style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--status-danger)', border: '2px solid var(--bg-panel)' }}></div></h3>

                        <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                            <p style={{ color: 'var(--status-danger)', fontSize: '0.7rem', fontWeight: 700, margin: '0 0 5px 0' }}>VIOLATION SPIKE</p>
                            <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>Zone 12 Broadway St.</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '5px 0 0 0' }}>12% increase in the last hour</p>
                        </div>

                        <div style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '1rem', borderRadius: '8px' }}>
                            <p style={{ color: 'var(--brand-primary)', fontSize: '0.7rem', fontWeight: 700, margin: '0 0 5px 0' }}>SYSTEM HEALTH</p>
                            <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>Camera #04 Optimized</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '5px 0 0 0' }}>AI logic updated successfully</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderVideoResult = () => (
        <div style={{ padding: '1rem 5%', maxWidth: '1600px', margin: '0 auto' }}>
            {renderHeader('Live Command Center', 'Real-time inference stream • YOLOv8 Neural Engine Active', true)}

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'stretch' }}>

                {/* Left Col: Giant Video Player */}
                <div style={{ flex: '1 1 70%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="premium-card" style={{ padding: '0', overflow: 'hidden', background: '#000', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={`${API_URL}${payload.stream_url}`} alt="Inference Stream" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                            {/* HUD Overlays */}
                            <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>
                                CAM-01 • MAIN INTERSECTION
                            </div>
                            <div style={{ position: 'absolute', top: '3rem', left: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px' }}>
                                <span style={{ color: 'var(--status-safe)' }}>FPS: 30</span> • HD
                            </div>
                            <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(239, 68, 68, 0.2)', backdropFilter: 'blur(4px)', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'pulseRing 2s infinite' }}></div>
                                REC
                            </div>
                        </div>
                    </div>

                    {/* Media Control Bar Match Mockup 3 */}
                    <div className="premium-card" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <select style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 16px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}>
                                <option>Camera 1 (Main Intersection)</option>
                                <option>Camera 2 (Highway Exit)</option>
                            </select>
                            <button className="btn-outline" style={{ padding: '10px', borderRadius: '8px', display: 'flex' }}><SquaresFour size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><SkipBack size={24} weight="fill" /></button>
                            <button style={{ background: 'var(--brand-primary)', border: 'none', color: 'white', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-glow)' }}><Pause size={24} weight="fill" /></button>
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
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Detected Today</p>
                            <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>1,248</h2>
                        </div>
                        <div className="premium-card" style={{ flex: 1, padding: '1.25rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <p style={{ margin: '0 0 5px 0', fontSize: '0.75rem', fontWeight: 700, color: 'var(--status-danger)', textTransform: 'uppercase' }}>Violations</p>
                            <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: 'var(--status-danger)' }}>{videoStats.unsafe}</h2>
                        </div>
                    </div>

                    <div className="premium-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0 }}>
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><ClockCounterClockwise color="var(--brand-primary)" /> Live Event Log</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', cursor: 'pointer', fontWeight: 600 }}>View All</span>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '500px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {videoStats.violators.slice().reverse().map((v, idx) => (
                                <div key={idx} style={{ background: 'var(--bg-input)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', padding: '1rem', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                                    <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>No Helmet Detected</h4>
                                    <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>CAM-01 • Timestamp: {v.timestamp}f</p>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: '#000', overflow: 'hidden' }}>
                                            <img src={`${API_URL}${v.violator_image_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Face" />
                                        </div>
                                        {v.plate_image_url && (
                                            <div style={{ width: '100px', height: '60px', borderRadius: '8px', background: '#000', overflow: 'hidden' }}>
                                                <img src={`${API_URL}${v.plate_image_url}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Plate" />
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                                        <span style={{ padding: '2px 8px', borderRadius: '100px', border: '1px solid var(--border-color)', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Bike</span>
                                        <span style={{ padding: '2px 8px', borderRadius: '100px', border: '1px solid var(--border-color)', fontSize: '0.7rem', color: 'var(--brand-primary)', fontWeight: 600 }}>Plate: {v.plate_text && v.plate_text !== 'No Text Detected' ? v.plate_text : 'N/A'}</span>
                                    </div>
                                </div>
                            ))}
                            {videoStats.violators.length === 0 && (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '2rem' }}>Awaiting events...</div>
                            )}
                        </div>
                        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
                            <button className="btn-outline" style={{ width: '100%', borderRadius: '8px', padding: '10px' }}>Export Logs to CSV</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderBatchResults = () => (
        <div style={{ padding: '1rem 5%', maxWidth: '1400px', margin: '0 auto' }}>
            {renderHeader('Batch Analysis Report', 'Processed directory of images via YOLOv8 WebAssembly.')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {payload.map((res, idx) => (
                    <div key={idx} className="premium-card" style={{ padding: '1rem', border: `1px solid ${res.status_text?.includes('NO HELMET') ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-color)'}` }}>
                        <div style={{ display: 'flex', gap: '10px', height: '140px', marginBottom: '1rem' }}>
                            <div style={{ flex: 1, background: '#000', borderRadius: '6px', overflow: 'hidden' }}>
                                <img src={`${API_URL}${res.result_url}`} alt="Out" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{res.filename}</span>
                            <span style={{ padding: '2px 8px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, background: res.status_text?.includes('NO HELMET') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: res.status_text?.includes('NO HELMET') ? '#ef4444' : '#10b981' }}>
                                {res.status_text?.split('(')[0]?.trim()}
                            </span>
                        </div>
                        <div style={{ background: 'var(--bg-input)', padding: '0.5rem 0.8rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Plate OCR:</span>
                            <span style={{ fontWeight: 600, color: res.plate_text !== 'No Plate Detected' ? '#fbbf24' : 'var(--text-muted)', fontSize: '0.85rem' }}>{res.plate_text || '--'}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="results-wrapper" style={{ paddingBottom: '3rem' }}>
            {type === 'single' && renderSingleResult()}
            {type === 'batch' && renderBatchResults()}
            {type === 'video' && renderVideoResult()}
        </div>
    );
}

export default Results;
