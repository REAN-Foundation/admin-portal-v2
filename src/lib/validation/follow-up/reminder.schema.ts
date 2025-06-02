import { z } from 'zod';

///////////////////////////////////////////////////////////////////////////////

export const appointmentCancelSchema = z.object({
  Dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).nonempty("At least one date is required"),
  Message: z.string().optional()
});