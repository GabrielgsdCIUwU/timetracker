import express from 'express';
import TaskController from '../controllers/TaskController.js';

const router = express.Router();

router.get('/', TaskController.getTasks);
router.post('/', TaskController.createTask);
router.post('/:id/subtasks', TaskController.addSubtask);
router.delete('/:id', TaskController.deleteTask);

// Tareas padre
router.post('/:id/start', TaskController.startTask);
router.post('/:id/pause', TaskController.pauseTask);
router.post('/:id/stop', TaskController.stopTask);

// Subtareas
router.post('/:id/subtasks/:subtaskId/start', TaskController.startSubtask);
router.post('/:id/subtasks/:subtaskId/pause', TaskController.pauseSubtask);
router.post('/:id/subtasks/:subtaskId/stop', TaskController.stopSubtask);

export default router;
