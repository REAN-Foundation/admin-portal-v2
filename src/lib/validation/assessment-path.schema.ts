import { z } from "zod";

export const createPathSchema = z.object({
	TemplateId: z
		.string({
			required_error: "Template ID is required.",
			invalid_type_error: "Template ID must be a string."
		})
		.min(1, { message: "Template ID cannot be empty." }),

	NodeId: z
		.string({
			required_error: "Node ID is required.",
			invalid_type_error: "Node ID must be a string."
		})
		.min(1, { message: "Node ID cannot be empty." }),

	MessageBeforeQuestion: z
		.string()
		.max(1000, { message: "Message before question must be at most 1000 characters." })
		.optional(),

	IsExitPath: z
		.boolean({
			required_error: "Is Exit Path must be selected."
		}),

	NextNodeId: z
		.string({
			required_error: "Next Node is required.",
			invalid_type_error: "Next Node must be a string."
		})
		.min(1, { message: "Next Node cannot be empty." }),

	NextNodeDisplayCode: z
		.string()
		.max(100, { message: "Next Node Display Code must be at most 100 characters." })
		.optional(),
});

export const updatePathSchema = z.object({
	
	MessageBeforeQuestion: z
		.string()
		.max(1000, { message: "Message before question must be at most 1000 characters." })
		.optional(),

	IsExitPath: z
		.boolean()
		.optional(),

	NextNodeId: z
		.string()
		.min(1, { message: "Next Node cannot be empty." })
		.optional(),

	DisplayCode: z
		.string()
		.max(100, { message: "Display Code must be at most 100 characters." })
		.optional(),

	ConditionId: z
		.string({
			required_error: "Condition is required."
		})
		.min(1, { message: "Condition id cannot be empty." })
		.optional(),
}); 