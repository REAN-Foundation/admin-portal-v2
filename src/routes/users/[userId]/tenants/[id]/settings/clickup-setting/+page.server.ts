import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getBotSecret, getTenantById } from '$routes/api/services/reancare/tenants';
import { getWebhookStatus} from '$routes/api/services/reancare/clickup';
import { CLICKUP_TEAM_ID } from '$env/static/private';
import type { WebhookStatus } from '$lib/types/clickup.types';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
	const sessionId = event.cookies.get('sessionId') as string;
	const tenantId = event.params.id as string;
	// const tenantCode = event.locals.sessionUser?.tenantCode || '';
	let statuses: WebhookStatus[] = [];

	if (!sessionId) {
		throw error(401, 'Unauthorized');
	}

	if (!tenantId) {
		throw error(400, 'Tenant ID is required');
	}
	const res = await getBotSecret(sessionId, tenantId)
	console.log('respose---',res)
	const botSecrete = res.Data || {};
	const clickupAuthentication = botSecrete.ClickupAuthentication;
	const primaryListId = botSecrete.ClickupListId;
	const issuesListId = botSecrete.ClickupIssuesListId;
	const caseListId = botSecrete.ClickupCaseListId;

	// Only fetch webhook status if ClickUp authentication is configured
	if (clickupAuthentication && primaryListId) {
		statuses = await getWebhookStatus(clickupAuthentication, CLICKUP_TEAM_ID, primaryListId, issuesListId, caseListId);
	}

	const tenantResponse = await getTenantById(sessionId, tenantId);
	const tenantCode = tenantResponse?.Data?.Tenant?.Code || '';

	console.log("tenantCode",tenantCode)
	return {
		tenantId,
		tenantCode,
		clickUpConfig:botSecrete,
		webhookStatuses:statuses,
		title: 'ClickUp Settings'
	};
};
