<script lang="ts">
	import { page } from '$app/state';
	import Icon from '@iconify/svelte';
	import { addToast, toastMessage } from '$lib/components/toast/toast.store';
	import BreadCrumbs from '$lib/components/breadcrumbs/breadcrums.svelte';
	import Image from '$lib/components/image.svelte';
	import { MarketingMaterialRequestSchema } from '$lib/validation/tenant.settings.schema';
	import type {
		TenantSettingsMarketingDomainModel,
		TenantMarketingQRCode
	} from '$lib/types/tenant.settings.types';
	import { imageUploadSchema } from '$lib/validation/tenant-setting-favicon.schema.js';
	import type { FaviconUploadModel, LogoUploadModel } from '$lib/types/tenant.settings.types.js';

	///////////////////////////////////////////////////////////////////////////////////////////

	let { data } = $props();
	console.log('Marketing Material Page Data:', data);

	const userId = page.params.userId;
	const tenantId = page.params.id;
	const tenantRoute = `/users/${userId}/tenants`;
	const marketingMaterialRoute = `/users/${userId}/tenants/${tenantId}/marketing-material`;
	let errors: Record<string, string> = $state({});
	const breadCrumbs = [
		{
			name: 'Tenants',
			path: tenantRoute
		},
		{
			name: 'Marketing Material',
			path: marketingMaterialRoute
		}
	];
	let promise = $state();
	const isEmpty = data.isEmpty || !data.marketingMaterial;
	let hasMarketingMaterial = $state(
		!data.isEmpty && data.marketingMaterial !== null && data.marketingMaterial !== undefined
	);
	let Styling = $state(
		isEmpty
			? {
					Primary: '',
					Secondary: '',
					Accent: '',
					LightBg: '',
					Panel: '',
					Muted: '',
					Text: '',
					HeadingFont: '',
					BodyFont: '',
					PageWidth: '',
					PageHeight: '',
					UserInterfaceWidth: '',
					UserInteractionWidth: '',
					QrSize: ''
				}
			: {
					Primary: data.marketingMaterial?.Styling?.Primary ?? '',
					Secondary: data.marketingMaterial?.Styling?.Secondary ?? '',
					Accent: data.marketingMaterial?.Styling?.Accent ?? '',
					LightBg: data.marketingMaterial?.Styling?.LightBg ?? '',
					Panel: data.marketingMaterial?.Styling?.Panel ?? '',
					Muted: data.marketingMaterial?.Styling?.Muted ?? '',
					Text: data.marketingMaterial?.Styling?.Text ?? '',
					HeadingFont: data.marketingMaterial?.Styling?.HeadingFont ?? '',
					BodyFont: data.marketingMaterial?.Styling?.BodyFont ?? '',
					PageWidth: data.marketingMaterial?.Styling?.PageWidth ?? '',
					PageHeight: data.marketingMaterial?.Styling?.PageHeight ?? '',
					UserInterfaceWidth: data.marketingMaterial?.Styling?.UserInterfaceWidth ?? '',
					UserInteractionWidth: data.marketingMaterial?.Styling?.UserInteractionWidth ?? '',
					QrSize: data.marketingMaterial?.Styling?.QrSize ?? ''
				}
	);

	let Content = $state(
		isEmpty
			? {
					Header: {
						MainTitle: '',
						Subtitle: ''
					},
					Introduction: {
						IntroParagraph: '',
						ProblemStatement: ''
					},
					Benefits: {
						Title: '',
						Items: []
					},
					UserInterface: {
						Heading: '',
						Paragraph: ''
					},
					Footer: {
						CtaHeading: '',
						CtaDescription: '',
						QrInstruction: ''
					}
				}
			: {
					Header: {
						MainTitle: data.marketingMaterial?.Content?.Header?.MainTitle ?? '',
						Subtitle: data.marketingMaterial?.Content?.Header?.Subtitle ?? ''
					},
					Introduction: {
						IntroParagraph: data.marketingMaterial?.Content?.Introduction?.IntroParagraph ?? '',
						ProblemStatement: data.marketingMaterial?.Content?.Introduction?.ProblemStatement ?? ''
					},
					Benefits: {
						Title: data.marketingMaterial?.Content?.Benefits?.Title ?? '',
						Items: (data.marketingMaterial?.Content?.Benefits?.Items ?? [])
					},
					UserInterface: {
						Heading: data.marketingMaterial?.Content?.UserInterface?.Heading ?? '',
						Paragraph: data.marketingMaterial?.Content?.UserInterface?.Paragraph ?? ''
					},
					Footer: {
						CtaHeading: data.marketingMaterial?.Content?.Footer?.CtaHeading ?? '',
						CtaDescription: data.marketingMaterial?.Content?.Footer?.CtaDescription ?? '',
						QrInstruction: data.marketingMaterial?.Content?.Footer?.QrInstruction ?? ''
					}
				}
	);
	let Images = $state(
		isEmpty
			? {
					TitleImage: '',
					UserInterfaceImage: ''
				}
			: {
					TitleImage: data.marketingMaterial?.Images?.TitleImage ?? '',
					UserInterfaceImage: data.marketingMaterial?.Images?.UserInterfaceImage ?? ''
				}
	);
	let QRcode: TenantMarketingQRCode = $state(
		isEmpty
			? null
			: (() => {
					const qrData = data.marketingMaterial?.QRCode;
					if (!qrData) return null;
					if (typeof qrData === 'string') return qrData;
					return {
						ResourceId: qrData.ResourceId ?? ''
					};
				})()
	);
	let titleImageFileName = $state('');
	let userInterfaceImageFileName = $state('');
	let qrCodeFileName = $state('');
	let logoFileNames = $state<string[]>(['', '', '']);
	let titleImageFile: File | null = null;
	let userInterfaceImageFile: File | null = null;
	let logoFiles: (File | null)[] = [null, null, null];
	let qrCodeFile: File | null = null;
	let disabled = $state(true);
	let edit = $state(false);
	let activeSection = $state<string | null>(null);

	const initializeLogos = () => {
		const logos = isEmpty ? [] : (data.marketingMaterial?.Logos ?? []).slice(0, 3);
		while (logos.length < 3) {
			logos.push('');
		}
		return logos;
	};
	let Logos = $state<string[]>(initializeLogos());

	const getImageUrl = (resourceId: string) => {
		if (!resourceId) return null;
		return `/api/server/file-resources/download/${resourceId}`;
	};

	const toggleSection = (sectionId: string) => {
		if (activeSection === sectionId) {
			activeSection = null;
		} else {
			activeSection = sectionId;
		}
	};

	const addBenefit = () => {
		Content.Benefits.Items = [...(Content.Benefits.Items ?? []), ''];
	};

	const removeBenefit = (index: number) => {
		Content.Benefits.Items = (Content.Benefits.Items ?? []).filter((_, i) => i !== index);
	};

	const removeLogo = (index: number) => {
		Logos[index] = '';
		logoFileNames[index] = '';
		Logos = [...Logos];
		logoFileNames = [...logoFileNames];
		logoFiles[index] = null;
	};

	const onImageSelected = async (e: Event, imageType: 'titleImage' | 'userInterfaceImage') => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const fileCreateModel: FaviconUploadModel = {
			UploadFile: file,
			FileName: file.name,
			FileType: file.type
		};

		const fileValidationResult = imageUploadSchema.safeParse(fileCreateModel);

		if (!fileValidationResult.success) {
			errors = Object.fromEntries(
				Object.entries(fileValidationResult.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || 'This field is required'
				])
			);
			return;
		}

		if (imageType === 'titleImage') {
			titleImageFileName = file.name;
			titleImageFile = file;
		} else {
			userInterfaceImageFileName = file.name;
			userInterfaceImageFile = file;
		}
	};

	const onLogoSelected = async (e: Event, logoIndex: number) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const fileCreateModel: LogoUploadModel = {
			UploadFile: file,
			FileName: file.name,
			FileType: file.type
		};

		const fileValidationResult = imageUploadSchema.safeParse(fileCreateModel);

		if (!fileValidationResult.success) {
			errors = Object.fromEntries(
				Object.entries(fileValidationResult.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || 'This field is required'
				])
			);
			return;
		}

		if (!logoFileNames[logoIndex]) {
			logoFileNames = [...logoFileNames];
		}
		logoFileNames[logoIndex] = file.name;
		logoFileNames = [...logoFileNames];
		logoFiles[logoIndex] = file;
	};

	const onQRCodeSelected = async (e: Event) => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const fileCreateModel: FaviconUploadModel = {
			UploadFile: file,
			FileName: file.name,
			FileType: file.type
		};

		const fileValidationResult = imageUploadSchema.safeParse(fileCreateModel);

		if (!fileValidationResult.success) {
			errors = Object.fromEntries(
				Object.entries(fileValidationResult.error.flatten().fieldErrors).map(([key, val]) => [
					key,
					val?.[0] || 'This field is required'
				])
			);
			return;
		}

		qrCodeFileName = file.name;
		qrCodeFile = file;
	};

	const handleEditClick = async () => {
		if (!edit) {
			addToast({
				message: 'Edit mode enabled.',
				type: 'info',
				timeout: 3000
			});
			edit = true;
		} else {
			addToast({
				message: 'Edit mode disabled.',
				type: 'info',
				timeout: 3000
			});
			edit = false;
		}
		disabled = !disabled;
	};

	const handleDownload = async () => {
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
				addToast({
					message: errorMessage,
					type: 'error',
					timeout: 3000
				});
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

			addToast({
				message: 'Download started successfully.',
				type: 'success',
				timeout: 3000
			});
		} catch (error) {
			console.error('Error downloading marketing material:', error);
			addToast({
				message: 'Failed to download marketing material. Please try again.',
				type: 'error',
				timeout: 3000
			});
		}
	};

	// const uploadFile = async (file: File, fileType: string, retryCount = 0): Promise<string | null> => {
	// 	try {
	// 		const uploadFormData = new FormData();
	// 		uploadFormData.append('file', file);
	// 		uploadFormData.append('filename', file.name);

	// 		const fileRes = await fetch(`/api/server/file-resources/upload/reancare`, {
	// 			method: 'POST',
	// 			body: uploadFormData
	// 		});

	// 		if (!fileRes.ok) {
	// 			const errorText = await fileRes.text();
	// 			let errorMessage = `Upload failed with status ${fileRes.status}`;
	// 			try {
	// 				const errorJson = JSON.parse(errorText);
	// 				errorMessage = errorJson.Message || errorJson.message || errorMessage;
	// 			} catch {
	// 				errorMessage = errorText || errorMessage;
	// 			}

	// 			if (fileRes.status === 500 && retryCount < 2) {
	// 				await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
	// 				return uploadFile(file, fileType, retryCount + 1);
	// 			}

	// 			throw new Error(errorMessage);
	// 		}

	// 		let fileJson;
	// 		try {
	// 			fileJson = await fileRes.json();
	// 		} catch (jsonError) {
	// 			throw new Error('Invalid response from server');
	// 		}

	// 		if (
	// 			fileJson.Message &&
	// 			(fileJson.Message.includes('ECONNRESET') || fileJson.Message.includes('ECONNREFUSED'))
	// 		) {
	// 			throw new Error('Connection error. Please check your network connection and try again.');
	// 		}

	// 		if (fileJson.Status === 'success' && fileJson.HttpCode === 201) {
	// 			const resourceId = fileJson.Data.FileResources[0].id;
	// 			if (resourceId) {
	// 				return resourceId;
	// 			} else {
	// 				throw new Error(`${fileType} upload failed: No resource ID returned`);
	// 			}
	// 		} else {
	// 			throw new Error(fileJson.Message || `${fileType} upload failed`);
	// 		}
	// 	} catch (error) {
	// 		console.error(`Error uploading ${fileType}:`, error);
	// 		const errorStr = error instanceof Error ? error.message : String(error);
	// 		const errorMessage =
	// 			errorStr.includes('ECONNRESET') || errorStr.includes('ECONNREFUSED')
	// 				? 'Connection was reset. Please check your network and try again.'
	// 				: errorStr.includes('fetch') ||
	// 					  errorStr.includes('network') ||
	// 					  errorStr.includes('Failed to fetch')
	// 					? 'Network error. Please check your connection and try again.'
	// 					: `${fileType} upload failed. Please try again.`;
	// 		addToast({ message: errorMessage, type: 'error', timeout: 5000 });
	// 		return null;
	// 	}
	// };

	// const handleSubmit = async (event: Event) => {
	// 	try {
	// 		event.preventDefault();
	// 		if (disabled) {
	// 			addToast({
	// 				message: 'Nothing to edit !',
	// 				type: 'warning',
	// 				timeout: 3000
	// 			});
	// 			return;
	// 		}

	// 		errors = {};

	// 		if (titleImageFile) {
	// 			const resourceId = await uploadFile(titleImageFile, 'Title image');
	// 			if (!resourceId) return;
	// 			Images.TitleImage = resourceId;
	// 			titleImageFile = null;
	// 			if (userInterfaceImageFile || logoFiles.some(f => f !== null) || qrCodeFile) {
	// 				await new Promise(resolve => setTimeout(resolve, 300));
	// 			}
	// 		}

	// 		if (userInterfaceImageFile) {
	// 			const resourceId = await uploadFile(userInterfaceImageFile, 'User interface image');
	// 			if (!resourceId) return;
	// 			Images.UserInterfaceImage = resourceId;
	// 			userInterfaceImageFile = null;
	// 			if (logoFiles.some(f => f !== null) || qrCodeFile) {
	// 				await new Promise(resolve => setTimeout(resolve, 300));
	// 			}
	// 		}

	// 		const uploadedLogoResourceIds: (string | null)[] = [null, null, null];
	// 		for (let i = 0; i < 3; i++) {
	// 			if (logoFiles[i]) {
	// 				const resourceId = await uploadFile(logoFiles[i]!, `Logo ${i + 1}`);
	// 				if (!resourceId) {
	// 					addToast({
	// 						message: `Failed to upload Logo ${i + 1}. Please try again.`,
	// 						type: 'error',
	// 						timeout: 5000
	// 					});
	// 					return;
	// 				}
	// 				uploadedLogoResourceIds[i] = resourceId;
	// 				logoFiles[i] = null;

	// 				if (i < 2 && logoFiles[i + 1]) {
	// 					await new Promise(resolve => setTimeout(resolve, 500));
	// 				}
	// 			}
	// 		}

	// 		if (qrCodeFile) {
	// 			await new Promise(resolve => setTimeout(resolve, 300));
	// 			const resourceId = await uploadFile(qrCodeFile, 'QR code');
	// 			if (!resourceId) {
	// 				addToast({
	// 					message: 'Failed to upload QR code. Please try again.',
	// 					type: 'error',
	// 					timeout: 5000
	// 				});
	// 				return;
	// 			}
	// 			QRcode = {
	// 				...QRcode,
	// 				resourceId: resourceId
	// 			};
	// 			qrCodeFile = null;
	// 		}

	// 		const finalLogosArray: string[] = [];
	// 		for (let i = 0; i < 3; i++) {
	// 			const logoResourceId = uploadedLogoResourceIds[i] || Logos[i];
	// 			if (logoResourceId && logoResourceId.trim() !== '') {
	// 				finalLogosArray.push(logoResourceId);
	// 			}
	// 		}

	// 		const marketingMaterialModel: MarketingMaterialCreateModel | MarketingMaterialUpdateModel = {
	// 			Styling,
	// 			Content: {
	// 				...Content,
	// 				benefits: {
	// 					...Content.benefits,
	// 					items: Content.benefits.items.map((item) => {
	// 						if (typeof item === 'string') {
	// 							return item;
	// 						}
	// 						const title = item?.title?.trim() || '';
	// 						const description = item?.description?.trim() || '';
	// 						if (title && description) {
	// 							return `${title}: ${description}`;
	// 						}
	// 						return description || title || '';
	// 					})
	// 				}
	// 			},
	// 			Images: {
	// 				TitleImage: Images.TitleImage,
	// 				UserInterfaceImage: Images.UserInterfaceImage
	// 			},
	// 			Logos: finalLogosArray,
	// 			QRcode: {
	// 				resourceId: QRcode.resourceId || '',
	// 				whatsappNumber: QRcode.whatsappNumber || '',
	// 				url: QRcode.url || ''
	// 			}
	// 		};

	// 		const validationResult = MarketingMaterialRequestSchema.safeParse(marketingMaterialModel);

	// 		if (!validationResult.success) {
	// 			errors = Object.fromEntries(
	// 				Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
	// 					key,
	// 					val?.[0] || 'This field is required'
	// 				])
	// 			);
	// 			return;
	// 		}

	// 		const method = isEmpty ? 'POST' : 'PUT';

	// 		try {
	// 			const res = await fetch(`/api/server/tenants/settings/${tenantId}/marketing-material`, {
	// 				method: method,
	// 				body: JSON.stringify(marketingMaterialModel),
	// 				headers: { 'content-type': 'application/json' }
	// 			});

	// 			if (!res.ok) {
	// 				throw new Error(`Request failed with status ${res.status}`);
	// 			}

	// 			let response;
	// 			try {
	// 				response = await res.json();
	// 			} catch (jsonError) {
	// 				throw new Error('Invalid response from server');
	// 			}

	// 			if (
	// 				response.Message &&
	// 				(response.Message.includes('ECONNRESET') || response.Message.includes('ECONNREFUSED'))
	// 			) {
	// 				addToast({
	// 					message: 'Connection error. Please check your network connection and try again.',
	// 					type: 'error',
	// 					timeout: 5000
	// 				});
	// 				return;
	// 			}

	// 			if (response.HttpCode === 201 || response.HttpCode === 200) {
	// 				toastMessage(response);
	// 				edit = false;
	// 				disabled = true;
	// 				hasMarketingMaterial = true;

	// 				for (let i = 0; i < 3; i++) {
	// 					if (uploadedLogoResourceIds[i]) {
	// 						Logos[i] = uploadedLogoResourceIds[i]!;
	// 					} else if (i < finalLogosArray.length) {
	// 						Logos[i] = finalLogosArray[i];
	// 					} else {
	// 						Logos[i] = '';
	// 					}
	// 				}
	// 				Logos = [...Logos];

	// 				return;
	// 			}

	// 			if (response.Errors) {
	// 				errors = response?.Errors || {};
	// 			} else {
	// 				toastMessage(response);
	// 			}
	// 		} catch (fetchError) {
	// 			console.error('Error submitting form:', fetchError);
	// 			const errorStr = fetchError instanceof Error ? fetchError.message : String(fetchError);
	// 			const errorMessage =
	// 				errorStr.includes('ECONNRESET') || errorStr.includes('ECONNREFUSED')
	// 					? 'Connection error. Please check your network connection and try again.'
	// 					: errorStr.includes('fetch') ||
	// 						  errorStr.includes('network') ||
	// 						  errorStr.includes('Failed to fetch')
	// 						? 'Network error. Please check your connection and try again.'
	// 						: 'Failed to submit. Please try again.';
	// 			addToast({ message: errorMessage, type: 'error', timeout: 5000 });
	// 			return;
	// 		}
	// 	} catch (error) {
	// 		console.error('Unexpected error in handleSubmit:', error);
	// 		const errorStr = error instanceof Error ? error.message : String(error);
	// 		const errorMessage =
	// 			errorStr.includes('ECONNRESET') || errorStr.includes('ECONNREFUSED')
	// 				? 'Connection was reset. Please check your network and try again.'
	// 				: 'An unexpected error occurred. Please try again.';
	// 		addToast({ message: errorMessage, type: 'error', timeout: 5000 });
	// 	}
	// };

	// +page.svelte - Improved handleSubmit function

	const uploadFile = async (
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
			} catch (jsonError) {
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

	const handleSubmit = async (event: Event) => {
		try {
			event.preventDefault();
			if (disabled) {
				addToast({
					message: 'Nothing to edit!',
					type: 'warning',
					timeout: 3000
				});
				return;
			}

			errors = {};

			// Step 1: Collect all files that need to be uploaded
			const filesToUpload: Array<{
				file: File;
				type: string;
				index?: number;
			}> = [];

			if (titleImageFile) {
				filesToUpload.push({ file: titleImageFile, type: 'Title image' });
			}
			if (userInterfaceImageFile) {
				filesToUpload.push({ file: userInterfaceImageFile, type: 'User interface image' });
			}
			logoFiles.forEach((file, index) => {
				if (file) {
					filesToUpload.push({ file, type: `Logo ${index + 1}`, index });
				}
			});
			if (qrCodeFile) {
				filesToUpload.push({ file: qrCodeFile, type: 'QR code' });
			}

			// Step 2: Upload all files in parallel
			if (filesToUpload.length > 0) {
				addToast({
					message: `Uploading ${filesToUpload.length} file(s)...`,
					type: 'info',
					timeout: 3000
				});

				const uploadPromises = filesToUpload.map(({ file, type }) => uploadFile(file, type));

				const uploadResults = await Promise.all(uploadPromises);

				// Step 3: Check for upload failures
				const failures = uploadResults
					.map((result, idx) => ({ result, file: filesToUpload[idx] }))
					.filter(({ result }) => !result.success);

				if (failures.length > 0) {
					const errorMessages = failures
						.map(({ file, result }) => `${file.type}: ${result.error}`)
						.join('\n');

					addToast({
						message: `Failed to upload ${failures.length} file(s):\n${errorMessages}`,
						type: 'error',
						timeout: 5000
					});
					return;
				}

				// Step 4: Update resource IDs with uploaded results
				uploadResults.forEach((result, idx) => {
					const fileInfo = filesToUpload[idx];
					if (result.success && result.resourceId) {
						switch (fileInfo.type) {
							case 'Title image':
								Images.TitleImage = result.resourceId;
								titleImageFile = null;
								break;
							case 'User interface image':
								Images.UserInterfaceImage = result.resourceId;
								userInterfaceImageFile = null;
								break;
							case 'QR code':
								QRcode = {
									ResourceId: result.resourceId
								};
								qrCodeFile = null;
								break;
							default:
								if (fileInfo.type.startsWith('Logo') && fileInfo.index !== undefined) {
									Logos[fileInfo.index] = result.resourceId;
									logoFiles[fileInfo.index] = null;
								}
						}
					}
				});

				addToast({
					message: `Successfully uploaded ${uploadResults.length} file(s)`,
					type: 'success',
					timeout: 3000
				});
			}

			// Step 5: Prepare final logos array (only non-empty values)
			const finalLogosArray: string[] = Logos.filter((logo) => logo && logo.trim() !== '');

			// Step 6: Prepare marketing material model
			const marketingMaterialModel: TenantSettingsMarketingDomainModel = {
				Styling,
				Content: {
					...Content,
					Benefits: {
						...Content.Benefits,
						Items: Content.Benefits.Items?.filter(item => item.trim() !== '') ?? []
					}
				},
				Images: {
					TitleImage: Images.TitleImage,
					UserInterfaceImage: Images.UserInterfaceImage
				},
				Logos: finalLogosArray.length > 0 ? finalLogosArray : null,
				QRCode: QRcode
			};

			// Step 7: Validate the model
			const validationResult = MarketingMaterialRequestSchema.safeParse(marketingMaterialModel);

			if (!validationResult.success) {
				errors = Object.fromEntries(
					Object.entries(validationResult.error.flatten().fieldErrors).map(([key, val]) => [
						key,
						val?.[0] || 'This field is required'
					])
				);
				addToast({
					message: 'Validation failed. Please check the form.',
					type: 'error',
					timeout: 3000
				});
				return;
			}

			// Step 8: Submit to backend
			const method = isEmpty ? 'POST' : 'PUT';

			try {
				const res = await fetch(`/api/server/tenants/settings/${tenantId}/marketing-material`, {
					method: method,
					body: JSON.stringify(marketingMaterialModel),
					headers: { 'content-type': 'application/json' }
				});

				if (!res.ok) {
					throw new Error(`Request failed with status ${res.status}`);
				}

				let response;
				try {
					response = await res.json();
				} catch (jsonError) {
					throw new Error('Invalid response from server');
				}

				if (response.HttpCode === 201 || response.HttpCode === 200) {
					toastMessage(response);
					edit = false;
					disabled = true;
					hasMarketingMaterial = true;

					// Update local state
					Logos = [...Logos];

					return;
				}

				if (response.Errors) {
					errors = response?.Errors || {};
				} else {
					toastMessage(response);
				}
			} catch (fetchError) {
				console.error('Error submitting form:', fetchError);
				const errorStr = fetchError instanceof Error ? fetchError.message : String(fetchError);
				const errorMessage =
					errorStr.includes('fetch') || errorStr.includes('network')
						? 'Network error. Please check your connection and try again.'
						: 'Failed to submit. Please try again.';
				addToast({ message: errorMessage, type: 'error', timeout: 5000 });
				return;
			}
		} catch (error) {
			console.error('Unexpected error in handleSubmit:', error);
			const errorStr = error instanceof Error ? error.message : String(error);
			addToast({
				message: 'An unexpected error occurred. Please try again.',
				type: 'error',
				timeout: 5000
			});
		}
	};
</script>

<BreadCrumbs crumbs={breadCrumbs} />

<div class="px-5 py-4">
	<div class="mx-auto my-2 border border-[var(--color-outline)]">
		<form onsubmit={async (event) => (promise = handleSubmit(event))}>
			<div
				class="flex items-center justify-between !rounded-b-none border bg-[var(--color-primary)] px-5 py-6"
			>
				<h1 class="text-xl text-[var(--color-info)]">Marketing Material</h1>
				<div class="flex items-center gap-2 text-end">
					<button
						type="button"
						class="table-btn variant-filled-secondary gap-1 disabled:cursor-not-allowed disabled:opacity-50"
						onclick={handleDownload}
						disabled={!hasMarketingMaterial}
					>
						<Icon icon="material-symbols:download-outline" />
						Download
					</button>
					<button
						type="button"
						class="table-btn variant-filled-secondary gap-1"
						onclick={handleEditClick}
					>
						<Icon icon="material-symbols:edit-outline" />
						Edit
					</button>
					<a
						href={tenantRoute}
						class="inline-flex items-center justify-center rounded-md border-[0.5px] border-[var(--color-outline)] px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200"
					>
						<Icon icon="material-symbols:close-rounded" class="h-5" />
					</a>
				</div>
			</div>

			<div class="flex flex-col space-y-4 px-4 py-4">
				<!-- Logos Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSection === 'logos' ? 'border-hover' : ''}`}
				>
					<button
						type="button"
						onclick={() => toggleSection('logos')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
						transition-all duration-100 ease-in-out ${
							activeSection === 'logos'
								? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
								: 'border-hover rounded bg-[var(--color-secondary)]'
						}`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon
								icon="material-symbols:workspace-premium-outline"
								class="hidden h-5 w-5 md:block"
							/>
							<div class="text-start">
								<p class="text-md font-medium">Logos</p>
								<p class="text-sm">Upload 3 logos</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSection === 'logos'}
						>
							<Icon
								icon="icon-park-outline:down"
								rotate={35}
								width={16}
								height={16}
								class="h-5 w-5"
							/>
						</span>
					</button>

					{#if activeSection === 'logos'}
						<div class="p-6">
							<div class="flex flex-col gap-4">
								{#each Logos as logo, index}
									<div
										class="rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] p-4"
									>
										<div class="mb-4 flex items-center justify-between">
											<h4 class="text-sm font-medium text-[var(--color-info)]">
												Logo {index + 1}
											</h4>
											{#if !disabled}
												<button
													type="button"
													onclick={() => removeLogo(index)}
													class="inline-flex items-center justify-center rounded-md border-[0.5px] border-[var(--color-outline)] px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200"
												>
													<Icon icon="material-symbols:delete-outline" class="h-5" />
												</button>
											{/if}
										</div>
										<div class="my-2 flex flex-col md:flex-row md:items-center">
											<label
												for="logo-upload-{index}"
												class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
												>Logo File</label
											>
											<div class="flex w-[70%] gap-3 md:items-center">
												<label class="table-btn variant-filled-secondary" for="logo-upload-{index}">
													Select File
													<input
														type="file"
														id="logo-upload-{index}"
														accept="image/*"
														class="hidden"
														{disabled}
														onchange={async (e) => await onLogoSelected(e, index)}
													/>
												</label>
												<input
													type="text"
													value={logoFileNames[index] || ''}
													readonly
													{disabled}
													class="input-field flex-1"
													placeholder="No file selected..."
												/>
											</div>
										</div>
										{#if Logos[index] && (data.marketingMaterial?.LogoUrls?.[index] || getImageUrl(Logos[index]))}
											<div class="mt-2">
												<Image
													cls="h-24 w-24 rounded border border-[var(--color-outline)] object-cover"
													source={(data.marketingMaterial?.LogoUrls?.[index]) ||
														getImageUrl(Logos[index])}
													w="24"
													h="24"
												/>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<!-- Header Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSection === 'header' ? 'border-hover' : ''}`}
				>
					<button
						type="button"
						onclick={() => toggleSection('header')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
						transition-all duration-100 ease-in-out ${
							activeSection === 'header'
								? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
								: 'border-hover rounded bg-[var(--color-secondary)]'
						}`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:text-fields" class="h-5 w-5" />
							<div class="text-start">
								<p class="text-md font-medium">Header</p>
								<p class="text-sm">Main title and subtitle</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSection === 'header'}
						>
							<Icon
								icon="icon-park-outline:down"
								rotate={35}
								width={16}
								height={16}
								class="h-5 w-5"
							/>
						</span>
					</button>

					{#if activeSection === 'header'}
						<div class="space-y-4 p-6">
							<div class="my-2 flex flex-col md:flex-row md:items-center">
								<label
									for="content-main-title"
									class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
									>Main Title <span class="text-red-700">*</span></label
								>
								<input
									type="text"
									id="content-main-title"
									bind:value={Content.Header.MainTitle}
									{disabled}
									placeholder="Enter main title"
									class="input-field w-[70%]"
								/>
							</div>
							<div class="my-4 flex flex-col md:flex-row md:items-center">
								<label
									for="content-subtitle"
									class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
									>Subtitle</label
								>
								<input
									type="text"
									id="content-subtitle"
									bind:value={Content.Header.Subtitle}
									{disabled}
									placeholder="Enter subtitle"
									class="input-field w-[70%]"
								/>
							</div>
						</div>
					{/if}
				</div>

				<!-- Introduction Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSection === 'introduction' ? 'border-hover' : ''}`}
				>
					<button
						type="button"
						onclick={() => toggleSection('introduction')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
						transition-all duration-100 ease-in-out ${
							activeSection === 'introduction'
								? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
								: 'border-hover rounded bg-[var(--color-secondary)]'
						}`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:description-outline" class="hidden h-5 w-5 md:block" />
							<div class="text-start">
								<p class="text-md font-medium">Introduction</p>
								<p class="text-sm">Introduction paragraph and problem statement</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSection === 'introduction'}
						>
							<Icon
								icon="icon-park-outline:down"
								rotate={35}
								width={16}
								height={16}
								class="h-5 w-5"
							/>
						</span>
					</button>

					{#if activeSection === 'introduction'}
						<div class="space-y-4 p-6">
							<div class="my-2 flex flex-col md:flex-row md:items-center">
								<label
									for="content-intro-paragraph"
									class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
									>Introduction Paragraph <span class="text-red-700">*</span></label
								>
								<textarea
									id="content-intro-paragraph"
									rows="3"
									bind:value={Content.Introduction.IntroParagraph}
									{disabled}
									placeholder="Enter introduction paragraph"
									class="input-field w-[70%]"
								></textarea>
							</div>
							<div class="my-4 flex flex-col md:flex-row md:items-center">
								<label
									for="content-problem-statement"
									class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
									>Problem Statement</label
								>
								<textarea
									id="content-problem-statement"
									rows="3"
									bind:value={Content.Introduction.ProblemStatement}
									{disabled}
									placeholder="Enter problem statement"
									class="input-field w-[70%]"
								></textarea>
							</div>
						</div>
					{/if}
				</div>

				<!-- Benefits Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSection === 'benefits' ? 'border-hover' : ''}`}
				>
					<button
						type="button"
						onclick={() => toggleSection('benefits')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
						transition-all duration-100 ease-in-out ${
							activeSection === 'benefits'
								? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
								: 'border-hover rounded bg-[var(--color-secondary)]'
						}`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:star-outline" class="hidden h-5 w-5 md:block" />
							<div class="text-start">
								<p class="text-md font-medium">Benefits</p>
								<p class="text-sm">Benefits title and items list</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSection === 'benefits'}
						>
							<Icon
								icon="icon-park-outline:down"
								rotate={35}
								width={16}
								height={16}
								class="h-5 w-5"
							/>
						</span>
					</button>

					{#if activeSection === 'benefits'}
						<div class="space-y-4 p-6">
							<div class="my-2 flex flex-col md:flex-row md:items-center">
								<label
									for="content-benefits-title"
									class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
									>Benefits Title</label
								>
								<input
									type="text"
									id="content-benefits-title"
									bind:value={Content.Benefits.Title}
									{disabled}
									placeholder="Key Benefits"
									class="input-field w-[70%]"
								/>
							</div>

							<div class="space-y-4">
								{#each (Content.Benefits.Items ?? []) as benefit, index}
									<div
										class="rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] p-4"
									>
										<div class="mb-4 flex items-center justify-between">
											<h4 class="text-sm font-medium text-[var(--color-info)]">
												Benefit #{index + 1}
											</h4>
											{#if !disabled}
												<button
													type="button"
													onclick={() => removeBenefit(index)}
													class="inline-flex items-center justify-center rounded-md border-[0.5px] border-[var(--color-outline)] px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-200"
												>
													<Icon icon="material-symbols:delete-outline" class="h-5" />
												</button>
											{/if}
										</div>
											<div class="my-2 flex flex-col md:flex-row md:items-center">
												<label
												for="benefit-item-{index}"
													class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
												>Benefit Text <span class="text-red-700">*</span></label
												>
												<textarea
												id="benefit-item-{index}"
													rows="3"
												bind:value={Content.Benefits.Items[index]}
													{disabled}
												placeholder="Enter benefit text"
													class="input-field w-[70%]"
												></textarea>
										</div>
									</div>
								{/each}

								<button
									type="button"
									onclick={addBenefit}
									{disabled}
									class="inline-flex min-w-[140px] items-center justify-center gap-1 rounded-md border border-[var(--color-outline)] bg-[var(--color-secondary)] px-3 py-1.5 text-sm font-medium text-[var(--color-info)] hover:bg-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
								>
									<Icon icon="material-symbols:add" class="h-4 w-4" />
									Add Benefit
								</button>
							</div>
						</div>
					{/if}
				</div>

				<!-- User Interface Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSection === 'userInterface' ? 'border-hover' : ''}`}
				>
					<button
						type="button"
						onclick={() => toggleSection('userInterface')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
						transition-all duration-100 ease-in-out ${
							activeSection === 'userInterface'
								? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
								: 'border-hover rounded bg-[var(--color-secondary)]'
						}`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:phone-android-outline" class="hidden h-5 w-5 md:block" />
							<div class="text-start">
								<p class="text-md font-medium">User Interface</p>
								<p class="text-sm">UI heading and paragraph text</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSection === 'userInterface'}
						>
							<Icon
								icon="icon-park-outline:down"
								rotate={35}
								width={16}
								height={16}
								class="h-5 w-5"
							/>
						</span>
					</button>

					{#if activeSection === 'userInterface'}
						<div class="space-y-4 p-6">
							<div class="my-2 flex flex-col md:flex-row md:items-center">
								<label
									for="content-ui-heading"
									class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
									>UI Heading <span class="text-red-700">*</span></label
								>
								<input
									type="text"
									id="content-ui-heading"
									bind:value={Content.UserInterface.Heading}
									{disabled}
									placeholder="Who Can Benefit from This Program"
									class="input-field w-[70%]"
								/>
							</div>
							<div class="my-4 flex flex-col md:flex-row md:items-center">
								<label
									for="content-ui-paragraph"
									class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
									>UI Paragraph</label
								>
								<textarea
									id="content-ui-paragraph"
									rows="3"
									bind:value={Content.UserInterface.Paragraph}
									{disabled}
									placeholder="Enter user interface paragraph"
									class="input-field w-[70%]"
								></textarea>
							</div>
						</div>
					{/if}
				</div>

				<!-- Footer Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSection === 'footer' ? 'border-hover' : ''}`}
				>
					<button
						type="button"
						onclick={() => toggleSection('footer')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
						transition-all duration-100 ease-in-out ${
							activeSection === 'footer'
								? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
								: 'border-hover rounded bg-[var(--color-secondary)]'
						}`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon
								icon="material-symbols:call-to-action-outline"
								class="hidden h-5 w-5 md:block"
							/>
							<div class="text-start">
								<p class="text-md font-medium">Footer</p>
								<p class="text-sm">CTA heading, description and QR instruction</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSection === 'footer'}
						>
							<Icon
								icon="icon-park-outline:down"
								rotate={35}
								width={16}
								height={16}
								class="h-5 w-5"
							/>
						</span>
					</button>

					{#if activeSection === 'footer'}
						<div class="space-y-4 p-6">
							<div class="my-2 flex flex-col md:flex-row md:items-center">
								<label
									for="content-cta-heading"
									class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
									>CTA Heading</label
								>
								<input
									type="text"
									id="content-cta-heading"
									bind:value={Content.Footer.CtaHeading}
									{disabled}
									placeholder="Get Started Today"
									class="input-field w-[70%]"
								/>
							</div>
							<div class="my-4 flex flex-col md:flex-row md:items-center">
								<label
									for="content-cta-description"
									class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
									>CTA Description</label
								>
								<textarea
									id="content-cta-description"
									rows="3"
									bind:value={Content.Footer.CtaDescription}
									{disabled}
									placeholder="Enter CTA description"
									class="input-field w-[70%]"
								></textarea>
							</div>
							<div class="my-4 flex flex-col md:flex-row md:items-center">
								<label
									for="content-qr-instruction"
									class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
									>QR Instruction</label
								>
								<input
									type="text"
									id="content-qr-instruction"
									bind:value={Content.Footer.QrInstruction}
									{disabled}
									placeholder="Scan to get started"
									class="input-field w-[70%]"
								/>
							</div>
						</div>
					{/if}
				</div>

				<!-- Images Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSection === 'images' ? 'border-hover' : ''}`}
				>
					<button
						type="button"
						onclick={() => toggleSection('images')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
						transition-all duration-100 ease-in-out ${
							activeSection === 'images'
								? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
								: 'border-hover rounded bg-[var(--color-secondary)]'
						}`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:image-outline" class="hidden h-5 w-5 md:block" />
							<div class="text-start">
								<p class="text-md font-medium">Images</p>
								<p class="text-sm">Title image and user interface image</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSection === 'images'}
						>
							<Icon
								icon="icon-park-outline:down"
								rotate={35}
								width={16}
								height={16}
								class="h-5 w-5"
							/>
						</span>
					</button>

					{#if activeSection === 'images'}
						<div class="space-y-4 p-6">
							<div class="my-2 flex flex-col md:flex-row md:items-center">
								<label
									for="image-title-image"
									class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
									>Title Image</label
								>
								<div class="flex w-[70%] gap-3 md:items-center">
									<label class="table-btn variant-filled-secondary" for="title-image-upload">
										Select File
										<input
											type="file"
											id="title-image-upload"
											accept="image/*"
											class="hidden"
											{disabled}
											onchange={async (e) => await onImageSelected(e, 'titleImage')}
										/>
									</label>
									<input
										type="text"
										id="image-title-image"
										value={titleImageFileName || ''}
										readonly
										{disabled}
										class="input-field flex-1"
										placeholder="No file selected..."
									/>
								</div>
							</div>
							{#if Images.TitleImage && (data.marketingMaterial?.Images?.TitleImageUrl || getImageUrl(Images.TitleImage))}
								<div class="mt-2">
									<Image
										cls="h-32 w-32 rounded border border-[var(--color-outline)] object-cover"
										source={(data.marketingMaterial?.Images?.TitleImageUrl) ||
											getImageUrl(Images.TitleImage)}
										w="32"
										h="32"
									/>
								</div>
							{/if}
							<div class="my-4 flex flex-col md:flex-row md:items-center">
								<label
									for="image-user-interface-image"
									class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
									>User Interface Image</label
								>
								<div class="flex w-[70%] gap-3 md:items-center">
									<label
										class="table-btn variant-filled-secondary"
										for="user-interface-image-upload"
									>
										Select File
										<input
											type="file"
											id="user-interface-image-upload"
											accept="image/*"
											class="hidden"
											{disabled}
											onchange={async (e) => await onImageSelected(e, 'userInterfaceImage')}
										/>
									</label>
									<input
										type="text"
										id="image-user-interface-image"
										value={userInterfaceImageFileName || ''}
										readonly
										{disabled}
										class="input-field flex-1"
										placeholder="No file selected..."
									/>
								</div>
							</div>
							{#if Images.UserInterfaceImage && (data.marketingMaterial?.Images?.UserInterfaceImageUrl || getImageUrl(Images.UserInterfaceImage))}
								<div class="mt-2">
									<Image
										cls="h-32 w-32 rounded border border-[var(--color-outline)] object-cover"
										source={(data.marketingMaterial?.Images?.UserInterfaceImageUrl) ||
											getImageUrl(Images.UserInterfaceImage)}
										w="32"
										h="32"
									/>
								</div>
							{/if}
						</div>
					{/if}
				</div>

				<!-- QR Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSection === 'qrcode' ? 'border-hover' : ''}`}
				>
					<button
						type="button"
						onclick={() => toggleSection('qrcode')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
						transition-all duration-100 ease-in-out ${
							activeSection === 'qrcode'
								? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
								: 'border-hover rounded bg-[var(--color-secondary)]'
						}`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:qr-code-scanner" class="h-5 w-5" />
							<div class="text-start">
								<p class="text-md font-medium">QR Code</p>
								<p class="text-sm">QR code resource ID, WhatsApp number and URL</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSection === 'qrcode'}
						>
							<Icon
								icon="icon-park-outline:down"
								rotate={35}
								width={16}
								height={16}
								class="h-5 w-5"
							/>
						</span>
					</button>

					{#if activeSection === 'qrcode'}
						<div class="space-y-4 p-6">
							<div class="my-2 flex flex-col md:flex-row md:items-center">
								<label
									for="qrcode-resource-id"
									class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
									>QR Code Image</label
								>
								<div class="flex w-[70%] gap-3 md:items-center">
									<label class="table-btn variant-filled-secondary" for="qrcode-upload">
										Select File
										<input
											type="file"
											id="qrcode-upload"
											accept="image/*"
											class="hidden"
											{disabled}
											onchange={async (e) => await onQRCodeSelected(e)}
										/>
									</label>
									<input
										type="text"
										id="qrcode-resource-id"
										value={qrCodeFileName || ''}
										readonly
										{disabled}
										class="input-field flex-1"
										placeholder="No file selected..."
									/>
								</div>
								{#if (typeof QRcode === 'object' && QRcode !== null && !Array.isArray(QRcode) && QRcode.ResourceId) && (data.marketingMaterial?.QRCode && typeof data.marketingMaterial.QRCode === 'object' && (data.marketingMaterial.QRCode as any)?.imageUrl || getImageUrl(QRcode.ResourceId))}
									<div class="mt-2">
										<Image
											cls="h-32 w-32 rounded border border-[var(--color-outline)] object-cover"
											source={(data.marketingMaterial?.QRCode && typeof data.marketingMaterial.QRCode === 'object' && (data.marketingMaterial.QRCode as any)?.imageUrl) ||
												getImageUrl(QRcode.ResourceId)}
											w="32"
											h="32"
										/>
									</div>
								{/if}
							</div>
						</div>
					{/if}
				</div>

				<!-- Color Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSection === 'colors' ? 'border-hover' : ''}`}
				>
					<button
						type="button"
						onclick={() => toggleSection('colors')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
						transition-all duration-100 ease-in-out ${
							activeSection === 'colors'
								? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
								: 'border-hover rounded bg-[var(--color-secondary)]'
						}`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:palette-outline" class="hidden h-5 w-5 md:block" />
							<div class="text-start">
								<p class="text-md font-medium">Colors</p>
								<p class="text-sm">Primary, secondary, accent and text colors</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSection === 'colors'}
						>
							<Icon
								icon="icon-park-outline:down"
								rotate={35}
								width={16}
								height={16}
								class="h-5 w-5"
							/>
						</span>
					</button>

					{#if activeSection === 'colors'}
						<div class="space-y-4 p-6">
							<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
								{#each [{ key: 'Primary', label: 'Primary' }, { key: 'Secondary', label: 'Secondary' }, { key: 'Accent', label: 'Accent' }, { key: 'LightBg', label: 'Light Background' }, { key: 'Panel', label: 'Panel' }, { key: 'Muted', label: 'Muted Text' }, { key: 'Text', label: 'Body Text' }] as c}
									<div class="my-2 flex flex-col md:flex-row md:items-center">
										<label
											for="styling-{c.key}-color"
											class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
											>{c.label} Color</label
										>
										<div class="flex w-[70%] items-center gap-2">
											<input
												type="color"
												id="styling-{c.key}-color"
												bind:value={Styling[c.key]}
												{disabled}
												class="h-12 w-16 cursor-pointer rounded border-none"
											/>
											<input
												type="text"
												id="styling-{c.key}-text"
												bind:value={Styling[c.key]}
												{disabled}
												placeholder="#1a472a"
												class="flex-1 rounded border border-[var(--color-outline)] bg-[var(--color-primary)] p-2"
												readonly
											/>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<!-- Fonts Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSection === 'fonts' ? 'border-hover' : ''}`}
				>
					<button
						type="button"
						onclick={() => toggleSection('fonts')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
						transition-all duration-100 ease-in-out ${
							activeSection === 'fonts'
								? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
								: 'border-hover rounded bg-[var(--color-secondary)]'
						}`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:font-download" class="h-5 w-5" />
							<div class="text-start">
								<p class="text-md font-medium">Fonts</p>
								<p class="text-sm">Heading and body font families</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSection === 'fonts'}
						>
							<Icon
								icon="icon-park-outline:down"
								rotate={35}
								width={16}
								height={16}
								class="h-5 w-5"
							/>
						</span>
					</button>

					{#if activeSection === 'fonts'}
						<div class="space-y-4 p-6">
							<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
								<div class="my-2 flex flex-col md:flex-row md:items-center">
									<label
										for="styling-heading-font"
										class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
										>Heading Font</label
									>
									<select
										id="styling-heading-font"
										bind:value={Styling.HeadingFont}
										{disabled}
										class="select input-field w-[70%]"
									>
										<option value="">Select a font</option>
										<option value="'Poppins', sans-serif">Poppins</option>
										<option value="'Inter', sans-serif">Inter</option>
										<option value="'Roboto', sans-serif">Roboto</option>
										<option value="'Open Sans', sans-serif">Open Sans</option>
										<option value="'Lato', sans-serif">Lato</option>
										<option value="'Montserrat', sans-serif">Montserrat</option>
										<option value="'Raleway', sans-serif">Raleway</option>
										<option value="'Nunito', sans-serif">Nunito</option>
										<option value="'Playfair Display', serif">Playfair Display</option>
										<option value="'Merriweather', serif">Merriweather</option>
										<option value="'Lora', serif">Lora</option>
										<option value="'PT Serif', serif">PT Serif</option>
										<option value="'Roboto Slab', serif">Roboto Slab</option>
										<option value="'Source Sans Pro', sans-serif">Source Sans Pro</option>
										<option value="'Ubuntu', sans-serif">Ubuntu</option>
										<option value="'Oswald', sans-serif">Oswald</option>
										<option value="'Fira Sans', sans-serif">Fira Sans</option>
										<option value="'Crimson Text', serif">Crimson Text</option>
										<option value="'Libre Baskerville', serif">Libre Baskerville</option>
									</select>
									{#if Styling.HeadingFont && !['', "'Poppins', sans-serif", "'Inter', sans-serif", "'Roboto', sans-serif", "'Open Sans', sans-serif", "'Lato', sans-serif", "'Montserrat', sans-serif", "'Raleway', sans-serif", "'Nunito', sans-serif", "'Playfair Display', serif", "'Merriweather', serif", "'Lora', serif", "'PT Serif', serif", "'Roboto Slab', serif", "'Source Sans Pro', sans-serif", "'Ubuntu', sans-serif", "'Oswald', sans-serif", "'Fira Sans', sans-serif", "'Crimson Text', serif", "'Libre Baskerville', serif"].includes(Styling.HeadingFont)}
										<input
											type="text"
											bind:value={Styling.HeadingFont}
											{disabled}
											placeholder="Custom font (e.g., 'Custom Font', sans-serif)"
											class="input-field mt-2 w-[70%]"
										/>
									{/if}
								</div>
								<div class="my-2 flex flex-col md:flex-row md:items-center">
									<label
										for="styling-body-font"
										class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
										>Body Font</label
									>
									<select
										id="styling-body-font"
										bind:value={Styling.BodyFont}
										{disabled}
										class="select input-field w-[70%]"
									>
										<option value="">Select a font</option>
										<option value="'Poppins', sans-serif">Poppins</option>
										<option value="'Inter', sans-serif">Inter</option>
										<option value="'Roboto', sans-serif">Roboto</option>
										<option value="'Open Sans', sans-serif">Open Sans</option>
										<option value="'Lato', sans-serif">Lato</option>
										<option value="'Montserrat', sans-serif">Montserrat</option>
										<option value="'Raleway', sans-serif">Raleway</option>
										<option value="'Nunito', sans-serif">Nunito</option>
										<option value="'Playfair Display', serif">Playfair Display</option>
										<option value="'Merriweather', serif">Merriweather</option>
										<option value="'Lora', serif">Lora</option>
										<option value="'PT Serif', serif">PT Serif</option>
										<option value="'Roboto Slab', serif">Roboto Slab</option>
										<option value="'Source Sans Pro', sans-serif">Source Sans Pro</option>
										<option value="'Ubuntu', sans-serif">Ubuntu</option>
										<option value="'Oswald', sans-serif">Oswald</option>
										<option value="'Fira Sans', sans-serif">Fira Sans</option>
										<option value="'Crimson Text', serif">Crimson Text</option>
										<option value="'Libre Baskerville', serif">Libre Baskerville</option>
									</select>
									{#if Styling.BodyFont && !['', "'Poppins', sans-serif", "'Inter', sans-serif", "'Roboto', sans-serif", "'Open Sans', sans-serif", "'Lato', sans-serif", "'Montserrat', sans-serif", "'Raleway', sans-serif", "'Nunito', sans-serif", "'Playfair Display', serif", "'Merriweather', serif", "'Lora', serif", "'PT Serif', serif", "'Roboto Slab', serif", "'Source Sans Pro', sans-serif", "'Ubuntu', sans-serif", "'Oswald', sans-serif", "'Fira Sans', sans-serif", "'Crimson Text', serif", "'Libre Baskerville', serif"].includes(Styling.BodyFont)}
										<input
											type="text"
											bind:value={Styling.BodyFont}
											{disabled}
											placeholder="Custom font (e.g., 'Custom Font', sans-serif)"
											class="input-field mt-2 w-[70%]"
										/>
									{/if}
								</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Sizes Section -->
				<div
					class={`my-2 flex w-full flex-col rounded-md border border-[var(--color-outline)] bg-[var(--color-primary)] !p-0 py-2 transition-colors duration-200 ${activeSection === 'sizes' ? 'border-hover' : ''}`}
				>
					<button
						type="button"
						onclick={() => toggleSection('sizes')}
						class={`flex w-full items-center justify-between rounded-lg px-5 py-3 text-[var(--color-info)]
						transition-all duration-100 ease-in-out ${
							activeSection === 'sizes'
								? 'rounded-b-none bg-[var(--color-primary)] text-[var(--color-info)]'
								: 'border-hover rounded bg-[var(--color-secondary)]'
						}`}
					>
						<div class="flex flex-1 items-center gap-2">
							<Icon icon="material-symbols:straighten-outline" class="hidden h-5 w-5 md:block" />
							<div class="text-start">
								<p class="text-md font-medium">Sizes</p>
								<p class="text-sm">Page dimensions and content sizes</p>
							</div>
						</div>
						<span
							class="transition-transform duration-300"
							class:rotate-90={activeSection === 'sizes'}
						>
							<Icon
								icon="icon-park-outline:down"
								rotate={35}
								width={16}
								height={16}
								class="h-5 w-5"
							/>
						</span>
					</button>

					{#if activeSection === 'sizes'}
						<div class="space-y-4 p-6">
							<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
								<div class="my-2 flex flex-col md:flex-row md:items-center">
									<label
										for="styling-page-width"
										class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
										>Page Width</label
									>
									<select
										id="styling-page-width"
										bind:value={Styling.PageWidth}
										{disabled}
										class="select input-field w-[70%]"
									>
										<option value="">Select page width</option>
										<option value="148mm" disabled>A6 (148mm)</option>
										<option value="210mm" disabled>A5 (210mm)</option>
										<option value="297mm">A4 (297mm)</option>
										<option value="420mm" disabled>A3 (420mm)</option>
										<option value="216mm" disabled>Letter (216mm)</option>
										<option value="279mm" disabled>Legal (279mm)</option>
										<option value="200mm" disabled>Custom 200mm</option>
										<option value="250mm" disabled>Custom 250mm</option>
										<option value="300mm" disabled>Custom 300mm</option>
										<option value="350mm" disabled>Custom 350mm</option>
									</select>
									{#if Styling.PageWidth && !['', '148mm', '210mm', '297mm', '420mm', '216mm', '279mm', '200mm', '250mm', '300mm', '350mm'].includes(Styling.PageWidth)}
										<input
											type="text"
											bind:value={Styling.PageWidth}
											{disabled}
											placeholder="Custom width (e.g., 180mm)"
											class="input-field mt-2 w-[70%]"
										/>
									{/if}
								</div>
								<div class="my-2 flex flex-col md:flex-row md:items-center">
									<label
										for="styling-page-height"
										class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
										>Page Height</label
									>
									<select
										id="styling-page-height"
										bind:value={Styling.PageHeight}
										{disabled}
										class="select input-field w-[70%]"
									>
										<option value="">Select page height</option>
										<option value="105mm" disabled>A6 (105mm)</option>
										<option value="148mm" disabled>A5 (148mm)</option>
										<option value="210mm">A4 (210mm)</option>
										<option value="297mm" disabled>A3 (297mm)</option>
										<option value="279mm" disabled>Letter (279mm)</option>
										<option value="356mm" disabled>Legal (356mm)</option>
										<option value="250mm" disabled>Custom 250mm</option>
										<option value="300mm" disabled>Custom 300mm</option>
										<option value="350mm" disabled>Custom 350mm</option>
										<option value="400mm" disabled>Custom 400mm</option>
									</select>
									{#if Styling.PageHeight && !['', '105mm', '148mm', '210mm', '297mm', '279mm', '356mm', '250mm', '300mm', '350mm', '400mm'].includes(Styling.PageHeight)}
										<input
											type="text"
											bind:value={Styling.PageHeight}
											{disabled}
											placeholder="Custom height (e.g., 240mm)"
											class="input-field mt-2 w-[70%]"
										/>
									{/if}
								</div>
								<div class="my-2 flex flex-col md:flex-row md:items-center">
									<label
										for="styling-ui-width"
										class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
										>UI Width</label
									>
									<select
										id="styling-ui-width"
										bind:value={Styling.UserInterfaceWidth}
										{disabled}
										class="select input-field w-[70%]"
									>
										<option value="">Select UI width</option>
										<option value="200px">200px</option>
										<option value="240px">240px</option>
										<option value="260px">260px</option>
										<option value="280px">280px</option>
										<option value="300px">300px</option>
										<option value="320px">320px</option>
										<option value="350px">350px</option>
										<option value="400px">400px</option>
										<option value="450px">450px</option>
										<option value="500px">500px</option>
									</select>
									{#if Styling.UserInterfaceWidth && !['', '200px', '240px', '260px', '280px', '300px', '320px', '350px', '400px', '450px', '500px'].includes(Styling.UserInterfaceWidth)}
										<input
											type="text"
											bind:value={Styling.UserInterfaceWidth}
											{disabled}
											placeholder="Custom width (e.g., 270px)"
											class="input-field mt-2 w-[70%]"
										/>
									{/if}
								</div>
								<div class="my-2 flex flex-col md:flex-row md:items-center">
									<label
										for="styling-interaction-width"
										class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
										>Interaction Width</label
									>
									<select
										id="styling-interaction-width"
										bind:value={Styling.UserInteractionWidth}
										{disabled}
										class="select input-field w-[70%]"
									>
										<option value="">Select interaction width</option>
										<option value="200px">200px</option>
										<option value="220px">220px</option>
										<option value="250px">250px</option>
										<option value="270px">270px</option>
										<option value="300px">300px</option>
										<option value="320px">320px</option>
										<option value="350px">350px</option>
										<option value="380px">380px</option>
										<option value="400px">400px</option>
										<option value="450px">450px</option>
									</select>
									{#if Styling.UserInteractionWidth && !['', '200px', '220px', '250px', '270px', '300px', '320px', '350px', '380px', '400px', '450px'].includes(Styling.UserInteractionWidth)}
										<input
											type="text"
											bind:value={Styling.UserInteractionWidth}
											{disabled}
											placeholder="Custom width (e.g., 230px)"
											class="input-field mt-2 w-[70%]"
										/>
									{/if}
								</div>
								<div class="my-2 flex flex-col md:flex-row md:items-center">
									<label
										for="styling-qr-size"
										class="text mx-1 mb-2 w-[30%] font-medium text-[var(--color-info)] md:mb-0"
										>QR Size</label
									>
									<select
										id="styling-qr-size"
										bind:value={Styling.QrSize}
										{disabled}
										class="select input-field w-[70%]"
									>
										<option value="">Select QR size</option>
										<option value="80px">80px (Small)</option>
										<option value="100px">100px</option>
										<option value="120px">120px (Medium)</option>
										<option value="150px">150px</option>
										<option value="180px">180px</option>
										<option value="200px">200px (Large)</option>
										<option value="250px">250px</option>
										<option value="300px">300px (Extra Large)</option>
									</select>
									{#if Styling.QrSize && !['', '80px', '100px', '120px', '150px', '180px', '200px', '250px', '300px'].includes(Styling.QrSize)}
										<input
											type="text"
											bind:value={Styling.QrSize}
											{disabled}
											placeholder="Custom size (e.g., 140px)"
											class="input-field mt-2 w-[70%]"
										/>
									{/if}
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<hr class="border-[0.5px] border-t border-[var(--color-outline)]" />

			<div class="button-container my-4">
				{#await promise}
					<button type="submit" class="table-btn variant-soft-secondary" disabled>
						Submiting
					</button>
				{:then data}
					<button type="submit" class="table-btn variant-soft-secondary">Submit</button>
				{/await}
			</div>
		</form>
	</div>
</div>
