import { z } from 'zod';

export const updateSettingsSchema = z.object({
  bio: z.string().max(160).optional(),
  name: z.string().min(1).max(50).optional(),
});
