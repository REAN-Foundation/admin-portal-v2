import { z } from "zod";

export const createOrUpdateSchema = z.object({
    Text: z
        .string({
            required_error: "Text is required.",
            invalid_type_error: "Text must be a string."
        })
        .min(3, { message: "Text must be at least 8 characters." })
        .max(256, { message: "Text must be at most 256 characters." }),

    Sequence: z
        .number()
        .optional(),
});
