import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, EnvelopeSimple, LockKey } from '@phosphor-icons/react';

function Login() {
    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '16px', background: 'var(--brand-primary)', color: '#fff', marginBottom: '1.5rem', boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)' }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Log in to access Traffic AI Guard</p>
                </div>

                <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} onSubmit={(e) => e.preventDefault()}>
                    <div className="input-group">
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                <EnvelopeSimple size={20} />
                            </div>
                            <input
                                type="email"
                                placeholder="commander@traffic.ai"
                                style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Password</label>
                            <a href="#" style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', textDecoration: 'none' }}>Forgot password?</a>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                <LockKey size={20} />
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <button className="btn-primary" style={{ marginTop: '0.5rem', padding: '14px', fontSize: '1rem', width: '100%', justifyContent: 'center' }}>
                        Log In to System
                    </button>
                </form>

                <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Don't have an operator account? <Link to="/signup" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>Create One</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
