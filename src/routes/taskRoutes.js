import express from 'express';
import TaskController from '../controllers/TaskController.js';
import { validateResource } from '../middlewares/validateResource.js';
import { addSubtaskSchema, createTaskSchema, manualTimeSchema, updateTaskSchema } from '../schemas/taskSchemas.js';

const router = express.Router();

router.get('/', TaskController.getTasks);
router.post('/', validateResource(createTaskSchema), TaskController.createTask);
router.post('/:id/subtasks', validateResource(addSubtaskSchema), TaskController.addSubtask);
router.delete('/:id', TaskController.deleteTask);

// Tareas padre
router.post('/:id/start', TaskController.startTask);
router.post('/:id/pause', TaskController.pauseTask);
router.post('/:id/stop', TaskController.stopTask);
router.post('/:id/reopen', TaskController.reopenTask);
router.put('/:id', validateResource(updateTaskSchema), TaskController.updateTask);

// Subtareas
router.post('/:id/subtasks/:subtaskId/start', TaskController.startSubtask);
router.post('/:id/subtasks/:subtaskId/pause', TaskController.pauseSubtask);
router.post('/:id/subtasks/:subtaskId/stop', TaskController.stopSubtask);
router.post('/:id/subtasks/:subtaskId/reopen', TaskController.reopenSubtask);
router.put('/:id/subtasks/:subtaskId', TaskController.updateSubtask);
router.delete('/:id/subtasks/:subtaskId', TaskController.deleteSubtask);

// Tiempo Manual
router.post('/:id/time-entries', validateResource(manualTimeSchema), TaskController.addManualTime);
router.post('/:id/subtasks/:subtaskId/time-entries', validateResource(manualTimeSchema), TaskController.addManualTime);

export default router;
