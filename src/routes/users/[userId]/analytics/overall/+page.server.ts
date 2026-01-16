import { error, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUserAnalytics } from '../../../../api/services/user-analytics/user-analytics';
import { redirect } from 'sveltekit-flash-message/server';
import { errorMessage } from '$lib/utils/message.utils';
import { TimeHelper } from '$lib/utils/time.helper';
import { DateStringFormat } from '$lib/types/time.types';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
    const sessionId = event.cookies.get('sessionId');
    const userId = event.params.userId;
    const today = new Date();
    const formattedDate = TimeHelper.getDateString(today, DateStringFormat.YYYY_MM_DD);
    const tenantCode = event.locals.sessionUser.tenantCode;
    const response = await getUserAnalytics(sessionId??'', formattedDate, tenantCode)
    if (!response) {
        throw error(404, 'Daily user statistics data not found');
    }
    if (response.Status === 'Failure') {
        throw redirect(303, `/users/${userId}/home`,
            errorMessage('Latest generic engagement analytics report not available.'),
            event
        );
    }
    const genericMetrics = response.Data.GenericMetrics;
    return {
        sessionId,
        genericMetrics,
        title:'Dashboard-Home-Generic'
    };
};
