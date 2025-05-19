import type { RequestEvent } from '@sveltejs/kit';
import { updateScoringCondition } from '../../../../services/reancare/assessments/assessment-nodes';

//////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
	const request = event.request;
	const data = await request.json();
	try {
		const response = await updateScoringCondition(
			data.sessionId,
			data.templateId,
			data.nodeId,
			data.scoringConditionId,
			data.resolutionScore
		);
		const scoringCondition = response.Data.ScoringCondition;
		return new Response(JSON.stringify(scoringCondition));
	} catch (err) {
		console.error(`Error updating scoring condition: ${err.message}`);
		return new Response(err.message);
	}
};
