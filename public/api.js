const API_URL = '/api/tasks';

export const fetchTasks = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
};

export const createTask = async (name) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name })
    });
    if (!response.ok) throw new Error('Failed to create task');
};

export const createSubtask = async (taskId, name) => {
    const response = await fetch(`${API_URL}/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    if (!response.ok) throw new Error('Failed to create subtask');
};

export const toggleTaskStatus = async (taskId, action) => {
    const response = await fetch(`${API_URL}/${taskId}/${action}`, { method: 'POST' });
    if (!response.ok) throw new Error(`Failed to ${action} task`);
};

export const toggleSubtaskStatus = async (taskId, subtaskId, action) => {
    const response = await fetch(`${API_URL}/${taskId}/subtasks/${subtaskId}/${action}`, { method: 'POST' });
    if (!response.ok) throw new Error(`Failed to ${action} subtask`);
};

export const deleteTask = async (taskId) => {
    const response = await fetch(`${API_URL}/${taskId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete task');
};