import React, { useState, useEffect } from 'react';
import { ChartLineUp, WarningOctagon, Crosshair, ChartBar, ChartPieSlice, VideoCamera, Plus } from '@phosphor-icons/react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const API_URL = 'http://127.0.0.1:5000';

function Analytics() {
    const [stats, setStats] = useState({ total_scans: '--', total_violations: '--', accuracy: '--' });
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        // Fetch Top KPIs
        axios.get(`${API_URL}/api/analytics/stats`)
            .then(res => setStats(res.data))
            .catch(err => console.error("Error fetching analytics stats:", err));

        // Fetch Chart Data
        axios.get(`${API_URL}/api/analytics/chart`)
            .then(res => {
                const data = res.data;
                setChartData({
                    labels: data.dates,
                    datasets: [
                        {
                            label: 'Total Scans',
                            data: data.totals,
                            backgroundColor: 'rgba(59, 130, 246, 0.8)',
                            borderRadius: 4,
                        },
                        {
                            label: 'Violations (No Helmet)',
                            data: data.violations,
                            backgroundColor: 'rgba(239, 68, 68, 0.8)',
                            borderRadius: 4,
                        }
                    ]
                });
            })
            .catch(err => console.error("Error fetching chart data:", err));
    }, []);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#9ca3af' }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#9ca3af' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#9ca3af' }
            }
        }
    };

    return (
        <div className="dashboard-container" style={{ padding: '2rem' }}>
            <div className="content-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1>Traffic Analytics</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>View historical data, violation trends, and system statistics.</p>
                </div>
            </div>

            {/* Analytics KPI Row */}
            <div className="horizon-panel glass-panel" style={{ marginBottom: '2rem' }}>
                <div className="horizon-item">
                    <div className="horizon-icon-box" style={{ background: 'var(--brand-light)', color: 'var(--brand-primary)' }}>
                        <ChartLineUp size={24} />
                    </div>
                    <div className="horizon-data">
                        <p>Total Vehicles Scanned</p>
                        <h3>{stats.total_scans !== '--' ? stats.total_scans.toLocaleString() : '--'}</h3>
                    </div>
                </div>
                <div className="horizon-item">
                    <div className="horizon-icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--status-warning)' }}>
                        <WarningOctagon size={24} />
                    </div>
                    <div className="horizon-data">
                        <p>Total Violations</p>
                        <h3>{stats.total_violations !== '--' ? stats.total_violations.toLocaleString() : '--'}</h3>
                    </div>
                </div>
                <div className="horizon-item">
                    <div className="horizon-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-safe)' }}>
                        <Crosshair size={24} />
                    </div>
                    <div className="horizon-data">
                        <p>System Accuracy</p>
                        <h3>{stats.accuracy !== '--' ? Number(stats.accuracy).toFixed(1) + '%' : '--'}</h3>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Left Column (Charts) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Traffic Volume Bar Chart */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ChartBar size={20} /> Dynamic Traffic Volume
                        </h3>
                        <div style={{ height: '250px', width: '100%', position: 'relative' }}>
                            <Bar data={chartData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Violation Breakdown */}
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ChartPieSlice size={20} /> Violation Breakdown
                        </h3>

                        <div className="progress-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Item 1 */}
                            <div className="progress-item">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>No Helmet</span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--status-danger)', fontWeight: 600 }}>68%</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '100px', overflow: 'hidden' }}>
                                    <div style={{ width: '68%', height: '100%', background: 'var(--status-danger)', borderRadius: '100px' }}></div>
                                </div>
                            </div>

                            {/* Item 2 */}
                            <div className="progress-item">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Multiple Riders</span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--status-warning)', fontWeight: 600 }}>22%</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '100px', overflow: 'hidden' }}>
                                    <div style={{ width: '22%', height: '100%', background: 'var(--status-warning)', borderRadius: '100px' }}></div>
                                </div>
                            </div>

                            {/* Item 3 */}
                            <div className="progress-item">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Red Light / Wrong Way</span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--brand-primary)', fontWeight: 600 }}>10%</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '100px', overflow: 'hidden' }}>
                                    <div style={{ width: '10%', height: '100%', background: 'var(--brand-primary)', borderRadius: '100px' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column (Status) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem', height: '100%' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <VideoCamera size={20} /> Camera Health
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.05)' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--status-safe)', boxShadow: '0 0 8px var(--status-safe)' }}></div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '0.9rem' }}>CAM 01 - Main Gate</h4>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>30 FPS | Latency: 12ms</p>
                                </div>
                                <span className="badge badge-safe">Online</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.05)' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--status-safe)', boxShadow: '0 0 8px var(--status-safe)' }}></div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '0.9rem' }}>CAM 02 - Exit North</h4>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>30 FPS | Latency: 15ms</p>
                                </div>
                                <span className="badge badge-safe">Online</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.05)' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--status-danger)' }}></div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ fontSize: '0.9rem' }}>CAM 03 - Parking B</h4>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Connection Lost</p>
                                </div>
                                <span className="badge badge-danger">Offline</span>
                            </div>

                            <button className="btn-outline" style={{ width: '100%', textAlign: 'center', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                <Plus size={16} /> Add New Camera
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Analytics;
