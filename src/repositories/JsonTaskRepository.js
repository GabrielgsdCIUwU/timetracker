import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default class JsonTaskRepository {
    constructor() {
        this.filePath = path.join(__dirname, '../../data.json');
        this.initFile();
    }

    async initFile() {
        try {
            await fs.access(this.filePath);
        } catch (error) {
            // Archivo no existe, crearlo con estructura base
            await fs.writeFile(this.filePath, JSON.stringify({ tasks: [] }, null, 2));
        }
    }

    async getAllTasks() {
        try {
            const data = await fs.readFile(this.filePath, 'utf8');
            return JSON.parse(data).tasks;
        } catch (error) {
            console.error('Error reading data file', error);
            return [];
        }
    }

    async getTaskById(taskId) {
        const tasks = await this.getAllTasks();
        return tasks.find(t => t.id === taskId) || null;
    }

    async saveTask(task) {
        const tasks = await this.getAllTasks();
        const index = tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
            tasks[index] = task; // Update
        } else {
            tasks.push(task); // Create
        }
        await this._saveAll(tasks);
    }

    async deleteTask(taskId) {
        let tasks = await this.getAllTasks();
        tasks = tasks.filter(t => t.id !== taskId);
        await this._saveAll(tasks);
    }

    async _saveAll(tasks) {
        try {
            await fs.writeFile(this.filePath, JSON.stringify({ tasks }, null, 2));
        } catch (error) {
            console.error('Error writing to data file', error);
            throw new Error('Could not save data');
        }
    }
}
