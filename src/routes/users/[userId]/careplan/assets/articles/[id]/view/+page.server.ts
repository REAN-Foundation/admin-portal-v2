import { error, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getArticleById } from '$routes/api/services/careplan/assets/article';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId');
	console.log('sessionId', sessionId);

	try {
		const articleId = event.params.id;
		console.log(articleId);
		const response = await getArticleById(sessionId, articleId);

		if (response.Status === 'failure' || response.HttpCode !== 200) {
			throw error(response.HttpCode, response.Message);
		}
		const article = response.Data;
		const id = response.Data.id;
		return {
			location: `${id}/edit`,
			article,
			message: response.Message
		};
	} catch (error) {
		console.error(`Error retriving article ${error.message}`);
	}
};
