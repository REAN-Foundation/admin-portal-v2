import type { RequestEvent } from '@sveltejs/kit';
import { deleteUser, getUserById, updateUser } from '../../../services/reancare/user';
import { ResponseHandler } from '$lib/utils/response.handler';
import { uuidSchema } from '$lib/validation/common.schema';
import type { UserUpdateModel } from '$lib/types/user.types';
import { updateSchema } from '$lib/validation/user.schemas';

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

		const response = await deleteUser(sessionId, id);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error deleting user:', error);
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

		const response = await getUserById(sessionId, id);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error fetching user:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};

export const PUT = async (event: RequestEvent) => {
	try {
		console.log('Inside User server PUT endpoints');
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const userId = event.params.id;
		const request = event.request;

		const data: UserUpdateModel = await request.json();

		const defaultTimeZone = data.CountryCode === '+1' ? '-05:00' : '+05:30';
		const currentTimeZone = data.CountryCode === '+1' ? '-05:00' : '+05:30';

		const phone = data.CountryCode + '-' + data.Phone;

		console.log('data', data);
		const validationResult = updateSchema.safeParse(data);
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

		const response = await updateUser(
			sessionId,
			userId,
			data.FirstName,
			data.LastName,
			phone,
			data.Email,
			data.SelectedUserRoleId,
			defaultTimeZone,
			currentTimeZone
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error updating user:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
