import { redirect } from 'sveltekit-flash-message/server';
import type { PageServerLoad } from './$types';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { searchHealthSystems } from '../../../../api/services/reancare/health.systems';
import { createHospital } from '../../../../api/services/reancare/hospitals';

/////////////////////////////////////////////////////////////////////////

export const load: PageServerLoad = async (event: RequestEvent) => {
    const sessionId = event.cookies.get('sessionId');
    console.log(`Loading the hospitals/create page`);
    try {
        const response = await searchHealthSystems(sessionId, {
            itemsPerPage: 200
        });
        const healthSystems = response.Data.HealthSystems.Items;
        return {
            healthSystems: healthSystems,
            title: 'Hospital Systems-Hospitals Create'
        };
    } catch (error) {
        console.error(`Error retriving health systems: ${error.message}`);
    }
};

const createHospitalSchema = zfd.formData({
    hospitalName: z.string().max(256),
    healthSystemId: z.string().optional(),
    tags: z.array(z.string()).optional()
});

export const actions = {
    createHospitalAction: async (event: RequestEvent) => {
        const request = event.request;
        const userId = event.params.userId;
        const sessionId = event.cookies.get('sessionId');
        const data = await request.formData();
        const formData = Object.fromEntries(data);
        const tags = data.has('tags') ? data.getAll('tags') : [];
        const formDataValue = { ...formData, tags: tags };

        console.log('formData', JSON.stringify(formDataValue, null, 2));

        type HospitalSchema = z.infer<typeof createHospitalSchema>;

        let result: HospitalSchema = {};
        try {
            result = createHospitalSchema.parse(formDataValue);
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
            response = await createHospital(sessionId, result.hospitalName, result.healthSystemId, result.tags);
        } catch (error: any) {
            const errorMessageText = error?.body?.message || 'An error occurred';
            throw redirect(303, `/users/${userId}/hospitals`, errorMessage(errorMessageText), event);
        }
        const id = response.Data.Hospital.id;
        throw redirect(
            303,
            `/users/${userId}/hospitals/${id}/view`,
            successMessage(`Hospital created successfully!`),
            event
        );
    }
};
