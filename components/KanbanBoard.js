'use client';

import { useState, useCallback } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import TaskDetailPanel from './TaskDetailPanel';

export default function KanbanBoard({ columns: initialColumns, tasks: initialTasks, projectMembers, user, projectId }) {
  const [columns, setColumns] = useState(initialColumns);
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTaskTitles, setNewTaskTitles] = useState({});

  const getColumnTasks = (columnId) =>
    tasks.filter((t) => t.column_id === columnId).sort((a, b) => a.position - b.position);

  const onDragEnd = useCallback(async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const taskId = parseInt(draggableId.replace('task-', ''));
    const sourceColId = parseInt(source.droppableId);
    const destColId = parseInt(destination.droppableId);

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newTasks = [...tasks];
    const sourceTasks = newTasks.filter((t) => t.column_id === sourceColId).sort((a, b) => a.position - b.position);
    const destTasks = sourceColId === destColId ? sourceTasks : newTasks.filter((t) => t.column_id === destColId).sort((a, b) => a.position - b.position);

    const [movedTask] = sourceTasks.splice(source.index, 1);
    movedTask.column_id = destColId;
    destTasks.splice(destination.index, 0, movedTask);

    const reindexed = newTasks.map((t) => {
      if (t.column_id === sourceColId) {
        const idx = sourceTasks.indexOf(t);
        return { ...t, position: idx >= 0 ? idx : t.position };
      }
      if (t.column_id === destColId) {
        const idx = destTasks.indexOf(t);
        return { ...t, position: idx >= 0 ? idx : t.position };
      }
      return t;
    });

    setTasks(reindexed);

    try {
      await fetch(`/api/tasks/${taskId}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ column_id: destColId, position: destination.index }),
      });
    } catch {
      setTasks(initialTasks);
    }
  }, [tasks, initialTasks]);

  const handleAddTask = async (columnId) => {
    const title = newTaskTitles[columnId];
    if (!title || !title.trim()) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          column_id: columnId,
          project_id: projectId,
          title: title.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks([...tasks, data.task]);
        setNewTaskTitles({ ...newTaskTitles, [columnId]: '' });
      }
    } catch {}
  };

  const handleUpdateTask = (updatedTask) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t)));
    setSelectedTask({ ...selectedTask, ...updatedTask });
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    setSelectedTask(null);
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: 16, height: '100%', overflow: 'auto', padding: '0 4px' }}>
          {columns.map((column) => {
            const columnTasks = getColumnTasks(column.id);
            return (
              <div key={column.id} style={{
                minWidth: 280, maxWidth: 320, flex: 1,
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: 12, padding: '0 4px',
                }}>
                  <h3 style={{
                    fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.05em', color: 'var(--text-secondary)',
                  }}>
                    {column.title}
                    <span style={{ color: 'var(--text-muted)', marginLeft: 6, fontWeight: 400 }}>
                      {columnTasks.length}
                    </span>
                  </h3>
                </div>

                <Droppable droppableId={String(column.id)}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        flex: 1, minHeight: 200,
                        padding: 8, borderRadius: 'var(--radius-lg)',
                        background: snapshot.isDraggingOver
                          ? 'hsla(245, 82%, 67%, 0.05)'
                          : 'transparent',
                        border: `2px dashed ${snapshot.isDraggingOver ? 'var(--accent)' : 'transparent'}`,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {columnTasks.map((task, index) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          index={index}
                          onClick={setSelectedTask}
                        />
                      ))}
                      {provided.placeholder}

                      <div style={{ marginTop: 8 }}>
                        {newTaskTitles[column.id] !== undefined ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <input
                              type="text"
                              placeholder="Task title..."
                              value={newTaskTitles[column.id] || ''}
                              onChange={(e) => setNewTaskTitles({ ...newTaskTitles, [column.id]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddTask(column.id);
                                if (e.key === 'Escape') setNewTaskTitles({ ...newTaskTitles, [column.id]: undefined });
                              }}
                              autoFocus
                              style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                            />
                            <button
                              onClick={() => handleAddTask(column.id)}
                              className="btn btn-primary btn-sm"
                              disabled={!newTaskTitles[column.id]?.trim()}
                            >
                              Add
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setNewTaskTitles({ ...newTaskTitles, [column.id]: '' })}
                            className="btn btn-ghost btn-sm"
                            style={{ width: '100%', justifyContent: 'flex-start', gap: 4, color: 'var(--text-muted)', fontSize: '0.8rem' }}
                          >
                            <Plus size={14} /> Add Task
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          projectMembers={projectMembers}
          user={user}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
    </>
  );
}
