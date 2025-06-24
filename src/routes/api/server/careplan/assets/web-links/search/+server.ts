import type { RequestEvent } from '@sveltejs/kit';
import { ResponseHandler } from '$lib/utils/response.handler';
import { searchWebLink } from '$routes/api/services/careplan/assets/web-link';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const searchParams: URLSearchParams = event.url.searchParams;
		const searchFilters: Record<string, string> = {
							name: searchParams.get('name') ?? '',
							code: searchParams.get('code') ?? '',
							orderBy: searchParams.get('sortBy') ?? 'CreatedAt',
							order: searchParams.get('sortOrder') ?? 'ascending',
							itemsPerPage: (searchParams.get('itemsPerPage') ?? '10').toString(),
							pageIndex: (searchParams.get('pageIndex') ?? '0').toString()
						};
						console.log('Search Parameters:', searchFilters);
						const response = await searchWebLink(sessionId, searchFilters);
		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error retrieving Web-link:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
