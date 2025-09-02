import type { RequestEvent } from '@sveltejs/kit';
import { addScoringCondition } from '../../../../services/reancare/assessments/assessment-nodes';
import { ResponseHandler } from '$lib/utils/response.handler';

//////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
	try {
		console.log("Inside Add Scoring Condition server POST endpoint");
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
		}

		const request = event.request;
		const data = await request.json();
		const templateId = event.url.searchParams.get('templateId');
		const nodeId = event.url.searchParams.get('nodeId');
		const resolutionScore = data.ResolutionScore;

		if (!templateId || !nodeId || !resolutionScore) {
			return ResponseHandler.handleError(400, null, new Error("Missing required parameters: templateId, nodeId, or resolutionScore"));
		}

		const response = await addScoringCondition(
			sessionId,
			templateId,
			nodeId,
			resolutionScore
		);
		
		return ResponseHandler.success(response);

	} catch (error) {
		console.error("Error adding scoring condition:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};
