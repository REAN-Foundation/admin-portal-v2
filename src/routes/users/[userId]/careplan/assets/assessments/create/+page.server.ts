import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchAssessmentTemplates } from '$routes/api/services/reancare/assessments/assessment-templates';

////////////////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const tenantId = event.locals?.sessionUser?.tenantId;

	event.depends('app:assessmentTemplate');

	const response = await searchAssessmentTemplates(sessionId, {
		orderBy: 'Title',
		order: 'ascending'
	});

	const assessmentTemplates = response?.Data?.AssessmentTemplateRecords?.Items || [];
	const message =
		(response?.Status === 'failure' || response?.HttpCode !== 200)
			? response?.Message || 'Failed to load assessment templates'
			: response?.Message || 'Assessment templates retrieved successfully';

	console.log('assessmentTemplates==>', assessmentTemplates);

	return {
		assessmentTemplates,
		sessionId,
		tenantId,
		message
	};
};


// import { error, type ServerLoadEvent } from '@sveltejs/kit';
// import type { PageServerLoad } from './$types';
// import { searchAssessmentTemplates } from '$routes/api/services/reancare/assessments/assessment-templates';

// ////////////////////////////////////////////////////////////////////////////////////////

// export const load: PageServerLoad = async (event: ServerLoadEvent) => {
// 	const sessionId = event.cookies.get('sessionId');
// 	const tenantId = event.locals?.sessionUser?.tenantId;

// 	event.depends('app:assessmentTemplate');

// 	try {
// 		const response = await searchAssessmentTemplates(sessionId, {
// 			orderBy: 'Title',
// 			order: 'ascending'
// 		});

// 		if (response.Status === 'failure' || response.HttpCode !== 200) {
// 			throw error(response.HttpCode, response.Message);
// 		}

// 		const assessmentTemplates = response.Data.AssessmentTemplateRecords.Items;


// 		return {
// 			assessmentTemplates,
// 			sessionId,
// 			tenantId,
// 			message: response.Message
// 		};
// 	} catch (err: any) {
// 		console.error(`Error retrieving Templates : ${err.message}`);
// 		throw error(500, 'Failed to load assessment templates');
// 	}
// };
