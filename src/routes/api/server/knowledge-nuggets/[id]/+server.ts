import type { RequestEvent } from '@sveltejs/kit';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { redirect } from 'sveltekit-flash-message/server';
import {
	deleteKnowledgeNugget,
	getKnowledgeNuggetById,
	updateKnowledgeNugget
} from '../../../services/reancare/knowledge-nuggets';
import { ResponseHandler } from '$lib/utils/response.handler';
import { uuidSchema } from '$lib/validation/common.schema';
import { createOrUpdateSchema } from '$lib/validation/knowledge.nuggets.schema';
import type { KnowledgeNuggetsUpdateModel } from '$lib/types/knowledge.nuggets.types';

//////////////////////////////////////////////////////////////

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

		const response = await deleteKnowledgeNugget(sessionId, id);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error deleting health system:', error);
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

		const response = await getKnowledgeNuggetById(sessionId, id);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error fetching health system:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};

export const PUT = async (event: RequestEvent) => {
	try {
		console.log('Inside knowledge nuggets server PUT endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const knowledgeNuggetId = event.params.id;
		const request = event.request;
		const data: KnowledgeNuggetsUpdateModel = await request.json();

		console.log('data', data);
		const validationResult = createOrUpdateSchema.safeParse(data);
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

		const response = await updateKnowledgeNugget(
			sessionId,
			knowledgeNuggetId,
			data.Name,
			data.BriefInformation,
			data.DetailedInformation,
			data.AdditionalResources,
			data.Tags
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error updating knowledge nuggets:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
