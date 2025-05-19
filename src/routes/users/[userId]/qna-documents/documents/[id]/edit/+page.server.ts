import { error, type RequestEvent, type ServerLoadEvent } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import type { PageServerLoad } from './$types';
import { getDocumentsById, updateDocuments } from '$routes/api/services/bot-content/documents';
import { getFileResourceById } from '$routes/api/services/reancare/file.resource';

/////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');

	const documentsId = event.params.id;
	console.log('documentsId', documentsId);

	const response = await getDocumentsById(sessionId, documentsId);
	console.log('response', response);

	if (response.Status === 'failure' || response.HttpCode !== 200) {
		throw error(response.HttpCode, response.Message);
	}
	const documents = response?.Data;

	const id = response?.Data?.id;
	return {
		location: `${id}/edit`,
		documents,
		message: response?.Message || 'Documents retrieved successfully',
		title: 'QNA - Documents Edit'
	};
};
