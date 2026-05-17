// import { z } from 'zod';

// export const createInventorySchema = z.object({
//   name: z.string().min(2, 'Name must be at least 2 characters').max(200),
//   sku: z.string().min(3, 'SKU must be at least 3 characters').max(50),
//   category: z.string().min(2, 'Category is required'),
//   description: z.string().max(1000).optional(),
//   quantity: z.number().min(0),
//   minQuantity: z.number().min(0).default(5),
//   maxQuantity: z.number().min(1).default(100),
//   unitPrice: z.number().min(0),
//   costPrice: z.number().min(0),
//   serviceCenterId: z.string().optional(),
//   supplier: z.object({
//     name: z.string(),
//     contact: z.string(),
//     email: z.string().email(),
//   }).optional(),
//   location: z.string().optional(),
// });

// export const updateInventorySchema = createInventorySchema.partial();

// export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
// export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;


import { z } from 'zod';

export const createInventorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  sku: z.string().min(1, 'SKU is required').max(50),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  quantity: z.number().min(0).default(0),
  minQuantity: z.number().min(0).default(5),
  maxQuantity: z.number().min(0).default(100),
  unitPrice: z.number().min(0),
  costPrice: z.number().min(0).optional(),
  location: z.string().optional(),
  supplier: z.object({
    name: z.string().optional(),
    contact: z.string().optional(),
    email: z.string().email().optional(),
  }).optional(),
});

export const updateInventorySchema = createInventorySchema.partial();