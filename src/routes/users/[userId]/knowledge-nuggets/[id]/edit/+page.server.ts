import { error, type RequestEvent } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import type { PageServerLoad } from './$types';
import { getKnowledgeNuggetById, updateKnowledgeNugget } from '../../../../../api/services/reancare/knowledge-nuggets';

/////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
    const sessionId = event.cookies.get('sessionId');
    const knowledgeNuggetsId = event.params.id;
    const response = await getKnowledgeNuggetById(sessionId, knowledgeNuggetsId);

    if (response.Status === 'failure' || response.HttpCode !== 200) {
        throw error(response.HttpCode, response.Message);
    }
    const KnowledgeNugget = response.Data.KnowledgeNugget;
    console.log(KnowledgeNugget);
    const id = response.Data.KnowledgeNugget.id;
    return {
        location: `${id}/edit`,
        KnowledgeNugget,
        message: response.Message,
        title: 'Educational-Knowledge Nuggets Edit'
    };
};
