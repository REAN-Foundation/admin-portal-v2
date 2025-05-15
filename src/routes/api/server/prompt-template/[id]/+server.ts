import { ResponseHandler } from '$lib/utils/response.handler';
import { uuidSchema } from '$lib/validation/common.schema';
import type { RequestEvent } from '@sveltejs/kit';
import {
	deletePromptTemplate,
	getPromptTemplateById,
	updatePromptTemplate
} from '../../../services/bot-content/prompt-template';
import type { PromptTemplateUpdateModel } from '$lib/types/prompt.template.types';
import { createOrUpdateSchema } from '$lib/validation/prompt.template.schema';

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

		const response = await deletePromptTemplate(sessionId, id);

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

		const response = await getPromptTemplateById(sessionId, id);

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

		const promptTemplateId = event.params.id;
		const createdByUserId = event.locals?.sessionUser?.userId;

		const request = event.request;
		const data: PromptTemplateUpdateModel = await request.json();

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

		const response = await updatePromptTemplate(
			sessionId,
			promptTemplateId,
			data.Name,
			data.Description,
			data.Content,
			data.SubGroup,
			data.Type,
			data.Category,
			data.Variables,
			createdByUserId
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error updating prompt templates:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
