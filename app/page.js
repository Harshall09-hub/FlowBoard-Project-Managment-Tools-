'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, MessageSquare, ArrowRight, CheckSquare, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: <LayoutDashboard size={28} />,
      title: 'Kanban Boards',
      description: 'Visual workflow management with drag-and-drop columns. Move tasks seamlessly between stages.',
    },
    {
      icon: <Users size={28} />,
      title: 'Team Collaboration',
      description: 'Add team members to projects, assign tasks, and track progress together in real time.',
    },
    {
      icon: <MessageSquare size={28} />,
      title: 'Task Comments',
      description: 'Discuss tasks inline with threaded comments. Keep all context attached to the work.',
    },
    {
      icon: <CheckSquare size={28} />,
      title: 'Priority Tracking',
      description: 'Set task priorities, due dates, and assignees to keep everyone aligned on what matters.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      <style>{`
        .hero-gradient {
          position: absolute;
          top: -50%;
          left: -25%;
          width: 150%;
          height: 150%;
          background: radial-gradient(ellipse at 30% 40%, hsla(245, 82%, 67%, 0.12) 0%, transparent 60%),
                      radial-gradient(ellipse at 70% 60%, hsla(280, 70%, 65%, 0.08) 0%, transparent 50%);
          animation: gradientShift 12s ease infinite;
          background-size: 200% 200%;
          pointer-events: none;
        }
        .hero-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(hsla(245, 82%, 67%, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, hsla(245, 82%, 67%, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }
        .feature-card {
          padding: 28px;
          border-radius: var(--radius-lg);
          background: var(--bg-surface);
          border: 1px solid var(--border);
          transition: all 0.3s ease;
          opacity: 0;
          transform: translateY(20px);
        }
        .feature-card.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .feature-card:hover {
          border-color: var(--accent);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(99, 102, 241, 0.1);
        }
        .feature-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          background: var(--accent-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          margin-bottom: 16px;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '16px 32px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', background: 'hsla(230, 21%, 11%, 0.8)',
        backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: '1.25rem' }}>
          <Sparkles size={24} style={{ color: 'var(--accent)' }} />
          <span className="gradient-text">FlowBoard</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => router.push('/login')}>Log In</button>
          <button className="btn btn-primary" onClick={() => router.push('/register')}>
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      <main style={{ position: 'relative' }}>
        <div className="hero-gradient" />
        <div className="hero-grid" />

        <section style={{
          position: 'relative', padding: '160px 24px 80px', maxWidth: 1100, margin: '0 auto',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px',
            background: 'var(--accent-muted)', borderRadius: '100px', color: 'var(--accent)',
            fontSize: '0.85rem', fontWeight: 500, marginBottom: 24,
          }}>
            <Sparkles size={14} /> Collaborative Project Management
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, lineHeight: 1.1,
            marginBottom: 20, letterSpacing: '-0.03em',
          }}>
            Manage Projects{' '}
            <span className="gradient-text">Together</span>
            <br />
            Ship Faster
          </h1>

          <p style={{
            fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: 600,
            margin: '0 auto 40px', lineHeight: 1.7,
          }}>
            FlowBoard combines the simplicity of Kanban boards with powerful collaboration features.
            Plan, track, and deliver projects your team loves.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => router.push('/register')}>
              Start Free <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => router.push('/login')}>
              Sign In
            </button>
          </div>
        </section>

        <section style={{
          position: 'relative', padding: '40px 24px 100px', maxWidth: 1100,
          margin: '0 auto',
        }}>
          <h2 style={{
            textAlign: 'center', fontSize: '1.8rem', fontWeight: 700, marginBottom: 48,
          }}>
            Everything you need to stay{' '}
            <span className="gradient-text">in flow</span>
          </h2>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
          }}>
            {features.map((feature, i) => (
              <div key={i} className={`feature-card ${mounted ? 'visible' : ''}`}
                style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="feature-icon">{feature.icon}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer style={{
        textAlign: 'center', padding: '32px', color: 'var(--text-muted)',
        fontSize: '0.85rem', borderTop: '1px solid var(--border)',
      }}>
        FlowBoard &copy; {new Date().getFullYear()}. Built with Next.js.
      </footer>
    </div>
  );
}
