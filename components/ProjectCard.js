'use client';

import { useRouter } from 'next/navigation';
import { Users, Layers } from 'lucide-react';

export default function ProjectCard({ project }) {
  const router = useRouter();

  return (
    <div
      className="card"
      onClick={() => router.push(`/projects/${project.id}`)}
      style={{
        padding: 0, cursor: 'pointer', overflow: 'hidden',
        borderTop: `3px solid ${project.color || '#6366f1'}`,
      }}
    >
      <div style={{ padding: 20 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6 }}>
          {project.name}
        </h3>
        {project.description && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {project.description}
          </p>
        )}
        <div style={{ display: 'flex', gap: 16, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Users size={14} /> {project.member_count || 0}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Layers size={14} /> {project.task_count || 0} tasks
          </span>
        </div>
      </div>
    </div>
  );
}
