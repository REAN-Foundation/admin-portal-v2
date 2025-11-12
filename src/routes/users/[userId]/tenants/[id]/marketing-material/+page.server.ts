import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getMarketingMaterialByTenantId } from '../../../../../api/services/reancare/tenant-settings';

export const load: PageServerLoad = async ({ params, locals }) => {
	const sessionId = locals?.sessionUser?.sessionId;
	if (!sessionId) {
		throw error(401, 'Access denied: Invalid session');
	}

	const tenantId = params.id;
	const userId = params.userId;

	try {

		const marketingMaterial = await getMarketingMaterialByTenantId(sessionId, tenantId);

		if (marketingMaterial.Status === 'failure' || marketingMaterial.HttpCode !== 200) {
			throw error(marketingMaterial.HttpCode, marketingMaterial.Message);
		}

		const tenantMarketingSettings = marketingMaterial.Data?.TenantMarketingSettings;

		// Check if data is empty/null
		const isEmpty = !tenantMarketingSettings ||
			tenantMarketingSettings === null ||
			(Object.keys(tenantMarketingSettings).length === 0 &&
				!tenantMarketingSettings.Styling &&
				!tenantMarketingSettings.Content);

		console.log('marketingMaterial for this tenant', marketingMaterial);
		console.log('marketingMaterialSettings', tenantMarketingSettings);
		console.log('isEmpty:', isEmpty);

		return {
			marketingMaterial: tenantMarketingSettings || null,
			isEmpty,
			userId,
			tenantId
		};
	} catch (err) {
		console.error('Error loading marketing material:', err);
		throw error(500, 'Failed to load marketing material');
	}
};

