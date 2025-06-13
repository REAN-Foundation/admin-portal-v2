// import { ResponseHandler } from '$lib/utils/response.handler';
// import { getAllAssessmentTemplates } from '$routes/api/services/careplan/assets/assessments';
// // import { getAllAssessmentTemplates } from '$routes/api/services/careplan/assets/templates.service';
// import type { RequestEvent } from '@sveltejs/kit';

// export const GET = async (event: RequestEvent) => {
// 	try {
// 		const sessionId = event.locals?.sessionUser?.sessionId;

// 		if (!sessionId) {
// 			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
// 		}

// 		const templates = await getAllAssessmentTemplates(sessionId);

// 		return ResponseHandler.success({
// 			Status: 'success',
// 			HttpCode: 200,
// 			Message: 'Templates fetched successfully',
// 			Data: templates
// 		});
// 	} catch (error) {
// 		console.error('Error fetching assessment templates:', error);
// 		return ResponseHandler.handleError(500, null, error);
// 	}
// };
