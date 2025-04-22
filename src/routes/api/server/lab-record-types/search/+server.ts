import type { RequestEvent } from '@sveltejs/kit';
import { searchLabRecordTypes } from '../../../services/reancare/lab-record-types';
import { ResponseHandler } from '$lib/utils/response.handler';

//////////////////////////////////////////////////////////////

// export const GET = async (event: RequestEvent) => {

//     const sessionId = event.locals.sessionUser.sessionId;
//     const searchParams: URLSearchParams = event.url.searchParams;
//     const typeName = searchParams.get('typeName') ?? undefined
//     const displayName = searchParams.get('displayName') ?? undefined
//     const sortBy = searchParams.get('sortBy') ?? 'CreatedAt';
//     const sortOrder = searchParams.get('sortOrder') ?? 'ascending';
//     const itemsPerPage_ = searchParams.get('itemsPerPage');
//     const itemsPerPage = itemsPerPage_ ? parseInt(itemsPerPage_) : 10;
//     const pageIndex_ = searchParams.get('pageIndex');
//     const pageIndex = pageIndex_ ? parseInt(pageIndex_) : 0;

// 	try {
//         const searchParams = {
//             typeName,
//             displayName,
//             orderBy: sortBy,
//             order: sortOrder,
//             itemsPerPage,
//             pageIndex,
//         };
//         console.log("Search parms: ", searchParams);
// 		const response = await searchLabRecordTypes(sessionId, searchParams);
//         const labRecords = response.Data.LabRecordTypes;
//         console.log("labRecords", JSON.stringify(response, null, 2));
//         return new Response(JSON.stringify(labRecords));
// 	} catch (err) {
// 		console.error(`Error retriving lab records: ${err.message}`);
// 		return new Response(err.message);
// 	}
// };

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}
		const searchParams: URLSearchParams = event.url.searchParams;
		const searchFilters = {
			typeName: searchParams.get('typeName') ?? undefined,
			displayName: searchParams.get('displayName') ?? undefined,
			orderBy: searchParams.get('sortBy') ?? 'CreatedAt',
			order: searchParams.get('sortOrder') ?? 'ascending',
			itemsPerPage: parseInt(searchParams.get('itemsPerPage') ?? '10'),
			pageIndex: parseInt(searchParams.get('pageIndex') ?? '0')
		};

		console.log('Search parms: ', searchParams);
		const response = await searchLabRecordTypes(sessionId, searchFilters);
		// const labRecords = response.Data.LabRecordTypes;
		// console.log('labRecords', JSON.stringify(response, null, 2));
		return new Response(JSON.stringify(response));
	} catch (err) {
		console.error(`Error retriving lab records: ${err.message}`);
		return new Response(err.message);
	}
};
