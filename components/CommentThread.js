'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import Avatar from './Avatar';

export default function CommentThread({ comments, taskId, user, onCommentAdded }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        onCommentAdded(data.comment);
        setContent('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>
        Comments ({comments.length})
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 300, overflow: 'auto', marginBottom: 16 }}>
        {comments.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: 20 }}>
            No comments yet. Start the discussion.
          </p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} style={{ display: 'flex', gap: 10 }}>
            <Avatar name={comment.user_name} size={28} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{comment.user_name}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {new Date(comment.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {comment.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ flex: 1 }}
        />
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={loading || !content.trim()}
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
