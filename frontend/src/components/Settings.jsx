import React, { useState } from 'react';
import { Gear, Bell, Camera, ShieldCheck, Database, Sliders } from '@phosphor-icons/react';

function Settings() {
    const [confidence, setConfidence] = useState(80);

    return (
        <div className="dashboard-container" style={{ padding: '2rem' }}>
            <div className="content-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Gear size={32} /> System Settings
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Configure YOLOv8 model parameters and alert thresholds.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Settings Navigation */}
                <div className="glass-panel" style={{ padding: '1rem', alignSelf: 'start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button className="nav-item active" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--brand-primary)', fontWeight: 600 }}>
                            <Sliders size={20} /> Model Configuration
                        </button>
                        <button className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', textAlign: 'left', cursor: 'pointer' }}>
                            <Camera size={20} /> Local Cameras
                        </button>
                        <button className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', textAlign: 'left', cursor: 'pointer' }}>
                            <Bell size={20} /> Alerts & Notifications
                        </button>
                        <button className="nav-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', textAlign: 'left', cursor: 'pointer' }}>
                            <Database size={20} /> Backup & Storage
                        </button>
                    </div>
                </div>

                {/* Settings Content */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        <Sliders size={24} /> Model Configuration
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        <div className="setting-row">
                            <div style={{ marginBottom: '1rem' }}>
                                <h4>Detection Confidence Threshold</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Minimum confidence score required to flag a violation.</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <input
                                    type="range"
                                    min="20"
                                    max="100"
                                    value={confidence}
                                    onChange={(e) => setConfidence(e.target.value)}
                                    style={{ flex: 1, accentColor: 'var(--brand-primary)' }}
                                />
                                <span style={{ fontWeight: 600, fontFamily: 'monospace', width: '40px', textAlign: 'right' }}>{confidence}%</span>
                            </div>
                        </div>

                        <div className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                            <div>
                                <h4>Save Processed Video Streams</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Log output of Live Feeds locally.</p>
                            </div>
                            <label className="switch">
                                <input type="checkbox" defaultChecked />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <div className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                            <div>
                                <h4>Enable YOLO Auto-Update</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Background fetch the latest .pt weights.</p>
                            </div>
                            <label className="switch">
                                <input type="checkbox" />
                                <span className="slider round"></span>
                            </label>
                        </div>

                    </div>

                    <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button className="btn-outline">Discard Changes</button>
                        <button className="btn-primary">Save Configuration</button>
                    </div>
                </div>
            </div>

            {/* Embedded CSS for the iOS style switch missing from standard inputs */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .switch { position: relative; display: inline-block; width: 50px; height: 26px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(255,255,255,0.1); -webkit-transition: .4s; transition: .4s; border: 1px solid var(--border-color); }
                .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 4px; bottom: 3px; background-color: var(--text-muted); -webkit-transition: .4s; transition: .4s; }
                input:checked + .slider { background-color: var(--brand-primary); border-color: var(--brand-primary); }
                input:checked + .slider:before { -webkit-transform: translateX(24px); -ms-transform: translateX(24px); transform: translateX(24px); background-color: #fff; }
                .slider.round { border-radius: 34px; }
                .slider.round:before { border-radius: 50%; }
            `}} />
        </div>
    );
}

export default Settings;
