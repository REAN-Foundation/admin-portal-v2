import { getArticleById } from '$routes/api/services/careplan/assets/article';
import type { PageServerLoad } from './$types';
import type { ServerLoadEvent } from '@sveltejs/kit';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const articleId = event.params.id;

	const response = await getArticleById(sessionId, articleId);

	const article = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		article,
		message: response?.Message || 'Article retrieved successfully',
		title: 'Article View'
	};
};
