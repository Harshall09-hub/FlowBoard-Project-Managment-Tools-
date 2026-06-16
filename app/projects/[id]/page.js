'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Settings, UserPlus, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import KanbanBoard from '@/components/KanbanBoard';
import Avatar from '@/components/Avatar';
import Modal from '@/components/Modal';

export default function ProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [columns, setColumns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [userRole, setUserRole] = useState('member');
  const [loading, setLoading] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [editProject, setEditProject] = useState({ name: '', description: '', color: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchProject = async () => {
    try {
      const [meRes, projectRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch(`/api/projects/${id}`),
      ]);

      if (!meRes.ok) {
        router.push('/login');
        return;
      }

      const meData = await meRes.json();
      setUser(meData.user);

      if (!projectRes.ok) {
        router.push('/dashboard');
        return;
      }

      const data = await projectRes.json();
      setProject(data.project);
      setMembers(data.members);
      setColumns(data.columns);
      setTasks(data.tasks);
      setUserRole(data.userRole);
      setEditProject({
        name: data.project.name,
        description: data.project.description || '',
        color: data.project.color || '#6366f1',
      });
    } catch {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;

    setAddingMember(true);
    try {
      const res = await fetch(`/api/projects/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: memberEmail.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setMembers([...members, { ...data.user, role: 'member' }]);
        setMemberEmail('');
        setShowAddMemberModal(false);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add member');
      }
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this member from the project?')) return;

    try {
      const res = await fetch(`/api/projects/${id}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: memberId }),
      });

      if (res.ok) {
        setMembers(members.filter((m) => m.id !== memberId));
      }
    } catch {}
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProject),
      });

      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
        setShowSettingsModal(false);
      }
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? All data will be lost.')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) router.push('/dashboard');
    } catch {}
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  if (!project) return null;

  const canManage = userRole === 'owner' || userRole === 'admin';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Navbar user={user} />

      <div style={{
        paddingTop: 56, display: 'flex', flexDirection: 'column', height: '100vh',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => router.push('/dashboard')} className="btn btn-ghost btn-sm">
              <ArrowLeft size={16} />
            </button>
            <div style={{ width: 4, height: 24, borderRadius: 2, background: project.color || '#6366f1' }} />
            <h1 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{project.name}</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {members.slice(0, 4).map((m) => (
                <Avatar key={m.id} name={m.name} size={28} />
              ))}
              {members.length > 4 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 2 }}>
                  +{members.length - 4}
                </span>
              )}
            </div>

            {canManage && (
              <>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAddMemberModal(true)}>
                  <UserPlus size={14} /> Add Member
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowSettingsModal(true)}>
                  <Settings size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ flex: 1, padding: '16px 24px', overflow: 'auto' }}>
          <KanbanBoard
            columns={columns}
            tasks={tasks}
            projectMembers={members}
            user={user}
            projectId={id}
          />
        </div>
      </div>

      <Modal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} title="Project Settings">
        <form onSubmit={handleSaveSettings}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>
              Name
            </label>
            <input
              type="text"
              value={editProject.name}
              onChange={(e) => setEditProject({ ...editProject, name: e.target.value })}
              required
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>
              Description
            </label>
            <textarea
              value={editProject.description}
              onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
              rows={3}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>
              Members ({members.length})
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {members.map((m) => (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '6px 10px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar name={m.name} size={24} />
                    <span style={{ fontSize: '0.85rem' }}>{m.name}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>({m.role})</span>
                  </div>
                  {canManage && m.role !== 'owner' && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(m.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--danger)', padding: 4 }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            {userRole === 'owner' && (
              <button type="button" className="btn btn-danger" onClick={handleDeleteProject}>
                Delete Project
              </button>
            )}
            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowSettingsModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={savingSettings}>
                {savingSettings ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showAddMemberModal} onClose={() => setShowAddMemberModal(false)} title="Add Member">
        <form onSubmit={handleAddMember}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>
              Member Email
            </label>
            <input
              type="email"
              placeholder="colleague@example.com"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              required
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              User must already have a FlowBoard account.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddMemberModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={addingMember || !memberEmail.trim()}>
              {addingMember ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
