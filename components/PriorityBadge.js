'use client';

const priorityConfig = {
  low: { color: 'var(--success)', bg: 'hsla(152, 69%, 50%, 0.1)' },
  medium: { color: 'var(--warning)', bg: 'hsla(38, 92%, 60%, 0.1)' },
  high: { color: 'var(--danger)', bg: 'hsla(0, 84%, 60%, 0.1)' },
  urgent: { color: '#ef4444', bg: 'hsla(0, 84%, 60%, 0.15)' },
};

export default function PriorityBadge({ priority = 'medium' }) {
  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 8px',
      borderRadius: '100px',
      fontSize: '0.7rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      color: config.color,
      background: config.bg,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: config.color }} />
      {priority}
    </span>
  );
}
