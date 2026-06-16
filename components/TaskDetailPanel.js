'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, User, Trash2, Save } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import Avatar from './Avatar';
import CommentThread from './CommentThread';

export default function TaskDetailPanel({ task, projectMembers, user, onClose, onUpdate, onDelete }) {
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editDueDate, setEditDueDate] = useState(task.due_date || '');
  const [editAssignee, setEditAssignee] = useState(task.assignee_id || '');
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/tasks/${task.id}/comments`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments);
        }
      } finally {
        setLoadingComments(false);
      }
    };
    fetchComments();
  }, [task.id]);

  const hasChanges =
    editTitle !== task.title ||
    editDescription !== (task.description || '') ||
    editPriority !== task.priority ||
    editDueDate !== (task.due_date || '') ||
    String(editAssignee) !== String(task.assignee_id || '');

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          priority: editPriority,
          due_date: editDueDate || null,
          assignee_id: editAssignee ? parseInt(editAssignee) : null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onUpdate(data.task);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
      if (res.ok) onDelete(task.id);
    } catch {}
  };

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(480px, 100vw)',
      background: 'var(--bg-primary)', borderLeft: '1px solid var(--border)',
      boxShadow: '-8px 0 32px rgba(0,0,0,0.4)', zIndex: 80,
      display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.2s ease',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '1px solid var(--border)',
      }}>
        <PriorityBadge priority={task.priority} />
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={handleDelete} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>
            <Trash2 size={16} />
          </button>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <X size={18} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          style={{
            fontSize: '1.2rem', fontWeight: 600, background: 'transparent',
            border: 'none', padding: 0, marginBottom: 16, width: '100%',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              Description
            </label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Priority
              </label>
              <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Due Date
              </label>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              Assignee
            </label>
            <select value={editAssignee} onChange={(e) => setEditAssignee(e.target.value)}>
              <option value="">Unassigned</option>
              {projectMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {hasChanges && (
          <button
            onClick={handleSave}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: 24 }}
            disabled={saving}
          >
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
          <CommentThread
            comments={comments}
            taskId={task.id}
            user={user}
            onCommentAdded={(comment) => setComments([...comments, comment])}
          />
        </div>
      </div>
    </div>
  );
}
