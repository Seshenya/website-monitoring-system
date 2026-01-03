import { z } from "zod";

export const relevanceSchema = z.object({
  score: z.number().min(0).max(1),
  reason: z.string().min(1),
});
