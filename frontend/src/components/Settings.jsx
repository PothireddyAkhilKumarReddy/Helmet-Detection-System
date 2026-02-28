import React, { useState } from 'react';
import { Gear, Bell, Camera, ShieldCheck, Database, Sliders, HardDrives } from '@phosphor-icons/react';

function Settings() {
    const [confidence, setConfidence] = useState(80);
    const [activeTab, setActiveTab] = useState('ai_model');

    const navItems = [
        { id: 'general', icon: <Gear size={20} />, label: 'General' },
        { id: 'ai_model', icon: <Sliders size={20} />, label: 'AI Model Config' },
        { id: 'camera', icon: <Camera size={20} />, label: 'Camera Network' },
        { id: 'notifications', icon: <Bell size={20} />, label: 'Notifications' },
        { id: 'security', icon: <ShieldCheck size={20} />, label: 'Security' },
    ];

    return (
        <div style={{ padding: '0 5%', maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>System Settings</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Configure YOLOv8 model parameters and alert thresholds.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Settings Navigation */}
                <div className="premium-card" style={{ padding: '1.5rem', alignSelf: 'start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px',
                                    background: activeTab === item.id ? 'var(--brand-light)' : 'transparent',
                                    border: activeTab === item.id ? '1px solid rgba(99, 102, 241, 0.3)' : 'none',
                                    color: activeTab === item.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
                                    fontWeight: activeTab === item.id ? 600 : 400,
                                    textAlign: 'left', cursor: 'pointer', borderRadius: '8px', transition: 'all 0.2s'
                                }}
                            >
                                {item.icon} {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settings Content */}
                <div className="premium-card" style={{ padding: '2rem' }}>

                    {activeTab === 'ai_model' ? (
                        <>
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', fontSize: '1.2rem', marginTop: 0 }}>
                                <Sliders size={24} color="var(--brand-primary)" /> AI Model Configuration
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                                <div className="setting-row">
                                    <div style={{ marginBottom: '1rem' }}>
                                        <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem' }}>Detection Confidence Threshold</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Minimum confidence score required to flag a violation.</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-input)', padding: '1rem', borderRadius: '8px' }}>
                                        <input
                                            type="range"
                                            min="20"
                                            max="100"
                                            value={confidence}
                                            onChange={(e) => setConfidence(e.target.value)}
                                            style={{ flex: 1, accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontWeight: 600, fontFamily: 'monospace', width: '40px', textAlign: 'right', color: 'var(--brand-primary)' }}>{confidence}%</span>
                                    </div>
                                </div>

                                <div className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem' }}>Save Processed Video Streams</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Log output of Live Feeds locally.</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                                <div className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem' }}>Enable YOLO Auto-Update</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Background fetch the latest .pt weights.</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                                <div className="setting-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem' }}>Hardware Acceleration</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Utilize CUDA Tensor Cores if available on system.</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                            </div>

                            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button className="btn-outline" style={{ padding: '10px 24px', borderRadius: '8px' }}>Discard Changes</button>
                                <button className="btn-primary" style={{ padding: '10px 24px', borderRadius: '8px' }}>Save Configuration</button>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', color: 'var(--text-muted)' }}>
                            <Gear size={48} weight="duotone" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>Coming Soon</h3>
                            <p style={{ margin: 0, textAlign: 'center', maxWidth: '300px' }}>
                                The {navItems.find(i => i.id === activeTab)?.label} configuration panel is currently under development.
                            </p>
                        </div>
                    )}
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
                
                .nav-item:hover:not(.active) { background: rgba(255,255,255,0.02) !important; color: var(--text-primary) !important; }
                [data-theme="light"] .nav-item:hover:not(.active) { background: rgba(0,0,0,0.02) !important; }
            `}} />
        </div>
    );
}

export default Settings;
