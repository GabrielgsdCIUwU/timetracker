import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// Make crypto available globally for uuid
globalThis.crypto = crypto;

export default class TaskService {
    constructor(taskRepository) {
        this.repository = taskRepository;
    }

    async getAllTasks() {
        const tasks = await this.repository.getAllTasks();
        // Podemos mapear las tareas para agregar un "totalTimeCalculated" para conveniencia si es necesario,
        // pero la regla de negocio principal dice que se calcula al mostrar. El frontend hará esto también
        // para su cronómetro, pero es buena práctica devolver el estado coherente.
        return tasks.map(task => this._enrichTaskWithCalculatedTime(task));
    }

    async createTask(name) {
        const newTask = {
            id: uuidv4(),
            name,
            status: 'pending', // pending, active, paused, completed
            timeEntries: [],
            subtasks: []
        };
        await this.repository.saveTask(newTask);
        return newTask;
    }

    async addSubtask(taskId, subtaskName) {
        const task = await this.repository.getTaskById(taskId);
        if (!task) throw new Error('Task not found');

        const newSubtask = {
            id: uuidv4(),
            name: subtaskName,
            status: 'pending',
            timeEntries: []
        };

        task.subtasks.push(newSubtask);
        await this.repository.saveTask(task);
        return newSubtask;
    }

    async startTimer(taskId, subtaskId = null) {
        const task = await this.repository.getTaskById(taskId);
        if (!task) throw new Error('Task not found');

        let target = task;
        if (subtaskId) {
            target = task.subtasks.find(s => s.id === subtaskId);
            if (!target) throw new Error('Subtask not found');
        }

        if (target.status === 'active') {
            throw new Error('Timer is already active');
        }

        if (target.status === 'completed') {
            throw new Error('Task is already completed');
        }

        // Add new time entry
        target.timeEntries.push({
            start: new Date().toISOString(),
            end: null
        });
        target.status = 'active';

        await this.repository.saveTask(task);
        return target;
    }

    async pauseTimer(taskId, subtaskId = null) {
        const task = await this.repository.getTaskById(taskId);
        if (!task) throw new Error('Task not found');

        let target = task;
        if (subtaskId) {
            target = task.subtasks.find(s => s.id === subtaskId);
            if (!target) throw new Error('Subtask not found');
        }

        if (target.status !== 'active') {
            throw new Error('Timer is not active');
        }

        // Find the open time entry
        const activeEntry = target.timeEntries.find(entry => entry.end === null);
        if (activeEntry) {
            activeEntry.end = new Date().toISOString();
        }

        target.status = 'paused';
        await this.repository.saveTask(task);
        return target;
    }

    async stopTimer(taskId, subtaskId = null) {
        const task = await this.repository.getTaskById(taskId);
        if (!task) throw new Error('Task not found');

        let target = task;
        if (subtaskId) {
            target = task.subtasks.find(s => s.id === subtaskId);
            if (!target) throw new Error('Subtask not found');
        }

        // If it was active, close the current entry
        if (target.status === 'active') {
            const activeEntry = target.timeEntries.find(entry => entry.end === null);
            if (activeEntry) {
                activeEntry.end = new Date().toISOString();
            }
        }

        target.status = 'completed';
        await this.repository.saveTask(task);
        return target;
    }

    // Método auxiliar para enriquecer el JSON de retorno (opcional pero útil)
    _enrichTaskWithCalculatedTime(task) {
        let parentTime = this._calculateEntriesTime(task.timeEntries);
        let subtasksTime = 0;

        const enrichedSubtasks = task.subtasks.map(subtask => {
            const subTime = this._calculateEntriesTime(subtask.timeEntries);
            subtasksTime += subTime;
            return { ...subtask, totalTimeMs: subTime };
        });

        return {
            ...task,
            subtasks: enrichedSubtasks,
            totalOwnTimeMs: parentTime,
            totalTimeMs: parentTime + subtasksTime // Padre propio + subtareas
        };
    }

    _calculateEntriesTime(entries) {
        const now = new Date();
        return entries.reduce((total, entry) => {
            const start = new Date(entry.start);
            const end = entry.end ? new Date(entry.end) : now;
            return total + (end - start);
        }, 0);
    }

    async deleteTask(taskId) {
        const task = await this.repository.getTaskById(taskId);
        if (!task) throw new Error('Task not found');
        await this.repository.deleteTask(taskId);
        return task;
    }
}
