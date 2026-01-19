import { BACKEND_API_URL, API_CLIENT_INTERNAL_KEY, CLICKUP_API_BASE} from '$env/static/private';
import { get, put } from './common.reancare';
import type {
	ClickUpConfig,
	ClickUpWebhookRequest,
	ClickUpWebhookResponse,
	// ClickUpWebhooksList,
	WebhookStatus
} from '$lib/types/clickup.types';

////////////////////////////////////////////////////////////////

export const getClickUpConfig = async (sessionId: string, tenantId: string) => {
	const url = BACKEND_API_URL + `/tenants/${tenantId}/settings/secret`;
	const response = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	if (response && response.Data) {
		const clickUpSecret = response.Data;
		const mappedConfig: ClickUpConfig = {
			Enabled: clickUpSecret.Enabled ?? true,
			ClickupAuthentication: clickUpSecret.ClickupAuthentication,
			ClickupListId: clickUpSecret.ClickupListId || '',
			ClickupIssuesListId: clickUpSecret.ClickupIssuesListId,
			ClickupCaseListId: clickUpSecret.ClickupCaseListId,
			WebhookClickupClientUrlToken: clickUpSecret.WebhookClickupClientUrlToken || '',
			Events: clickUpSecret.Events || [],
			WebhookId: clickUpSecret.WebhookId,
			IssuesWebhookId: clickUpSecret.IssuesWebhookId,
			CaseWebhookId: clickUpSecret.CaseWebhookId
		};

		return {
			...response,
			Data: mappedConfig
		};
	}

	return {
		...response,
		Data: null
	};
};


export const saveClickUpConfig = async (
	sessionId: string,
	tenantId: string,
	clickUpConfig: ClickUpConfig
) => {
	const url = BACKEND_API_URL + `/tenants/${tenantId}/settings/secret`;
	const existingResponse = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

	let secretData: any = {};
	if (existingResponse && existingResponse.Data) {
		secretData = existingResponse.Data;
	}

	// Map ClickUpConfig fields to secret storage format
	secretData.ClickupAuthentication = clickUpConfig.ClickupAuthentication;
	secretData.ClickupListId = clickUpConfig.ClickupListId;
	secretData.ClickupIssuesListId = clickUpConfig.ClickupIssuesListId;
	secretData.ClickupCaseListId = clickUpConfig.ClickupCaseListId;
	secretData.WebhookClickupClientUrlToken = clickUpConfig.WebhookClickupClientUrlToken;
	secretData.Events = clickUpConfig.Events;
	secretData.WebhookId = clickUpConfig.WebhookId;
	secretData.IssuesWebhookId = clickUpConfig.IssuesWebhookId;
	secretData.CaseWebhookId = clickUpConfig.CaseWebhookId;

	return await put(sessionId, url, secretData, true, API_CLIENT_INTERNAL_KEY);
};

