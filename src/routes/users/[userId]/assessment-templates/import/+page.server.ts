import { writeFile } from 'node:fs/promises';
import type { RequestEvent } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { errorMessage, successMessage } from '$lib/utils/message.utils';
import { PUBLIC_LOCAL_STORAGE } from '$env/static/public';
import { Buffer } from 'buffer';
import * as fs from 'fs';
import { importAssessmentTemplate } from '../../../../api/services/reancare/assessments/assessment-templates';

///////////////////////////////////////////////////////////////////////////////////////////

export const actions = {
    importAssessment: async (event: RequestEvent) => {
        const userId = event.params.userId;
        const request = event.request;
        const sessionId = event.cookies.get('sessionId');
        const formData = await request.formData();
        const uploadedFile = formData?.get('name') as File;
        const fileName = uploadedFile.name;
        const fileUploadFolder = PUBLIC_LOCAL_STORAGE;
        const filePath = `${fileUploadFolder}/${fileName}`;

        if (!fs.existsSync(`${fileUploadFolder}`)) {
            fs.mkdirSync(`${fileUploadFolder}`, { recursive: true });
        }

        await writeFile(filePath, Buffer.from(await uploadedFile?.arrayBuffer()));

        if (!fs.existsSync(filePath)) {
            console.log('File not created');
            throw redirect(
                303,
                `/users/${userId}/assessment-templates`,
                errorMessage('Unable to import assessment template.'),
                event
            );
        }

        const response = await importAssessmentTemplate(sessionId, fileName, filePath);

        fs.unlinkSync(filePath);

        if (response.Status === 'failure' || response.HttpCode !== 201) {
            console.log(`Error in import assessment template: ${response.Message}`);
            throw redirect(303, `/users/${userId}/assessment-templates`, errorMessage('Error in import assessment template'), event);
        }
        throw redirect(303, `/users/${userId}/assessment-templates`, successMessage(response.Message), event);
    }
};
