import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getTenantSettings } from '../../../../../../api/services/reancare/tenant-settings';

export const load: PageServerLoad = async ({ params, locals }) => {
	const sessionId = locals?.sessionUser?.sessionId;
	if (!sessionId) {
		throw error(401, 'Access denied: Invalid session');
	}

	const tenantId = params.id;
	const userId = params.userId;

	try {
		// Get all tenant settings
		const allSettings = await getTenantSettings(sessionId, tenantId);
		
		return {
			marketingMaterialSettings: allSettings?.Data?.MarketingMaterial || {},
			tenantCode: allSettings?.Data?.Common?.TenantCode || '',
			tenantName: allSettings?.Data?.Common?.TenantName || '',
			userId,
			tenantId
		};
	} catch (err) {
		console.error('Error loading marketing material settings:', err);
		throw error(500, 'Failed to load marketing material settings');
	}
};
