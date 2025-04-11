import { redirect } from 'sveltekit-flash-message/server';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { createSymptom } from '../../../../api/services/reancare/symptoms';

/////////////////////////////////////////////////////////////////////////

const createSymptomSchema = zfd.formData({
    symptom: z.string().min(3).max(256),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    language: z.string().optional(),
    imageResourceId: z.string().uuid()
});

export const actions = {
    createSymptomAction: async (event: RequestEvent) => {
        const request = event.request;
        const userId = event.params.userId;
        const sessionId = event.cookies.get('sessionId');
        const data = await request.formData();
        const formData = Object.fromEntries(data);
        const tags = data.has('tags') ? data.getAll('tags') : [];
        const formDataValue = { ...formData, tags: tags };

        type SymptomSchema = z.infer<typeof createSymptomSchema>;

        let result: SymptomSchema = {};
        try {
            result = createSymptomSchema.parse(formDataValue);
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
            response = await createSymptom(
                sessionId,
                result.symptom,
                result.description,
                result.tags,
                result.language,
                result.imageResourceId
            );
        } catch (error: any) {
            const errorMessageText = error?.body?.message || 'An error occurred';
            throw redirect(303, `/users/${userId}/symptoms`, errorMessage(errorMessageText), event);
        }

        const id = response.Data.SymptomType.id;

        throw redirect(
            303,
            `/users/${userId}/symptoms/${id}/view`,
            successMessage(`Symptom created successfully!`),
            event
        );
    }
};
