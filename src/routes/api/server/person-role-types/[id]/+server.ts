import type { RequestEvent } from '@sveltejs/kit';
import {
	deletePersonRoleType,
	getPersonRoleTypeById,
	updatePersonRoleType
} from '../../../services/reancare/person-role-types';
import { ResponseHandler } from '$lib/utils/response.handler';
import { uuidSchema } from '$lib/validation/common.schema';
import type { PersonRoleUpdateModel } from '$lib/types/person.role.types';
import { createOrUpdateSchema } from '$lib/validation/person.role.schemas';

//////////////////////////////////////////////////////////////

export const DELETE = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session'));
		}

		const id = event.params.id;

		const response = await deletePersonRoleType(sessionId, id);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error deleting person role types:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.request.headers.get('session-id');
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

		const response = await getPersonRoleTypeById(sessionId, id);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error fetching health system:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};

export const PUT = async (event: RequestEvent) => {
	try {
		console.log('Inside user roles server PUT endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const personRoleTypeId = event.params.id;
		const request = event.request;
		const data: PersonRoleUpdateModel = await request.json();

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

		const response = await updatePersonRoleType(
			sessionId,
			personRoleTypeId,
			data.Name,
			data.Description
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error updating user roles:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
