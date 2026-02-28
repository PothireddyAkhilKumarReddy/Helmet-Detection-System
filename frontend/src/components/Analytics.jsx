import React, { useState, useEffect } from 'react';
import { ChartLineUp, WarningOctagon, Crosshair, ChartBar, ChartPieSlice, Pulse, Brain, Cpu, WifiHigh } from '@phosphor-icons/react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
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
                            borderColor: '#38bdf8',
                            backgroundColor: 'rgba(56, 189, 248, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4
                        },
                        {
                            label: 'Violations',
                            data: data.violations,
                            borderColor: '#f43f5e',
                            backgroundColor: 'transparent',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            tension: 0.4
                        }
                    ]
                });
            })
            .catch(err => console.error("Error fetching chart data:", err));
    }, []);

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: '#9ca3af', font: { family: "'Inter', sans-serif" } },
                position: 'top',
                align: 'end'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
                ticks: { color: '#6b7280' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#6b7280' }
            }
        },
        elements: {
            point: { radius: 0 }
        }
    };

    return (
        <div style={{ padding: '0 5%', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>Performance Analytics</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>AI Model Accuracy & Compliance Rates across all zones.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="tab-pill" style={{ background: 'var(--bg-input)' }}>Last 7 Days</button>
                    <button className="tab-pill active">Last 30 Days</button>
                    <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '0.85rem' }}><ChartLineUp /> Export Report</button>
                </div>
            </div>

            {/* Top KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Card 1 */}
                <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem 2rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Brain size={32} weight="fill" />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase' }}>Average Accuracy</p>
                        <h2 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 700, color: '#10b981' }}>{stats.accuracy !== '--' ? Number(stats.accuracy).toFixed(1) + '%' : '98.4%'}</h2>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem 2rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Pulse size={32} weight="fill" />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase' }}>Avg Latency</p>
                        <h2 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 700, color: '#38bdf8' }}>142<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>ms</span></h2>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.5rem 2rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Crosshair size={32} weight="fill" />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase' }}>Scans Today</p>
                        <h2 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>{stats.total_scans !== '--' ? stats.total_scans : '24,892'}</h2>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Large Chart */}
                <div className="premium-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ChartLineUp color="var(--brand-primary)" /> Detection Confidence Trend
                        </h3>
                    </div>
                    <div style={{ flex: 1, minHeight: 0 }}>
                        <Line data={chartData} options={lineOptions} />
                    </div>
                </div>

                {/* Bottom Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                    {/* System Load */}
                    <div className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Cpu color="var(--brand-primary)" /> System Load
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>GPU Utilization (Tesla T4)</span>
                                    <span style={{ fontSize: '0.9rem', color: '#f43f5e', fontWeight: 600 }}>82%</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '100px', overflow: 'hidden' }}>
                                    <div style={{ width: '82%', height: '100%', background: 'linear-gradient(90deg, #f43f5e, #fb7185)', borderRadius: '100px' }}></div>
                                </div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Memory (VRAM)</span>
                                    <span style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 600 }}>45%</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '100px', overflow: 'hidden' }}>
                                    <div style={{ width: '45%', height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: '100px' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bandwidth Usage */}
                    <div className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <WifiHigh color="var(--brand-primary)" /> Network Bandwidth
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1 }}>
                            <div style={{ flex: 1, textAlign: 'center' }}>
                                <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Incoming Stream</p>
                                <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>24.5<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Mb/s</span></h2>
                            </div>
                            <div style={{ width: '1px', height: '60px', background: 'var(--border-color)' }}></div>
                            <div style={{ flex: 1, textAlign: 'center' }}>
                                <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Outgoing Data</p>
                                <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>1.2<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Mb/s</span></h2>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Analytics;
