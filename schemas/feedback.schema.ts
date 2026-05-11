import { z } from 'zod';

export const createFeedbackSchema = z.object({
  ticketId: z.string().min(1, 'Ticket ID is required'),
  rating: z.number().min(1).max(5),
  npsScore: z.number().min(0).max(10).optional(),
  comment: z.string().max(2000).optional(),
  categories: z.array(z.enum([
    'service_quality',
    'response_time',
    'technician_skill',
    'communication',
    'pricing',
    'overall_experience',
  ])).optional(),
  isPublic: z.boolean().default(false),
});

export const respondToFeedbackSchema = z.object({
  content: z.string().min(10, 'Response must be at least 10 characters').max(1000),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
export type RespondToFeedbackInput = z.infer<typeof respondToFeedbackSchema>;
