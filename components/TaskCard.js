'use client';

import { Draggable } from '@hello-pangea/dnd';
import { Calendar, User } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import Avatar from './Avatar';

export default function TaskCard({ task, index, onClick }) {
  return (
    <Draggable draggableId={`task-${task.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          style={{
            ...provided.draggableProps.style,
            padding: '12px 14px',
            background: snapshot.isDragging ? 'var(--bg-surface-hover)' : 'var(--bg-surface)',
            border: `1px solid ${snapshot.isDragging ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            marginBottom: 8,
            transition: 'box-shadow 0.15s ease',
            boxShadow: snapshot.isDragging ? 'var(--shadow-lg)' : 'none',
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <PriorityBadge priority={task.priority} />
          </div>

          <p style={{
            fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.4,
            color: 'var(--text-primary)', marginBottom: 10,
          }}>
            {task.title}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {task.due_date && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  <Calendar size={11} />
                  {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>

            {task.assignee_name && (
              <Avatar name={task.assignee_name} size={24} />
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
