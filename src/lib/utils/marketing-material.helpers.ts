import type { TenantSettingsMarketingDomainModel } from '$lib/types/tenant.settings.types';

/**
 * Converts a string to PascalCase
 */
const toPascalCase = (str: string): string => {
	return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Transforms object keys to PascalCase and filters out empty values
 */
const transformToPascalCase = (
	obj: Record<string, unknown> | null | undefined
): Record<string, unknown> | null => {
	if (!obj || typeof obj !== 'object') return null;
	const transformed: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(obj)) {
		const pascalKey = toPascalCase(key);
		if (typeof value === 'string') {
			if (value.trim() !== '') {
				transformed[pascalKey] = value;
			}
		} else if (Array.isArray(value)) {
			const filteredArray = value.filter(
				(item) => item && (typeof item === 'string' ? item.trim() !== '' : true)
			);
			if (filteredArray.length > 0) {
				transformed[pascalKey] = filteredArray;
			}
		} else if (typeof value === 'object' && value !== null) {
			const transformedNested = transformToPascalCase(value as Record<string, unknown>);
			if (transformedNested && Object.keys(transformedNested).length > 0) {
				transformed[pascalKey] = transformedNested;
			}
		} else if (value !== '' && value !== null && value !== undefined) {
			transformed[pascalKey] = value;
		}
	}
	return Object.keys(transformed).length > 0 ? transformed : null;
};

/**
 * Filters out empty strings from object
 */
const filterEmptyStrings = (
	obj: Record<string, unknown> | null | undefined
): Record<string, unknown> | null => {
	if (!obj || typeof obj !== 'object') return null;
	const filtered: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(obj)) {
		if (typeof value === 'string') {
			if (value.trim() !== '') {
				filtered[key] = value;
			}
		} else if (Array.isArray(value)) {
			const filteredArray = value.filter(
				(item) => item && typeof item === 'string' && item.trim() !== ''
			);
			if (filteredArray.length > 0) {
				filtered[key] = filteredArray;
			}
		} else if (typeof value === 'object' && value !== null) {
			const filteredNested = filterEmptyStrings(value as Record<string, unknown>);
			if (filteredNested && Object.keys(filteredNested).length > 0) {
				filtered[key] = filteredNested;
			}
		} else if (value !== '' && value !== null && value !== undefined) {
			filtered[key] = value;
		}
	}
	return Object.keys(filtered).length > 0 ? filtered : null;
};

/**
 * Transforms marketing material settings into the format expected by the API
 */
export const transformMarketingMaterialSettings = (
	settings: TenantSettingsMarketingDomainModel
): Record<string, unknown> => {
	const body: Record<string, unknown> = {};

	// Transform Styling
	if (settings.Styling) {
		const transformedStyling = transformToPascalCase(settings.Styling as Record<string, unknown>);
		if (transformedStyling) {
			body.Styling = transformedStyling;
		}
	}

	// Transform Content
	if (settings.Content) {
		const transformedContent = transformToPascalCase(settings.Content as Record<string, unknown>);
		if (transformedContent) {
			body.Content = transformedContent;
		}
	}

	// Filter and add Images
	if (settings.Images) {
		const filteredImages = filterEmptyStrings(settings.Images as Record<string, unknown>);
		if (filteredImages) {
			body.Images = filteredImages;
		}
	}

	// Process Logos
	if (settings.Logos !== undefined && settings.Logos !== null) {
		if (Array.isArray(settings.Logos)) {
			const filteredLogos = settings.Logos.filter(
				(logo) => logo && typeof logo === 'string' && logo.trim() !== ''
			);
			if (filteredLogos.length > 0) {
				body.Logos = filteredLogos;
			}
		} else if (typeof settings.Logos === 'object') {
			body.Logos = settings.Logos;
		}
	}

	// Process QRCode
	if (settings.QRCode !== undefined && settings.QRCode !== null) {
		if (typeof settings.QRCode === 'string') {
			body.QRCode = {
				ResourceId: settings.QRCode
			};
		} else if (typeof settings.QRCode === 'object' && !Array.isArray(settings.QRCode)) {
			const qrcode = settings.QRCode as Record<string, unknown>;
			const transformedQRcode: Record<string, unknown> = {};

			if (
				qrcode.ResourceId &&
				typeof qrcode.ResourceId === 'string' &&
				qrcode.ResourceId.trim() !== ''
			) {
				transformedQRcode.ResourceId = qrcode.ResourceId;
			}

			if (transformedQRcode.ResourceId) {
				body.QRCode = transformedQRcode;
			}
		}
	}

	// Add PageView if provided
	if (settings.PageView !== undefined && (settings.PageView === 1 || settings.PageView === 2)) {
		body.PageView = settings.PageView;
	}

	return body;
};

