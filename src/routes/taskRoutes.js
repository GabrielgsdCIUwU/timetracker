import express from 'express';
import TaskController from '../controllers/TaskController.js';
import { validateResource } from '../middlewares/validateResource.js';
import { addSubtaskSchema, createTaskSchema } from '../schemas/taskSchemas.js';

const router = express.Router();

router.get('/', TaskController.getTasks);
router.post('/', validateResource(createTaskSchema), TaskController.createTask);
router.post('/:id/subtasks', validateResource(addSubtaskSchema), TaskController.addSubtask);
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
