import { error, type ServerLoadEvent } from '@sveltejs/kit';
import { getOption, searchAssessmentNodes } from '$routes/api/services/reancare/assessments/assessment-nodes';
import type { PageServerLoad } from '../$types';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const templateId = event.params.templateId;
	const nodeId = event.params.nodeId;
	const optionId = event.params.optionId;

	const searchParams = {
		templateId: templateId,
		parentNodeId: nodeId
	};
	
	const response = await searchAssessmentNodes(sessionId, searchParams);

	const option = await getOption(sessionId, templateId, nodeId, optionId);
	if (option.Status === 'failure' || option.HttpCode !== 200) {
		throw error(option.HttpCode, option.Message);
	}
	
	if (response.Status === 'failure' || response.HttpCode !== 200) {
		throw error(response.HttpCode, response.Message);
	}
	
	const optionData = option?.Data?.Option;
	console.log('optionData', option);
	const allNodes = response?.Data?.AssessmentNodeRecords?.Items || [];
	const childNodes = allNodes.filter(node => node.ParentNodeId === nodeId);
	
	return {
		childNodes,
		sessionId,
		optionData,
		message: response.Message,
		title: 'Create Assessment Path'
	};
};

// export const actions = {
// 	createAssessmentPathAction: async (event: ServerLoadEvent) => {
// 		const request = event.request;
// 		const userId = event.params.userId;
// 		const templateId = event.params.templateId;
// 		const nodeId = event.params.nodeId;
// 		const sessionId = event.cookies.get('sessionId');
// 		const data = await request.formData();
// 		const formData = Object.fromEntries(data);

// 		console.log('formData', JSON.stringify(formData, null, 2));

// 		type AssessmentPathSchema = z.infer<typeof createAssessmentPathSchema>;

// 		let result: AssessmentPathSchema = {};
// 		try {
// 			result = createAssessmentPathSchema.parse(formData);
// 			console.log('result', result);
// 		} catch (err) {
// 			const { fieldErrors: errors } = err.flatten();
// 			console.log(errors);
// 			const { ...rest } = formData;
// 			return {
// 				data: rest,
// 				errors
// 			};
// 		}
	   
// 		let response;
// 		try {
// 			response = await createAssessmentPath(
// 				sessionId,
// 				templateId,
// 				nodeId,
// 				result.messageBeforeQuestion,
// 				result.isExitPath,
// 				result.nextNode,
// 				result.nextNodeDisplayCode
// 			);
// 		} catch (error: any) {
// 			const errorMessageText = error?.body?.message || 'An error occurred';
// 			throw redirect(303, `/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/view`, errorMessage(errorMessageText), event);
// 		}
		
// 		throw redirect(
// 			303,
// 			`/users/${userId}/assessment-templates/${templateId}/assessment-nodes/${nodeId}/view`,
// 			successMessage(`Assessment path created successfully!`),
// 			event
// 		);
// 	}
// }; 