import type { FileUploadModel } from '$lib/types/file.upload.types';
import { ResponseHandler } from '$lib/utils/response.handler';
import { fileUploadSchema } from '$lib/validation/file.upload.schema';
import { uploadBinary } from '$routes/api/services/reancare/file.resource';
import type { RequestEvent, RequestHandler } from './$types';
import * as fs from 'fs';
import { json } from '@sveltejs/kit';

export const config = {
	maxBodySize: 50 * 1024 * 1024 // Set to 50MB instead of 0
};

export const POST = async (event: RequestEvent) => {
    console.log("File upload request received");
    
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    let filePath: string | null = null;
    
    try {
        console.log("Parsing FormData...");
        const formData = await event.request.formData();
        const file = formData.get('file') as File;
        
        console.log("File received:", {
            name: file?.name,
            size: file?.size,
            type: file?.type
        });
        
        if (!file) {
            console.log("No file provided");
            return json({
                Status: 'failure',
                HttpCode: 400,
                Message: 'No file provided'
            }, { status: 400 });
        }

        // Check file size
        if (file.size > maxFileSize) {
            console.log(`File too large: ${file.size} bytes`);
            return json({
                Status: 'failure',
                HttpCode: 413,
                Message: `File too large. Size: ${(file.size / 1024 / 1024).toFixed(2)}MB, Maximum: ${maxFileSize / 1024 / 1024}MB`
            }, { status: 413 });
        }

        // Create file model for validation
        const fileCreateModel: FileUploadModel = {
            UploadFile: file,
            FileName: file.name,
            FileType: file.type
        };

        console.log("Validating file...");
        // Zod validation
        const validationResult = fileUploadSchema.safeParse(fileCreateModel);
        if (!validationResult.success) {
            console.log("File validation failed:", validationResult.error);
            return json({
                Status: 'failure',
                HttpCode: 400,
                Message: 'Validation failed',
                Errors: Object.fromEntries(
                    Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
                        key,
                        val?.[0] || ''
                    ])
                )
            }, { status: 400 });
        }

        console.log("File validation passed, converting to buffer...");
        
        // Convert file to buffer and save temporarily
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Create unique temporary file path
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // Sanitize filename
        filePath = `/tmp/${timestamp}-${safeName}`;
        
        // Write to temporary file
        fs.writeFileSync(filePath, buffer);
        console.log(`Temporary file created: ${filePath}, size: ${buffer.length} bytes`);

        // Get session details
        const sessionId = event.locals?.sessionUser?.sessionId;
        const tenantId = event.locals?.sessionUser?.tenantCode;

        if (!sessionId || !tenantId) {
            console.log("Missing session or tenant information");
            throw new Error('Missing session or tenant information');
        }

        console.log("Uploading to backend service...");
        
        // Upload to your API/storage layer
        const response = await uploadBinary(sessionId, tenantId, buffer, file.name, true);
        
        console.log("Upload successful:", response);
        return json(response, { status: 201 });

    } catch (err: any) {
        console.error('Error in file upload:', err);
        
        let status = 500;
        let message = err.message || 'Internal server error';

        // Handle specific error types
        if (err.message?.includes('request entity too large') || 
            err.message?.includes('PayloadTooLargeError') ||
            err.message?.includes('Content-length exceeds limit')) {
            status = 413;
            message = 'File too large for upload';
        } else if (err.code === 'ENOENT') {
            status = 500;
            message = 'Temporary file system error';
        }

        return json({
            Status: 'error',
            HttpCode: status,
            Message: message
        }, { status });
        
    } finally {
        // Clean up temporary file
        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                console.log(`Cleaned up temporary file: ${filePath}`);
            } catch (cleanupError) {
                console.error('Error cleaning up temporary file:', cleanupError);
            }
        }
    }
};

