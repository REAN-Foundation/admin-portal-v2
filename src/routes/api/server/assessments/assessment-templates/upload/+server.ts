import { PUBLIC_LOCAL_STORAGE } from '$env/static/public';
import type { FileUploadModel } from '$lib/types/file.upload.types';
import { ResponseHandler } from '$lib/utils/response.handler';
import { fileUploadSchema } from '$lib/validation/file.upload.schema';
import { importAssessmentTemplate } from '../../../../services/reancare/assessments/assessment-templates';
import type { RequestEvent, RequestHandler } from './$types';
import * as fs from 'fs';
import { writeFile } from 'node:fs/promises';

export const POST: RequestHandler = async (event: RequestEvent) => {
    try {
        console.log(`Upload in progress---`);

        const formData = await event.request.formData();
        console.log('formData', formData);
        // const filename: string;
        const file = formData.get('file') as File;
        const filename = file.name;
        const fileUploadFolder = PUBLIC_LOCAL_STORAGE;

        const fileCreateModel: FileUploadModel = {
            UploadFile: file,
            FileName: file.name,
            FileType: file.type
        };

        const validationResult = fileUploadSchema.safeParse(fileCreateModel);
        console.log('validation result from server', validationResult);
        if (!validationResult.success) {
            return ResponseHandler.success({
                Status: 'failure',
                HttpCode: 400,
                Message: 'Validation failed',
                Errors: Object.fromEntries(
                    Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
                        key,
                        val?.[0] || ''
                    ])
                )
            });
        }

        console.log('File name:', filename);
        console.log('File type:', file.type);

        const filePath = `${fileUploadFolder}/${filename}`;

        if (!fs.existsSync(`${fileUploadFolder}`)) {
            fs.mkdirSync(`${fileUploadFolder}`, { recursive: true });
        }


        if (fs.existsSync(filePath)) {
            console.log(`Copied file ${filename} to server /tmp.`);
        }

        const sessionId = event.locals?.sessionUser?.sessionId;
        // const tenantId = event.locals?.sessionUser?.tenantCode;
        // const fileBuffer = fs.readFileSync(filePath);

        await writeFile(filePath, Buffer.from(await file?.arrayBuffer()));

        if (!fs.existsSync(filePath)) {
            console.log('File not created');
            return ResponseHandler.success({
                Status: 'failure',
                HttpCode: 400,
                Message: 'File not created',
                Errors: Object.fromEntries(
                    Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
                        key,
                        val?.[0] || ''
                    ])
                )
            });
        }

        console.log('Uploading file resource ...');

        const response = await importAssessmentTemplate(sessionId, filename, filePath);

        console.log(JSON.stringify(response, null, 2));

        fs.unlinkSync(filePath);

        return new Response(JSON.stringify(response), { status: 201 });
    } catch (err) {
        console.error(`Error uploading file: ${err}`);
        return new Response(JSON.stringify({ Status: 'error', Message: err.message }), { status: 500 });
    }
};
