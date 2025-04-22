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

const updateKnowledgeNuggetSchema = zfd.formData({
    topicName: z.string().max(128),
    briefInformation: z.string().optional(),
    detailedInformation: z.string().optional(),
    additionalResources: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional()
});

export const actions = {
    updateKnowledgeNuggetAction: async (event: RequestEvent) => {
        const request = event.request;
        const userId = event.params.userId;
        const knowledgeNuggetsId = event.params.id;
        const sessionId = event.cookies.get('sessionId');
        const data = await request.formData();
        const formData = Object.fromEntries(data);

        const additionalResources = data.has('additionalResources') ? data.getAll('additionalResources') : [];
        const tags = data.has('tags') ? data.getAll('tags') : [];
        const formDataValue = { ...formData, tags: tags, additionalResources: additionalResources };

        type KnowledgeNuggetSchema = z.infer<typeof updateKnowledgeNuggetSchema>;

        let result: KnowledgeNuggetSchema = {};
        try {
            result = updateKnowledgeNuggetSchema.parse(formDataValue);
            console.log('result', result);
        } catch (err: any) {
            const { fieldErrors: errors } = err.flatten();
            console.log(errors);
            const { ...rest } = formData;
            return {
                data: rest,
                errors
            };
        }

        let response;
        try {
            response = await updateKnowledgeNugget(
                sessionId,
                knowledgeNuggetsId,
                result.topicName,
                result.briefInformation,
                result.detailedInformation,
                result.additionalResources,
                result.tags
            );
        } catch (error: any) {
            const errorMessageText = error?.body?.message || 'An error occurred';
            throw redirect(303, `/users/${userId}/knowledge-nuggets`, errorMessage(errorMessageText), event);
        }
        const id = response.Data.KnowledgeNugget.id;
        throw redirect(
            303,
            `/users/${userId}/knowledge-nuggets/${id}/view`,
            successMessage(`Knowledge nuggets updated successfully!`),
            event
        );
    }
};
