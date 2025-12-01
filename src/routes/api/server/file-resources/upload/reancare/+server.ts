// import type { FileUploadModel } from '$lib/types/file.upload.types';
// import { ResponseHandler } from '$lib/utils/response.handler';
// import { imageUploadSchema } from '$lib/validation/tenant-setting-favicon.schema';
// import { uploadBinary } from '$routes/api/services/reancare/file.resource';
// import type { RequestEvent, RequestHandler } from './$types';
// import * as fs from 'fs';

// //////////////////////////////////////////////////////////////

// export const POST: RequestHandler = async (event: RequestEvent) => {
//     try {
//         console.log(`Upload in progress---`);
//         const formData = await event.request.formData();
//         console.log('formData', formData);
//         const file = formData.get('file') as File;
//         const filename = file.name;
//         const fileCreateModel: FileUploadModel = {
//             UploadFile: file,
//             FileName: file.name,
//             FileType: file.type
//         };
//         const validationResult = imageUploadSchema.safeParse(fileCreateModel);
//         console.log('validation result from server', validationResult);
//         if (!validationResult.success) {
//             return ResponseHandler.success({
//                 Status: 'failure',
//                 HttpCode: 400,
//                 Message: 'Validation failed',
//                 Errors: Object.fromEntries(
//                     Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
//                         key,
//                         val?.[0] || ''
//                     ])
//                 )
//             });
//         }
//         const buffer = await file.arrayBuffer();
//         const filePath = `/tmp/${filename}`;
//         fs.writeFileSync(filePath, Buffer.from(buffer));
//         if (fs.existsSync(filePath)) {
//             console.log(`Copied file ${filename} to server /tmp.`);
//         }
//         const sessionId = event.locals?.sessionUser?.sessionId;
//         const tenantId = event.locals?.sessionUser?.tenantCode;
//         const fileBuffer = fs.readFileSync(filePath);
//         console.log('Uploading file resource ...');
//         const response = await uploadBinary(sessionId, tenantId, fileBuffer, filename, true);
//         console.log("This is the response",JSON.stringify(response, null, 2));
//         fs.unlinkSync(filePath);
//         return new Response(JSON.stringify(response), { status: 201 });
//     } catch (err) {
//         console.error(`Error uploading file: ${err}`);
//         return new Response(JSON.stringify({ Status: 'error', Message: err.message }), { status: 500 });
//     }
// };

import type { FileUploadModel } from '$lib/types/file.upload.types';
import { ResponseHandler } from '$lib/utils/response.handler';
import { imageUploadSchema } from '$lib/validation/tenant-setting-favicon.schema';
import { uploadBinary } from '$routes/api/services/reancare/file.resource';
import type { RequestEvent, RequestHandler } from './$types';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const readFile = promisify(fs.readFile);

//////////////////////////////////////////////////////////////

/**
 * Retry logic for file upload with exponential backoff
 */
async function uploadWithRetry(
	sessionId: string,
	tenantId: string,
	fileBuffer: Buffer,
	filename: string,
	maxRetries = 3
): Promise<any> {
	let lastError: Error | null = null;

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			console.log(`Upload attempt ${attempt + 1}/${maxRetries} for ${filename}`);
			const response = await uploadBinary(sessionId, tenantId, fileBuffer, filename, true);

			// Check for connection errors in response
			if (
				response.Message &&
				(response.Message.includes('ECONNRESET') || response.Message.includes('ECONNREFUSED'))
			) {
				throw new Error('Connection error');
			}

			return response;
		} catch (error) {
			lastError = error as Error;
			console.error(`Upload attempt ${attempt + 1} failed:`, error);

			// Don't retry on non-network errors
			const errorStr = error instanceof Error ? error.message : String(error);
			if (
				!errorStr.includes('ECONNRESET') &&
				!errorStr.includes('ECONNREFUSED') &&
				!errorStr.includes('network') &&
				!errorStr.includes('timeout')
			) {
				throw error;
			}

			// Wait before retrying (exponential backoff)
			if (attempt < maxRetries - 1) {
				const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	throw lastError || new Error('Upload failed after maximum retries');
}

/**
 * Clean up temporary file safely
 */
async function cleanupTempFile(filePath: string): Promise<void> {
	try {
		if (fs.existsSync(filePath)) {
			await unlink(filePath);
			console.log(`Cleaned up temporary file: ${filePath}`);
		}
	} catch (error) {
		console.error(`Failed to cleanup temporary file ${filePath}:`, error);
		// Don't throw - cleanup failures shouldn't break the upload
	}
}

/**
 * POST handler for file upload
 */
export const POST: RequestHandler = async (event: RequestEvent) => {
	let tempFilePath: string | null = null;

	try {
		console.log('File upload started');

		// Extract form data
		const formData = await event.request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			return ResponseHandler.success({
				Status: 'failure',
				HttpCode: 400,
				Message: 'No file provided'
			});
		}

		const filename = file.name;

		// Validate file
		const fileCreateModel: FileUploadModel = {
			UploadFile: file,
			FileName: file.name,
			FileType: file.type
		};

		const validationResult = imageUploadSchema.safeParse(fileCreateModel);
		console.log('Validation result:', validationResult.success);

		if (!validationResult.success) {
			return ResponseHandler.success({
				Status: 'failure',
				HttpCode: 400,
				Message: 'Validation failed',
				Errors: Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'Invalid field'
					])
				)
			});
		}

		// Create temporary file
		const buffer = await file.arrayBuffer();
		const sanitizedFilename = path.basename(filename); // Prevent path traversal
		tempFilePath = `/tmp/${Date.now()}-${sanitizedFilename}`;

		await writeFile(tempFilePath, Buffer.from(buffer));
		console.log(`Temporary file created: ${tempFilePath}`);

		// Get session info
		const sessionId = event.locals?.sessionUser?.sessionId;
		const tenantId = event.locals?.sessionUser?.tenantCode;

		if (!sessionId || !tenantId) {
			await cleanupTempFile(tempFilePath);
			return ResponseHandler.success({
				Status: 'failure',
				HttpCode: 401,
				Message: 'Unauthorized: Invalid session'
			});
		}

		// Read file buffer
		const fileBuffer = await readFile(tempFilePath);

		// Upload with retry logic
		console.log('Uploading file to backend...');
		const response = await uploadWithRetry(sessionId, tenantId, fileBuffer, filename);

		console.log('Upload response:', JSON.stringify(response, null, 2));

		// Cleanup temporary file
		await cleanupTempFile(tempFilePath);

		return new Response(JSON.stringify(response), {
			status: response.HttpCode || 201,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (err) {
		console.error('Error uploading file:', err);

		// Cleanup on error
		if (tempFilePath) {
			await cleanupTempFile(tempFilePath);
		}

		const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
		const statusCode = errorMessage.includes('Unauthorized') ? 401 : 500;

		return new Response(
			JSON.stringify({
				Status: 'failure',
				HttpCode: statusCode,
				Message: errorMessage
			}),
			{
				status: statusCode,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}
};
