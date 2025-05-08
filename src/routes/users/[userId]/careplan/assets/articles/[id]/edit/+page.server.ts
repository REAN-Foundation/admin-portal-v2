import { error, type RequestEvent } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { getArticleById, updateArticle } from '$routes/api/services/careplan/assets/article';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');

	try {
		const articleId = event.params.id;
		console.log(articleId);
		const response = await getArticleById(sessionId, articleId);

		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw error(response.HttpCode, response.Message);
		}
		const article = response.Data;
		console.log('article', article);
		return {
			article
		};
	} catch (error) {
		console.error(`Error retriving article: ${error.message}`);
	}
};

const updateArticleSchema = zfd.formData({
	name: z.string().max(128),
	summary: z.string().optional(),
	pathUrl: z.string().optional(),
	tags: z.array(z.string()).optional(),
	version: z.string().optional()
});

export const actions = {
	updateArticleAction: async (event: RequestEvent) => {
		const request = event.request;
		const userId = event.params.userId;
		const articleId = event.params.id;
		const sessionId = event.cookies.get('sessionId');
		const data = await request.formData();
		const formData = Object.fromEntries(data);
		const tags = data.has('tags') ? data.getAll('tags') : [];
		const formDataValue = { ...formData, tags: tags };

		type AnimationSchema = z.infer<typeof updateArticleSchema>;

		let result: AnimationSchema = {};
		try {
			result = updateArticleSchema.parse(formDataValue);
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

		const response = await updateArticle(
			sessionId,
			articleId,
			result.name,
			result.summary,
			result.pathUrl,
			result.tags,
			result.version
		);
		const id = response.Data.id;
		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw redirect(
				303,
				'/users/${userId}/careplan/assets',
				errorMessage(response.Message),
				event
			);
		}
		throw redirect(
			303,
			`/users/${userId}/careplan/assets/articles/${id}/view`,
			successMessage(`Article updated successfully!`),
			event
		);
	}
};
