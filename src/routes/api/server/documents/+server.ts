import type { RequestEvent } from '@sveltejs/kit';

import { ResponseHandler } from '$lib/utils/response.handler';
import type { DocumentsCreateModel } from '$lib/types/documents.types';
import { createOrUpdateSchema } from '$lib/validation/documents.schema';
import { createDocuments } from '$routes/api/services/bot-content/documents';

//////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
	try {
		console.log('Inside documents server POST endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const createdByUserId = event.locals?.sessionUser?.userId;

		const request = event.request;
		const data: DocumentsCreateModel = await request.json();

		console.log('data', data);
		const validationResult = createOrUpdateSchema.safeParse(data);
		console.log('validation result', validationResult);

		let keywords = (data.Keywords)?.join(', ')
		console.log("keywords", keywords);
		

		if (!validationResult.success) {
			return ResponseHandler.success({
				Status: 'failure',
				HttpCode: 400,
				Message: 'Validation failed',
				Errors: Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || ''
					])
				)
			});
		}

		const response = await createDocuments(
			sessionId,
			data.Name,
			data.Description,
			data.ResourceId,
			data.FileName,
			data.Source,
			data.ParentDocument,
			data.Version,
			data.ChunkingStratergy,
			data.ChunkingLength,
			data.ChunkingOverlap,
			data.Splitter,
			data.Active,
			keywords,
			data.DocumentType,
			createdByUserId
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error creating prompt template:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
