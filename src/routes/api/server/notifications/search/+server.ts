import type { RequestEvent } from '@sveltejs/kit';
import { searchNotifications } from '../../../services/reancare/notifications';
import { ResponseHandler } from '$lib/utils/response.handler';
import { createSearchFilters } from '$lib/utils/search.utils';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals.sessionUser.sessionId;

		const searchFilters = createSearchFilters(event, {
			title: event.url.searchParams.get('title') ?? undefined,
			type: event.url.searchParams.get('type') ?? undefined,
		});

		// console.log('Search parms: ', searchFilters);
		const response = await searchNotifications(sessionId, searchFilters);
		// const items = response.Data.NotificationRecords.Items;

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error retrieving notifications:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
