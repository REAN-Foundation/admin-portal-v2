import { redirect } from 'sveltekit-flash-message/server';
import type { RequestEvent } from '@sveltejs/kit';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import { createArticle } from '$routes/api/services/careplan/assets/article';

/////////////////////////////////////////////////////////////////////////

const createArticleSchema = zfd.formData({
	name: z.string().max(128),
	summary: z.string().optional(),
	pathUrl: z.string().optional(),
	tags: z.array(z.string()).optional(),
	version: z.string().optional()
});

export const actions = {
	createArticleAction: async (event: RequestEvent) => {
		const request = event.request;
		const userId = event.params.userId;
		const sessionId = event.cookies.get('sessionId');
		const data = await request.formData();
		const formData = Object.fromEntries(data);
		const tags = data.has('tags') ? data.getAll('tags') : [];
		const formDataValue = { ...formData, tags: tags };

		type ArticleSchema = z.infer<typeof createArticleSchema>;

		let result: ArticleSchema = {};
		try {
			result = createArticleSchema.parse(formDataValue);
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

		const response = await createArticle(
			sessionId,
			result.name,
			result.summary,
			result.pathUrl,
			result.tags,
			result.version
		);
		const id = response.Data.id;
		console.log(response);
		if (response.Status === 'failure' || response.HttpCode !== 201) {
			throw redirect(303, '/assets', errorMessage(response.Message), event);
		}
		throw redirect(
			303,
			`/users/${userId}/careplan/assets/articles/${id}/view`,
			successMessage(`Article created successfully!`),
			event
		);
	}
};
