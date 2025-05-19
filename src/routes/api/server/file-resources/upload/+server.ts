import type { FileUploadModel } from '$lib/types/file.upload.types';
import { ResponseHandler } from '$lib/utils/response.handler';
import { fileUploadSchema } from '$lib/validation/file.upload.schema';
import { uploadBinary } from '$routes/api/services/reancare/file.resource';
import type { RequestEvent, RequestHandler } from './$types';
import * as fs from 'fs';

//////////////////////////////////////////////////////////////

// export const POST = (async (event: RequestEvent) => {
// 	try {
// 		console.log(`Upload in progress---`);

// 		// console.log(JSON.stringify(event, null, 2));
// 		console.log("Event",event);
// 		const formData = await event.request.formData();
// 		// console.log(JSON.stringify(event, null, 2));
//     const file = formData.get('file') as File;
//     const filename = formData.get('filename');
// 		// const data_ = await event.request.json();
// 		// const params: URLSearchParams = event.url.searchParams;
// 		// console.log(`search params : ` + params);
// 		// const filename = event.request.headers.get('filename');
// 		console.log("filename............",filename);

// 		const fileBuffer = data_['image'];
// 		const filePath = filename;
// 		fs.writeFileSync(filePath, fileBuffer, 'base64');

// 		if (fs.existsSync(filePath)) {
// 			console.log(Date.now().toString());
// 			console.log(`Copied file ${filename} to server stats/temp.`);
// 		}

// 		const sessionId = event.locals.sessionUser.sessionId;
// 		const buffer = fs.readFileSync(filePath);

// 		console.log('Uploading file resource ...');
// 		//const location = path.join(process.cwd(), filePath);
// 		const response = await uploadBinary(sessionId, buffer, filename, true);
// 		console.log(JSON.stringify(response, null, 2));

// 		fs.unlinkSync(filePath);

// 		return new Response(JSON.stringify(response));
// 	} catch (err) {
// 		//console.error(`Error uploading file: ${err.message}`);
// 		console.error(`Error uploading file: ${JSON.stringify(err.stack.split('\n'), null, 2)}`);
// 		return new Response(err.message);
// 	}
// }) satisfies RequestHandler;
export const POST: RequestHandler = async (event: RequestEvent) => {
	try {
		console.log(`Upload in progress---`);

		const formData = await event.request.formData();
		console.log('formData', formData);
		let filename: string;
		const file = formData.get('file') as File;
		filename = file.name;

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

		const sessionId = event.locals?.sessionUser?.sessionId;
		const tenantId = event.locals?.sessionUser?.tenantCode;
		const fileBuffer = fs.readFileSync(filePath);

		console.log('Uploading file resource ...');
		const response = await uploadBinary(sessionId, tenantId, fileBuffer, filename, true);
		console.log(JSON.stringify(response, null, 2));

		fs.unlinkSync(filePath);

		return new Response(JSON.stringify(response), { status: 201 });
	} catch (err) {
		console.error(`Error uploading file: ${err}`);
		return new Response(JSON.stringify({ Status: 'error', Message: err.message }), { status: 500 });
	}
};
