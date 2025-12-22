// marketing-material.utils.ts
import jsQR from 'jsqr';
import { addToast } from '$lib/components/toast/toast.store';

export const validateQRCode = async (
	file: File
): Promise<{ isValid: boolean; errors: string[]; data?: string }> => {
	const errors: string[] = [];

	// Validate image dimensions
	const imageSize = await new Promise<{ width: number; height: number }>((resolve) => {
		const img = document.createElement('img');
		const url = URL.createObjectURL(file);

		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve({ width: img.width, height: img.height });
		};

		img.onerror = () => {
			URL.revokeObjectURL(url);
			resolve({ width: 0, height: 0 });
		};

		img.src = url;
	});

	const MIN_SIZE = 200;
	if (imageSize.width < MIN_SIZE || imageSize.height < MIN_SIZE) {
		errors.push(`QR code image must be at least ${MIN_SIZE}x${MIN_SIZE}px`);
	}

	// Real QR validation (decode)
	const qrResult = await new Promise<string | null>((resolve) => {
		const img = document.createElement('img');
		const url = URL.createObjectURL(file);

		img.onload = () => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			if (!ctx) {
				URL.revokeObjectURL(url);
				resolve(null);
				return;
			}

			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0);

			const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			const code = jsQR(imageData.data, imageData.width, imageData.height);

			URL.revokeObjectURL(url);
			resolve(code?.data ?? null);
		};

		img.onerror = () => {
			URL.revokeObjectURL(url);
			resolve(null);
		};

		img.src = url;
	});

	if (!qrResult) {
		errors.push('Uploaded image does not contain a readable QR code.');
	}

	return {
		isValid: errors.length === 0,
		errors,
		data: qrResult ?? undefined
	};
};

export const uploadFile = async (
	file: File,
	fileType: string
): Promise<{ success: boolean; resourceId?: string; error?: string }> => {
	try {
		const uploadFormData = new FormData();
		uploadFormData.append('file', file);
		uploadFormData.append('filename', file.name);

		const fileRes = await fetch(`/api/server/file-resources/upload/reancare`, {
			method: 'POST',
			body: uploadFormData
		});

		if (!fileRes.ok) {
			const errorText = await fileRes.text();
			let errorMessage = `Upload failed with status ${fileRes.status}`;
			try {
				const errorJson = JSON.parse(errorText);
				errorMessage = errorJson.Message || errorJson.message || errorMessage;
			} catch {
				errorMessage = errorText || errorMessage;
			}
			return { success: false, error: errorMessage };
		}

		let fileJson;
		try {
			fileJson = await fileRes.json();
		} catch {
			return { success: false, error: 'Invalid response from server' };
		}

		if (fileJson.Status === 'success' && fileJson.HttpCode === 201) {
			const resourceId = fileJson.Data.FileResources[0].id;
			if (resourceId) {
				return { success: true, resourceId };
			} else {
				return { success: false, error: `${fileType} upload failed: No resource ID returned` };
			}
		} else {
			return { success: false, error: fileJson.Message || `${fileType} upload failed` };
		}
	} catch (error) {
		console.error(`Error uploading ${fileType}:`, error);
		const errorStr = error instanceof Error ? error.message : String(error);
		return {
			success: false,
			error:
				errorStr.includes('fetch') || errorStr.includes('network')
					? 'Network error. Please check your connection and try again.'
					: `${fileType} upload failed. Please try again.`
		};
	}
};

export const downloadMaterial = async (tenantId: string, hasMarketingMaterial: boolean) => {
	if (!hasMarketingMaterial) {
		addToast({
			message: 'No marketing material available to download.',
			type: 'warning',
			timeout: 3000
		});
		return;
	}

	try {
		const res = await fetch(
			`/api/server/tenants/settings/${tenantId}/marketing-material/download`
		);

		if (!res.ok) {
			let errorMessage = 'Download failed';
			const contentType = res.headers.get('content-type');
			if (contentType && contentType.includes('application/json')) {
				try {
					const errorText = await res.text();
					if (errorText) {
						const errorData = JSON.parse(errorText);
						errorMessage = errorData.Message || errorData.message || errorMessage;
					}
				} catch {
					errorMessage = `Download failed with status ${res.status}`;
				}
			} else {
				errorMessage = `Download failed with status ${res.status}`;
			}
			addToast({ message: errorMessage, type: 'error', timeout: 3000 });
			return;
		}

		const blob = await res.blob();
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;

		const contentDisposition = res.headers.get('content-disposition');
		let filename = `marketing-material-${tenantId}.pdf`;
		if (contentDisposition) {
			const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
			if (filenameMatch && filenameMatch[1]) {
				filename = filenameMatch[1].replace(/['"]/g, '');
			}
		}

		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);

		addToast({ message: 'Download started successfully.', type: 'success', timeout: 3000 });
	} catch (error) {
		console.error('Error downloading marketing material:', error);
		addToast({
			message: 'Failed to download marketing material. Please try again.',
			type: 'error',
			timeout: 3000
		});
	}
};