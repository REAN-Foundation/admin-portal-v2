import { PUBLIC_LOCAL_STORAGE } from "$env/static/public";
import { ResponseHandler } from "$lib/utils/response.handler";
import { importAssessmentTemplate } from "../../../../services/reancare/assessments/assessment-templates";
import { type RequestEvent } from "@sveltejs/kit";
import { Buffer } from 'buffer';
import * as fs from 'fs';
import { writeFile } from 'node:fs/promises';

export const POST = async (event: RequestEvent) => {
    try {
        console.log("Inside Assessment template server POST endpoints");
        const sessionId = event.locals?.sessionUser?.sessionId;

        if (!sessionId) {
            return ResponseHandler.handleError(401, null, new Error("Access denied: Invalid session."));
        }

        // const userId = event.params.userId;
        const request = event.request;
        // const sessionId = event.cookies.get('sessionId');
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
            // throw redirect(
            //     303,
            //     `/users/${userId}/assessment-templates`,
            //     errorMessage('Unable to import assessment template.'),
            //     event
            // );
        }

        const response = await importAssessmentTemplate(sessionId, fileName, filePath);

        fs.unlinkSync(filePath);

        if (response.Status === 'failure' || response.HttpCode !== 201) {
            console.log(`Error in import assessment template: ${response.Message}`);
            // throw redirect(303, `/users/${userId}/assessment-templates`, errorMessage('Error in import assessment template'), event);
        }
        // throw redirect(303, `/users/${userId}/assessment-templates`, successMessage(response.Message), event);
    }
    catch (error) {
        console.error("Error creating assessment node:", error);
        return ResponseHandler.handleError(500, null, error);
    }
}