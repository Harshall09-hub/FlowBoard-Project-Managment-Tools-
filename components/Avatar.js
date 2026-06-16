'use client';

export default function Avatar({ name, avatarUrl, size = 32, className = '' }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const colors = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#14b8a6', '#06b6d4', '#3b82f6',
  ];

  const colorIndex = name ? name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length : 0;

  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.4,
    fontWeight: 600,
    color: 'white',
    background: colors[colorIndex],
    flexShrink: 0,
    overflow: 'hidden',
  };

  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} style={{ ...style, objectFit: 'cover' }} className={className} />;
  }

  return <span style={style} className={className} title={name}>{initials}</span>;
}
