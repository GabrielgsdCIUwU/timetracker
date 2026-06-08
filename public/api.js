const API_URL = '/api/tasks';

export const fetchTasks = async () => handleResponse(await fetch(API_URL));

export const createTask = async (data) => {
    return handleResponse(await fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    }));
};

export const updateTask = async (taskId, data) => {
    return handleResponse(await fetch(`${API_URL}/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }));
};

export const createSubtask = async (taskId, name) => {
    return handleResponse(await fetch(`${API_URL}/${taskId}/subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    }));
};

export const updateSubtask = async (taskId, subtaskId, data) => {
    return handleResponse(await fetch(`${API_URL}/${taskId}/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }));
}

export const deleteSubtask = async (taskId, subtaskId) => {
    return handleResponse(await fetch(`${API_URL}/${taskId}/subtasks/${subtaskId}`, { method: 'DELETE' }));
};

export const toggleTaskStatus = async (taskId, action) => {
    return handleResponse(await fetch(`${API_URL}/${taskId}/${action}`, { method: 'POST' }));
};

export const toggleSubtaskStatus = async (taskId, subtaskId, action) => {
    return handleResponse(await fetch(`${API_URL}/${taskId}/subtasks/${subtaskId}/${action}`, { method: 'POST' }));
};

export const deleteTask = async (taskId) => {
    return handleResponse(await fetch(`${API_URL}/${taskId}`, { method: 'DELETE' }));
};

export const addManualTime = async (taskId, subtaskId, start, end) => {
    const url = subtaskId
        ? `${API_URL}/${taskId}/subtasks/${subtaskId}/time-entries`
        : `${API_URL}/${taskId}/time-entries`;
    
    return handleResponse(await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, end })
    }));
};

const handleResponse = async (response) => {
    if (!response.ok) {
        let errorMessage = 'Request failed';
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
};