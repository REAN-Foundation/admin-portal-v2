import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getMarketingMaterialByTenantId } from '../../../../../../api/services/reancare/tenant-settings';

export const load: PageServerLoad = async ({ params, locals }) => {
	const sessionId = locals?.sessionUser?.sessionId;
	if (!sessionId) {
		throw error(401, 'Access denied: Invalid session');
	}

	const tenantId = params.id;
	const userId = params.userId;

	try {
		// Get marketing material settings by tenant id
		const marketingMaterial = await getMarketingMaterialByTenantId(sessionId, tenantId);

		if (marketingMaterial.Status === 'failure' || marketingMaterial.HttpCode !== 200) {
			throw error(marketingMaterial.HttpCode, marketingMaterial.Message);
		}

		console.log('marketingMaterialSettings', marketingMaterial.Data);
		return {
			marketingMaterial: marketingMaterial.Data || {},
			userId,
			tenantId
		};
	} catch (err) {
		console.error('Error loading marketing material:', err);
		throw error(500, 'Failed to load marketing material');
	}
};
