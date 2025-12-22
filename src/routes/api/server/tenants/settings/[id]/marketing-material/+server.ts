import { ResponseHandler } from '$lib/utils/response.handler';
import { uuidSchema } from '$lib/validation/common.schema';
import { MarketingMaterialRequestSchema } from '$lib/validation/tenant.settings.schema';
import type { RequestEvent } from '@sveltejs/kit';
import type { MarketingMaterialCreateModel, MarketingMaterialUpdateModel } from '$lib/types/tenant.settings.types';
import {
	createMarketingMaterial,
	getMarketingMaterial,
	updateMarketingMaterial
} from '../../../../../services/reancare/tenant-settings';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session'));
		}

		const result = await uuidSchema.safeParseAsync(event.params);
		if (!result.success) {
			const data = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])
			);
			return ResponseHandler.handleError(400, data, new Error('Validation failed'));
		}

		const tenantId = event.params.id;

		const response = await getMarketingMaterial(sessionId, tenantId);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error fetching marketing material:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};

export const POST = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session'));
		}

		const result = await uuidSchema.safeParseAsync(event.params);
		if (!result.success) {
			const data = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])
			);
			return ResponseHandler.handleError(400, data, new Error('Validation failed'));
		}

		const tenantId = event.params.id;
		const request = event.request;
		const data: MarketingMaterialCreateModel = await request.json();

		const validationResult = MarketingMaterialRequestSchema.safeParse(data);
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

		const response = await createMarketingMaterial(sessionId, tenantId, data);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error creating marketing material:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};

export const PUT = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session'));
		}

		const result = await uuidSchema.safeParseAsync(event.params);
		if (!result.success) {
			const data = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])
			);
			return ResponseHandler.handleError(400, data, new Error('Validation failed'));
		}

		const tenantId = event.params.id;
		const request = event.request;
		const data: MarketingMaterialUpdateModel = await request.json();

		const validationResult = MarketingMaterialRequestSchema.safeParse(data);
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

		const response = await updateMarketingMaterial(sessionId, tenantId, data);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error('Error updating marketing material:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};

