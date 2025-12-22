// marketing-material.state.ts
import type {
	TenantSettingsMarketingDomainModel,
	TenantMarketingQRCode
} from '$lib/types/tenant.settings.types';

export interface ContentLimits {
	mainTitle: { min: number; max: number };
	subtitle: { min: number; max: number };
	introParagraph: { min: number; max: number };
	problemStatement: { min: number; max: number };
	benefitsTitle: { min: number; max: number };
	benefitItem: { min: number; max: number };
	maxBenefits: number;
	uiHeading: { min: number; max: number };
	uiParagraph: { min: number; max: number };
	ctaHeading: { min: number; max: number };
	ctaDescription: { min: number; max: number };
	qrInstruction: { min: number; max: number };
}

export const CONTENT_LIMITS: Record<1 | 2, ContentLimits> = {
	1: {
		mainTitle: { min: 10, max: 50 },
		subtitle: { min: 0, max: 80 },
		introParagraph: { min: 50, max: 300 },
		problemStatement: { min: 0, max: 600 },
		benefitsTitle: { min: 0, max: 30 },
		benefitItem: { min: 10, max: 100 },
		maxBenefits: 4,
		uiHeading: { min: 10, max: 50 },
		uiParagraph: { min: 0, max: 150 },
		ctaHeading: { min: 0, max: 40 },
		ctaDescription: { min: 0, max: 100 },
		qrInstruction: { min: 0, max: 50 }
	},
	2: {
		mainTitle: { min: 10, max: 80 },
		subtitle: { min: 0, max: 120 },
		introParagraph: { min: 50, max: 400 },
		problemStatement: { min: 0, max: 300 },
		benefitsTitle: { min: 0, max: 50 },
		benefitItem: { min: 10, max: 200 },
		maxBenefits: 8,
		uiHeading: { min: 10, max: 80 },
		uiParagraph: { min: 0, max: 300 },
		ctaHeading: { min: 0, max: 60 },
		ctaDescription: { min: 0, max: 200 },
		qrInstruction: { min: 0, max: 80 }
	}
};

