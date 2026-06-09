import TaskService from '../services/TaskService.js';
import JsonTaskRepository from '../repositories/JsonTaskRepository.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const taskRepository = new JsonTaskRepository();
const taskService = new TaskService(taskRepository);

export default class TaskController {
    static getTasks = asyncHandler(async (req, res) => {
        const { tag } = req.query;
        const tasks = await taskService.getAllTasks(tag);
        res.json(tasks);
    });

    static createTask = asyncHandler(async (req, res) => {
        const { name, tags } = req.body;
        const task = await taskService.createTask(name, tags);
        res.status(201).json(task);
    });

    static updateTask = asyncHandler(async (req, res) => {
        const task = await taskService.updateTask(req.params.id, req.body);
        res.json(task);
    });

    static addSubtask = asyncHandler(async (req, res) => {
        const subtask = await taskService.addSubtask(req.params.id, req.body.name);
        res.status(201).json(subtask);
    });

    static updateSubtask = asyncHandler(async (req, res) => {
        const subtask = await taskService.updateSubtask(req.params.id, req.params.subtaskId, req.body);
        res.json(subtask);
    });

    static deleteSubtask = asyncHandler(async (req, res) => {
        await taskService.deleteSubtask(req.params.id, req.params.subtaskId);
        res.json({ message: 'Subtask deleted' });
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

    static reopenTask = asyncHandler(async (req, res) => {
        const target = await taskService.reopenTimer(req.params.id);
        res.json(target);
    });

    static reopenSubtask = asyncHandler(async (req, res) => {
        const target = await taskService.reopenTimer(req.params.id, req.params.subtaskId);
        res.json(target);
    });

    static addManualTime = asyncHandler(async (req, res) => {
        const { start, end } = req.body;
        const target = await taskService.addManualTime(req.params.id, req.params.subtaskId, start, end);
        res.status(201).json(target);
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
