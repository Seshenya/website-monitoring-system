import { z } from "zod";

export const monitorStateSchema = z.object({
  keywords: z.array(z.string()),
  changes: z.string(),
  summary: z.string().optional(),
  relevanceScore: z.number().min(0).max(1).optional(),
  relevanceReason: z.string().optional(),
  attempts: z.number(),
  isRelevant: z.boolean().optional(),
});
