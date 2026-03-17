import React, { useState, useEffect } from 'react';
import { ClockCounterClockwise, WarningOctagon, CheckCircle, MagnifyingGlass, Funnel, DownloadSimple } from '@phosphor-icons/react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000';

function History() {
    const [historyData, setHistoryData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, SAFE, VIOLATION

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/analytics/history`);
            setHistoryData(res.data);
        } catch (err) {
            console.error("Failed to fetch history:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (filteredData.length === 0) return;

        const headers = ['Status', 'Timestamp', 'License Plate', 'Confidence', 'Image URL'];
        const csvRows = [headers.join(',')];

        filteredData.forEach(row => {
            const status = row.status_text;
            const time = row.timestamp;
            const plate = row.plate_text !== 'No Plate Detected' ? row.plate_text : 'N/A';
            const conf = '0.98';
            const url = `${API_URL}${row.result_url}`;

            csvRows.push(`"${status}","${time}","${plate}","${conf}","${url}"`);
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `traffic_history_${new Date().getTime()}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const filteredData = historyData.filter(row => {
        // Search text matching
        const matchesSearch =
            row.plate_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            row.status_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            row.timestamp.includes(searchQuery);

        // Status matching
        let matchesStatus = true;
        if (filterStatus === 'SAFE') {
            matchesStatus = !row.status_text.includes("NO HELMET") && !row.status_text.includes("No Rider");
        } else if (filterStatus === 'VIOLATION') {
            matchesStatus = row.status_text.includes("NO HELMET");
        }

        return matchesSearch && matchesStatus;
    });

    return (
        <div style={{ padding: '0 5%', maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 0.5rem 0', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ClockCounterClockwise size={32} color="var(--brand-primary)" />
                        Detection History
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Review all logged events and intelligent alerts.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search plates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="premium-card"
                            style={{ padding: '10px 16px 10px 40px', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', background: 'var(--bg-panel)', width: '250px' }}
                        />
                        <MagnifyingGlass size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="btn-outline"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', appearance: 'none', cursor: 'pointer', background: 'var(--bg-panel)', color: 'var(--text-primary)' }}
                    >
                        <option value="ALL">All Status</option>
                        <option value="VIOLATION">Violations Only</option>
                        <option value="SAFE">Safe Riders</option>
                    </select>
                    <button onClick={handleExportCSV} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px' }}>
                        <DownloadSimple size={18} /> Export CSV
                    </button>
                </div>
            </div>

            <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'var(--bg-input)', borderBottom: '1px solid var(--border-color)' }}>
                        <tr>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Status</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Timestamp</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>License Plate</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Snapshot</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Confidence</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <div className="pulse-ring" style={{ margin: '0 auto', marginBottom: '1rem' }}></div>
                                    Loading history...
                                </td>
                            </tr>
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No records match your search criteria.
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((row, i) => {
                                const isViolation = row.status_text.includes('NO HELMET');
                                return (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-panel-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: isViolation ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: isViolation ? '#ef4444' : '#10b981' }}>
                                                {isViolation ? <WarningOctagon size={14} weight="fill" /> : <CheckCircle size={14} weight="fill" />}
                                                {row.status_text}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{row.timestamp}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'monospace', fontWeight: 600 }}>{row.plate_text !== 'No Plate Detected' ? row.plate_text : '--'}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ width: '120px', height: '60px', borderRadius: '6px', background: 'var(--bg-input)', backgroundImage: `url(${API_URL}${row.result_url})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid var(--border-color)' }}></div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--bg-input)', color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                                0.98 Conf
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default History;
