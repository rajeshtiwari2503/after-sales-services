// // import { z } from 'zod';

// // export const createTicketSchema = z.object({
// //   title: z.string().min(5, 'Title must be at least 5 characters').max(200),
// //   description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
// //   priority: z.enum(['low', 'medium', 'high', 'critical']),
// //   category: z.enum(['hardware', 'software', 'installation', 'maintenance', 'warranty', 'consultation', 'other']),
// //   customerId: z.string().optional(),
// //   serviceCenterId: z.string().optional(),
// // });

// // export const updateTicketSchema = z.object({
// //   title: z.string().min(5).max(200).optional(),
// //   description: z.string().min(20).max(5000).optional(),
// //   priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
// //   category: z.enum(['hardware', 'software', 'installation', 'maintenance', 'warranty', 'consultation', 'other']).optional(),
// //   status: z.enum(['open', 'in_progress', 'pending_parts', 'pending_customer', 'resolved', 'closed', 'cancelled']).optional(),
// //   technicianId: z.string().optional(),
// //   serviceCenterId: z.string().optional(),
// //   estimatedCompletionDate: z.string().datetime().optional(),
// // });

// // export const addNoteSchema = z.object({
// //   content: z.string().min(1, 'Note content is required').max(2000),
// //   isInternal: z.boolean().default(false),
// // });

// // export const assignTicketSchema = z.object({
// //   technicianId: z.string().min(1, 'Technician ID is required'),
// // });

// // export const updateStatusSchema = z.object({
// //   status: z.enum(['open', 'in_progress', 'pending_parts', 'pending_customer', 'resolved', 'closed', 'cancelled']),
// //   reason: z.string().optional(),
// // });

// // export type CreateTicketInput = z.infer<typeof createTicketSchema>;
// // export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
// // export type AddNoteInput = z.infer<typeof addNoteSchema>;
// // export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
// // export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

//  // schemas/ticket.schema.ts  — REPLACE your existing file
// // Change: assignTicketSchema now accepts technicianId OR serviceCenterId (or both)

// import { z } from 'zod';

// export const createTicketSchema = z.object({
//   title: z.string().min(5, 'Title must be at least 5 characters').max(200),
//   description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
//   priority: z.enum(['low', 'medium', 'high', 'critical']),
//   category: z.enum(['hardware', 'software', 'installation', 'maintenance', 'warranty', 'consultation', 'other']),
//   customerId: z.string().optional(),
//   serviceCenterId: z.string().optional(),
//   technicianId: z.string().optional(),
//   estimatedCompletionDate: z.string().optional(),
// });

// export const updateTicketSchema = z.object({
//   title: z.string().min(5).max(200).optional(),
//   description: z.string().min(20).max(5000).optional(),
//   priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
//   category: z.enum(['hardware', 'software', 'installation', 'maintenance', 'warranty', 'consultation', 'other']).optional(),
//   status: z.enum(['open', 'in_progress', 'pending_parts', 'pending_customer', 'resolved', 'closed', 'cancelled']).optional(),
//   technicianId: z.string().optional(),
//   serviceCenterId: z.string().optional(),
//   estimatedCompletionDate: z.string().datetime().optional(),
// });

// export const addNoteSchema = z.object({
//   content: z.string().min(1, 'Note content is required').max(2000),
//   isInternal: z.boolean().default(false),
// });

// // Updated: either technicianId or serviceCenterId must be provided
// export const assignTicketSchema = z
//   .object({
//     technicianId: z.string().optional(),
//     serviceCenterId: z.string().optional(),
//   })
//   .refine(
//     (data) => data.technicianId || data.serviceCenterId,
//     { message: 'Provide either technicianId or serviceCenterId' }
//   );

// export const updateStatusSchema = z.object({
//   status: z.enum(['open', 'in_progress', 'pending_parts', 'pending_customer', 'resolved', 'closed', 'cancelled']),
//   reason: z.string().optional(),
// });

// export type CreateTicketInput = z.infer<typeof createTicketSchema>;
// export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
// export type AddNoteInput = z.infer<typeof addNoteSchema>;
// export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
// export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;


// schemas/ticket.schema.ts  — REPLACE existing
import { z } from 'zod';

export const createTicketSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  category: z.string().default('other'),          // free text / slug, kept for compat
  categoryId: z.string().optional(),              // ← NEW: ObjectId of Category
  productId: z.string().optional(),               // ← NEW: ObjectId of Product
  faultId: z.string().optional(),                 // ← NEW: subdoc _id in Category.faults
  faultName: z.string().optional(),               // ← NEW: denormalized fault name
  customerId: z.string().optional(),
  serviceCenterId: z.string().optional(),
  technicianId: z.string().optional(),
  estimatedCompletionDate: z.string().optional(),
});

export const updateTicketSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  category: z.string().optional(),
  categoryId: z.string().optional(),
  productId: z.string().optional(),
  faultId: z.string().optional(),
  faultName: z.string().optional(),
  status: z.enum(['open', 'in_progress', 'pending_parts', 'pending_customer', 'resolved', 'closed', 'cancelled']).optional(),
  technicianId: z.string().optional(),
  serviceCenterId: z.string().optional(),
  estimatedCompletionDate: z.string().datetime().optional(),
});

export const addNoteSchema = z.object({
  content: z.string().min(1, 'Note content is required').max(2000),
  isInternal: z.boolean().default(false),
});

export const assignTicketSchema = z
  .object({
    technicianId: z.string().optional(),
    serviceCenterId: z.string().optional(),
  })
  .refine((d) => d.technicianId || d.serviceCenterId, {
    message: 'Provide technicianId or serviceCenterId',
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