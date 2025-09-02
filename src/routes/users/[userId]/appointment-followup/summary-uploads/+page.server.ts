import { error, type ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { searchReportData } from '$routes/api/services/follow-up/reminders';
import { getTenantSettingsByType } from '$routes/api/services/reancare/tenant-settings';

///////////////////////////////////////////////////////////////////////////////
export const load: PageServerLoad = async (event: ServerLoadEvent) => {
	const sessionId = event.cookies.get('sessionId');
	const tenantCode = event.locals.sessionUser.tenantCode;
	const tenantId = event.locals.sessionUser.tenantId;
	console.log('tenatCode', tenantCode);
	let settings = undefined;
	// const date = new Date();
	// const dateString = date.toISOString().split('T')[0];
	const searchParams = {
		// appointment_date: dateString,
		tenant_code: tenantCode,
		order_by: 'appointment_date',
		order: 'ascending',
		items_per_page: 10
	};
	const response = await searchReportData(tenantCode, searchParams);
	const appointmentRecords = response?.Data || [];
	console.log('Appointment Records==>', appointmentRecords);
	const followupSettings = await getTenantSettingsByType(sessionId, tenantId, 'Followup');
	if (followupSettings.Status === 'failure' || followupSettings.HttpCode !== 200) {
		throw error(followupSettings.HttpCode, followupSettings.Message);
	}
	if (followupSettings.Data.TenantSettings) {
		settings = followupSettings.Data.TenantSettings;
	}

	return {
		appointmentRecords,
		sessionId,
		settings,
		message: response?.Message || 'Appointment records retrieved successfully',
		title: ''
	};
};
