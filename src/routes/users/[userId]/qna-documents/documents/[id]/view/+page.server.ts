// Importing necessary modules and types
import { type ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import { getDocumentsById } from '$routes/api/services/bot-content/documents';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');

	const documentId = event.params.id;

	const response = await getDocumentsById(sessionId, documentId);

	const document = response?.Data;

	const id = response?.Data?.id;
	console.log(response, 'response got');

	return {
		location: `${id}/edit`,
		document,
		message: response?.Message || 'Documents retrieved successfully',
		title: 'QNA documents - Documents View'
	};
};
