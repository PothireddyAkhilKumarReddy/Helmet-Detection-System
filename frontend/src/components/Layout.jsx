import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, SquaresFour, ChartLineUp, VideoCamera, Gear, Sun, Moon } from '@phosphor-icons/react';

function Layout() {
    const location = useLocation();
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const savedTheme = localStorage.getItem('app-theme') || 'dark';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('app-theme', newTheme);
    };

    return (
        <div className="top-nav-layout">
            <header className="top-navbar">
                <div className="nav-brand">
                    <div className="brand-logo">
                        <ShieldCheck size={28} weight="fill" />
                    </div>
                    <h2>Traffic AI</h2>
                </div>

                <nav className="nav-links">
                    <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                        <SquaresFour size={20} /> Dashboard
                    </Link>
                    <Link to="/analytics" className={`nav-item ${location.pathname === '/analytics' ? 'active' : ''}`}>
                        <ChartLineUp size={20} /> Analytics
                    </Link>
                    <Link to="/live-feed" className={`nav-item ${location.pathname === '/live-feed' ? 'active' : ''}`}>
                        <VideoCamera size={20} /> Live Feed
                    </Link>
                    <Link to="/settings" className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
                        <Gear size={20} /> Settings
                    </Link>
                </nav>

                <div className="nav-actions">
                    <button className="theme-toggle" id="theme-toggle" aria-label="Toggle Theme" onClick={toggleTheme}>
                        {theme === 'light' ? <Moon size={20} weight="fill" id="theme-icon" /> : <Sun size={20} weight="fill" id="theme-icon" />}
                    </button>
                    <div className="auth-buttons">
                        <Link to="/login" className="btn-outline">Log In</Link>
                        <Link to="/signup" className="btn-primary">Sign Up</Link>
                    </div>
                </div>
            </header>

            <main className="main-content">
                <Outlet />
            </main>

            <footer className="global-footer">
                <div className="footer-content">
                    <div className="footer-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={20} />
                        <span>Traffic AI Guard &copy; 2026</span>
                    </div>
                    <div className="footer-links">
                        <Link to="/about">About Us</Link>
                        <Link to="/terms">Terms & Conditions</Link>
                        <Link to="#">Privacy Policy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Layout;
