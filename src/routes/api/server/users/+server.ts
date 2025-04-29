import { ResponseHandler } from '$lib/utils/response.handler';
import type { RequestEvent } from '@sveltejs/kit';
import { createHealthSystem } from '../../services/rean-care/health.systems';
import type { HealthSystemCreateModel } from '$lib/types/health.system.types';
import type { UserCreateModel } from '$lib/types/user.types';
import { createUser, updateUser } from '../../services/reancare/user';
import { createSchema } from '$lib/validation/user.schemas';

export const POST = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		const tenantId = event.locals?.sessionUser?.tenantId;
		const userId = event.params.userId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session.'));
		}

		const request = event.request;
		const data: UserCreateModel = await request.json();

		console.log('data', data);
		const validationResult = createSchema.safeParse(data);
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
		const defaultTimeZone = data.CountryCode === '+1' ? '-05:00' : '+05:30';
		const currentTimeZone = data.CountryCode === '+1' ? '-05:00' : '+05:30';

		const response = await createUser(
			sessionId,
			tenantId,
			data.FirstName,
			data.LastName,
			data.Phone,
			data.Email,
			data.Role,
			data.SelectedUserRoleId,
			data.Password,
			defaultTimeZone,
			currentTimeZone
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error creating user:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
