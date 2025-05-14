import { ResponseHandler } from '$lib/utils/response.handler';
import { uuidSchema } from '$lib/validation/common.schema';
import type { RequestEvent } from '@sveltejs/kit';

import { deleteDocuments, getDocumentsById, updateDocuments } from '$routes/api/services/bot-content/documents';
import type { DocumentsUpdateModel } from '$lib/types/documents.types';
import { createOrUpdateSchema } from '$lib/validation/documents.schema';

///////////////////////////////////////////////////////////////////////////////

export const DELETE = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session'));
		}

		const result = await uuidSchema.safeParseAsync(event.params);
		if (!result.success) {
			const data = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || ''
				])
			);
			return ResponseHandler.handleError(400, data, new Error('Validation failed'));
		}

		const id = event.params.id;

		const response = await deleteDocuments(sessionId, id);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error deleting prompt templates:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session'));
		}

		const result = await uuidSchema.safeParseAsync(event.params);
		if (!result.success) {
			const data = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || ''
				])
			);
			return ResponseHandler.handleError(400, data, new Error('Validation failed'));
		}

		const id = event.params.id;

		const response = await getDocumentsById(sessionId, id);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error fetching prompt template:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};

export const PUT = async (event: RequestEvent) => {
	try {
		console.log('Inside prompt template server PUT endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const documentsId = event.params.id;
		const createdByUserId = event.locals?.sessionUser?.userId;

		const request = event.request;
		const data: DocumentsUpdateModel = await request.json();

		console.log('data', data);
		const validationResult = createOrUpdateSchema.safeParse(data);
		console.log('validation result', validationResult);

		let keywords = (data.Keywords)?.join(', ')
		
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

		const response = await updateDocuments(
			sessionId,
			documentsId,
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
			createdByUserId
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error updating prompt templates:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
