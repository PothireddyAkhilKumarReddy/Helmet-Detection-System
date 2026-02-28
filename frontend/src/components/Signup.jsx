import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, EnvelopeSimple, LockKey, User } from '@phosphor-icons/react';

function Signup() {
    return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '16px', background: 'var(--brand-primary)', color: '#fff', marginBottom: '1.5rem', boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)' }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h2 style={{ marginBottom: '0.5rem' }}>Create Account</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Deploy Traffic AI Guard today</p>
                </div>

                <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} onSubmit={(e) => e.preventDefault()}>
                    <div className="input-group">
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                <User size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="John Doe"
                                style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', outline: 'none' }}
                            />
                        </div>
                    </div>

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
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-primary)' }}>Create Password</label>
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
                        Register Operator
                    </button>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
                        By registering, you agree to our Terms & Conditions.
                    </p>
                </form>

                <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Already an operator? <Link to="/login" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>Log In</Link>
                </div>
            </div>
        </div>
    );
}

export default Signup;
