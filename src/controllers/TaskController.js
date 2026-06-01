import TaskService from '../services/TaskService.js';
import JsonTaskRepository from '../repositories/JsonTaskRepository.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const taskRepository = new JsonTaskRepository();
const taskService = new TaskService(taskRepository);

export default class TaskController {
    static getTasks = asyncHandler(async (req, res) => {
        const tasks = await taskService.getAllTasks();
        res.json(tasks);
    });

    static createTask = asyncHandler(async (req, res) => {
        const task = await taskService.createTask(req.body.name);
        res.status(201).json(task);
    });

    static addSubtask = asyncHandler(async (req, res) => {
        const subtask = await taskService.addSubtask(req.params.id, req.body.name);
        res.status(201).json(subtask);
    });

    static startTask = asyncHandler(async (req, res) => {
        const target = await taskService.startTimer(req.params.id);
        res.json(target);
    });

    static pauseTask = asyncHandler(async (req, res) => {
        const target = await taskService.pauseTimer(req.params.id);
        res.json(target);
    });

    static stopTask = asyncHandler(async (req, res) => {
        const target = await taskService.stopTimer(req.params.id);
        res.json(target);
    });

    static startSubtask = asyncHandler(async (req, res) => {
        const target = await taskService.startTimer(req.params.id, req.params.subtaskId);
        res.json(target);
    });

    static pauseSubtask = asyncHandler(async (req, res) => {
        const target = await taskService.pauseTimer(req.params.id, req.params.subtaskId);
        res.json(target);
    });

    static stopSubtask = asyncHandler(async (req, res) => {
        const target = await taskService.stopTimer(req.params.id, req.params.subtaskId);
        res.json(target);
    });

    static deleteTask = asyncHandler(async (req, res) => {
        await taskService.deleteTask(req.params.id);
        res.json({ message: 'Task deleted successfully' });
    });
}
