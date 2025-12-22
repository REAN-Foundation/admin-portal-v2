export interface Setting {
	Name: string;
	Enabled?: boolean;
	Navigable?: boolean;
	Path?: string;
	Icon?: string;
	Description?: string;
}

export enum TenantSettingsTypes {
	Common = 'Common',
	Followup = 'Followup',
	ChatBot = 'ChatBot',
	Forms = 'Forms',
	Consent = 'Consent'
}

export enum WeekDay {
	Sunday = 'Sunday',
	Monday = 'Monday',
	Tuesday = 'Tuesday',
	Wednesday = 'Wednesday',
	Thursday = 'Thursday',
	Friday = 'Friday',
	Saturday = 'Saturday'
}

export const TenantSettingsTypesList = [
	TenantSettingsTypes.Common,
	TenantSettingsTypes.Followup,
	TenantSettingsTypes.ChatBot,
	TenantSettingsTypes.Forms,
	TenantSettingsTypes.Consent
];

export interface UserInterfaces {
	PatientApp: boolean;
	ChatBot: boolean;
	Forms: boolean;
	PatientPortal: boolean;
	Followup: boolean;
}

export interface ClinicalFeatures {
	Vitals: Setting;
	LabRecords: Setting;
	Symptoms: Setting;
	SymptomAssessments: Setting;
	DrugsManagement: Setting;
	Medications: Setting;
	Careplans: Setting;
	Assessments: Setting;
	DailyAssessments: Setting;
	Appointments: Setting;
	Visits: Setting;
	Orders: Setting;
	Documents: Setting;
	PatientHealthReports: Setting;
}

export interface Wellness {
	Exercise: Setting;
	Nutrition: Setting;
	Meditation: Setting;
	Priorities: Setting;
	Goals: Setting;
	DeviceIntegration: Setting;
}

export interface EHR {
	FHIRStorage: Setting;
	EHRIntegration: Setting;
	ABDM: Setting;
}

export interface Community {
	UserGroups: Setting;
	Chat: Setting;
}

export interface Research {
	Cohorts: Setting;
}

export interface Affiliations {
	HealthCenters: Setting;
	HealthSystems: Setting;
}

export interface Miscellaneous {
	Gamification: Setting;
	Notifications: Setting;
	Newsfeeds: Setting;
	Notices: Setting;
}

export interface Educational {
	Courses: Setting;
	LearningJourney: Setting;
	KnowledgeNuggets: Setting;
}

export interface General {
	ViewPersonRoles: Setting;
	ViewUsers: Setting;
}

export interface AnalysisSettings {
	CustomQueries: Setting;
	Quicksight: Setting;
}

export interface CommonSettings {
	UserInterfaces?: UserInterfaces;
	Clinical: ClinicalFeatures;
	Wellness: Wellness;
	EHR: EHR;
	Community: Community;
	Research: Research;
	Affiliations: Affiliations;
	Miscellaneous: Miscellaneous;
	Educational: Educational;
	Analysis: AnalysisSettings;
	General?: General;
}

export interface MessageChannels {
	WhatsApp: boolean;
	Telegram: boolean;
}

export interface SupportChannels {
	ClickUp: boolean;
	Slack: boolean;
	Email: boolean;
}

export interface ChatBotSettings {
	Name: string;
	OrganizationName?: string;
	OrganizationLogo?: string;
	OrganizationWebsite?: string;
	Favicon?: string;
	Description?: string;
	DefaultLanguage?: string;
	MessageChannels: MessageChannels;
	SupportChannels: SupportChannels;
	Personalization: boolean;
	LocationContext: boolean;
	Localization: boolean;
	RemindersMedication: boolean;
	QnA: boolean;
	Consent: boolean;
	WelcomeMessage: boolean;
	Feedback: boolean;
	ReminderAppointment: boolean;
	AppointmentFollowup: boolean;
	ConversationHistory: boolean;
	Emojis: boolean;
	BasicAssessment: boolean;
	BasicCarePlan: boolean;
	Timezone?: string;
}

export enum FollowupSource {
	File = 'File',
	Api = 'Api',
	None = 'None'
}

export enum ScheduleFrequency {
	Daily = 'daily',
	Weekly = 'weekly',
	Monthly = 'monthly'
}

type ReminderTriggerType =
	| 'PreviousDay'
	| 'SameDayMorning'
	| 'StartOfDay'
	| 'XHoursBefore'
	| 'XMinutesBefore'
	| 'CustomTimeBefore'
	| 'AfterAppointment'
	| 'EndOfDay'
	| 'NoReminder';

export interface ReminderTrigger {
	Type: ReminderTriggerType;
	OffsetValue?: number;
	OffsetUnit?: 'minutes' | 'hours' | 'days';
	TimeOfDay?: string;
}

