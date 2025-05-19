import { z } from "zod";

export const createOrUpdateSchema = z.object({
    NodeType: z
        .string({
            required_error: "NodeType is required.",
            invalid_type_error: "NodeType must be a string."
        })
        .min(1, { message: "NodeType cannot be empty." }),

    ParentNodeId: z
        .string({
            required_error: "ParentNodeId is required.",
            invalid_type_error: "ParentNodeId must be a valid UUID string."
        })
        .uuid({ message: "ParentNodeId must be a valid UUID." }),

    Title: z
        .string({
            required_error: "Title is required.",
            invalid_type_error: "Title must be a string."
        })
        .min(8, { message: "Title must be at least 8 characters." })
        .max(256, { message: "Title must be at most 256 characters." }),

    Description: z
        .string()
        .max(1024, { message: "Description must be at most 1024 characters." })
        .optional(),

    RawData: z
        .string()
        .max(1024, { message: "Raw Data must be at most 1024 characters." })
        .optional(),

    Sequence: z
        .number({
            required_error: "Sequence is required.",
            invalid_type_error: "Sequence must be a number."
        })
        .optional(),

    QueryType: z
        .string({
            required_error: "QueryType is required.",
            invalid_type_error: "QueryType must be a string."
        }),

    ResolutionScore: z
        .number({
            required_error: "ResolutionScore is required.",
            invalid_type_error: "ResolutionScore must be a number."
        })
        .optional(),

    ProviderAssessmentCode: z
        .string({
            required_error: "ProviderAssessmentCode is required.",
            invalid_type_error: "ProviderAssessmentCode must be a string."
        })
        .optional(),

    Message: z
        .string({
            required_error: "Message is required.",
            invalid_type_error: "Message must be a string."
        })
        .optional(),

    ServeListNodeChildrenAtOnce: z
        .boolean({
            required_error: "ServeListNodeChildrenAtOnce must be selected."
        })
        .optional(),

    ScoringApplicable: z
        .boolean({
            required_error: "ScoringApplicable must be selected."
        })
        .optional(),

    Options: z
        .array(
            z
                .object({
                    Text: z.string({
                        required_error: "Option value is required.",
                        invalid_type_error: "Option value must be a string.",
                    }).min(1, { message: "Option value cannot be empty." }),
                    Sequence: z.number({
                        required_error: "Option label is required.",
                        invalid_type_error: "Option label must be a string.",
                    }).min(1, { message: "Option label cannot be empty." }),
                })
                .optional()
            , {
                required_error: "Options are required.",
                invalid_type_error: "Options must be an array of objects.",
            })
        .optional(),

    // Options: z
    //     .array(z.string())
    //     .optional(),

    Tags: z
        .array(z.string())
        .optional(),

    CorrectAnswer: z
        .number({
            required_error: "CorrectAnswer is required.",
            invalid_type_error: "CorrectAnswer must be a number."
        })
        .optional()
});
