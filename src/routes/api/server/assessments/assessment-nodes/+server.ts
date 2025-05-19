import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import { createAssessmentNode } from "../../../services/reancare/assessments/assessment-nodes";
import type { AssessmentNodeCreateModel } from "$lib/types/assessment-node.types";
import { createOrUpdateSchema } from "$lib/validation/assessment-node.schema";

export const POST = async (event: RequestEvent) => {
	try {
		console.log("Inside Assessment template server POST endpoints");
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
		}

		const request = event.request;
		const data: AssessmentNodeCreateModel = await request.json();

		const validationResult = createOrUpdateSchema.safeParse(data);
		if (!validationResult.success) {
			return ResponseHandler.success({
				Status: 'failure',
				HttpCode: 400,
				Message: 'Validation failed',
				Errors: Object.fromEntries(Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])),
			});
		}
		const templateId = event.url.searchParams.get('templateId');

		const response = await createAssessmentNode(
			sessionId,
			templateId,
			data.ParentNodeId,
			data.NodeType,
			data.Title,
			data.Description,
			data.Tags,
			data.Message,
			data.ServeListNodeChildrenAtOnce,
			data.QueryType,
			data.Options,
			data.Sequence,
			data.CorrectAnswer,
			data.RawData,
			data.Required,
			data.ScoringApplicable,
			data.ResolutionScore,
			data.ProviderAssessmentCode
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error("Error creating assessment node:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};