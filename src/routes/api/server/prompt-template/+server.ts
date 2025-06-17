import type { RequestEvent } from '@sveltejs/kit';
import {
	createPromptsTemplate,
	deletePromptTemplate
} from '../../services/bot-content/prompt-template';
import { ResponseHandler } from '$lib/utils/response.handler';
import type { PromptTemplateCreateModel } from '$lib/types/prompt.template.types';
import { createOrUpdateSchema } from '$lib/validation/prompt.template.schema';

//////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
	try {
		console.log('Inside prompt template server POST endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const createdByUserId = event.locals?.sessionUser?.userId;

		const request = event.request;
		const data: PromptTemplateCreateModel = await request.json();

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

		const response = await createPromptsTemplate(
			sessionId,
			data.Name,
			data.Description,
			data.Model,
			data.Prompt,
			data.Group,
			data.UseCaseType,
			data.Variables,
			data.Temperature,
			data.TopP,
			data.FrequencyPenalty,
			data.PresencePenalty,
			createdByUserId
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error creating prompt template:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
