import { z } from "zod";
export const createConditionSchema = z.object({
	PathId: z.string().uuid({ message: "Path ID must be a valid UUID." }).optional(),
	TemplateId: z.string().uuid({ message: "Template ID must be a valid UUID." }).optional(),
	NodeId: z.string().uuid({ message: "Node ID must be a valid UUID." }).optional(),
	OptionSequence: z.number().optional(),
});
