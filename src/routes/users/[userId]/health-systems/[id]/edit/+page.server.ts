import { error, fail, type RequestEvent } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import type { PageServerLoad } from './$types';

import type { ServerLoadEvent } from '@sveltejs/kit';
import { getHealthSystemById, updateHealthSystem } from '../../../../services/rean-care/health.systems';
import { updateSchema } from '$lib/validation/health.system.schema';

/////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: ServerLoadEvent) => {
    const sessionId = event.cookies.get('sessionId');
    const healthSystemId = event.params.id;
    const response = await getHealthSystemById(sessionId, healthSystemId);

    const healthSystem = response?.Data?.HealthSystem;
    const id = response?.Data?.HealthSystem?.id;

    return {
        location: `${id}/edit`,
        healthSystem,
        message: response?.Message || 'Health System retrieved successfully',
        title: 'Hospital Systems-Health Systems Edit'
    };
};

// const updateHealthSystemSchema = zfd.formData({
//     healthSystemName: z.string().max(128),
//     tags: z.array(z.string()).optional()
// });

export const actions = {
    updateHealthSystemAction: async (event: RequestEvent) => {
        // const request = event.request;
        const userId = event.params.userId;
        const healthSystemId = event.params.id;
        const sessionId = event.cookies.get('sessionId');
        const data = await event.request.formData();
        // const formData = Object.fromEntries(data)
        const result = await updateSchema.safeParseAsync(Object.fromEntries(data));
        if (!result.success) {
            return fail(400, 
                { 
                    errors: Object.fromEntries(Object.entries(result.error.flatten().fieldErrors).map(([key, val]) => [key, val?.[0] || ''])),
                });
        }




        // const request = event.request;
        // const userId = event.params.userId;
        // const healthSystemId = event.params.id;
        // const sessionId = event.cookies.get('sessionId');
        // const data = await request.formData();
        // const formData = Object.fromEntries(data);
        // const tags = data.has('tags') ? data.getAll('tags') : [];
        // const formDataValue = { ...formData, tags: tags };

        // console.log('formData', JSON.stringify(formDataValue, null, 2));

        // type HealthSystemSchema = z.infer<typeof updateHealthSystemSchema>;

        // let result: HealthSystemSchema = {};
        // try {
        //     result = updateHealthSystemSchema.parse(formDataValue);
        //     console.log('result', result);
        // } catch (err) {
        //     const { fieldErrors: errors } = err.flatten();
        //     console.log(errors);
        //     const { ...rest } = formData;
        //     return {
        //         data: rest,
        //         errors
        //     };
        // }

        let response;
        try {
            response = await updateHealthSystem(sessionId, healthSystemId, result?.data?.healthSystemName, result?.data?.tags);
        } catch (error: any) {
            const errorMessageText = error?.body?.message || 'An error occurred';
            throw redirect(303, `/users/${userId}/health-systems`, errorMessage(errorMessageText), event);
        }
        const id = response.Data.HealthSystem.id;
        throw redirect(
            303,
            `/users/${userId}/health-systems/${id}/view`,
            successMessage(`Health system updated successfully!`),
            event
        );
    }
};
