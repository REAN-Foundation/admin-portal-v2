import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { uploadMarketingMaterialQrCode } from '$lib/api/services/reancare/tenant-settings.js';

export const POST: RequestHandler = async ({ request, params, locals }) => {
	try {
		const sessionId = locals.sessionId;
		const tenantId = params.id;

		if (!sessionId) {
			return json({ Status: 'failure', HttpCode: 401, Message: 'Unauthorized' }, { status: 401 });
		}

		if (!tenantId) {
			return json({ Status: 'failure', HttpCode: 400, Message: 'Tenant ID is required' }, { status: 400 });
		}

		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			return json({ Status: 'failure', HttpCode: 400, Message: 'No file provided' }, { status: 400 });
		}

		const result = await uploadMarketingMaterialQrCode(sessionId, tenantId, file);

		return json(result, { status: result.HttpCode || 200 });
	} catch (error) {
		console.error('QR Code upload error:', error);
		return json(
			{
				Status: 'failure',
				HttpCode: 500,
				Message: 'Internal server error'
			},
			{ status: 500 }
		);
	}
};
