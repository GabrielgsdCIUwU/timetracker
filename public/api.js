const API_URL = '/api/tasks';

export const fetchTasks = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
};

export const createTask = async (data) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ data })
    });
    if (!response.ok) throw new Error(response.json().error || 'Failed to create task');
};

export const updateTask = async (taskId, data) => {
    const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update task');
}

export const createSubtask = async (taskId, name) => {
    const response = await fetch(`${API_URL}/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    if (!response.ok) throw new Error('Failed to create subtask');
};

export const updateSubtask = async (taskId, subtaskId, data) => {
    const response = await fetch(`${API_URL}/${taskId}/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update subtask');
};

export const deleteSubtask = async (taskId, subtaskId) => {
    const response = await fetch(`${API_URL}/${taskId}/subtasks/${subtaskId}`, {method: 'DELETE'});
    if (!response.ok) throw new Error('Failed to delete subtask');
}

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

export const addManualTime = async (taskId, subtaskId, start, end) => {
    const url = subtaskId
        ? `${API_URL}/${taskId}/subtasks/${subtaskId}/time-entries`
        : `${API_URL}/${taskId}/time-entries`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, end})
    });
    if (!response.ok) throw new Error('Failed to add manual time');
}