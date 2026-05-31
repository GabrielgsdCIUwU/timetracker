import TaskService from '../services/TaskService.js';
import JsonTaskRepository from '../repositories/JsonTaskRepository.js';

const taskRepository = new JsonTaskRepository();
const taskService = new TaskService(taskRepository);

export default class TaskController {
    static async getTasks(req, res) {
        try {
            const tasks = await taskService.getAllTasks();
            res.json(tasks);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async createTask(req, res) {
        try {
            const { name } = req.body;
            if (!name) return res.status(400).json({ error: 'Name is required' });
            
            const task = await taskService.createTask(name);
            res.status(201).json(task);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async addSubtask(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            if (!name) return res.status(400).json({ error: 'Name is required' });

            const subtask = await taskService.addSubtask(id, name);
            res.status(201).json(subtask);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    static async startTask(req, res) {
        try {
            const { id } = req.params;
            const target = await taskService.startTimer(id);
            res.json(target);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async pauseTask(req, res) {
        try {
            const { id } = req.params;
            const target = await taskService.pauseTimer(id);
            res.json(target);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async stopTask(req, res) {
        try {
            const { id } = req.params;
            const target = await taskService.stopTimer(id);
            res.json(target);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async startSubtask(req, res) {
        try {
            const { id, subtaskId } = req.params;
            const target = await taskService.startTimer(id, subtaskId);
            res.json(target);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async pauseSubtask(req, res) {
        try {
            const { id, subtaskId } = req.params;
            const target = await taskService.pauseTimer(id, subtaskId);
            res.json(target);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async stopSubtask(req, res) {
        try {
            const { id, subtaskId } = req.params;
            const target = await taskService.stopTimer(id, subtaskId);
            res.json(target);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    static async deleteTask(req, res) {
        try {
            const { id } = req.params;
            await taskService.deleteTask(id);
            res.json({ message: 'Task deleted successfully' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