export const createClickUpWebhook = async (
	authToken: string,
	teamId: string,
	webhookRequest: ClickUpWebhookRequest
): Promise<ClickUpWebhookResponse> => {

	console.log("Webhook request" , JSON.stringify(webhookRequest))
	const response = await fetch(`${CLICKUP_API_BASE}/team/${teamId}/webhook`, {
		method: 'POST',
		headers: {
			Authorization: authToken,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(webhookRequest)
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`ClickUp API Error: ${response.status} - ${errorText}`);
	}

	return await response.json();
};


export const deleteClickUpWebhook = async (
	authToken: string,
	webhookId: string
): Promise<void> => {
	const response = await fetch(`${CLICKUP_API_BASE}/webhook/${webhookId}`, {
		method: 'DELETE',
		headers: {
			Authorization: authToken
		}
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to delete webhook: ${response.status} - ${errorText}`);
	}
};


export const getClickUpWebhook = async (authToken: string, webhookId: string): Promise<any> => {
	const response = await fetch(`${CLICKUP_API_BASE}/webhook/${webhookId}`, {
		method: 'GET',
		headers: {
			Authorization: authToken
		}
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to get webhook: ${response.status} - ${errorText}`);
	}

	return await response.json();
};


export const testClickUpConnection = async (
	authToken: string,
	teamId: string
): Promise<boolean> => {
	try {
		const response = await fetch(`${CLICKUP_API_BASE}/team/${teamId}`, {
			method: 'GET',
			headers: {
				Authorization: authToken
			}
		});

		return response.ok;
	} catch (error) {
		console.log(error);
		return false;
	}
};

// export const getClickUpAuthenticationRecord = async (
// 	sessionId: string,
// 	authenticationId: string
// ): Promise<ClickUpAuthenticationRecord> => {
// 	const url = BACKEND_API_URL + `/clickup/authentication/${authenticationId}`;
// 	const response = await get(sessionId, url, true, API_CLIENT_INTERNAL_KEY);

// 	if (response && response.Data) {
// 		return {
// 			id: authenticationId,
// 			AuthToken: response.Data.AuthToken,
// 			TeamId: response.Data.TeamId || CLICKUP_TEAM_ID
// 		};
// 	}

// 	// Fallback to environment variables
// 	return {
// 		id: authenticationId,
// 		AuthToken: CLICKUP_AUTH_TOKEN,
// 		TeamId: CLICKUP_TEAM_ID
// 	};
// };

export const getAllClickUpWebhooks = async (
	authToken: string,
	teamId: string
) => {
	const response = await fetch(`${CLICKUP_API_BASE}/team/${teamId}/webhook`, {
		method: 'GET',
		headers: {
			Authorization: authToken,
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Failed to get webhooks: ${response.status} - ${errorText}`);
	}
	const data = await response.json();

	return data;
};

export const findWebhookByListId = async (
	authToken: string,
	teamId: string,
	listId: string
): Promise<any> => {
	try {
		const webhooksList = await getAllClickUpWebhooks(authToken, teamId);

		const webhooks = webhooksList?.webhooks || [];

		const webhook = webhooks.find(
			(wh) => wh?.list_id && (wh.list_id) === Number(listId)
		);

		return webhook || null;
	} catch (error) {
		console.error('Error finding webhook by list ID:', error);
		return null;
	}
};

export const getWebhookStatus = async (
	authToken: string,
	teamId: string,
	primaryListId?: string,
	issuesListId?: string,
	caseListId?: string
): Promise<WebhookStatus[]> => {
	const statuses: WebhookStatus[] = [];

	try {

		const webhooksList = await getAllClickUpWebhooks(authToken, teamId);

		const webhooks = webhooksList?.webhooks || [];

		if (primaryListId) {
				const webhook = webhooks.find(
					(wh) => wh?.list_id && (wh.list_id) === Number(primaryListId)
				);
				statuses.push({
					listId: primaryListId,
					listType: 'primary',
					listName: 'Primary List',
					webhookId: webhook?.id,
					exists: !!webhook,
					endpoint: webhook?.endpoint,
					health: webhook?.health,
					events: webhook?.events
				});
			}
	
			// Check issues list
			if (issuesListId) {
				const webhook = webhooks.find(
					(wh) => wh?.list_id && (wh.list_id) === Number(issuesListId)
				);
				statuses.push({
					listId: issuesListId,
					listType: 'issues',
					listName: 'Issues List',
					webhookId: webhook?.id,
					exists: !!webhook,
					endpoint: webhook?.endpoint,
					health: webhook?.health,
					events: webhook?.events
				});
			}
			if (caseListId) {
				const webhook = webhooks.find(
					(wh) => wh?.webhook?.list_id && (wh.webhook.list_id) === Number(caseListId)
				);
				statuses.push({
					listId: caseListId,
					listType: 'case',
					listName: 'Case List',
					webhookId: webhook?.id,
					exists: !!webhook,
					endpoint: webhook?.endpoint,
					health: webhook?.health,
					events: webhook?.events
				});
			}
	} catch (error) {
		console.error('Error fetching webhook status:', error);

		// Still return status entries even if fetch fails, showing them as non-existent
		if (primaryListId) {
			statuses.push({
				listId: primaryListId,
				listType: 'primary',
				listName: 'Primary List',
				exists: false
			});
		}
		if (issuesListId) {
			statuses.push({
				listId: issuesListId,
				listType: 'issues',
				listName: 'Issues List',
				exists: false
			});
		}
		if (caseListId) {
			statuses.push({
				listId: caseListId,
				listType: 'case',
				listName: 'Case List',
				exists: false
			});
		}
	}

	console.log('statuses',statuses)
	return statuses;
};
