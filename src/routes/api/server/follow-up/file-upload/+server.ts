import type { FileUploadModel } from '$lib/types/file.upload.types';
import { Helper } from '$lib/utils/helper';
import { ResponseHandler } from '$lib/utils/response.handler';
import { fileUploadSchema } from '$lib/validation/file.upload.schema';
import { uploadAppoinmentPdf } from '$routes/api/services/follow-up/file-upload';
import type { RequestEvent, RequestHandler } from '@sveltejs/kit';
import * as fs from 'fs';

///////////////////////////////////////////////////////////////////////////////

export const POST: RequestHandler = async (event: RequestEvent) => {
	try {
		console.log(`Upload in progress---`);
		const formData = await event.request.formData();
		console.log('formData', formData);
		const file = formData.get('file') as File;
		const filename = file.name;

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

		const buffer = await file.arrayBuffer();
		const filePath = `/tmp/${filename}`;
		fs.writeFileSync(filePath, Buffer.from(buffer));

		if (fs.existsSync(filePath)) {
			console.log(`Copied file ${filename} to server /tmp.`);
		}

		const tenantCode = event.locals?.sessionUser?.tenantCode;

		const newFileName = Helper.replaceAll(filename, ' ', '_');

		const today = new Date();
		const formattedDate = today.toISOString().split('T')[0].replace(/-/g, '');
		const extensionIndex = newFileName.lastIndexOf('.');
		const extension = newFileName.substring(extensionIndex);
		const finalFileName = `${tenantCode}_${formattedDate}${extension}`;
		console.log('finalFileName...', finalFileName);
		console.log('Uploading file resource ...');
	

		const response = await uploadAppoinmentPdf(finalFileName, filePath);
		console.log(JSON.stringify(response, null, 2));

		fs.unlinkSync(filePath);

		return new Response(JSON.stringify(response), { status: 201 });
	} catch (err) {
		console.error(`Error uploading file: ${err}`);
		return new Response(JSON.stringify({ Status: 'error', Message: err.message }), { status: 500 });
	}
};
