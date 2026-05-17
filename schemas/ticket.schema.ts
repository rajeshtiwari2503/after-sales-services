import { z } from 'zod';

export const createTicketSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.enum(['hardware', 'software', 'installation', 'maintenance', 'warranty', 'consultation', 'other']),
  customerId: z.string().optional(),
  serviceCenterId: z.string().optional(),
});

export const updateTicketSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(20).max(5000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  category: z.enum(['hardware', 'software', 'installation', 'maintenance', 'warranty', 'consultation', 'other']).optional(),
  status: z.enum(['open', 'in_progress', 'pending_parts', 'pending_customer', 'resolved', 'closed', 'cancelled']).optional(),
  technicianId: z.string().optional(),
  serviceCenterId: z.string().optional(),
  estimatedCompletionDate: z.string().datetime().optional(),
});

export const addNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required').max(2000),
  isInternal: z.boolean().default(false),
});

export const assignTicketSchema = z.object({
  technicianId: z.string().min(1, 'Technician ID is required'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'pending_parts', 'pending_customer', 'resolved', 'closed', 'cancelled']),
  reason: z.string().optional(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type AddNoteInput = z.infer<typeof addNoteSchema>;
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;


// import { z } from 'zod';

// export const createTicketSchema = z.object({
//   title: z.string().min(1, 'Title is required').max(200),
//   description: z.string().min(1, 'Description is required').max(5000),
//   category: z.enum(['hardware', 'software', 'installation', 'maintenance', 'warranty', 'consultation', 'other']),
//   priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
//   customerId: z.string().min(1, 'Customer is required'),
//   technicianId: z.string().optional(),
//   serviceCenterId: z.string().optional(),
//   estimatedCompletionDate: z.string().optional(),
// });

// export const updateTicketSchema = z.object({
//   title: z.string().max(200).optional(),
//   description: z.string().max(5000).optional(),
//   category: z.enum(['hardware', 'software', 'installation', 'maintenance', 'warranty', 'consultation', 'other']).optional(),
//   priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
//   customerId: z.string().optional(),
//   technicianId: z.string().optional(),
//   serviceCenterId: z.string().optional(),
//   estimatedCompletionDate: z.string().optional(),
// });

// export const changeStatusSchema = z.object({
//   status: z.enum(['open', 'in_progress', 'pending_parts', 'pending_customer', 'resolved', 'closed', 'cancelled']),
// });

// export type CreateTicketInput = z.infer<typeof createTicketSchema>;
// export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
