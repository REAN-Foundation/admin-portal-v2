import { z } from "zod";

export const createOrUpdateSchema = z.object({
    Title: z
        .string({
            required_error: "Title is required.",
            invalid_type_error: "Title must be a string."
        })
        .min(1, { message: "Title cannot be empty." })
        .max(256, { message: "Title must be at most 256 characters long." }),

    Description: z
        .string()
        .max(1024, { message: "Description must be at most 1024 characters long." })
        .optional(),

    Type: z
        .string({
            required_error: "Type is required.",
            invalid_type_error: "Type must be a string."
        })
        .min(1, { message: "Type cannot be empty." })
        .max(128, { message: "Type must be at most 128 characters long." }),

    Provider: z
        .string({
            required_error: "Provider is required.",
            invalid_type_error: "Provider must be a string."
        })
        .min(1, { message: "Provider cannot be empty." })
        .max(128, { message: "Provider must be at most 128 characters long." }),

    ProviderAssessmentCode: z
        .string({
            required_error: "Assessment code is required.",
            invalid_type_error: "Assessment code must be a string."
        })
        .min(1, { message: "Assessment code cannot be empty." })
        .max(128, { message: "Assessment code must be at most 128 characters long." }),

    ServeListNodeChildrenAtOnce: z
        .boolean({
            required_error: "ServeListNodeChildrenAtOnce must be selected."
        }),

    ScoringApplicable: z
        .boolean({
            required_error: "ScoringApplicable must be selected."
        }),

    Tags: z
        .array(z.string())
        .optional()
});
