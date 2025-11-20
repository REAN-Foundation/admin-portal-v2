import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import { createAssessmentTemplate } from "../../../services/reancare/assessments/assessment-templates";
import { createOrUpdateSchema } from "$lib/validation/assessment.template.schema";
import type { AssessmentTemplateCreateModel } from "$lib/types/assessment-template.types";

export const POST = async (event: RequestEvent) => {
	try {
		console.log("Inside Assessment template server POST endpoints");
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
		}

		const request = event.request;
		const data: AssessmentTemplateCreateModel = await request.json();

		const validationResult = createOrUpdateSchema.safeParse(data);
		if (!validationResult.success) {
			return ResponseHandler.success({
				Status: 'failure',
				HttpCode: 400,
				Message: 'Validation failed',
				Errors: Object.fromEntries(Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])),
			});
		}

		const response = await createAssessmentTemplate(
			sessionId,
			data.Title,
			data.Description,
			data.Type,
			data.Provider,
			data.ProviderAssessmentCode,
			data.ServeListNodeChildrenAtOnce || false,
			data.ScoringApplicable || false,
			data.Tags || [],
			data.RawData
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error("Error creating assessment node:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};