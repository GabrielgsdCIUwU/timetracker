import { z } from 'zod';

export const createTaskSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required'})
            .min(3, 'Name must be at least 3 characters long')
            .max(100, 'Name is too long'),
        tags: z.array(z.string()).optional().default([])
    })
});

export const updateTaskSchema = z.object({
    params: z.object({ id: z.uuid('Invalid ID')}),
    body: z.object({
        name: z.string().min(3).max(100).optional(),
        tags: z.array(z.string()).optional()
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

export const updateSubtaskSchema = z.object({
    params: z.object({
        id: z.uuid('Invalid task ID'),
        subtaskId: z.uuid('Invalid subtask ID')
    }),
    body: z.object({
        name: z.string().min(3).max(100).optional()
    })
});

export const manualTimeSchema = z.object({
    params: z.object({
        id: z.uuid(),
        subtaskId: z.uuid().optional()
    }),
    body: z.object({
        start: z.iso.datetime({error: "Invalid start date"}),
        end: z.iso.datetime({error: "Invalid end date"}),
    }).refine(data => new Date(data.start) < new Date(data.end), {
        error: "The start date should be before the end date",
        path: ["start"]
    })
});