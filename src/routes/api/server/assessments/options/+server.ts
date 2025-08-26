import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import { addOption } from "../../../services/reancare/assessments/assessment-nodes";
import { createOrUpdateSchema } from "$lib/validation/assessment-node-option.schema";
import type { AssessmentNodeOptionCreateModel } from "$lib/types/assessment-node-option.types";


export const POST = async (event: RequestEvent) => {
	try {
		console.log("Inside node option server POST endpoints");
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
		}

		const request = event.request;
		const data: AssessmentNodeOptionCreateModel = await request.json();

		console.log("data", data);
		const validationResult = createOrUpdateSchema.safeParse(data);
		console.log('validationResult', validationResult);
		if (!validationResult.success) {
			return ResponseHandler.success({
				Status: 'failure',
				HttpCode: 400,
				Message: 'Validation failed',
				Errors: Object.fromEntries(Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])),
			});
		}
		const templateId = event.url.searchParams.get('templateId');
		const nodeId = event.url.searchParams.get('nodeId');

		const response = await addOption(
			sessionId,
			templateId,
			nodeId,
			data.Text,
			data.Sequence,
			data.ProviderGivenCode,
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error("Error creating option:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};