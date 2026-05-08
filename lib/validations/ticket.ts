import { z } from "zod";

export const ticketSchema =
  z.object({
    title: z.string().min(3),

    description: z.string().min(10),

    customerName:
      z.string().min(2),

    customerEmail:
      z.string().email(),

    customerPhone:
      z.string().min(10),

    priority: z.enum([
      "LOW",
      "MEDIUM",
      "HIGH",
      "URGENT",
    ]),
  });