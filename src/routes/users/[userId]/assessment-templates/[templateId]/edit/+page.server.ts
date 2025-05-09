import { error, type RequestEvent } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { zfd } from 'zod-form-data';
import { z } from 'zod';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import type { PageServerLoad } from './$types';
import {
    getAssessmentTemplateById,
    updateAssessmentTemplate
} from '../../../../../api/services/reancare/assessments/assessment-templates';
import { validateFormData } from '$lib/utils/formValidation';

/////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
    const sessionId = event.cookies.get('sessionId');
    const assessmentTemplateId = event.params.templateId;
    const response = await getAssessmentTemplateById(sessionId, assessmentTemplateId);

    if (response.Status === 'failure' || response.HttpCode !== 200) {
        throw error(response.HttpCode, response.Message);
    }
    const assessmentTemplate = response.Data.AssessmentTemplate;
    const id = response.Data.AssessmentTemplate.id;
    return {
        location: `${id}/edit`,
        assessmentTemplate,
        message: response.Message,
        title: 'Clinical-Assessments Edit'
    };
};

const updateAssessmentTemplateSchema = zfd.formData({
    title: z.string().min(3).max(256),
    description: z.string().optional(),
    type: z.string(),
    provider: z.string().optional(),
    providerAssessmentCode: z.string().optional(),
    serveListNodeChildrenAtOnce: zfd.checkbox({ trueValue: 'true' }),
    scoringApplicable: zfd.checkbox({ trueValue: 'true' }),
    tags: z.array(z.string()).optional()
});

export const actions = {
    updateAssessmentAction: async (event: RequestEvent) => {
        const request = event.request;
        const userId = event.params.userId;
        const assessmentTemplateId = event.params.templateId;
        const sessionId = event.cookies.get('sessionId');
        const data = await request.formData();
        const formData = Object.fromEntries(data);
        const tags = data.has('tags') ? data.getAll('tags') : [];
        const formDataValue = { ...formData, tags: tags };

        console.log('formData', JSON.stringify(formDataValue, null, 2));

        type AssessmentTemplateSchema = z.infer<typeof updateAssessmentTemplateSchema>;

        let result: AssessmentTemplateSchema = {};
        try {
            result = updateAssessmentTemplateSchema.parse(formDataValue);
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
            response = await updateAssessmentTemplate(
                sessionId,
                assessmentTemplateId,
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
            successMessage(`Assessment updated successfully!`),
            event
        );
    }
};
