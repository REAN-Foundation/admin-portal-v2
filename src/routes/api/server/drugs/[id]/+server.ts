import type { RequestEvent } from '@sveltejs/kit';
import { deleteDrug, getDrugById, updateDrug } from '../../../services/reancare/drugs';
import { ResponseHandler } from '$lib/utils/response.handler';
import { uuidSchema } from '$lib/validation/common.schema';
import { createOrUpdateSchema } from '$lib/validation/drugs.schema';
import type { DrugUpdateModel } from '$lib/types/drug.types';

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

		const response = await deleteDrug(sessionId, id);

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
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session"));
		}

		const result = await uuidSchema.safeParseAsync(event.params);
		if (!result.success) {
			const data = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ""])
			);
			return ResponseHandler.handleError(400, data, new Error("Validation failed"));
		}

		const id = event.params.id;

		const response = await getDrugById(sessionId, id);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error("Error fetching health system:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};

export const PUT = async (event: RequestEvent) => {
	try {
		console.log("Inside drug server PUT endpoints");
		const sessionId = event.locals?.sessionUser?.sessionId;

		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
		}

		const drugId = event.params.id;
		const request = event.request;
		const data: DrugUpdateModel = await request.json();

		console.log("data", data);
		const validationResult = createOrUpdateSchema.safeParse(data);
		if (!validationResult.success) {
			return ResponseHandler.success({
				Status: 'failure',
				HttpCode: 400,
				Message: 'Validation failed',
				Errors: Object.fromEntries(Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])),
			});
		}

		const response = await updateDrug(
			sessionId, 
			drugId, 
			data.DrugName,
			data.GenericName,
			data.Ingredients,
			data.Strength,
			data.OtherCommercialNames,
			data.Manufacturer,
			data.OtherInformation
		);

		return ResponseHandler.success(response);
	} catch (error) {
		console.error("Error updating drug:", error);
		return ResponseHandler.handleError(500, null, error);
	}
};
