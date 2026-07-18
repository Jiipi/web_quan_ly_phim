import { z } from "zod";

export const createListSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().optional(),
});
export type CreateListInput = z.infer<typeof createListSchema>;

export const updateListSchema = z
  .object({
    name: z.string().min(1).max(80).optional(),
    description: z.string().max(500).nullable().optional(),
    isPublic: z.boolean().optional(),
  })
  .refine((d) => d.name !== undefined || d.description !== undefined || d.isPublic !== undefined, {
    message: "Không có gì để cập nhật.",
  });

export const addListItemSchema = z.object({ mediaItemId: z.string().min(1) });

export const reorderListSchema = z.object({
  orderedMediaItemIds: z.array(z.string().min(1)).min(1),
});
