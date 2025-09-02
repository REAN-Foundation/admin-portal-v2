import { PUBLIC_LOCAL_STORAGE } from '$env/static/public';
import type { FileUploadModel } from '$lib/types/file.upload.types';
import { ResponseHandler } from '$lib/utils/response.handler';
import { fileUploadSchema } from '$lib/validation/file.upload.schema';
import { importCareplan } from '$routes/api/services/careplan/careplans';
import type { RequestEvent } from '@sveltejs/kit';
import * as fs from 'fs';
import { writeFile } from 'node:fs/promises';

////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const POST = async (event: RequestEvent) => {
    try {

        const formData = await event.request.formData();

        const file = formData.get('file') as File;
        const filename = file.name;
        const fileUploadFolder = PUBLIC_LOCAL_STORAGE;

        const fileCreateModel: FileUploadModel = {
            UploadFile: file,
            FileName: file.name,
            FileType: file.type
        };

        const validationResult = fileUploadSchema.safeParse(fileCreateModel);

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

        const filePath = `${fileUploadFolder}/${filename}`;

        if (!fs.existsSync(`${fileUploadFolder}`)) {
            fs.mkdirSync(`${fileUploadFolder}`, { recursive: true });
        }


        if (fs.existsSync(filePath)) {
            console.log(`Copied file ${filename} to server /tmp.`);
        }

        const sessionId = event.locals?.sessionUser?.sessionId;

        await writeFile(filePath, Buffer.from(await file?.arrayBuffer()));

         if (!fs.existsSync(filePath)) {
                   console.log('File not created');
                   return ResponseHandler.success({
                       Status: 'failure',
                       HttpCode: 400,
                       Message: 'File not created',
                       Errors: { file: 'File was not created on the server.' }
                   });
               }

        const response = await importCareplan(sessionId, filename, filePath);

        fs.unlinkSync(filePath);

        return new Response(JSON.stringify(response), { status: 201 });
    } catch (err) {
        console.error(`Error uploading file: ${err}`);
        return new Response(JSON.stringify({ Status: 'error', Message: err.message }), { status: 500 });
    }
};