import { redirect } from 'sveltekit-flash-message/server';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { createKnowledgeNugget } from '../../../../api/services/reancare/knowledge-nuggets';

/////////////////////////////////////////////////////////////////////////

const createKnowledgeNuggetSchema = zfd.formData({
	topicName: z.string().max(128),
	briefInformation: z.string().optional(),
	detailedInformation: z.string().optional(),
	additionalResources: z.array(z.string()).optional(),
	tags: z.array(z.string()).optional()
});

export const actions = {
	createKnowledgeNuggetAction: async (event: RequestEvent) => {
		const request = event.request;
		const userId = event.params.userId;
		const sessionId = event.cookies.get('sessionId');
		const data = await request.formData();
		const formData = Object.fromEntries(data);

		const additionalResources = data.has('additionalResources')
			? data.getAll('additionalResources')
			: [];
		const tags = data.has('tags') ? data.getAll('tags') : [];
		const formDataValue = { ...formData, tags: tags, additionalResources: additionalResources };

		type KnowledgeNuggetSchema = z.infer<typeof createKnowledgeNuggetSchema>;

		let result: KnowledgeNuggetSchema = {};
		try {
			result = createKnowledgeNuggetSchema.parse(formDataValue);
			console.log('result', result);
		} catch (err: any) {
			const { fieldErrors: errors } = err.flatten();
			console.log(errors);
			const { ...rest } = formData;
			return {
				data: rest,
				errors
			};
		}

		let response;
		try {
			response = await createKnowledgeNugget(
				sessionId,
				result.topicName,
				result.briefInformation,
				result.detailedInformation,
				result.additionalResources,
				result.tags
			);
		} catch (error: any) {
			const errorMessageText = error?.body?.message || 'An error occurred';
			throw redirect(
				303,
				`/users/${userId}/knowledge-nuggets`,
				errorMessage(errorMessageText),
				event
			);
		}
		const id = response.Data.KnowledgeNugget.id;
		throw redirect(
			303,
			`/users/${userId}/knowledge-nuggets/${id}/view`,
			successMessage(`Knowledge nuggets created successfully!`),
			event
		);
	}
};
