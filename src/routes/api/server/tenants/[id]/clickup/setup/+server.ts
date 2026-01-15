import { ResponseHandler } from '$lib/utils/response.handler';
// import { uuidSchema } from '$lib/validation/common.schema';
import { ClickUpConfigSchema } from '$lib/validation/clickup.schema';
import {
	getClickUpConfig,
	saveClickUpConfig,
	createClickUpWebhook,
	findWebhookByListId
} from '$routes/api/services/reancare/clickup';
import type { ClickUpConfig } from '$lib/types/clickup.types';
import type { RequestEvent } from '@sveltejs/kit';
import { BOT_WRAPPER_URL, CLICKUP_TEAM_ID } from '$env/static/private';

///////////////////////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
	try {
		console.log('Inside the webhook setup');
		const sessionId = event.locals?.sessionUser?.sessionId;
		const tenantCode = event.locals?.sessionUser?.tenantCode;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session'));
		}

		const tenantId = event.params.id;
		const requestBody = await event.request.json();

		// Validate the request body
		console.log('requestBody',requestBody)
		const validation = ClickUpConfigSchema.safeParse(requestBody);
		if (!validation.success) {
			const data = Object.fromEntries(
				Object.entries(validation.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || ''
				])
			);
			return ResponseHandler.handleError(400, data, new Error('Validation failed'));
		}

		const clickUpConfig = validation.data as ClickUpConfig;

		// Get current config to retrieve auth credentials
		const configResponse = await getClickUpConfig(sessionId, tenantId);
		const currentConfig = configResponse.Data;
	
		const webhookUrl =
			BOT_WRAPPER_URL +
			tenantCode +
			`/clickup/` +
			clickUpConfig.WebhookClickupClientUrlToken +
			`/receive`;

		const createdWebhooks: any[] = [];

		if (clickUpConfig.ClickupListId) {
			try {
				const existingWebhook = await findWebhookByListId(
					currentConfig.ClickupAuthentication,
					CLICKUP_TEAM_ID,
					clickUpConfig.ClickupListId
				);

				if (existingWebhook) {
					console.log(
						`Webhook already exists for primary list ${clickUpConfig.ClickupListId}:`,
						existingWebhook.id
					);
					clickUpConfig.WebhookId = existingWebhook.id;
				} else {
					const webhookResponse = await createClickUpWebhook(
						currentConfig.ClickupAuthentication,
						CLICKUP_TEAM_ID,
						{
							endpoint: webhookUrl,
							events: clickUpConfig.Events,
							list_id: clickUpConfig.ClickupListId
						}
					);
					clickUpConfig.WebhookId = webhookResponse.id;
					createdWebhooks.push({ type: 'primary', id: webhookResponse.id });
				}
			} catch (err: any) {
				console.error('Failed to create/check primary list webhook:', err);
				return ResponseHandler.handleError(
					400,
					null,
					new Error(`Failed to setup primary list webhook: ${err.message}`)
				);
			}
		}

		// Issues List Webhook
		if (clickUpConfig.ClickupIssuesListId) {
			try {
				const existingWebhook = await findWebhookByListId(
					currentConfig.ClickupAuthentication,
					CLICKUP_TEAM_ID,
					clickUpConfig.ClickupIssuesListId
				);

				if (existingWebhook) {
					console.log(
						`Webhook already exists for issues list ${clickUpConfig.ClickupIssuesListId}:`,
						existingWebhook.id
					);
					clickUpConfig.IssuesWebhookId = existingWebhook.id;
				} else {
					const webhookResponse = await createClickUpWebhook(
							currentConfig.ClickupAuthentication,
							CLICKUP_TEAM_ID,
						{
							endpoint: webhookUrl,
							events: clickUpConfig.Events,
							list_id: clickUpConfig.ClickupIssuesListId
						}
					);
					clickUpConfig.IssuesWebhookId = webhookResponse.id;
					createdWebhooks.push({ type: 'issues', id: webhookResponse.id });
				}
			} catch (err: any) {
				console.error('Failed to create/check issues list webhook:', err);
				// Don't fail the entire request if optional webhook fails
			}
		}

		// Case List Webhook
		if (clickUpConfig.ClickupCaseListId) {
			try {
				const existingWebhook = await findWebhookByListId(
					currentConfig.ClickupAuthentication,
					CLICKUP_TEAM_ID,
					clickUpConfig.ClickupCaseListId
				);

				if (existingWebhook) {
					console.log(
						`Webhook already exists for case list ${clickUpConfig.ClickupCaseListId}:`,
						existingWebhook.id
					);
					clickUpConfig.CaseWebhookId = existingWebhook.id;
				} else {
					const webhookResponse = await createClickUpWebhook(
						currentConfig.ClickupAuthentication,
						CLICKUP_TEAM_ID,
						{
							endpoint: webhookUrl,
							events: clickUpConfig.Events,
							list_id: clickUpConfig.ClickupCaseListId
						}
					);
					clickUpConfig.CaseWebhookId = webhookResponse.id;
					createdWebhooks.push({ type: 'case', id: webhookResponse.id });
				}
			} catch (err: any) {
				console.error('Failed to create/check case list webhook:', err);
				// Don't fail the entire request if optional webhook fails
			}
		}

		// Save configuration to tenant secrets
		await saveClickUpConfig(sessionId, tenantId, clickUpConfig);

		return ResponseHandler.success({
			Status: 'success',
			HttpCode: 200,
			Message: `ClickUp webhook(s) configured successfully. Created: ${createdWebhooks.length}, Existing: ${
				(clickUpConfig.WebhookId ? 1 : 0) +
				(clickUpConfig.IssuesWebhookId ? 1 : 0) +
				(clickUpConfig.CaseWebhookId ? 1 : 0) -
				createdWebhooks.length
			}`,
			Data: {
				config: clickUpConfig,
				createdWebhooks
			}
		});
	} catch (error: any) {
		console.error('Error setting up ClickUp webhook:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};
