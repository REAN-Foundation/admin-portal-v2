import type { RequestEvent } from '@sveltejs/kit';
import { updateScoringCondition } from '../../../../services/reancare/assessments/assessment-nodes';
import { ResponseHandler } from '$lib/utils/response.handler';
import type { ScoringConditionUpdateModel } from '$lib/types/assessment-node.types';

//////////////////////////////////////////////////////////////

export const PUT = async (event: RequestEvent) => {
	try {
		console.log("Inside Assessment template server POST endpoints");
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
		}

		const request = event.request;
		const data: ScoringConditionUpdateModel = await request.json();
		const templateId = event.url.searchParams.get('templateId');
		const nodeId = event.url.searchParams.get('nodeId');

		const response = await updateScoringCondition(
			sessionId,
			templateId,
			nodeId,
			data.ScoringConditionId,
			data.ResolutionScore
		);
		return ResponseHandler.success(response);

	} catch (error) {
		console.error("Error creating assessment node:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};
