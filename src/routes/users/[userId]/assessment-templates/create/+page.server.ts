import { redirect } from 'sveltekit-flash-message/server';
import type { RequestEvent } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { createAssessmentTemplate } from '../../../../api/services/reancare/assessments/assessment-templates';
// import { createAssessmentTemplate } from '../../../../api/services/reancare/assessments/assessment-templates';

/////////////////////////////////////////////////////////////////////////

const createAssessmentTemplateSchema = zfd.formData({
    title: z.string().min(3).max(256),
    description: z.string().optional(),
    type: z.string(),
    provider: z.string().optional(),
    providerAssessmentCode: z.string().optional(),
    serveListNodeChildrenAtOnce: zfd.checkbox(),
    scoringApplicable: zfd.checkbox(),
    tags: z.array(z.string()).optional()
});

export const actions = {
    createAssessmentAction: async (event: RequestEvent) => {
        const request = event.request;
        const userId = event.params.userId;
        const sessionId = event.cookies.get('sessionId');
        const data = await request.formData();
        const formData = Object.fromEntries(data);
        const tags = data.has('tags') ? data.getAll('tags') : [];
        const formDataValue = { ...formData, tags: tags };

        console.log('formData', JSON.stringify(formDataValue, null, 2));

        type AssessmentTemplateSchema = z.infer<typeof createAssessmentTemplateSchema>;

        let result: AssessmentTemplateSchema = {};
        try {
            result = createAssessmentTemplateSchema.parse(formDataValue);
            console.log('result', result);
        } catch (err) {
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
            response = await createAssessmentTemplate(
                sessionId,
                result.title,
                result.description,
                result.type,
                result.provider,
                result.providerAssessmentCode,
                result.serveListNodeChildrenAtOnce,
                result.scoringApplicable,
                result.tags
            );
        } catch (error: any) {
            const errorMessageText = error?.body?.message || 'An error occurred';
            throw redirect(303, `/users/${userId}/assessment-templates`, errorMessage(errorMessageText), event);
        }
        const id = response.Data.AssessmentTemplate.id;
        throw redirect(
            303,
            `/users/${userId}/assessment-templates/${id}/view`,
            successMessage(`Assessment created successfully!`),
            event
        );
    }
};
