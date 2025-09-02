import { error, type ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchDocuments } from '$routes/api/services/bot-content/documents';
import { Helper } from '$lib/utils/helper';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');

	event.depends('app:documents');

	const response = await searchDocuments(sessionId, {
        tenantId: Helper.isDefaultTenant(event.locals?.sessionUser?.tenantCode, event.locals?.sessionUser?.roleName) ? null : event.locals?.sessionUser?.tenantId,
        tenantCode: Helper.isDefaultTenant(event.locals?.sessionUser?.tenantCode, event.locals?.sessionUser?.roleName) ? null : event.locals?.sessionUser?.tenantCode,
		orderBy: 'Name',
		order: 'ascending',
		itemsPerPage: 10
	});


	const documents = response?.Data;
	const fileResource = response?.Data?.Items?.FileResource;
	console.log(fileResource);
	
	const documentVersion = response?.Data?.DocumentVersion
	console.log('documents', documents);

	return {
		documents,
		fileResource,
		documentVersion,
		sessionId,
		message: response.Message
	};
};
