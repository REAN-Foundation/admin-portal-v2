import type { FileUploadModel } from '$lib/types/file.upload.types';
import { fileUploadSchema } from '$lib/validation/file.upload.schema';

import type { RequestEvent } from './$types';
import * as fs from 'fs';
import { json } from '@sveltejs/kit';
import { uploadBinary } from '$routes/api/services/bot-content/file.resource';

///////////////////////////////////////////////////////////////////////////////////////////////////////////

export const config = {
    maxBodySize: 10 * 1024 * 1024, // 2MB in bytes
    parseBody: false // Disable automatic body parsing to handle it manually
};

export const POST = async (event: RequestEvent) => {
    console.log("File upload request received");

    const maxFileSize = 10 * 1024 * 1024; // 2MB
    let filePath: string | null = null;

    try {
        // Get content info from headers
        const contentType = event.request.headers.get('content-type') || '';
        const contentLength = parseInt(event.request.headers.get('content-length') || '0');

        console.log('Content-Type:', contentType);
        console.log('Content-Length:', contentLength);

        // Check if it's multipart form data
        if (!contentType.includes('multipart/form-data')) {
            return json({
                Status: 'failure',
                HttpCode: 400,
                Message: 'Request must be multipart/form-data'
            }, { status: 400 });
        }

        // Check size before processing
        if (contentLength > maxFileSize) {
            console.log(`Request too large: ${contentLength} bytes`);
            return json({
                Status: 'failure',
                HttpCode: 413,
                Message: `Request too large. Size: ${(contentLength / 1024 / 1024).toFixed(2)}MB, Maximum: ${maxFileSize / 1024 / 1024}MB`
            }, { status: 413 });
        }

        console.log("Reading raw request body...");

        // Read the raw body as ArrayBuffer (this bypasses SvelteKit's parsing)
        const arrayBuffer = await event.request.arrayBuffer();
        console.log(`Raw body received: ${arrayBuffer.byteLength} bytes`);

        // Extract boundary from content-type header
        const boundaryMatch = contentType.match(/boundary=([^;]+)/);
        if (!boundaryMatch) {
            return json({
                Status: 'failure',
                HttpCode: 400,
                Message: 'No boundary found in multipart data'
            }, { status: 400 });
        }

        const boundary = boundaryMatch[1].replace(/"/g, ''); // Remove quotes if present
        console.log('Boundary:', boundary);

        // Parse the multipart data
        const { file, fileName, fileType } = parseMultipartFormData(arrayBuffer, boundary);

        if (!file || !fileName) {
            console.log("No file found in multipart data");
            return json({
                Status: 'failure',
                HttpCode: 400,
                Message: 'No file provided in form data'
            }, { status: 400 });
        }

        console.log("File parsed:", {
            name: fileName,
            size: file.byteLength,
            type: fileType,
            hasFile: !!file,
            hasFileName: !!fileName
        });

        // Check file size again
        if (file.byteLength > maxFileSize) {
            console.log(`File too large: ${file.byteLength} bytes`);
            return json({
                Status: 'failure',
                HttpCode: 413,
                Message: `File too large. Size: ${(file.byteLength / 1024 / 1024).toFixed(2)}MB, Maximum: ${maxFileSize / 1024 / 1024}MB`
            }, { status: 413 });
        }

        // Create a mock File object for validation
        const mockFile = {
            name: fileName,
            size: file.byteLength,
            type: fileType || 'application/octet-stream'
        } as File;

        // Validate using your existing schema
        const fileCreateModel: FileUploadModel = {
            UploadFile: mockFile,
            FileName: fileName,
            FileType: fileType || 'application/octet-stream'
        };

        console.log("Mock file for validation:", {
            name: mockFile.name,
            size: mockFile.size,
            type: mockFile.type
        });

        console.log("File create model:", fileCreateModel);

        console.log("Validating file...");
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

        console.log("File validation passed, creating buffer...");

        // Convert to Buffer
        const buffer = Buffer.from(file);

        // Create unique temporary file path
        const timestamp = Date.now();
        const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
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

        // Upload to your backend
        const response = await uploadBinary(sessionId, tenantId, buffer, fileName, true);

        console.log("Upload successful:", response);
        return json(response, { status: 201 });

    } catch (err: any) {
        console.error('Error in file upload:', err);

        const status = 500;
        const message = err.message || 'Internal server error';

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

// Function to manually parse multipart form data
function parseMultipartFormData(arrayBuffer: ArrayBuffer, boundary: string): {
    file: ArrayBuffer | null,
    fileName: string,
    fileType: string
} {
    const data = new Uint8Array(arrayBuffer);
    const boundaryBytes = new TextEncoder().encode(`--${boundary}`);
    const doubleNewline = new TextEncoder().encode('\r\n\r\n');

    // Find file part
    let fileStart = -1;
    let fileEnd = -1;
    let fileName = '';
    let fileType = '';

    // Convert the beginning to string to parse headers
    const headerSection = new TextDecoder('utf-8', { fatal: false }).decode(data.slice(0, Math.min(4096, data.length)));
    const parts = headerSection.split(`--${boundary}`);

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part.includes('Content-Disposition: form-data') && part.includes('filename=')) {
            // Extract filename
            const fileNameMatch = part.match(/filename="([^"]+)"/);
            if (fileNameMatch) {
                fileName = fileNameMatch[1];
            }

            // Extract content type
            const contentTypeMatch = part.match(/Content-Type:\s*([^\r\n]+)/);
            if (contentTypeMatch) {
                fileType = contentTypeMatch[1].trim();
            }

            // Find the actual start of file data
            const partBytes = new TextEncoder().encode(part);
            let searchStart = 0;

            // Find this part in the original data
            for (let j = 0; j <= data.length - partBytes.length; j++) {
                let found = true;
                for (let k = 0; k < Math.min(partBytes.length, 100); k++) { // Only check first 100 bytes
                    if (data[j + k] !== partBytes[k]) {
                        found = false;
                        break;
                    }
                }
                if (found) {
                    searchStart = j;
                    break;
                }
            }

            // Find the double newline that separates headers from data
            for (let j = searchStart; j <= data.length - doubleNewline.length; j++) {
                let found = true;
                for (let k = 0; k < doubleNewline.length; k++) {
                    if (data[j + k] !== doubleNewline[k]) {
                        found = false;
                        break;
                    }
                }
                if (found) {
                    fileStart = j + doubleNewline.length;
                    break;
                }
            }

            // Find the end (next boundary)
            if (fileStart !== -1) {
                for (let j = fileStart; j <= data.length - boundaryBytes.length; j++) {
                    let found = true;
                    for (let k = 0; k < boundaryBytes.length; k++) {
                        if (data[j + k] !== boundaryBytes[k]) {
                            found = false;
                            break;
                        }
                    }
                    if (found) {
                        fileEnd = j - 2; // -2 for \r\n before boundary
                        break;
                    }
                }
            }

            break;
        }
    }

    if (fileStart !== -1 && fileEnd !== -1 && fileStart < fileEnd) {
        const fileData = data.slice(fileStart, fileEnd);
        return {
            file: fileData.buffer.slice(fileData.byteOffset, fileData.byteOffset + fileData.byteLength),
            fileName,
            fileType
        };
    }

    return { file: null, fileName: '', fileType: '' };
}

