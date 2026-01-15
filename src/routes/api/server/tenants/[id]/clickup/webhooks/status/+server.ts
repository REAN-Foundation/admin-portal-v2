import { CLICKUP_TEAM_ID, CLICKUP_AUTH_TOKEN } from '$env/static/private';
import { ResponseHandler } from '$lib/utils/response.handler';
import { uuidSchema } from '$lib/validation/common.schema';
import { getClickUpConfig, getWebhookStatus } from '$routes/api/services/reancare/clickup';
import type { RequestEvent } from '@sveltejs/kit';


///////////////////////////////////////////////////////////////////////////////

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

		const tenantId = event.params.id;

		// Get current config to retrieve auth credentials and list IDs
		const configResponse = await getClickUpConfig(sessionId, tenantId);
		const config = configResponse.Data;

		if (!config) {
			return ResponseHandler.handleError(404, null, new Error('ClickUp configuration not found'));
		}

		// Get webhook status for all configured lists
		const statuses = await getWebhookStatus(
			CLICKUP_AUTH_TOKEN,
			CLICKUP_TEAM_ID,
			config.ClickupListId,
			config.ClickupIssuesListId,
			config.ClickupCaseListId
		);

		return ResponseHandler.success({
			Status: 'success',
			HttpCode: 200,
			Message: 'Webhook statuses retrieved successfully',
			Data: statuses
		});
	} catch (error) {
		console.error('Error getting webhook status:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
