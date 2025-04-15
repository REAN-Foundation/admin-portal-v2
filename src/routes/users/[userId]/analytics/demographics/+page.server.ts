import { error, type RequestEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getUserAnalytics } from '../../../../api/services/user-analytics/user-analytics';
import chalk from 'chalk';
import { redirect } from 'sveltekit-flash-message/server';
import { errorMessage} from '$lib/utils/message.utils';
import { TimeHelper } from '$lib/utils/time.helper';
import { DateStringFormat } from '$lib/types/time.types';

////////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
    const sessionId = event.cookies.get('sessionId');
    const userId = event.params.userId;
    const today = new Date();
    const formattedDate = TimeHelper.getDateString(today, DateStringFormat.YYYY_MM_DD);
    const response = await getUserAnalytics(sessionId??'', formattedDate)
    if (!response) {
        throw error(404, 'Daily user statistics data not found');
    }
    if (response.Status === 'Failure') {
        throw redirect(303, `/users/${userId}/home`,
			errorMessage('Latest patient statistics analytics report not available.'), 
			event
			);
     }

    const basicStatistics = response.Data.BasicStatistics;

    return {
        sessionId,
        basicStatistics,
        title:'Dashboard-Home-Demographics'
    };
};

