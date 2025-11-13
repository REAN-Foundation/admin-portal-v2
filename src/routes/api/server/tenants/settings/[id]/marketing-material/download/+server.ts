import type { RequestEvent } from '@sveltejs/kit';
import { ResponseHandler } from '$lib/utils/response.handler';
import { uuidSchema } from '$lib/validation/common.schema';
import { downloadMarketingMaterialByTenantId } from '../../../../../../services/reancare/tenant-settings';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	try {
		const sessionId = event.locals?.sessionUser?.sessionId;
		if (!sessionId) {
			return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session'));
		}

		const result = await uuidSchema.safeParseAsync(event.params);
		if (!result.success) {
			const data = Object.fromEntries(
				Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])
			);
			return ResponseHandler.handleError(400, data, new Error('Validation failed'));
		}

		const tenantId = event.params.id;

		const response = await downloadMarketingMaterialByTenantId(sessionId, tenantId);

		if (response.success && response.Data) {
			const buffer = Buffer.from(response.Data.Buffer);
			const fileName = response.Data.FileName || `marketing-material-${tenantId}.pdf`;
			const mimeType = response.Data.MimeType || 'application/pdf';

			return new Response(buffer, {
				headers: {
					'Content-Type': mimeType,
					'Content-Disposition': `attachment; filename="${fileName}"`
				}
			});
		}

		return ResponseHandler.handleError(500, null, new Error('Download failed'));
	} catch (error) {
		console.error('Error downloading marketing material:', error);
		return ResponseHandler.handleError(500, null, error);
	}
};

