import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import { createAssessmentCondition} from "../../../../../services/reancare/assessments/assessment-conditions";
import { createConditionSchema } from "$lib/validation/assessment-condition.schema";
import type { AssessmentConditionCreateModel } from "$lib/types/assessment-condition.types";

//////////////////////////////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
	try {
		console.log("Inside assessment condition server POST endpoint");
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
		}

		const pathId = event.params.pathId;
		// const templateId = event.params.templateId;
		// const nodeId = event.params.nodeId;
		if (!pathId) {
			return ResponseHandler.handleError(400, null, new Error("Path ID is required."));
		}

		const request = event.request;
		const data: AssessmentConditionCreateModel = await request.json();

		console.log("Condition creation data:", data);
		
		const validationResult = createConditionSchema.safeParse(data);
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

		const response = await createAssessmentCondition(
			sessionId,
			data.TemplateId,
			data.NodeId,
			data.PathId,
			data.OptionSequece
		);
		
		return ResponseHandler.success(response);

	} catch (error) {
		console.error("Error creating assessment condition:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};
