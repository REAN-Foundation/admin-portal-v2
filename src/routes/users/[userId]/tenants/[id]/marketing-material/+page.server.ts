import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { BACKEND_API_URL } from '$env/static/private';
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

		// Add image URLs for all images and logos (similar to symptom view page)
		if (tenantMarketingSettings) {
			// Title Image URL
			if (tenantMarketingSettings.Images?.titleImage) {
				tenantMarketingSettings.Images.titleImageUrl =
					BACKEND_API_URL + `/file-resources/${tenantMarketingSettings.Images.titleImage}/download?disposition=inline`;
			} else {
				tenantMarketingSettings.Images = tenantMarketingSettings.Images || {};
				tenantMarketingSettings.Images.titleImageUrl = null;
			}

			// User Interface Image URL
			if (tenantMarketingSettings.Images?.userInterfaceImage) {
				tenantMarketingSettings.Images.userInterfaceImageUrl =
					BACKEND_API_URL + `/file-resources/${tenantMarketingSettings.Images.userInterfaceImage}/download?disposition=inline`;
			} else {
				tenantMarketingSettings.Images = tenantMarketingSettings.Images || {};
				tenantMarketingSettings.Images.userInterfaceImageUrl = null;
			}

			// Logo URLs (array of URLs for each logo)
			if (tenantMarketingSettings.Logos && Array.isArray(tenantMarketingSettings.Logos)) {
				tenantMarketingSettings.LogoUrls = tenantMarketingSettings.Logos.map((logoId: string) => {
					if (logoId) {
						return BACKEND_API_URL + `/file-resources/${logoId}/download?disposition=inline`;
					}
					return null;
				});
			} else {
				tenantMarketingSettings.LogoUrls = [null, null, null];
			}

			// QR Code Image URL
			if (tenantMarketingSettings.QRcode?.resourceId) {
				tenantMarketingSettings.QRcode.imageUrl =
					BACKEND_API_URL + `/file-resources/${tenantMarketingSettings.QRcode.resourceId}/download?disposition=inline`;
			} else {
				tenantMarketingSettings.QRcode = tenantMarketingSettings.QRcode || {};
				tenantMarketingSettings.QRcode.imageUrl = null;
			}
		}

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

