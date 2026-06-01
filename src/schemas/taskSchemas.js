import { z } from 'zod';

export const createTaskSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required'})
            .min(3, 'Name must be at least 3 characters long')
            .max(100, 'Name is too long')
    })
});

export const addSubtaskSchema = z.object({
    params: z.object({
        id: z.uuid('Invalid task ID')
    }),
    body: z.object({
        name: z.string({ required_error: 'Subtask name is required' })
        .min(3, 'Must be at least 3 characters long')
    })
});