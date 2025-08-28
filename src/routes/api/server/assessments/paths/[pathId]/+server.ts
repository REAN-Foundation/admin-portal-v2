import { ResponseHandler } from "$lib/utils/response.handler";
import type { RequestEvent } from "@sveltejs/kit";
import { updateAssessmentPath, deleteAssessmentPath, getAssessmentPathById } from "../../../../services/reancare/assessments/assessment-paths";
import { updatePathSchema } from "$lib/validation/assessment-path.schema";
import type { AssessmentPathUpdateModel } from "$lib/types/assessment-path.types";

//////////////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		console.log("Inside assessment path server GET endpoint");
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
		}

		const pathId = event.params.pathId;
		if (!pathId) {
			return ResponseHandler.handleError(400, null, new Error("Path ID is required."));
		}

		const url = new URL(event.request.url);
		const templateId = url.searchParams.get('templateId');
		const nodeId = url.searchParams.get('nodeId');
		const optionId = url.searchParams.get('optionId');

		if (!templateId || !nodeId || !optionId) {
			return ResponseHandler.handleError(400, null, new Error("Template ID, Node ID, and Option ID are required as query parameters."));
		}

		const response = await getAssessmentPathById(sessionId, templateId, nodeId, pathId);
		return ResponseHandler.success(response);

	} catch (error) {
		console.error("Error getting assessment path:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};

export const PUT = async (event: RequestEvent) => {
	try {
		console.log("Inside assessment path server PUT endpoint");
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
		}

		const pathId = event.params.pathId;
		if (!pathId) {
			return ResponseHandler.handleError(400, null, new Error("Path ID is required."));
		}

		const url = new URL(event.request.url);
		const templateId = url.searchParams.get('templateId');
		const nodeId = url.searchParams.get('nodeId');
	

		if (!templateId || !nodeId) {
			return ResponseHandler.handleError(400, null, new Error("Template ID, Node ID are required as query parameters."));
		}

		const request = event.request;
		const data: AssessmentPathUpdateModel = await request.json();

		console.log("Path update data:", data);
		
		const validationResult = updatePathSchema.safeParse(data);
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

		const response = await updateAssessmentPath(
			sessionId,
			templateId,
			nodeId,
			pathId,
			data
		);
		
		return ResponseHandler.success(response);

	} catch (error) {
		console.error("Error updating assessment path:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};

export const DELETE = async (event: RequestEvent) => {
	try {
		console.log("Inside assessment path server DELETE endpoint");
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
		}

		const pathId = event.params.pathId;
		if (!pathId) {
			return ResponseHandler.handleError(400, null, new Error("Path ID is required."));
		}

		const url = new URL(event.request.url);
		const templateId = url.searchParams.get('templateId');
		const nodeId = url.searchParams.get('nodeId');

		if (!templateId || !nodeId ) {
			return ResponseHandler.handleError(400, null, new Error("Template ID, Node ID, and Option ID are required as query parameters."));
		}

		const response = await deleteAssessmentPath(
			sessionId,
			templateId,
			nodeId,
			pathId
		);
		
		return ResponseHandler.success(response);

	} catch (error) {
		console.error("Error deleting assessment path:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};
