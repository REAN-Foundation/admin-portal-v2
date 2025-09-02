import type { RequestEvent } from '@sveltejs/kit';
import { ResponseHandler } from '$lib/utils/response.handler';
import { download } from '$routes/api/services/bot-content/file.resource';

//////////////////////////////////////////////////////////////

export const GET = async (event: RequestEvent) => {
	const resourceId = event.params.id;
	const sessionId = event.locals?.sessionUser?.sessionId;
	if (!sessionId) {
		return ResponseHandler.handleError(401, null, new Error('Access denied: Invalid session'));
	}

	const attachment = event.url.searchParams.get('asAttachment');

	try {
		console.log('Downloading file resource...');
		const response = await download(sessionId, resourceId, attachment  == 'true' ? true : false);
		console.log('responseee', response);

		const buffer = Buffer.from(response.Data.Buffer); 
		const fileName = response.Data.FileName ?? 'file';
		const mimeType = response.Data.MimeType ?? 'application/octet-stream';

		return new Response(buffer, {
			headers: {
				'Content-Type': mimeType,
				'Content-Disposition': `${attachment ? 'attachment' : 'inline'}; filename="${fileName}"`
			}
		});
	} catch (err) {
		console.error(`Error downloading file resource: ${err.message}`);
		return new Response(err.message);
	}
};