export interface FileUploadConfig {
	FileColumnFormat: string;
	FileType: 'csv' | 'xlsx' | 'json' | 'xml' | 'txt' | 'pdf';
	ReminderSchedule: ReminderTrigger[];
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type ResponseType = 'json' | 'text' | 'form' | 'xml';

interface ApiAuthConfig {
	Method: HttpMethod;
	Url: string;
	Body?: any;
	// QueryParams?: string;
	QueryParams?: Record<string, string>;
	// Headers?: string;
	Headers?: Record<string, string>;
	TokenPath: string;
	ResponseType?: ResponseType;
	TokenInjection: {
		Location: 'header' | 'query' | 'body';
		Key: string;
		Prefix?: string;
	};
}

interface ApiFetchConfig {
	Method: HttpMethod;
	Url: string;
	QueryParams?: Record<string, string>;
	Body?: any;
	Headers?: Record<string, string>;
	ResponseType?: ResponseType;
	ResponseField?: string;
}

export interface ApiIntegrationConfig {
	Auth?: ApiAuthConfig;
	Fetch: ApiFetchConfig;
	ReminderSchedule: ReminderTrigger[];
	ScheduleFrequency: ScheduleFrequency;
}

export interface FollowupSettings {
	Source: FollowupSource;
	FileUploadSettings?: FileUploadConfig;
	ApiIntegrationSettings?: ApiIntegrationConfig;
}

export interface FormsIntegrations {
	KoboToolbox: boolean;
	ODK: boolean;
	GoogleForm: boolean;
}

export interface FormsUIIntegrations {
	KoboToolbox: Setting;
	ODK: Setting;
	GoogleForm: Setting;
}

export interface FormsSettings {
	Integrations: FormsIntegrations;
	OfflineSupport: boolean;
	FieldApp: boolean;
}

export interface FormsUISettings {
	Integrations: FormsUIIntegrations;
	OfflineSupport: Setting;
	FieldApp: Setting;
}

export interface ConsentSettings {
	TenantId?: string;
	TenantName?: string;
	TenantCode?: string;
	DefaultLanguage?: string;
	Messages?: ConsentMessage[];
}

export interface ConsentMessage {
	LanguageCode?: string;
	Content?: string;
	WebsiteURL?: string;
}

export interface TenantSettingsDomainModel {
	Common?: CommonSettings;
	Followup?: FollowupSettings;
	ChatBot?: ChatBotSettings;
	Forms?: FormsSettings;
	Consent?: ConsentSettings;
	CustomSettings?: CustomSettings;
}

export enum CustomSettingDataType {
	String = 'string',
	Number = 'number',
	Boolean = 'boolean',
	Object = 'object',
	Array = 'array'
}

export interface CustomSetting {
	Name: string;
	Description: string;
	DataType: CustomSettingDataType;
	Value: any;
}

export interface CustomSettings {
	[key: string]: CustomSetting;
}

export interface TenantSettingsDto extends TenantSettingsDomainModel {
	TenantId?: string;
	CustomSettings?: CustomSettings;
}

export interface FaviconUploadModel {
	UploadFile: File;
	FileName: string;
	FileType: string;
}

export interface LogoUploadModel {
	UploadFile: File;
	FileName: string;
	FileType: string;
}

export interface Benefit {
	Icon?: string;
	Title: string;
	Description: string;
}

export interface MarketingMaterialUploadModel {
	UploadFile: File;
	FileName: string;
	FileType: string;
}

// Tenant Marketing Material Types matching backend structure
export interface TenantMarketingStyling {
	Primary?: string;
	Secondary?: string;
	Accent?: string;
	LightBg?: string;
	Panel?: string;
	Muted?: string;
	Text?: string;
	HeadingFont?: string;
	BodyFont?: string;
	PageWidth?: string;
	PageHeight?: string;
	UserInterfaceWidth?: string;
	UserInteractionWidth?: string;
	QrSize?: string;
}

export interface TenantMarketingContentSection {
	Heading?: string;
	Paragraph?: string;
}

export interface TenantMarketingContentIntroduction {
	IntroParagraph?: string;
	ProblemStatement?: string;
}

export interface TenantMarketingContentBenefits {
	Title?: string;
	Items?: string[];
}

export interface TenantMarketingContentFooter {
	CtaHeading?: string;
	CtaDescription?: string;
	QrInstruction?: string;
}

export interface TenantMarketingContentHeader {
	MainTitle?: string;
	Subtitle?: string;
}

export interface TenantMarketingContent {
	Header?: TenantMarketingContentHeader | null;
	Introduction?: TenantMarketingContentIntroduction | null;
	Benefits?: TenantMarketingContentBenefits | null;
	UserInterface?: TenantMarketingContentSection | null;
	Footer?: TenantMarketingContentFooter | null;
}

export type TenantMarketingQRCode = string | {
	ResourceId?: string;
	[key: string]: unknown;
} | null;

export interface TenantMarketingImages {
	TitleImage?: string;
	UserInterfaceImage?: string;
	[key: string]: string | undefined;
}

export type TenantMarketingLogos = string[] | {
	[key: string]: string;
} | null;

export interface TenantSettingsMarketingDomainModel {
	Styling?: TenantMarketingStyling | null;
	Content?: TenantMarketingContent | null;
	QRCode?: TenantMarketingQRCode;
	Images?: TenantMarketingImages | null;
	Logos?: TenantMarketingLogos;
	PDFResourceId?: string | null;
	PageView?: 1 | 2;
}

export interface TenantSettingsMarketingDto extends TenantSettingsMarketingDomainModel {
	TenantId?: string;
}

export enum TenantSettingsMarketingTypes {
	Styling = 'Styling',
	Content = 'Content',
	QRCode = 'QRCode',
	Images = 'Images',
	Logos = 'Logos',
}

export const TenantSettingsMarketingTypesList = [
	TenantSettingsMarketingTypes.Styling,
	TenantSettingsMarketingTypes.Content,
	TenantSettingsMarketingTypes.QRCode,
	TenantSettingsMarketingTypes.Images,
	TenantSettingsMarketingTypes.Logos,
];

// Legacy aliases for backward compatibility
export type MarketingMaterialStyling = TenantMarketingStyling;
export type MarketingMaterialContent = TenantMarketingContent;
export type MarketingMaterialImages = TenantMarketingImages;
export type MarketingMaterialQRcode = TenantMarketingQRCode;
export type MarketingMaterialCreateModel = TenantSettingsMarketingDomainModel;
export type MarketingMaterialUpdateModel = TenantSettingsMarketingDomainModel;
