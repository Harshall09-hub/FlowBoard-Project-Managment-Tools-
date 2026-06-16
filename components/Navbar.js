'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import Avatar from './Avatar';

export default function Navbar({ user }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', background: 'hsla(230, 21%, 11%, 0.9)',
      backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem' }}
        >
          <Sparkles size={20} style={{ color: 'var(--accent)' }} />
          <span className="gradient-text">FlowBoard</span>
        </button>
      </div>

      {user && (
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px',
              borderRadius: 'var(--radius-md)', background: 'none', color: 'var(--text-primary)',
            }}
          >
            <Avatar name={user.name} size={28} />
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              {user.name}
            </span>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </button>

          {menuOpen && (
            <div className="card" style={{
              position: 'absolute', right: 0, top: '100%', marginTop: 8,
              minWidth: 180, padding: 6, boxShadow: 'var(--shadow-lg)',
            }}>
              <button
                onClick={() => { router.push('/dashboard'); setMenuOpen(false); }}
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', gap: 8, padding: '8px 12px' }}
              >
                <LayoutDashboard size={14} /> Dashboard
              </button>
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <button
                onClick={handleLogout}
                className="btn btn-ghost btn-sm"
                style={{ width: '100%', justifyContent: 'flex-start', gap: 8, padding: '8px 12px', color: 'var(--danger)' }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
