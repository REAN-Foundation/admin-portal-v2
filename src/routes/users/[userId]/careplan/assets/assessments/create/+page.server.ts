import { error, type ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchAssessmentTemplates } from '$routes/api/services/reancare/assessments/assessment-templates';

////////////////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const tenantId = event.locals?.sessionUser?.tenantId;

	event.depends('app:assessmentTemplate');

	try {
		const response = await searchAssessmentTemplates(sessionId, {
			orderBy: 'Title',
			order: 'ascending'
		});

		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw error(response.HttpCode, response.Message);
		}

		const assessmentTemplates = response.Data.AssessmentTemplateRecords.Items;


		return {
			assessmentTemplates,
			sessionId,
			tenantId,
			message: response.Message
		};
	} catch (err: any) {
		console.error(`Error retrieving Templates : ${err.message}`);
		throw error(500, 'Failed to load assessment templates');
	}
};

////////////////////////////////////////////////////////////////////////////////////////

// const createAssessmentSchema = zfd.formData({
// 	name: z.string().max(128),
// 	description: z.string().optional(),
// 	template: z.string().optional(),
// 	templateCode: z.string().optional(),
// 	tags: z.array(z.string()).optional(),
// 	version: z.string().optional()
// });

// export const actions = {
// 	createAssessmentAction: async (event: RequestEvent) => {
// 		const request = event.request;
// 		const sessionId = event.cookies.get('sessionId');
// 		const userId = event.params.userId;
// 		const tenantId = event.locals?.sessionUser?.tenantId;

// 		const data = await request.formData();
// 		const formData = Object.fromEntries(data);
// 		const tags = data.has('tags') ? data.getAll('tags') : [];
// 		const formDataValue = { ...formData, tags };

// 		type AssessmentSchema = z.infer<typeof createAssessmentSchema>;
// 		let result: AssessmentSchema = {};

// 		try {
// 			result = createAssessmentSchema.parse(formDataValue);
// 			console.log('Parsed result:', result);
// 		} catch (err: any) {
// 			const { fieldErrors: errors } = err.flatten();
// 			console.log(errors);
// 			const { ...rest } = formData;
// 			return {
// 				data: rest,
// 				errors
// 			};
// 		}

// 		const response = await createAssessment(
// 			sessionId,
// 			result.name,
// 			result.description,
// 			result.template,
// 			result.templateCode,
// 			result.tags,
// 			result.version,
// 			tenantId
// 		);

// 		if (response.Status === 'failure' || response.HttpCode !== 201) {
//             throw redirect(303, `/users/${userId}/careplan/assets`);

// 		}

// 		const id = response.Data.id;

// 		throw redirect(
// 			303,
// 			`/users/${userId}/careplan/assets/assessments/${id}/view`)
		
// 	}
// };