export function createMarketingState(data: any, isEmpty: boolean) {
	let pageView = $state<1 | 2>(isEmpty ? 1 : (data.marketingMaterial?.PageView as 1 | 2) || 1);
	let disabled = $state(true);
	let edit = $state(false);
	let activeSection = $state<string | null>(null);
	let errors = $state<Record<string, string>>({});
	let hasMarketingMaterial = $state(
		!isEmpty && data.marketingMaterial !== null && data.marketingMaterial !== undefined
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
						Items: [] as string[]
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
						Items: data.marketingMaterial?.Content?.Benefits?.Items ?? []
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

	const initializeLogos = () => {
		const logos = isEmpty ? [] : (data.marketingMaterial?.Logos ?? []).slice(0, 2);
		if (logos.length === 0) {
			return [''];
		}
		return logos;
	};
	const initialLogos = initializeLogos();

	let Logos = $state<string[]>(initialLogos);

	let QRcode = $state<TenantMarketingQRCode>(
		isEmpty
			? null
			: (() => {
					const qrData = data.marketingMaterial?.QRCode;
					if (!qrData) return null;
					if (typeof qrData === 'string') return qrData;
					return {
						ResourceId: qrData.ResourceId ?? qrData.PDFResourceId ?? ''
					};
				})()
	);

	let titleImageFileName = $state('');
	let userInterfaceImageFileName = $state('');
	let qrCodeFileName = $state('');
	let logoFileNames = $state<string[]>(initialLogos.map(() => ''));

	let titleImageFile = $state<File | null>(null);
	let userInterfaceImageFile = $state<File | null>(null);
	let qrCodeFile = $state<File | null>(null);
	let logoFiles = $state<(File | null)[]>(initialLogos.map(() => null));

	function getCharacterStatus(text: string, field: keyof ContentLimits) {
		const limits = CONTENT_LIMITS[pageView][field] as { min: number; max: number };
		const length = text?.length || 0;
		const isValid = length >= limits.min && length <= limits.max;
		return { length, limits, isValid };
	}

	function toggleSection(sectionId: string) {
		activeSection = activeSection === sectionId ? null : sectionId;
	}

	function toggleEdit() {
		edit = !edit;
		disabled = !disabled;
	}

	function addBenefit() {
		const currentCount = Content.Benefits.Items.length;
		const maxBenefits = CONTENT_LIMITS[pageView].maxBenefits;

		if (currentCount < maxBenefits) {
			Content.Benefits.Items = [...Content.Benefits.Items, ''];
			return true;
		}
		return false;
	}

	function removeBenefit(index: number) {
		Content.Benefits.Items = Content.Benefits.Items.filter((_, i) => i !== index);
	}

	function addLogo() {
		const maxLogos = 2;
		if (Logos.length < maxLogos) {
			Logos = [...Logos, ''];
			logoFileNames = [...logoFileNames, ''];
			logoFiles = [...logoFiles, null];
			return true;
		}
		return false;
	}

	function removeLogo(index: number) {
		Logos = Logos.filter((_, i) => i !== index);
		logoFileNames = logoFileNames.filter((_, i) => i !== index);
		logoFiles = logoFiles.filter((_, i) => i !== index);
	}

	function clearTitleImage() {
		Images.TitleImage = '';
		titleImageFileName = '';
		titleImageFile = null;
	}

	function clearUserInterfaceImage() {
		Images.UserInterfaceImage = '';
		userInterfaceImageFileName = '';
		userInterfaceImageFile = null;
	}

	function clearQRCode() {
		QRcode = null;
		qrCodeFileName = '';
		qrCodeFile = null;
		const newErrors = { ...errors };
		delete newErrors.qrCode;
		errors = newErrors;
	}

	function setLogoFile(index: number, file: File, fileName: string) {
		while (logoFileNames.length <= index) {
			logoFileNames = [...logoFileNames, ''];
		}
		while (logoFiles.length <= index) {
			logoFiles = [...logoFiles, null];
		}
		logoFileNames[index] = fileName;
		logoFiles[index] = file;
		logoFileNames = [...logoFileNames];
		logoFiles = [...logoFiles];
	}

	return {
		get pageView() {
			return pageView;
		},
		set pageView(value: 1 | 2) {
			pageView = value;
		},
		get disabled() {
			return disabled;
		},
		set disabled(value: boolean) {
			disabled = value;
		},
		get edit() {
			return edit;
		},
		set edit(value: boolean) {
			edit = value;
		},
		get activeSection() {
			return activeSection;
		},
		set activeSection(value: string | null) {
			activeSection = value;
		},
		get errors() {
			return errors;
		},
		set errors(value: Record<string, string>) {
			errors = value;
		},
		get hasMarketingMaterial() {
			return hasMarketingMaterial;
		},
		set hasMarketingMaterial(value: boolean) {
			hasMarketingMaterial = value;
		},
		get Styling() {
			return Styling;
		},
		get Content() {
			return Content;
		},
		get Images() {
			return Images;
		},
		get Logos() {
			return Logos;
		},
		set Logos(value: string[]) {
			Logos = value;
		},
		get QRcode() {
			return QRcode;
		},
		set QRcode(value: TenantMarketingQRCode) {
			QRcode = value;
		},
		get titleImageFileName() {
			return titleImageFileName;
		},
		set titleImageFileName(value: string) {
			titleImageFileName = value;
		},
		get userInterfaceImageFileName() {
			return userInterfaceImageFileName;
		},
		set userInterfaceImageFileName(value: string) {
			userInterfaceImageFileName = value;
		},
		get qrCodeFileName() {
			return qrCodeFileName;
		},
		set qrCodeFileName(value: string) {
			qrCodeFileName = value;
		},
		get logoFileNames() {
			return logoFileNames;
		},
		set logoFileNames(value: string[]) {
			logoFileNames = value;
		},
		get titleImageFile() {
			return titleImageFile;
		},
		set titleImageFile(value: File | null) {
			titleImageFile = value;
		},
		get userInterfaceImageFile() {
			return userInterfaceImageFile;
		},
		set userInterfaceImageFile(value: File | null) {
			userInterfaceImageFile = value;
		},
		get qrCodeFile() {
			return qrCodeFile;
		},
		set qrCodeFile(value: File | null) {
			qrCodeFile = value;
		},
		get logoFiles() {
			return logoFiles;
		},
		set logoFiles(value: (File | null)[]) {
			logoFiles = value;
		},
		getCharacterStatus,
		toggleSection,
		toggleEdit,
		addBenefit,
		removeBenefit,
		addLogo,
		removeLogo,
		clearTitleImage,
		clearUserInterfaceImage,
		clearQRCode,
		setLogoFile
	};
}
