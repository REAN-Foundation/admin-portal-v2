import { z } from "zod";

export const updateSchema = z.object({
    healthSystemName: z
        .string({ required_error: "Health system name is required." })
        .min(1, { message: "Health system name cannot be empty." })
        .max(128, { message: "Health system name must be at most 128 characters long." }),
    tags: z.array(z.string()).optional()
});
