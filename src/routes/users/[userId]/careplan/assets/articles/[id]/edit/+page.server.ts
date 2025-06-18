import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getArticleById } from '$routes/api/services/careplan/assets/article';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const articleId = event.params.id;
	const tenantId = event.locals.sessionUser.tenantId;
	const response = await getArticleById(sessionId, articleId);

	const article = response?.Data;
	const id = response?.Data?.id;

	return {
		location: `${id}/edit`,
		article,
		tenantId,
		message: response?.Message || 'Article retrieved successfully',
		title: 'Article Edit'
	};
};
