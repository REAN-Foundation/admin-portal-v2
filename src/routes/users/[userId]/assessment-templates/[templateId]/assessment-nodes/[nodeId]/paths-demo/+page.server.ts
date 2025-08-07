import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	return {
		templateId: params.templateId,
		nodeId: params.nodeId,
		userId: params.userId,
		title: 'Assessment Paths Demo'
	};
}; 