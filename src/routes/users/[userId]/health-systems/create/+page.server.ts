import { redirect } from 'sveltekit-flash-message/server';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { createHealthSystem } from '../../../../api/services/reancare/health.systems';

/////////////////////////////////////////////////////////////////////////

// export const load: PageServerLoad = async (event: RequestEvent) => {
//     const sessionId = event.cookies.get('sessionId');
//     console.log(`Loading the healthSystems/create page`);
//     try {
//         const response = await searchHealthSystems(sessionId);
//         const healthSystems = response.Data.HealthSystems.Items;
//         // console.log(`Health systems = ${JSON.stringify(healthSystems)}`);
//         return {
//             healthSystems: healthSystems
//         };
//     }
//     catch (error) {
//         console.error(`Error retriving health systems: ${error.message}`);
//     }
// };

const createHealthSystemSchema = zfd.formData({
    healthSystemName: z.string().max(256),
    tags: z.array(z.string()).optional()
});

export const actions = {
    createHealthSystemAction: async (event: RequestEvent) => {
        const request = event.request;
        const userId = event.params.userId;
        const sessionId = event.cookies.get('sessionId');
        const data = await request.formData();
        const formData = Object.fromEntries(data);
        const tags = data.has('tags') ? data.getAll('tags') : [];
        const formDataValue = { ...formData, tags: tags };

        console.log('formData', JSON.stringify(formDataValue, null, 2));

        type HealthSystemSchema = z.infer<typeof createHealthSystemSchema>;

        let result: HealthSystemSchema = {};
        try {
            result = createHealthSystemSchema.parse(formDataValue);
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
            response = await createHealthSystem(sessionId, result.healthSystemName, result.tags);
        } catch (error: any) {
            const errorMessageText = error?.body?.message || 'An error occurred';
            throw redirect(303, `/users/${userId}/health-systems`, errorMessage(errorMessageText), event);
        }
        const id = response.Data.HealthSystem.id;
        throw redirect(
            303,
            `/users/${userId}/health-systems/${id}/view`,
            successMessage(`Health system created successfully!`),
            event
        );
    }
};
