export class ApiClient {
    static #BASE_URL = '/api/tasks';

    static async #handleResponse(response) {
        if (!response.ok) {
            let errorMessage = 'Request failed';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) { }
            throw new Error(errorMessage);
        }

        const text = await response.text();
        return text ? JSON.parse(text) : null;
    }

    static async #request(endpoint = '', method = 'GET', body = null) {
        const options = { method, headers: {} };

        if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${this.#BASE_URL}${endpoint}`, options);
        return this.#handleResponse(response);
    }

    static fetchTasks() {
        return this.#request();
    }

    static createTask(data) {
        return this.#request('', 'POST', data);
    }

    static updateTask(taskId, data) {
        return this.#request(`/${taskId}`, 'PUT', data);
    }

    static createSubtask(taskId, name) {
        return this.#request(`/${taskId}/subtasks`, 'POST', { name });
    }

    static updateSubtask(taskId, subtaskId, data) {
        return this.#request(`/${taskId}/subtasks/${subtaskId}`, 'PUT', data);
    }

    static deleteSubtask(taskId, subtaskId) {
        return this.#request(`/${taskId}/subtasks/${subtaskId}`, 'DELETE');
    }

    static toggleTaskStatus(taskId, action) {
        return this.#request(`/${taskId}/${action}`, 'POST');
    }

    static toggleSubtaskStatus(taskId, subtaskId, action) {
        return this.#request(`/${taskId}/subtasks/${subtaskId}/${action}`, 'POST');
    }

    static deleteTask(taskId) {
        return this.#request(`/${taskId}`, 'DELETE');
    }

    static addManualTime(taskId, subtaskId, start, end) {
        const endpoint = subtaskId
            ? `/${taskId}/subtasks/${subtaskId}/time-entries`
            : `/${taskId}/time-entries`;

        return this.#request(endpoint, 'POST', { start, end });
    }
}