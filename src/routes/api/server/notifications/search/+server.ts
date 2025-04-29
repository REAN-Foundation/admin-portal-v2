import type { RequestEvent } from '@sveltejs/kit';
import { page } from '$app/stores';
import { searchNotifications } from '../../../services/reancare/notifications';
import { ResponseHandler } from '$lib/utils/response.handler';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals.sessionUser.sessionId;

		const searchParams: URLSearchParams = event.url.searchParams;

		const searchFilters = {
			title: searchParams.get('title') ?? undefined,
			type: searchParams.get('type') ?? undefined,
			sortBy: searchParams.get('sortBy') ?? 'CreatedAt',
			sortOrder: searchParams.get('sortOrder') ?? 'ascending',
			itemsPerPage: parseInt(searchParams.get('itemsPerPage') ?? '10'),
			pageIndex: parseInt(searchParams.get('pageIndex') ?? '0')
		};

		// console.log('Search parms: ', searchParams);
		const response = await searchNotifications(sessionId, searchFilters);
		// const items = response.Data.NotificationRecords.Items;

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error retrieving health systems:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
