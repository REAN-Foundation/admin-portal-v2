import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import { createAssessmentPath } from "../../../services/reancare/assessments/assessment-paths";
import { createPathSchema } from "$lib/validation/assessment-path.schema";
import type { AssessmentPathCreateModel } from "$lib/types/assessment-path.types";

export const POST = async (event: RequestEvent) => {
	try {
		console.log("Inside assessment path server POST endpoint");
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
		}

		const request = event.request;
		const data: AssessmentPathCreateModel = await request.json();

		console.log("Path creation data:", data);
		
		const validationResult = createPathSchema.safeParse(data);
		if (!validationResult.success) {
			return ResponseHandler.success({
				Status: 'failure',
				HttpCode: 400,
				Message: 'Validation failed',
				Errors: Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				),
			});
		}

		const response = await createAssessmentPath(
			sessionId,
			data.TemplateId,
			data.NodeId,
			data.MessageBeforeQuestion,
			data.IsExitPath,
			data.NextNodeId,
			data.NextNodeDisplayCode
		);
		
		return ResponseHandler.success(response);

	} catch (error) {
		console.error("Error creating assessment path:", error);
		return ResponseHandler.handleError(500, null, error);
	}
}; 