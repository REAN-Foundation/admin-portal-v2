import { z } from "zod";

export const createOrUpdateSchema = z.object({
    ScoringConditionId: z
        .string({
            required_error: "ResolutionScore is required.",
            invalid_type_error: "ResolutionScore must be a string."
        }).optional(),

    ResolutionScore: z
        .number({
            required_error: "ResolutionScore is required.",
            invalid_type_error: "ResolutionScore must be a number."
        })
        .optional(),
});
