import { ResponseHandler } from '$lib/utils/response.handler';
import { uuidSchema } from '$lib/validation/common.schema';
import {
	getClickUpConfig,
	saveClickUpConfig,
	deleteClickUpWebhook
} from '$routes/api/services/reancare/clickup';
import type { RequestEvent } from '@sveltejs/kit';

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

		const tenantId = event.params.id;

		// Get current config
		const configResponse = await getClickUpConfig(sessionId, tenantId);
		const config = configResponse.Data;

		if (!config || !config.WebhookId) {
			return ResponseHandler.handleError(404, null, new Error('No webhook found to delete'));
		}

		// Delete from ClickUp
		try {
			await deleteClickUpWebhook(config.AuthToken, config.WebhookId);
		} catch (err: any) {
			console.error('Failed to delete webhook from ClickUp:', err);
			// Continue to update config even if ClickUp deletion fails
		}

		// Update config - remove webhook ID and disable
		config.WebhookId = undefined;
		config.Enabled = false;

		// Save updated config
		await saveClickUpConfig(sessionId, tenantId, config);

		return ResponseHandler.success({
			Status: 'success',
			HttpCode: 200,
			Message: 'Webhook deleted successfully',
			Data: null
		});
	} catch (error) {
		console.error('Error deleting webhook:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
