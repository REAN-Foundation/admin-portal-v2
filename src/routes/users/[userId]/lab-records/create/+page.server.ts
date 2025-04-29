import { redirect } from 'sveltekit-flash-message/server';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
// import { validateFormData } from '$lib/utils/formValidation';
import { createLabRecordType } from '../../../../api/services/reancare/lab-record-types';

/////////////////////////////////////////////////////////////////////////

const createLabRecordSchema = zfd.formData({
    typeName: z.string().max(128),
    displayName: z.string().optional(),
    snowmedCode: z.string().optional(),
    loincCode: z.string().optional(),
    normalRangeMin: zfd.numeric(z.number().optional()),
    normalRangeMax: zfd.numeric(z.number().optional()),
    unit: z.string().optional()
});
export const actions = {
    createLabRecordTypeAction: async (event: RequestEvent) => {
        const request = event.request;
        const userId = event.params.userId;
        const sessionId = event.cookies.get('sessionId');
        const data = await request.formData();
        const formData = Object.fromEntries(data);
        // const tags = data.has('tags') ? data.getAll('tags') : [];
        const formDataValue = { ...formData };

        // const { result, errors } = await validateFormData(request, createLabRecordSchema);

        // if (errors) {
        //     return { data: result, errors };
        // }


        type LabRecordSchema = z.infer<typeof createLabRecordSchema>;

        let result: LabRecordSchema = {};
        try {
            result = createLabRecordSchema.parse(formDataValue);
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
            response = await createLabRecordType(
                sessionId,
                result.typeName,
                result.displayName,
                result.snowmedCode,
                result.loincCode,
                result.normalRangeMin,
                result.normalRangeMax,
                result.unit
            );
        } catch (error: any) {
            const errorMessageText = error?.body?.message || 'An error occurred';
            throw redirect(303, `/users/${userId}/lab-records`, errorMessage(errorMessageText), event);
        }
        const id = response.Data.LabRecordType.id;
        throw redirect(
            303,
            `/users/${userId}/lab-records/${id}/view`,
            successMessage(`Lab record created successfully!`),
            event
        );
    }
};
